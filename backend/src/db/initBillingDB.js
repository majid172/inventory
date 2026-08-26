const db = require('../config/db');

async function initBillingDB() {
  try {
    // 1. Create `payments` table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`payments\` (
        \`id\`              INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`       INT             NOT NULL,
        \`transaction_no\`  VARCHAR(100)    DEFAULT NULL,
        \`amount\`          DECIMAL(10,2)   NOT NULL,
        \`currency\`        VARCHAR(10)     NOT NULL DEFAULT 'BDT',
        \`gateway\`         VARCHAR(50)     NOT NULL DEFAULT 'bkash',
        \`gateway_ref\`     VARCHAR(255)    DEFAULT NULL,
        \`invoice_no\`      VARCHAR(100)    DEFAULT NULL,
        \`plan_id\`         VARCHAR(50)     DEFAULT NULL,
        \`billing_cycle\`   VARCHAR(20)     NOT NULL DEFAULT 'monthly',
        \`status\`          VARCHAR(50)     NOT NULL DEFAULT 'success',
        \`paid_at\`         DATETIME        DEFAULT NULL,
        \`created_at\`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_payments_tenant\` (\`tenant_id\`),
        INDEX \`idx_payments_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // Ensure `transaction_no` column exists if table was created previously
    try {
      await db.query(`ALTER TABLE \`payments\` ADD COLUMN \`transaction_no\` VARCHAR(100) DEFAULT NULL AFTER \`tenant_id\``);
    } catch (e) {}

    // 2. Create `billings` table if not exists (Aligned with phpMyAdmin structure)
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`billings\` (
        \`id\`              INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`       INT             NOT NULL,
        \`invoice_no\`      VARCHAR(100)    NOT NULL,
        \`trx_no\`          VARCHAR(100)    DEFAULT NULL,
        \`amount\`          DECIMAL(10,2)   NOT NULL,
        \`currency\`        VARCHAR(10)     NOT NULL DEFAULT 'BDT',
        \`gateway\`         VARCHAR(50)     NOT NULL DEFAULT 'bkash',
        \`gateway_ref\`     VARCHAR(255)    DEFAULT NULL,
        \`plan_name\`       VARCHAR(100)    DEFAULT 'Pro Tier',
        \`billing_cycle\`   VARCHAR(20)     NOT NULL DEFAULT 'monthly',
        \`status\`          VARCHAR(50)     NOT NULL DEFAULT 'success',
        \`paid_at\`         DATETIME        DEFAULT NULL,
        \`created_at\`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_billings_tenant\` (\`tenant_id\`),
        INDEX \`idx_billings_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    try {
      await db.query(`ALTER TABLE \`billings\` ADD COLUMN \`trx_no\` VARCHAR(100) DEFAULT NULL AFTER \`invoice_no\``);
    } catch (e) {}

    console.log('✅ Billing & Payments database tables verified / initialized in MySQL!');
  } catch (err) {
    console.warn('⚠️ Warning verifying/creating billing tables in MySQL:', err.message);
  }
}

module.exports = initBillingDB;
