// ============================================================================
// PharmaCare SaaS — Auth Controller (100% Aligned with MySQL SQL Dump)
// ============================================================================

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwtHelper');

const normalizeRole = (role) => {
  if (!role) return 'cashier';
  const r = role.toString().toLowerCase().replace(/[_\s-]+/g, '');
  if (r === 'superadmin') return 'superadmin';
  if (r === 'tenantowner' || r === 'owner' || r === 'admin') return 'tenant_owner';
  if (r === 'pharmacist') return 'pharmacist';
  return 'cashier';
};

const formatUser = (u, tenant = null, subscription = null) => ({
  id: u.id?.toString(),
  tenantId: u.tenant_id?.toString() || null,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  storeName: tenant ? tenant.name : null,
  domain: tenant ? tenant.domain : null,
  planId: subscription ? subscription.plan_id : null,
  subscriptionStatus: subscription ? subscription.status : null,
  subscriptionEnd: subscription ? subscription.end_date : null
});

// Helper for comparing bcrypt hashes (handles PHP $2y$ format)
const verifyPasswordHash = async (plainPassword, hashFromDb) => {
  if (!plainPassword) return false;
  if (!hashFromDb) return false;
  let normalizedHash = hashFromDb;
  if (hashFromDb.startsWith('$2y$')) {
    normalizedHash = '$2a$' + hashFromDb.substring(4);
  }
  try {
    const matched = await bcrypt.compare(plainPassword, normalizedHash);
    return matched;
  } catch (e) {
    return false;
  }
};

const { getSettings } = require('../utils/settingsService');

