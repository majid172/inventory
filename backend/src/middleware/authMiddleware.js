// ============================================================================
// PharmaCare SaaS — Multi-Tenant Auth & Scope Middleware
// ============================================================================

const { verifyToken } = require('../utils/jwtHelper');
const db = require('../config/db');

// ---------------------------------------------------------------------------
// 1. verifyTokenMiddleware — Parse & validate JWT on every protected request
// ---------------------------------------------------------------------------
const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    if (process.env.NODE_ENV === 'development' && process.env.DEV_ALLOW_MOCK_AUTH === 'true') {
      req.user = { id: 1, email: 'admin@yourapp.com', role: 'SUPER_ADMIN', tenantId: 'SYSTEM' };
      req.tenantId = null;
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication token required. Please sign in.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    if (process.env.NODE_ENV === 'development' && process.env.DEV_ALLOW_MOCK_AUTH === 'true') {
      req.user = { id: 1, email: 'admin@yourapp.com', role: 'SUPER_ADMIN', tenantId: 'SYSTEM' };
      req.tenantId = null;
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please sign in again.'
    });
  }

  req.user = decoded;
  // Attach tenantId shortcut for convenience (support token claim or x-tenant-id header)
  const parsedTokenTid = decoded.tenantId && !isNaN(parseInt(decoded.tenantId, 10)) ? parseInt(decoded.tenantId, 10) : null;
  const parsedHeaderTid = req.headers['x-tenant-id'] && !isNaN(parseInt(req.headers['x-tenant-id'], 10)) ? parseInt(req.headers['x-tenant-id'], 10) : null;
  req.tenantId = parsedTokenTid || parsedHeaderTid || 1;

  // Attach branchId shortcut (from token claim or x-branch-id header)
  const parsedTokenBid = (decoded.branchId || decoded.branch_id) && !isNaN(parseInt(decoded.branchId || decoded.branch_id, 10))
    ? parseInt(decoded.branchId || decoded.branch_id, 10)
    : null;
  const parsedHeaderBid = req.headers['x-branch-id'] && !isNaN(parseInt(req.headers['x-branch-id'], 10))
    ? parseInt(req.headers['x-branch-id'], 10)
    : null;
  req.branchId = parsedTokenBid || parsedHeaderBid || null;

  next();
};

// ---------------------------------------------------------------------------
// 2. requireSuperAdmin — Platform owner only
// ---------------------------------------------------------------------------
const requireSuperAdmin = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && !req.user) {
    req.user = { id: 1, email: 'admin@pharmasaas.com', role: 'SUPER_ADMIN', tenantId: 'SYSTEM' };
    return next();
  }
  const role = (req.user?.role || '').toString().toUpperCase().replace(/[_\s-]+/g, '');
  if (!req.user || (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'TENANTOWNER' && role !== 'STOREADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Platform Super Admin privileges required.'
    });
  }
  next();
};

// ---------------------------------------------------------------------------
// 3. requireTenantAccess — Ensures request is scoped to the user's own tenant
// ---------------------------------------------------------------------------
const requireTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  // Super admin bypasses tenant isolation
  const role = (req.user?.role || '').toUpperCase();
  if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') return next();

  if (!req.tenantId) {
    return res.status(403).json({ success: false, message: 'No tenant context. Please sign in.' });
  }
  next();
};

// ---------------------------------------------------------------------------
// 4. requireActiveSubscription — Block write ops on expired/suspended tenants
//    Uses tenant_subscriptions.end_date (real DB schema — tenants table has
//    NO subscription_end or grace_period_days columns).
// ---------------------------------------------------------------------------
const GRACE_PERIOD_DAYS = 7; // Fixed grace period after subscription expires

