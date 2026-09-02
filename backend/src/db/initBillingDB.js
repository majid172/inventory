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

    // 3. Ensure `subscription_plans` table has all limit columns
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`subscription_plans\` (
        \`id\`                  INT             NOT NULL AUTO_INCREMENT,
        \`name\`                VARCHAR(100)    NOT NULL,
        \`price\`               DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        \`price_monthly\`       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        \`price_yearly\`        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        \`duration_days\`       INT             NOT NULL DEFAULT 30,
        \`max_terminals\`       INT             NOT NULL DEFAULT 1,
        \`max_users\`           INT             NOT NULL DEFAULT 3,
        \`max_products\`        INT             NOT NULL DEFAULT 500,
        \`max_branches\`        INT             NOT NULL DEFAULT 1,
        \`max_sms\`             INT             NOT NULL DEFAULT 0,
        \`trial_days\`          INT             NOT NULL DEFAULT 14,
        \`features\`            JSON            NULL,
        \`is_active\`           TINYINT(1)      NOT NULL DEFAULT 1,
        \`created_at\`          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    try {
      await db.query(`ALTER TABLE \`subscription_plans\` ADD COLUMN \`max_branches\` INT NOT NULL DEFAULT 1 AFTER \`max_terminals\``);
    } catch (e) {}

    // 4. Create `branches` table if not exists (Multi-Branch / Multi-Store Outlets)
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`branches\` (
        \`id\`              INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`       INT             NOT NULL,
        \`name\`            VARCHAR(150)    NOT NULL DEFAULT 'Main Branch',
        \`code\`            VARCHAR(50)     DEFAULT 'BR-01',
        \`address\`         TEXT            NULL,
        \`phone\`           VARCHAR(50)     NULL,
        \`is_main\`         TINYINT(1)      NOT NULL DEFAULT 1,
        \`status\`          ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        \`created_at\`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_branch_tenant\` (\`tenant_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // 5. Create `pos_terminals` table if not exists (Tracks active / registered cash registers)
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`pos_terminals\` (
        \`id\`              INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`       INT             NOT NULL,
        \`branch_id\`       INT             DEFAULT NULL,
        \`terminal_code\`   VARCHAR(50)     NOT NULL,
        \`device_name\`     VARCHAR(255)    DEFAULT 'Main Counter POS',
        \`mac_or_ip\`       VARCHAR(100)    DEFAULT NULL,
        \`status\`          VARCHAR(50)     NOT NULL DEFAULT 'active',
        \`last_active_at\`  DATETIME        DEFAULT NULL,
        \`created_at\`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_tenant_terminal\` (\`tenant_id\`, \`terminal_code\`),
        INDEX \`idx_terminals_tenant\` (\`tenant_id\`),
        INDEX \`idx_terminals_branch\` (\`branch_id\`),
        INDEX \`idx_terminals_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    try {
      await db.query(`ALTER TABLE \`pos_terminals\` ADD COLUMN \`branch_id\` INT DEFAULT NULL AFTER \`tenant_id\``);
    } catch (e) {}

    try {
      await db.query(`ALTER TABLE \`users\` ADD COLUMN \`branch_id\` INT DEFAULT NULL AFTER \`tenant_id\``);
    } catch (e) {}

    try {
      await db.query(`ALTER TABLE \`sales\` ADD COLUMN \`branch_id\` INT DEFAULT NULL AFTER \`tenant_id\`, ADD COLUMN \`terminal_id\` INT DEFAULT NULL AFTER \`branch_id\``);
    } catch (e) {}

    console.log('✅ Billing, Plans, Branches, Terminals & Payments database tables verified / initialized in MySQL!');
  } catch (err) {
    console.warn('⚠️ Warning verifying/creating billing tables in MySQL:', err.message);
  }
}

module.exports = initBillingDB;

