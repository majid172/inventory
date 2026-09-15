const db = require('../config/db');

async function initSalesDB() {
  try {
    // 1. Create `sales` table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`sales\` (
        \`id\`              INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`       INT             NOT NULL DEFAULT 1,
        \`branch_id\`       INT             DEFAULT NULL,
        \`terminal_id\`     INT             DEFAULT NULL,
        \`invoice_no\`      VARCHAR(100)    NOT NULL,
        \`customer_phone\`  VARCHAR(255)    DEFAULT 'Walk-in Patient',
        \`customer_email\`  VARCHAR(255)    DEFAULT NULL,
        \`subtotal\`        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`discount\`        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`tax\`             DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`total\`           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`paid_amount\`     DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`due_amount\`      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`payment_method\`  VARCHAR(50)     NOT NULL DEFAULT 'cash',
        \`transaction_no\`  VARCHAR(100)    DEFAULT NULL,
        \`status\`          VARCHAR(50)     NOT NULL DEFAULT 'completed',
        \`notes\`           TEXT            DEFAULT NULL,
        \`sold_by\`         INT             DEFAULT NULL COMMENT 'user_id of cashier',
        \`created_at\`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_tenant_invoice\` (\`tenant_id\`, \`invoice_no\`),
        INDEX \`idx_sale_tenant\`   (\`tenant_id\`),
        INDEX \`idx_sale_branch\`   (\`branch_id\`),
        INDEX \`idx_sale_phone\`    (\`customer_phone\`),
        INDEX \`idx_sale_date\`     (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // Patch existing sales table with missing columns
    const salesAlterColumns = [
      `ALTER TABLE \`sales\` ADD COLUMN \`branch_id\` INT DEFAULT NULL AFTER \`tenant_id\``,
      `ALTER TABLE \`sales\` ADD COLUMN \`terminal_id\` INT DEFAULT NULL AFTER \`branch_id\``,
      `ALTER TABLE \`sales\` ADD COLUMN \`customer_phone\` VARCHAR(255) DEFAULT 'Walk-in Patient' AFTER \`invoice_no\``,
      `ALTER TABLE \`sales\` ADD COLUMN \`customer_email\` VARCHAR(255) DEFAULT NULL AFTER \`customer_phone\``,
      `ALTER TABLE \`sales\` ADD COLUMN \`transaction_no\` VARCHAR(100) DEFAULT NULL AFTER \`payment_method\``,
      `ALTER TABLE \`sales\` ADD COLUMN \`refunded_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER \`paid_amount\``
    ];
    for (const alter of salesAlterColumns) {
      try { await db.query(alter); } catch (e) {}
    }

    // 2. Create `sale_items` table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`sale_items\` (
        \`id\`              INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`       INT             NOT NULL DEFAULT 1,
        \`sale_id\`         INT             NOT NULL,
        \`product_id\`      VARCHAR(50)     DEFAULT NULL COMMENT 'Local product ID or MD- prefixed master drug ID',
        \`master_drug_id\`  INT             DEFAULT NULL COMMENT 'Master drug numeric ID if from master catalog',
        \`batch_id\`        INT             DEFAULT NULL,
        \`product_name\`    VARCHAR(255)    NOT NULL DEFAULT 'Medicine',
        \`quantity\`        INT             NOT NULL DEFAULT 1,
        \`returned_quantity\` INT           NOT NULL DEFAULT 0,
        \`unit_price\`      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        \`discount\`        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        \`subtotal\`        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_si_tenant\`  (\`tenant_id\`),
        INDEX \`idx_si_sale\`    (\`sale_id\`),
        INDEX \`idx_si_product\` (\`product_id\`),
        INDEX \`idx_si_batch\`   (\`batch_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // Patch existing sale_items table
    const saleItemsAlters = [
      `ALTER TABLE \`sale_items\` MODIFY COLUMN \`product_id\` VARCHAR(50) DEFAULT NULL`,
      `ALTER TABLE \`sale_items\` ADD COLUMN \`master_drug_id\` INT DEFAULT NULL AFTER \`product_id\``,
      `ALTER TABLE \`sale_items\` ADD COLUMN \`returned_quantity\` INT NOT NULL DEFAULT 0 AFTER \`quantity\``
    ];
    for (const alter of saleItemsAlters) {
      try { await db.query(alter); } catch (e) {}
    }

    // Ensure refunded_amount exists in sales
    try {
      await db.query(`ALTER TABLE \`sales\` ADD COLUMN \`refunded_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER \`paid_amount\``);
    } catch (e) {}

    // 3. Create `sales_returns` table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`sales_returns\` (
        \`id\`              INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`       INT             NOT NULL DEFAULT 1,
        \`sale_id\`         INT             NOT NULL,
        \`invoice_no\`      VARCHAR(100)    NOT NULL,
        \`return_no\`       VARCHAR(100)    NOT NULL,
        \`refund_amount\`   DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
        \`refund_method\`   VARCHAR(50)     NOT NULL DEFAULT 'cash',
        \`reason\`          TEXT            DEFAULT NULL,
        \`returned_by\`     INT             DEFAULT NULL COMMENT 'user_id of cashier/admin',
        \`created_at\`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_tenant_return\` (\`tenant_id\`, \`return_no\`),
        INDEX \`idx_ret_tenant\`        (\`tenant_id\`),
        INDEX \`idx_ret_sale\`          (\`sale_id\`),
        INDEX \`idx_ret_invoice\`       (\`invoice_no\`),
        INDEX \`idx_ret_date\`          (\`created_at\`),
        CONSTRAINT \`fk_ret_sale\` FOREIGN KEY (\`sale_id\`) REFERENCES \`sales\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 4. Create `sales_return_items` table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`sales_return_items\` (
        \`id\`              INT             NOT NULL AUTO_INCREMENT,
        \`tenant_id\`       INT             NOT NULL DEFAULT 1,
        \`return_id\`       INT             NOT NULL,
        \`sale_item_id\`    INT             DEFAULT NULL,
        \`product_id\`      INT             NOT NULL,
        \`batch_id\`        INT             DEFAULT NULL,
        \`quantity\`        INT             NOT NULL DEFAULT 1,
        \`unit_price\`      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        \`refund_subtotal\` DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_sri_tenant\`   (\`tenant_id\`),
        INDEX \`idx_sri_return\`   (\`return_id\`),
        INDEX \`idx_sri_item\`     (\`sale_item_id\`),
        INDEX \`idx_sri_product\`  (\`product_id\`),
        INDEX \`idx_sri_batch\`    (\`batch_id\`),
        CONSTRAINT \`fk_sri_return\` FOREIGN KEY (\`return_id\`) REFERENCES \`sales_returns\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    console.log('✅ Sales, Sale Items, and Sales Returns tables auto-initialized in MySQL!');
  } catch (err) {
    console.warn('⚠️ Warning verifying/creating sales tables in MySQL:', err.message);
  }
}

module.exports = initSalesDB;
