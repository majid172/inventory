const db = require('../config/db');

async function initSalesDB() {
  try {
    // 1. Create `sales` table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`sales\` (
        \`id\`              INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`       INT             NOT NULL DEFAULT 1,
        \`invoice_no\`      VARCHAR(100)    NOT NULL,
        \`customer_phone\`  VARCHAR(255)    DEFAULT 'Walk-in Patient',
        \`subtotal\`        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`discount\`        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`tax\`             DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`total\`           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`paid_amount\`     DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`due_amount\`      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`payment_method\`  VARCHAR(50)     NOT NULL DEFAULT 'cash',
        \`status\`          VARCHAR(50)     NOT NULL DEFAULT 'completed',
        \`notes\`           TEXT            DEFAULT NULL,
        \`sold_by\`         INT             DEFAULT NULL COMMENT 'user_id of cashier',
        \`created_at\`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_tenant_invoice\` (\`tenant_id\`, \`invoice_no\`),
        INDEX \`idx_sale_tenant\`   (\`tenant_id\`),
        INDEX \`idx_sale_phone\`    (\`customer_phone\`),
        INDEX \`idx_sale_date\`     (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // Ensure customer_phone and transaction_no columns exist if table was created previously
    try {
      await db.query(`ALTER TABLE \`sales\` ADD COLUMN \`customer_phone\` VARCHAR(255) DEFAULT 'Walk-in Patient' AFTER \`invoice_no\``);
    } catch (e) {}

    try {
      await db.query(`ALTER TABLE \`sales\` ADD COLUMN \`transaction_no\` VARCHAR(100) DEFAULT NULL AFTER \`payment_method\``);
    } catch (e) {}

    // 2. Create `sale_items` table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`sale_items\` (
        \`id\`          INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`   INT             NOT NULL DEFAULT 1,
        \`sale_id\`     INT             NOT NULL,
        \`product_id\`  INT             NOT NULL,
        \`batch_id\`    INT             DEFAULT NULL,
        \`product_name\`VARCHAR(255)    NOT NULL DEFAULT 'Medicine',
        \`quantity\`    INT             NOT NULL DEFAULT 1,
        \`unit_price\`  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        \`discount\`    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        \`subtotal\`    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_si_tenant\`  (\`tenant_id\`),
        INDEX \`idx_si_sale\`    (\`sale_id\`),
        INDEX \`idx_si_product\` (\`product_id\`),
        INDEX \`idx_si_batch\`   (\`batch_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    console.log('✅ Sales and Sale Items tables auto-initialized in MySQL!');
  } catch (err) {
    console.warn('⚠️ Warning verifying/creating sales tables in MySQL:', err.message);
  }
}

module.exports = initSalesDB;
