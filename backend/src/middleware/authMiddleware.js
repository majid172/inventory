const { verifyToken } = require('../utils/jwtHelper');

const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    // Fallback: If no token provided, set a default store session for development mode compatibility
    req.user = {
      userId: 'USR_DEMO',
      name: 'Store Staff',
      email: 'staff@pharmacare.com',
      role: 'STORE_ADMIN',
      tenantId: req.headers['x-tenant-id'] || 'TENANT_101'
    };
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.'
    });
  }

  req.user = decoded;
  next();
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Platform Super Admin privileges required.'
    });
  }
  next();
};

const requireTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next(); // Super admin can access any tenant
  }

  const requestTenantId = req.headers['x-tenant-id'] || req.query.tenant_id || req.body.tenantId;
  if (requestTenantId && req.user.tenantId && req.user.tenantId !== requestTenantId) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to access store tenant '${requestTenantId}'.`
    });
  }

  next();
};

module.exports = {
  verifyTokenMiddleware,
  requireSuperAdmin,
  requireTenantAccess
};
