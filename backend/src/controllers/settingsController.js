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
    let tenantId = req.tenantId || (req.user && req.user.tenantId);

    // 1. Fetch tenant basic record from `tenants` table
    let tenant = null;
    try {
      if (tenantId && tenantId !== 'SYSTEM') {
        const [[t]] = await db.query('SELECT * FROM tenants WHERE id = ?', [tenantId]);
        tenant = t;
      }
      if (!tenant) {
        const [[firstT]] = await db.query('SELECT * FROM tenants ORDER BY id ASC LIMIT 1');
        tenant = firstT;
        tenantId = tenant?.id || 1;
      }
    } catch (e) {
      console.warn('Tenant table query error:', e.message);
    }

    // 2. Fetch custom key-value settings from `tenant_settings` table if exists
    let settings = {};
    try {
      const [rows] = await db.query('SELECT setting_key, setting_value FROM tenant_settings WHERE tenant_id = ?', [tenantId]);
      rows.forEach(row => {
        try {
          settings[row.setting_key] = JSON.parse(row.setting_value);
        } catch (e) {
          settings[row.setting_key] = row.setting_value;
        }
      });
    } catch (e) {}

    const storeNameVal = tenant?.name || tenant?.store_name || 'My Pharmacy Store';
    const storePhoneVal = tenant?.phone || '';
    const storeAddressVal = tenant?.address || '';
    const taxRegVal = tenant?.tax_registration_number || '';

    settings = {
      name: storeNameVal,
      storeName: storeNameVal,
      store_name: storeNameVal,
      phone: storePhoneVal,
      address: storeAddressVal,
      tax_registration_number: taxRegVal,
      tenantId: tenant?.id || 1,
      ...settings
    };

    if (!settings.name || settings.name === 'My Pharmacy Store') settings.name = storeNameVal;
    if (!settings.storeName) settings.storeName = storeNameVal;
    if (!settings.phone) settings.phone = storePhoneVal;
    if (!settings.address) settings.address = storeAddressVal;

    res.json({ success: true, settings, tenant });
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