// ---------------------------------------------------------------------------
// POST /api/auth/register-tenant
// Onboards new pharmacy: inserts tenants, users (tenant_owner), tenant_subscriptions
// ---------------------------------------------------------------------------
const registerTenant = async (req, res) => {
  try {
    const settings = getSettings();
    if (settings && settings.selfRegistrationEnabled === false) {
      return res.status(403).json({
        success: false,
        message: 'New pharmacy registrations are currently disabled by the administrator.'
      });
    }

    const { storeName, name, ownerName, email, phone, password, planId, planTier, address, domain } = req.body;

    const bStoreName = storeName || name;
    const bOwnerName = ownerName || name;
    const bEmail = (email || '').trim().toLowerCase();
    const bPlanId = parseInt(planId, 10) || (planTier === 'enterprise' ? 3 : planTier === 'starter' ? 1 : 2);

    if (!bStoreName || !bEmail) {
      return res.status(400).json({
        success: false,
        message: 'Store name and email address are required.'
      });
    }

    const bDomain = domain || bStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if user or tenant already exists in MySQL
    const [existingUsers] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [bEmail]);
    const [existingTenants] = await db.query('SELECT * FROM tenants WHERE LOWER(domain) = ? OR LOWER(name) = ?', [bDomain, bStoreName.toLowerCase()]);

    let tenantId;
    let userId;
    let isRenewal = false;

    if ((existingUsers && existingUsers.length > 0) || (existingTenants && existingTenants.length > 0)) {
      // =========================================================================
      // RENEWAL MODE: Existing Tenant / Existing User found -> Renew Subscription!
      // =========================================================================
      isRenewal = true;
      const existingUser = existingUsers[0];
      const existingTenant = existingTenants[0];

      tenantId = existingTenant ? existingTenant.id : (existingUser ? existingUser.tenant_id : null);
      
      // Update tenant & user status to 'active'
      if (tenantId) {
        await db.query(`UPDATE tenants SET status = 'active' WHERE id = ?`, [tenantId]);
        await db.query(`UPDATE users SET status = 'active' WHERE tenant_id = ?`, [tenantId]);
      }

      // If user exists, update password if provided
      if (existingUser) {
        userId = existingUser.id;
        if (password && password.trim().length > 0) {
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(password.trim(), salt);
          await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
        }
      } else if (tenantId) {
        // Create user if tenant existed without owner
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password || '123456', salt);
        const [uRes] = await db.query(
          `INSERT INTO users (tenant_id, name, email, password_hash, role, status)
           VALUES (?, ?, ?, ?, 'tenant_owner', 'active')`,
          [tenantId, bOwnerName, bEmail, passwordHash]
        );
        userId = uRes.insertId;
      }
    } else {
      // =========================================================================
      // REGISTRATION MODE: New Tenant Store -> Insert Tenant & User
      // =========================================================================
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required for new pharmacy store registration.' });
      }

      // 1. Determine trial mode
      const isFreeTrial = req.body.gateway === 'free_trial' || req.body.billingType === 'trial' || !req.body.trx_no;
      const initialStatus = isFreeTrial ? 'trial' : 'active';

      // Insert Tenant
      const [tenantResult] = await db.query(
        `INSERT INTO tenants (name, domain, address, phone, status)
         VALUES (?, ?, ?, ?, ?)`,
        [bStoreName, bDomain, address || '', phone || null, initialStatus]
      );
      tenantId = tenantResult.insertId;

      // 2. Hash Password & Insert User (Role: tenant_owner)
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const [userResult] = await db.query(
        `INSERT INTO users (tenant_id, name, email, password_hash, role, status)
         VALUES (?, ?, ?, ?, 'tenant_owner', 'active')`,
        [tenantId, bOwnerName, bEmail, passwordHash]
      );
      userId = userResult.insertId;
    }

    // 3. Get Plan Details & Extend / Insert Subscription
    const isFreeTrial = req.body.gateway === 'free_trial' || req.body.billingType === 'trial' || !req.body.trx_no;
    const subStatus = isFreeTrial ? 'trial' : 'active';
    const [[planRow]] = await db.query(
      'SELECT * FROM subscription_plans WHERE id = ? OR LOWER(name) LIKE ? LIMIT 1',
      [bPlanId, `%${planTier || 'pro'}%`]
    );
    
    const sysSettings = getSettings();
    const dynamicTrialDays = (sysSettings && sysSettings.defaultTrialDays !== undefined && sysSettings.defaultTrialDays !== null)
      ? parseInt(sysSettings.defaultTrialDays, 10)
      : 14;

    const durationDays = isFreeTrial ? dynamicTrialDays : (planRow?.duration_days || (req.body.billingCycle === 'yearly' ? 365 : 30));
    const planPrice = isFreeTrial ? 0.00 : (planRow?.price || (planTier === 'enterprise' ? 399.00 : planTier === 'starter' ? 49.00 : 149.00));

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0];

    // Set older active/trial subscriptions for this tenant to expired
    try {
      await db.query(`UPDATE tenant_subscriptions SET status = 'expired' WHERE tenant_id = ?`, [tenantId]);
    } catch (e) {}

    const [subResult] = await db.query(
      `INSERT INTO tenant_subscriptions (tenant_id, plan_id, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, bPlanId, startDate, endDate, subStatus]
    );
    const subscriptionId = subResult.insertId;

    // 4. Insert Payment & Billing Records into `billings` table
    const bGateway = req.body.gateway || req.body.paymentMethod || 'bkash';
    const bTrxNo = req.body.trx_no || req.body.trxNo || req.body.transactionId || req.body.transaction_no || `TRX_${Date.now()}`;
    const bInvoiceNo = req.body.invoice_no || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bPlanName = planRow?.name || (planTier ? `${planTier.toUpperCase()} Tier` : 'Pro Tier');
    const bBillingCycle = req.body.billingCycle || req.body.billing_cycle || 'monthly';
    const bPaidAt = new Date();

    try {
      await db.query(
        `INSERT INTO billings (tenant_id, invoice_no, trx_no, amount, currency, gateway, gateway_ref, plan_name, billing_cycle, status, paid_at)
         VALUES (?, ?, ?, ?, 'BDT', ?, ?, ?, ?, 'success', ?)`,
        [tenantId, bInvoiceNo, bTrxNo, planPrice, bGateway, bTrxNo, bPlanName, bBillingCycle, bPaidAt]
      );
    } catch (bErr) {
      console.warn('Warning inserting into billings table:', bErr.message);
    }

    try {
      await db.query(
        `INSERT INTO payments (tenant_id, subscription_id, amount, payment_method, transaction_id, status)
         VALUES (?, ?, ?, ?, ?, 'success')`,
        [tenantId, subscriptionId, planPrice, bGateway, bTrxNo]
      );
    } catch (pErr) {
      console.warn('Warning inserting into payments table:', pErr.message);
    }

    const [[tenant]] = await db.query('SELECT * FROM tenants WHERE id = ?', [tenantId]);
    const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    const token = signToken({
      id: userId,
      email: user.email,
      role: 'STORE_ADMIN',
      tenantId: tenantId
    });

    return res.status(isRenewal ? 200 : 201).json({
      success: true,
      isRenewal,
      message: isRenewal 
        ? 'Subscription plan renewed successfully! Store access reactivated.' 
        : 'Pharmacy store registered & provisioned successfully.',
      token,
      user: formatUser(user, tenant, { plan_id: bPlanId, status: 'active', end_date: endDate }),
      tenant
    });
  } catch (err) {
    console.error('registerTenant error:', err);
    return res.status(500).json({ success: false, message: `Registration Error: ${err.message}` });
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/login (Universal Simple Login)
// ---------------------------------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, username, password, pin } = req.body;
    const searchIdentifier = (email || username || '').trim().toLowerCase();
    const passToVerify = password || pin;

    if (!searchIdentifier || !passToVerify) {
      return res.status(400).json({ success: false, message: 'Email/Username and password are required.' });
    }

    let [users] = await db.query('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?', [searchIdentifier, searchIdentifier]);
    if (!users || users.length === 0) {
      // Check if superadmin default account
      if (searchIdentifier === 'admin@pharmasaas.com' || searchIdentifier === 'superadmin' || searchIdentifier === 'admin') {
        const [superUsers] = await db.query('SELECT * FROM users WHERE role IN ("SUPER_ADMIN", "superadmin", "ADMIN") LIMIT 1');
        if (superUsers && superUsers.length > 0) {
          users = superUsers;
        }
      }
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Account not found with this email or username.' });
    }

    const user = users[0];
    const isMatch = await verifyPasswordHash(passToVerify, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    let tenant = null;
    let subscription = null;

    if (user.tenant_id) {
      try {
        const [[t]] = await db.query('SELECT * FROM tenants WHERE id = ?', [user.tenant_id]);
        tenant = t;
        const [[s]] = await db.query(
          'SELECT * FROM tenant_subscriptions WHERE tenant_id = ? ORDER BY id DESC LIMIT 1',
          [user.tenant_id]
        );
        subscription = s;
      } catch (e) {}
    }

    const normRole = normalizeRole(user.role);
    const isSuperAdminUser = normRole === 'superadmin';

    // Status & Subscription Expiry Verification (Non-SuperAdmin Users)
    if (!isSuperAdminUser) {
      const uStatus = (user.status || 'active').toLowerCase();
      if (uStatus === 'inactive' || uStatus === 'suspended' || uStatus === 'expired' || uStatus === 'disabled') {
        return res.status(403).json({
          success: false,
          code: 'SUBSCRIPTION_EXPIRED',
          message: '⚠️ Subscription Expired / Account Inactive! Your account is currently inactive or suspended. Please renew your subscription to access your panel.'
        });
      }

      if (tenant) {
        const tStatus = (tenant.status || 'active').toLowerCase();
        if (tStatus === 'inactive' || tStatus === 'suspended' || tStatus === 'expired') {
          return res.status(403).json({
            success: false,
            code: 'SUBSCRIPTION_EXPIRED',
            message: '⚠️ Subscription Expired / Store Suspended! Your pharmacy store account is currently inactive. Please renew your plan to access your panel.'
          });
        }
      }

      if (subscription) {
        const sStatus = (subscription.status || 'active').toLowerCase();
        const todayStr = new Date().toISOString().split('T')[0];
        const endStr = subscription.end_date ? new Date(subscription.end_date).toISOString().split('T')[0] : null;
        const isExpired = sStatus === 'expired' || sStatus === 'suspended' || (endStr && endStr < todayStr);

        if (isExpired) {
          // Auto sync status = 'expired' in MySQL
          if (user.tenant_id) {
            try {
              await db.query(`UPDATE tenants SET status = 'expired' WHERE id = ?`, [user.tenant_id]);
              await db.query(`UPDATE users SET status = 'expired' WHERE tenant_id = ?`, [user.tenant_id]);
              await db.query(`UPDATE tenant_subscriptions SET status = 'expired' WHERE tenant_id = ?`, [user.tenant_id]);
            } catch (e) {}
          }

          return res.status(403).json({
            success: false,
            code: 'SUBSCRIPTION_EXPIRED',
            message: `⚠️ Subscription Expired! Your subscription plan expired on ${endStr || 'recently'}. Please renew your plan to reactivate access.`
          });
        }
      }
    }
    const rolePayload = normRole === 'superadmin' ? 'SUPER_ADMIN' : (normRole === 'tenant_owner' ? 'STORE_ADMIN' : (user.role || 'STORE_ADMIN'));

    const token = signToken({
      id: user.id,
      email: user.email,
      role: rolePayload,
      tenantId: user.tenant_id || 'SYSTEM'
    });

    return res.json({
      success: true,
      token,
      user: formatUser(user, tenant, subscription),
      tenant
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/super-admin-login
// ---------------------------------------------------------------------------
const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = ? AND role IN ("superadmin", "SUPER_ADMIN", "super_admin")',
      [cleanEmail]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Super Admin account not found with this email.' });
    }

    const user = users[0];
    const isMatch = await verifyPasswordHash(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: 'SUPER_ADMIN',
      tenantId: 'SYSTEM'
    });

    return res.json({
      success: true,
      token,
      user: formatUser(user),
      message: 'Super Admin authenticated successfully.'
    });
  } catch (err) {
    console.error('superAdminLogin error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated.' });

    const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    let tenant = null;
    let subscription = null;

    if (user.tenant_id) {
      const [[t]] = await db.query('SELECT * FROM tenants WHERE id = ?', [user.tenant_id]);
      tenant = t;
      const [[s]] = await db.query(
        'SELECT * FROM tenant_subscriptions WHERE tenant_id = ? ORDER BY id DESC LIMIT 1',
        [user.tenant_id]
      );
      subscription = s;
    }

    return res.json({
      success: true,
      user: formatUser(user, tenant, subscription),
      tenant
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const logout = async (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await verifyPasswordHash(currentPassword, user.password_hash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password.' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getStaff = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const [rows] = await db.query('SELECT id, name, email, role, status, created_at FROM users WHERE tenant_id = ? ORDER BY id DESC', [tid]);
    return res.json({ success: true, staff: rows, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { name, email, password, role = 'pharmacist' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const [r] = await db.query(
      'INSERT INTO users (tenant_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, "active")',
      [tid, name, email.trim().toLowerCase(), hash, role]
    );

    const [[created]] = await db.query('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [r.insertId]);
    return res.status(201).json({ success: true, message: 'Staff created.', staff: created, user: created });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { name, role, status } = req.body;
    const updates = [];
    const params = [];
    if (name) { updates.push('name = ?'); params.push(name); }
    if (role) { updates.push('role = ?'); params.push(role); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length > 0) {
      params.push(req.params.id, tid);
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, params);
    }
    const [[updated]] = await db.query('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Staff updated.', staff: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  registerTenant,
  login,
  superAdminLogin,
  getProfile,
  getMe: getProfile,
  logout,
  changePassword,
  getStaff,
  createStaff,
  updateStaff
};
