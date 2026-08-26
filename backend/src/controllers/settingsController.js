const db = require('../config/db');

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

// GET /api/settings/system
// Public or Authenticated (depends on route config)
const getSystemSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM system_settings');
    let settings = {};
    rows.forEach(row => {
      if (row.setting_key === 'platform_config') {
        try {
          const config = typeof row.setting_value === 'string' ? JSON.parse(row.setting_value) : row.setting_value;
          settings = { ...settings, ...config };
        } catch (e) {}
      } else {
        settings[row.setting_key] = row.setting_value;
      }
    });
    res.json({ success: true, settings });
  } catch (err) {
    console.error('getSystemSettings error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/settings/system
// SUPER_ADMIN only
const updateSystemSettings = async (req, res) => {
  const { setting_key, setting_value, description } = req.body;
  if (!setting_key || setting_value === undefined) {
    return res.status(400).json({ success: false, message: 'setting_key and setting_value are required' });
  }
  
  try {
    const updatedBy = req.user ? req.user.id : null;
    await db.query(
      `INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value),
         description = COALESCE(VALUES(description), description),
         updated_by = VALUES(updated_by)`,
      [setting_key, JSON.stringify(setting_value), description || null, updatedBy]
    );
    res.json({ success: true, message: 'System setting updated successfully' });
  } catch (err) {
    console.error('updateSystemSettings error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ============================================================================
// TENANT SETTINGS
// ============================================================================

// GET /api/settings/tenant
// Requires authentication & tenant access
const getTenantSettings = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(403).json({ success: false, message: 'No tenant context' });

    const [rows] = await db.query('SELECT setting_key, setting_value FROM tenant_settings WHERE tenant_id = ?', [tenantId]);
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch (e) {
        settings[row.setting_key] = row.setting_value;
      }
    });
    res.json({ success: true, settings });
  } catch (err) {
    console.error('getTenantSettings error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/settings/tenant
// Requires authentication & tenant access (STORE_ADMIN)
const updateTenantSettings = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(403).json({ success: false, message: 'No tenant context' });

    const { setting_key, setting_value, settings } = req.body;

    // Support for batch updating an object of settings
    if (settings && typeof settings === 'object') {
      const promises = Object.entries(settings).map(([key, val]) => {
        return db.query(
          `INSERT INTO tenant_settings (tenant_id, setting_key, setting_value)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [tenantId, key, JSON.stringify(val)]
        );
      });
      await Promise.all(promises);
      return res.json({ success: true, message: 'Tenant settings updated successfully' });
    }

    // Legacy single key-value update
    if (!setting_key || setting_value === undefined) {
      return res.status(400).json({ success: false, message: 'setting_key and setting_value are required' });
    }

    await db.query(
      `INSERT INTO tenant_settings (tenant_id, setting_key, setting_value)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [tenantId, setting_key, JSON.stringify(setting_value)]
    );
    res.json({ success: true, message: 'Tenant setting updated successfully' });
  } catch (err) {
    console.error('updateTenantSettings error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  getTenantSettings,
  updateTenantSettings
};