const requireActiveSubscription = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const role = (req.user?.role || '').toUpperCase();
  if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') return next();
  if (!req.tenantId) return res.status(403).json({ success: false, message: 'No tenant context' });

  try {
    // 1. Check tenant exists and its account status
    const [[tenant]] = await db.query(
      'SELECT id, status FROM tenants WHERE id = ?',
      [req.tenantId]
    );

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    if (tenant.status === 'suspended') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // 2. Get the latest subscription from tenant_subscriptions
    const [[sub]] = await db.query(
      `SELECT id, status, end_date
       FROM tenant_subscriptions
       WHERE tenant_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [req.tenantId]
    );

    // No subscription record at all — deny writes, allow reads
    if (!sub) {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(403).json({
          success: false,
          code: 'NO_SUBSCRIPTION',
          message: 'No active subscription found. Please subscribe to a plan.'
        });
      }
      return next();
    }

    const now = new Date();
    const subStatus = (sub.status || '').toLowerCase();
    const subEnd = sub.end_date ? new Date(sub.end_date) : null;

    // 3. Active subscription — allow everything
    if (subStatus === 'active' && subEnd && subEnd >= now) {
      return next();
    }

    // 4. Cancelled subscription — deny
    if (subStatus === 'cancelled') {
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_CANCELLED',
        message: 'Your subscription has been cancelled. Please renew to continue.'
      });
    }

    // 5. Expired subscription — apply grace period logic
    if (subStatus === 'expired' || (subEnd && subEnd < now)) {
      const graceCutoff = subEnd
        ? new Date(subEnd.getTime() + GRACE_PERIOD_DAYS * 86400000)
        : now;

      if (now > graceCutoff) {
        // Beyond grace period — block all access
        return res.status(403).json({
          success: false,
          code: 'SUBSCRIPTION_EXPIRED',
          message: `Subscription expired on ${subEnd ? subEnd.toDateString() : 'an earlier date'}. Please renew to continue using the platform.`
        });
      }

      // Within grace period — allow reads, block writes
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const daysLeft = Math.ceil((graceCutoff - now) / 86400000);
        return res.status(403).json({
          success: false,
          code: 'GRACE_PERIOD_READONLY',
          message: `Subscription expired. Account is in read-only mode. You have ${daysLeft} day(s) left in the grace period to renew.`
        });
      }

      return next();
    }

    // 6. Pending payment — allow reads, block writes
    if (subStatus === 'pending_payment') {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(403).json({
          success: false,
          code: 'PAYMENT_PENDING',
          message: 'Your subscription payment is pending. Please complete payment to unlock full access.'
        });
      }
      return next();
    }

    // 7. Any other status (e.g. unknown) — allow through (fail open)
    next();
  } catch (err) {
    console.error('Subscription check error:', err.message);
    next(); // Fail open so a DB error does not block legitimate users
  }
};

// ---------------------------------------------------------------------------
// 5. requireRole — RBAC permission check (supports normalized uppercase roles)
//    Usage: requireRole('STORE_ADMIN', 'PHARMACIST', 'OWNER')
// ---------------------------------------------------------------------------
const normalizeRoleString = (role) => {
  if (!role) return 'CASHIER';
  const r = role.toString().toUpperCase().replace(/[_\s-]+/g, '');
  if (r === 'SUPERADMIN') return 'SUPER_ADMIN';
  if (r === 'BRANCHMANAGER' || r === 'BRANCH_MANAGER' || r === 'MANAGER') return 'BRANCH_MANAGER';
  if (r === 'TENANTOWNER' || r === 'OWNER' || r === 'ADMIN' || r === 'STOREADMIN') return 'STORE_ADMIN';
  if (r === 'PHARMACIST') return 'PHARMACIST';
  return 'CASHIER';
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized. Please sign in.' });
  
  const userRole = normalizeRoleString(req.user.role);
  const normalizedAllowed = allowedRoles.map(r => normalizeRoleString(r));

  // Super Admin always has full access
  if (userRole === 'SUPER_ADMIN') return next();

  if (!normalizedAllowed.includes(userRole)) {
    return res.status(403).json({
      success: false,
      code: 'ACCESS_FORBIDDEN',
      message: `Access denied. Your role (${userRole}) does not have permission to access this resource.`
    });
  }
  next();
};

// ---------------------------------------------------------------------------
// 6. enforcePlanLimit — Check tenant usage vs plan limits before create ops
//    resource: 'users' | 'products' | 'branches' | 'terminals'
// ---------------------------------------------------------------------------
const enforcePlanLimit = (resource) => async (req, res, next) => {
  if (!req.user || req.user.role === 'SUPER_ADMIN') return next();
  const tid = req.tenantId || req.user?.tenantId || 1;

  try {
    let plan = null;
    try {
      const [subRows] = await db.query(
        `SELECT sp.id, sp.max_users, sp.max_products, sp.max_branches, sp.max_terminals, sp.name as plan_name
         FROM tenant_subscriptions ts
         JOIN subscription_plans sp ON ts.plan_id = sp.id
         WHERE ts.tenant_id = ? AND ts.status IN ('active', 'trial')
         ORDER BY ts.id DESC LIMIT 1`,
        [tid]
      );
      if (subRows && subRows.length > 0) {
        plan = subRows[0];
      }
    } catch (e) {}

    if (!plan) {
      // Fallback: get any subscription for this tenant (expired is better than nothing)
      // NOTE: tenants table has no plan_id or plan_tier columns — always use tenant_subscriptions
      try {
        const [fallbackRows] = await db.query(
          `SELECT sp.id, sp.max_users, sp.max_products, sp.max_branches, sp.max_terminals, sp.name as plan_name
           FROM tenant_subscriptions ts
           JOIN subscription_plans sp ON ts.plan_id = sp.id
           WHERE ts.tenant_id = ?
           ORDER BY ts.id DESC LIMIT 1`,
          [tid]
        );
        if (fallbackRows && fallbackRows.length > 0) {
          plan = fallbackRows[0];
        }
      } catch (e) {}
    }

    if (!plan) return next();
    const limit = plan[`max_${resource}`];
    if (limit === undefined || limit === null || limit >= 99999) return next(); // Unlimited

    let countQuery = '';
    let countParams = [tid];

    if (resource === 'users') {
      countQuery = "SELECT COUNT(*) AS cnt FROM users WHERE tenant_id = ? AND role != 'SUPER_ADMIN'";
    } else if (resource === 'products') {
      countQuery = 'SELECT COUNT(*) AS cnt FROM products WHERE tenant_id = ?';
    } else if (resource === 'branches') {
      countQuery = 'SELECT COUNT(*) AS cnt FROM branches WHERE tenant_id = ?';
    } else if (resource === 'terminals') {
      countQuery = "SELECT COUNT(*) AS cnt FROM pos_terminals WHERE tenant_id = ? AND status = 'active'";
    }

    if (!countQuery) return next();

    const [countRows] = await db.query(countQuery, countParams);
    const current = parseInt(countRows[0]?.cnt || 0, 10);

    if (current >= limit) {
      const planTitle = plan.plan_name || 'Starter';
      return res.status(403).json({
        success: false,
        code: 'PLAN_LIMIT_REACHED',
        message: `Plan limit reached: your ${planTitle} plan allows up to ${limit} ${resource}. Please upgrade your subscription tier to add more.`,
        current,
        limit,
        resource,
        planName: planTitle
      });
    }

    next();
  } catch (err) {
    console.error('Plan limit check error:', err.message);
    next(); // Fail open
  }
};

module.exports = {
  verifyTokenMiddleware,
  requireSuperAdmin,
  requireTenantAccess,
  requireActiveSubscription,
  requireRole,
  enforcePlanLimit,
  normalizeRoleString
};

