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
  if (r === 'tenantowner' || r === 'owner' || r === 'admin' || r === 'storeadmin') return 'tenant_owner';
  if (r === 'branchmanager' || r === 'manager') return 'branch_manager';
  if (r === 'pharmacist') return 'pharmacist';
  return 'cashier';
};

const formatUser = (u, tenant = null, subscription = null, branch = null) => ({
  id: u.id?.toString(),
  tenantId: u.tenant_id?.toString() || null,
  branch_id: u.branch_id ? Number(u.branch_id) : null,
  branchId: u.branch_id ? Number(u.branch_id) : null,
  branch_name: branch ? branch.name : u.branch_name || null,
  branch_code: branch ? branch.code : u.branch_code || null,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  storeName: tenant ? (tenant.name || tenant.store_name) : null,
  domain: tenant ? (tenant.domain || tenant.slug) : null,
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

    if (!bEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const bDomain = bStoreName ? bStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';

    // Check if user or tenant already exists in MySQL
    const [existingUsers] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [bEmail]);
    const [existingTenants] = bDomain ? await db.query('SELECT * FROM tenants WHERE LOWER(domain) = ? OR LOWER(name) = ?', [bDomain, bStoreName.toLowerCase()]) : [[]];

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
      if (!bStoreName) {
        return res.status(400).json({ success: false, message: 'Store name is required for new pharmacy store registration.' });
      }
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

      // =========================================================================
      // AUTO-PROVISIONING: Insert Default Branch & Default POS Terminal
      // =========================================================================
      try {
        // 1. Create Default "Main Branch"
        const [branchRes] = await db.query(
          `INSERT INTO branches (tenant_id, name, code, address, phone, is_main, status)
           VALUES (?, ?, 'BR-01', ?, ?, 1, 'active')`,
          [tenantId, `${bStoreName} - Main Branch`, address || '', phone || '']
        );
        const defaultBranchId = branchRes.insertId;

        // 2. Assign User to Main Branch
        await db.query(`UPDATE users SET branch_id = ? WHERE id = ?`, [defaultBranchId, userId]);

        // 3. Register First POS Terminal ("Counter-01")
        await db.query(
          `INSERT INTO pos_terminals (tenant_id, branch_id, terminal_code, device_name, status)
           VALUES (?, ?, 'POS-01', 'Counter-01 (Main POS)', 'active')`,
          [tenantId, defaultBranchId]
        );
      } catch (provErr) {
        console.warn('⚠️ Auto-provisioning branch/terminal notice:', provErr.message);
      }
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
    const planPrice = isFreeTrial ? 0.00 : (planRow?.price || (planTier === 'enterprise' ? 399.00 : planTier === 'starter' ? 0.00 : 0.00));

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
        `INSERT INTO billings (tenant_id, tenant_subscription_id, invoice_no, trx_no, amount, currency, gateway, gateway_ref, plan_name, billing_cycle, status, paid_at)
         VALUES (?, ?, ?, ?, ?, 'BDT', ?, ?, ?, ?, 'success', ?)`,
        [tenantId, subscriptionId, bInvoiceNo, bTrxNo, planPrice, bGateway, bTrxNo, bPlanName, bBillingCycle, bPaidAt]
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
    let branch = null;
    if (user.branch_id) {
      try {
        const [[bRow]] = await db.query('SELECT id, name, code FROM branches WHERE id = ?', [user.branch_id]);
        branch = bRow || null;
      } catch (e) {}
    }

    const rolePayload = normRole === 'superadmin' 
      ? 'SUPER_ADMIN' 
      : (normRole === 'tenant_owner' ? 'STORE_ADMIN' 
      : (normRole === 'branch_manager' ? 'BRANCH_MANAGER' 
      : (user.role || 'CASHIER')));

    const token = signToken({
      id: user.id,
      email: user.email,
      role: rolePayload,
      tenantId: user.tenant_id || 'SYSTEM',
      branchId: user.branch_id || null,
      branch_id: user.branch_id || null
    });

    return res.json({
      success: true,
      token,
      user: formatUser(user, tenant, subscription, branch),
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
    let branch = null;

    if (user.tenant_id) {
      const [[t]] = await db.query('SELECT * FROM tenants WHERE id = ?', [user.tenant_id]);
      tenant = t;
      const [[s]] = await db.query(
        'SELECT * FROM tenant_subscriptions WHERE tenant_id = ? ORDER BY id DESC LIMIT 1',
        [user.tenant_id]
      );
      subscription = s;
    }

    if (user.branch_id) {
      try {
        const [[bRow]] = await db.query('SELECT id, name, code FROM branches WHERE id = ?', [user.branch_id]);
        branch = bRow || null;
      } catch (e) {}
    }

    return res.json({
      success: true,
      user: formatUser(user, tenant, subscription, branch),
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
    const tid = req.tenantId || (req.user && req.user.tenantId && req.user.tenantId !== 'SYSTEM' ? req.user.tenantId : 1);
    const userRole = (req.user?.role || '').toString().toUpperCase().replace(/[_\s-]+/g, '');
    const userBranchId = req.user?.branch_id || req.user?.branchId || req.branchId;
    const filterBranchId = req.query.branch_id;

    console.log(`[getStaff] tid=${tid} userRole=${userRole} userBranch=${userBranchId} filterBranch=${filterBranchId}`);

    let whereSql = "WHERE (u.tenant_id = ? OR u.tenant_id IS NULL) AND LOWER(COALESCE(u.role, '')) NOT IN ('super_admin', 'superadmin')";
    const params = [tid];

    // Branch manager / Cashier is strictly restricted to their own assigned branch
    if (userRole === 'BRANCHMANAGER' || userRole === 'MANAGER' || userRole === 'CASHIER') {
      if (userBranchId) {
        whereSql += " AND u.branch_id = ?";
        params.push(userBranchId);
      }
    } else if (filterBranchId && filterBranchId !== 'all') {
      whereSql += " AND (u.branch_id = ? OR u.branch_id IS NULL OR LOWER(u.role) IN ('store_admin', 'tenant_owner', 'storeadmin', 'owner'))";
      params.push(filterBranchId);
    }

    let rows = [];
    try {
      const [r] = await db.query(
        `SELECT u.id, u.name, u.email, u.role, u.status, u.branch_id, u.created_at,
                COALESCE(b.name, 'Main Branch') AS branch_name, 
                COALESCE(b.code, 'HQ') AS branch_code
         FROM users u
         LEFT JOIN branches b ON b.id = u.branch_id
         ${whereSql}
         ORDER BY u.id DESC`,
        params
      );
      rows = r;
    } catch (e1) {
      console.warn('[getStaff] primary query error, trying fallback:', e1.message);
      try {
        const [r] = await db.query(
          `SELECT u.id, u.name, u.email, u.role, u.status, u.branch_id, u.created_at
           FROM users u
           ${whereSql}
           ORDER BY u.id DESC`,
          params
        );
        rows = r;
      } catch (e2) {
        console.error('[getStaff] fallback query error:', e2.message);
        rows = [];
      }
    }

    // Fetch tenant active subscription plan info and max_users limit from database
    let maxUsers = 2;
    let planName = 'Starter';
    let planId = 1;

    try {
      // 1. Check active subscription first
      const [[sub]] = await db.query(
        `SELECT sp.id, sp.name as plan_name, sp.max_users
         FROM tenant_subscriptions ts
         JOIN subscription_plans sp ON ts.plan_id = sp.id
         WHERE ts.tenant_id = ? AND ts.status IN ('active', 'trial')
         ORDER BY ts.id DESC LIMIT 1`,
        [tid]
      );
      if (sub && sub.max_users) {
        maxUsers = Number(sub.max_users);
        planName = sub.plan_name;
        planId = sub.id;
      } else {
        // 2. Fallback to tenants table
        const [[tRow]] = await db.query(
          `SELECT sp.id, sp.name as plan_name, sp.max_users
           FROM tenants t
           LEFT JOIN subscription_plans sp ON (t.plan_id = sp.id OR t.plan_tier = sp.id OR LOWER(t.plan_tier) = LOWER(sp.name))
           WHERE t.id = ? LIMIT 1`,
          [tid]
        );
        if (tRow && tRow.max_users) {
          maxUsers = Number(tRow.max_users);
          planName = tRow.plan_name || 'Starter';
          planId = tRow.id || 1;
        }
      }
    } catch (planErr) {
      console.warn('getStaff plan limit lookup warning:', planErr.message);
    }

    const totalStaff = rows.length;
    const canAddStaff = totalStaff < maxUsers;

    return res.json({
      success: true,
      staff: rows,
      data: rows,
      meta: {
        totalStaff,
        maxUsers,
        planName,
        planId,
        canAddStaff,
        remainingSlots: Math.max(0, maxUsers - totalStaff)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const userRole = (req.user?.role || '').toString().toUpperCase().replace(/[_\s-]+/g, '');
    const userBranchId = req.user?.branch_id || req.user?.branchId || req.branchId;
    let { name, email, password, role = 'CASHIER', branch_id = null } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Branch manager creates staff inside their assigned branch
    if (userRole === 'BRANCHMANAGER' || userRole === 'MANAGER') {
      branch_id = userBranchId;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let insertId = null;
    try {
      const [r] = await db.query(
        'INSERT INTO users (tenant_id, branch_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, "active")',
        [tid, branch_id || null, name, email.trim().toLowerCase(), hash, role]
      );
      insertId = r.insertId;
    } catch (dbErr) {
      // Auto-fix column definition if role was truncated (e.g. was short enum/varchar) or status/branch_id missing
      console.warn('[createStaff] Initial insert failed, ensuring table columns and retrying:', dbErr.message);
      try {
        await db.query('ALTER TABLE `users` MODIFY COLUMN `role` VARCHAR(50) NOT NULL DEFAULT "CASHIER"');
      } catch (e) {}
      try {
        await db.query('ALTER TABLE `users` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT "active"');
      } catch (e) {}
      try {
        await db.query('ALTER TABLE `users` ADD COLUMN `branch_id` INT DEFAULT NULL AFTER `tenant_id`');
      } catch (e) {}

      // Retry insert
      try {
        const [r2] = await db.query(
          'INSERT INTO users (tenant_id, branch_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, "active")',
          [tid, branch_id || null, name, email.trim().toLowerCase(), hash, role]
        );
        insertId = r2.insertId;
      } catch (retryErr) {
        // Fallback without branch_id/status if still failing
        const [r3] = await db.query(
          'INSERT INTO users (tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
          [tid, name, email.trim().toLowerCase(), hash, role]
        );
        insertId = r3.insertId;
      }
    }

    let created = { id: insertId, name, email, role, branch_id, status: 'active' };
    try {
      const [[cRow]] = await db.query(
        `SELECT u.id, u.name, u.email, u.role, u.status, u.branch_id, u.created_at,
                COALESCE(b.name, 'Main Branch') AS branch_name, 
                COALESCE(b.code, 'HQ') AS branch_code
         FROM users u
         LEFT JOIN branches b ON b.id = u.branch_id
         WHERE u.id = ?`,
        [insertId]
      );
      if (cRow) created = cRow;
    } catch (fetchErr) {
      console.warn('[createStaff] fetch created staff warning:', fetchErr.message);
    }

    return res.status(201).json({ success: true, message: 'Staff created.', staff: created, user: created });
  } catch (err) {
    console.error('[createStaff] fatal error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const { name, role, status, branch_id, password } = req.body;
    const updates = [];
    const params = [];
    if (name) { updates.push('name = ?'); params.push(name); }
    if (role) { updates.push('role = ?'); params.push(role); }
    if (status) { updates.push('status = ?'); params.push(status); }
    if (branch_id !== undefined) { updates.push('branch_id = ?'); params.push(branch_id || null); }
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password.trim(), salt);
      updates.push('password_hash = ?');
      params.push(hash);
    }
    if (updates.length > 0) {
      params.push(req.params.id, tid);
      try {
        await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, params);
      } catch (updateErr) {
        // Fix column schema if role was truncated
        try {
          await db.query('ALTER TABLE `users` MODIFY COLUMN `role` VARCHAR(50) NOT NULL DEFAULT "CASHIER"');
          await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`, params);
        } catch (retryUpdateErr) {
          console.error('[updateStaff] retry failed:', retryUpdateErr.message);
        }
      }
    }
    const [[updated]] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.branch_id, u.created_at,
              COALESCE(b.name, 'Main Branch') AS branch_name, 
              COALESCE(b.code, 'HQ') AS branch_code
       FROM users u
       LEFT JOIN branches b ON b.id = u.branch_id
       WHERE u.id = ?`,
      [req.params.id]
    );
    return res.json({ success: true, message: 'Staff updated.', staff: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const tid = req.tenantId || 1;
    const userId = req.params.id;

    const [[targetUser]] = await db.query('SELECT id, role, email FROM users WHERE id = ? AND tenant_id = ?', [userId, tid]);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (targetUser.id === req.user?.id || targetUser.role === 'TENANT_OWNER' || targetUser.role === 'STORE_ADMIN') {
      const [adminCountRows] = await db.query('SELECT COUNT(*) as count FROM users WHERE tenant_id = ? AND role IN ("STORE_ADMIN", "TENANT_OWNER")', [tid]);
      if (adminCountRows[0].count <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the only Store Admin account.' });
      }
    }

    await db.query('DELETE FROM users WHERE id = ? AND tenant_id = ?', [userId, tid]);
    return res.json({ success: true, message: 'Staff member deleted successfully.' });
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
  updateStaff,
  deleteStaff
};

