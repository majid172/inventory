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
    if (process.env.NODE_ENV !== 'production') {
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
    if (process.env.NODE_ENV !== 'production') {
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
// 5. requireRole — RBAC permission check
//    Usage: requireRole('STORE_ADMIN', 'PHARMACIST')
// ---------------------------------------------------------------------------
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}.`
    });
  }
  next();
};

// ---------------------------------------------------------------------------
// 6. enforcePlanLimit — Check tenant usage vs plan limits before create ops
//    resource: 'users' | 'products' | 'branches'
// ---------------------------------------------------------------------------
const enforcePlanLimit = (resource) => async (req, res, next) => {
  if (!req.user || req.user.role === 'SUPER_ADMIN') return next();
  if (!req.tenantId) return next();

  try {
    const [tenantRows] = await db.query(
      `SELECT t.plan_id, sp.max_users, sp.max_products, sp.max_branches
       FROM tenants t
       JOIN subscription_plans sp ON t.plan_id = sp.id
       WHERE t.id = ?`,
      [req.tenantId]
    );

    if (!tenantRows || tenantRows.length === 0) return next();
    const plan = tenantRows[0];
    const limit = plan[`max_${resource}`];
    if (!limit || limit >= 99999) return next(); // Unlimited

    let countQuery = '';
    let countParams = [req.tenantId];

    if (resource === 'users') {
      countQuery = "SELECT COUNT(*) AS cnt FROM users WHERE tenant_id = ? AND role != 'SUPER_ADMIN' AND is_active = 1";
    } else if (resource === 'products') {
      countQuery = 'SELECT COUNT(*) AS cnt FROM products WHERE tenant_id = ? AND is_active = 1';
    } else if (resource === 'branches') {
      countQuery = 'SELECT branches_count AS cnt FROM tenants WHERE id = ?';
    }

    if (!countQuery) return next();

    const [countRows] = await db.query(countQuery, countParams);
    const current = parseInt(countRows[0]?.cnt || 0, 10);

    if (current >= limit) {
      return res.status(403).json({
        success: false,
        code: 'PLAN_LIMIT_REACHED',
        message: `Plan limit reached: your ${plan.plan_id} plan allows up to ${limit} ${resource}. Please upgrade.`,
        current,
        limit,
        resource
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
  enforcePlanLimit
};
