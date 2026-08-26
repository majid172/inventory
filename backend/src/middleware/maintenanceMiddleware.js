const { getSettings } = require('../utils/settingsService');

const maintenanceMiddleware = (req, res, next) => {
  const settings = getSettings();
  
  // If maintenance mode is off, proceed normally
  if (!settings || !settings.maintenanceMode) {
    return next();
  }

  // Allow super admins to bypass maintenance mode
  const role = (req.user?.role || '').toUpperCase();
  if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') {
    return next();
  }

  // Block everyone else
  return res.status(503).json({
    success: false,
    code: 'MAINTENANCE_MODE',
    message: settings.maintenanceMessage || 'System is currently undergoing maintenance. Please check back shortly.'
  });
};

module.exports = maintenanceMiddleware;
