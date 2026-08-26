const db = require('../config/db');

let cachedSettings = {
  platformName: 'PharmaCare SaaS',
  supportEmail: 'support@pharmacare.com',
  maintenanceMode: false,
  selfRegistrationEnabled: true
};

const initSettings = async () => {
  try {
    await refreshSettings();
    console.log('Global settings loaded from database.');
  } catch (err) {
    console.error('Failed to init settings from DB, using defaults:', err.message);
  }
};

const refreshSettings = async () => {
  const [rows] = await db.query("SELECT setting_value FROM system_settings WHERE setting_key = 'platform_config'");
  if (rows && rows.length > 0) {
    cachedSettings = typeof rows[0].setting_value === 'string' 
      ? JSON.parse(rows[0].setting_value) 
      : rows[0].setting_value;
  }
};

const getSettings = () => {
  return cachedSettings;
};

module.exports = {
  initSettings,
  refreshSettings,
  getSettings
};
