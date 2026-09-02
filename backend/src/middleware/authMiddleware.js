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
// ---------------------------------------------------------------------------
const requireActiveSubscription = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const role = (req.user?.role || '').toUpperCase();
  if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') return next();
  if (!req.tenantId) return res.status(403).json({ success: false, message: 'No tenant context' });

  try {
    const [rows] = await db.query(
      'SELECT status, subscription_end, grace_period_days FROM tenants WHERE id = ?',
      [req.tenantId]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const tenant = rows[0];
    const now = new Date();
    const subEnd = tenant.subscription_end ? new Date(tenant.subscription_end) : null;

    if (tenant.status === 'suspended') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Grace period check: expired but within grace window → read-only mode
    if (tenant.status === 'expired' || (subEnd && subEnd < now && tenant.status !== 'trial')) {
      const graceDays = tenant.grace_period_days || 7;
      const graceCutoff = subEnd ? new Date(subEnd.getTime() + graceDays * 86400000) : now;
      if (now > graceCutoff) {
        return res.status(403).json({
          success: false,
          code: 'SUBSCRIPTION_EXPIRED',
          message: 'Subscription expired. Please renew to continue using the platform.'
        });
      }
      // Within grace — allow GETs, block POSTs/PUTs/DELETEs
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(403).json({
          success: false,
          code: 'GRACE_PERIOD_READONLY',
          message: 'Subscription expired. Account is in read-only mode during grace period. Please renew.'
        });
      }
    }

    next();
  } catch (err) {
    console.error('Subscription check error:', err.message);
    next(); // Fail open so a DB error doesn't block legitimate users
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
  if (r === 'TENANTOWNER' || r === 'OWNER' || r === 'ADMIN' || r === 'STOREADMIN' || r === 'MANAGER') return 'STORE_ADMIN';
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
      const [tenantRows] = await db.query(
        `SELECT sp.id, sp.max_users, sp.max_products, sp.max_branches, sp.max_terminals, sp.name as plan_name
         FROM tenants t
         LEFT JOIN subscription_plans sp ON (t.plan_id = sp.id OR t.plan_tier = sp.id OR LOWER(t.plan_tier) = LOWER(sp.name))
         WHERE t.id = ? LIMIT 1`,
        [tid]
      );
      if (tenantRows && tenantRows.length > 0) {
        plan = tenantRows[0];
      }
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

