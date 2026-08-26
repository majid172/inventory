-- ============================================================================
-- 🚀 PharmaCare Multi-Tenant SaaS Platform — Complete MySQL Schema
-- Tech Stack: Node.js / Express + MySQL (mysql2)
-- Isolation: Shared DB with tenant_id row-level scoping (middleware enforced)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. SUBSCRIPTION PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id`                  VARCHAR(50)     NOT NULL,
  `name`                VARCHAR(100)    NOT NULL,
  `price_monthly`       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `price_yearly`        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `max_users`           INT             NOT NULL DEFAULT 3,
  `max_products`        INT             NOT NULL DEFAULT 500,
  `max_branches`        INT             NOT NULL DEFAULT 1,
  `max_sms`             INT             NOT NULL DEFAULT 0,
  `trial_days`          INT             NOT NULL DEFAULT 14,
  `features`            JSON            NULL,
  `is_active`           TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 2. TENANTS TABLE (Pharmacy subscriber organizations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `tenants` (
  `id`                  INT             NOT NULL AUTO_INCREMENT,
  `store_name`          VARCHAR(255)    NOT NULL,
  `slug`                VARCHAR(100)    NOT NULL,
  `owner_name`          VARCHAR(255)    NOT NULL,
  `email`               VARCHAR(255)    NOT NULL,
  `phone`               VARCHAR(50)     DEFAULT NULL,
  `address`             TEXT            DEFAULT NULL,
  `trade_license`       VARCHAR(500)    DEFAULT NULL,
  `plan_id`             VARCHAR(50)     NOT NULL DEFAULT 'pro',
  `status`              VARCHAR(50)     NOT NULL DEFAULT 'pending',
  `grace_period_days`   INT             NOT NULL DEFAULT 7,
  `subscription_start`  DATE            DEFAULT NULL,
  `subscription_end`    DATE            DEFAULT NULL,
  `trial_ends_at`       DATE            DEFAULT NULL,
  `mrr`                 DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `created_at`          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_slug`  (`slug`),
  UNIQUE KEY `uq_tenant_email` (`email`),
  INDEX `idx_tenant_status`    (`status`),
  INDEX `idx_tenant_plan`      (`plan_id`),
  CONSTRAINT `fk_tenant_plan`  FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 3. USERS TABLE (Super admin + all tenant users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`     INT             DEFAULT NULL,
  `name`          VARCHAR(255)    NOT NULL,
  `email`         VARCHAR(255)    NOT NULL,
  `phone`         VARCHAR(50)     DEFAULT NULL,
  `password_hash` VARCHAR(255)    NOT NULL,
  `role`          VARCHAR(50)     NOT NULL DEFAULT 'CASHIER',
  `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
  `last_login`    DATETIME        DEFAULT NULL,
  `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email`   (`email`),
  INDEX `idx_users_tenant`      (`tenant_id`),
  INDEX `idx_users_role`        (`role`),
  CONSTRAINT `fk_users_tenant`  FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 4. PAYMENTS TABLE (All subscription payment transactions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`       INT             NOT NULL,
  `amount`          DECIMAL(10,2)   NOT NULL,
  `currency`        VARCHAR(10)     NOT NULL DEFAULT 'USD',
  `gateway`         VARCHAR(50)     NOT NULL DEFAULT 'stripe',
  `gateway_ref`     VARCHAR(255)    DEFAULT NULL,
  `invoice_no`      VARCHAR(100)    DEFAULT NULL,
  `plan_id`         VARCHAR(50)     DEFAULT NULL,
  `billing_cycle`   VARCHAR(20)     NOT NULL DEFAULT 'monthly',
  `status`          VARCHAR(50)     NOT NULL DEFAULT 'pending',
  `paid_at`         DATETIME        DEFAULT NULL,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_payments_tenant`   (`tenant_id`),
  INDEX `idx_payments_status`   (`status`),
  CONSTRAINT `fk_payments_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `billings` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`       INT             NOT NULL,
  `invoice_no`      VARCHAR(100)    NOT NULL,
  `amount`          DECIMAL(10,2)   NOT NULL,
  `currency`        VARCHAR(10)     NOT NULL DEFAULT 'BDT',
  `gateway`         VARCHAR(50)     NOT NULL DEFAULT 'bkash',
  `gateway_ref`     VARCHAR(255)    DEFAULT NULL,
  `plan_name`       VARCHAR(100)    DEFAULT 'Pro Tier',
  `billing_cycle`   VARCHAR(20)     NOT NULL DEFAULT 'monthly',
  `status`          VARCHAR(50)     NOT NULL DEFAULT 'success',
  `paid_at`         DATETIME        DEFAULT NULL,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_billings_tenant`   (`tenant_id`),
  INDEX `idx_billings_status`   (`status`),
  CONSTRAINT `fk_billings_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
);

-- ============================================================================
-- 5. CATEGORIES TABLE (Tenant-scoped product categories)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id`          INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`   INT             NOT NULL,
  `name`        VARCHAR(100)    NOT NULL,
  `icon`        VARCHAR(50)     DEFAULT '💊',
  `description` TEXT            DEFAULT NULL,
  `is_active`   TINYINT(1)      DEFAULT 1,
  `created_at`  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cat_tenant` (`tenant_id`),
  CONSTRAINT `fk_cat_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 6. SUPPLIERS TABLE (Tenant-scoped supplier directory)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`       INT             NOT NULL,
  `name`            VARCHAR(255)    NOT NULL,
  `contact_person`  VARCHAR(255)    DEFAULT NULL,
  `phone`           VARCHAR(50)     DEFAULT NULL,
  `email`           VARCHAR(255)    DEFAULT NULL,
  `address`         TEXT            DEFAULT NULL,
  `due_amount`      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sup_tenant` (`tenant_id`),
  CONSTRAINT `fk_sup_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 7. PRODUCTS TABLE (Medicine catalog — tenant-scoped)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `products` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`       INT             NOT NULL,
  `category_id`     INT             DEFAULT NULL,
  `name`            VARCHAR(255)    NOT NULL,
  `generic_name`    VARCHAR(255)    DEFAULT NULL,
  `manufacturer`    VARCHAR(255)    DEFAULT NULL,
  `dosage_form`     VARCHAR(100)    DEFAULT NULL,
  `strength`        VARCHAR(100)    DEFAULT NULL,
  `unit`            VARCHAR(50)     DEFAULT 'piece',
  `barcode`         VARCHAR(100)    DEFAULT NULL,
  `purchase_price`  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `sale_price`      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `stock_quantity`  INT             NOT NULL DEFAULT 0,
  `reorder_level`   INT             NOT NULL DEFAULT 10,
  `rack_location`   VARCHAR(50)     DEFAULT NULL,
  `rx_required`     TINYINT(1)      NOT NULL DEFAULT 0,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prod_tenant`   (`tenant_id`),
  INDEX `idx_prod_category` (`category_id`),
  INDEX `idx_prod_barcode`  (`barcode`),
  CONSTRAINT `fk_prod_tenant`   FOREIGN KEY (`tenant_id`)   REFERENCES `tenants`     (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prod_category` FOREIGN KEY (`category_id`) REFERENCES `categories`  (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 8. INVENTORY BATCHES TABLE (FEFO — First Expired, First Out)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `inventory_batches` (
  `id`                INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`         INT             NOT NULL,
  `product_id`        INT             NOT NULL,
  `batch_number`      VARCHAR(100)    NOT NULL,
  `manufacture_date`  DATE            DEFAULT NULL,
  `expiry_date`       DATE            NOT NULL,
  `quantity_received` INT             NOT NULL DEFAULT 0,
  `quantity_remaining`INT             NOT NULL DEFAULT 0,
  `unit_cost_price`   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `supplier_id`       INT             DEFAULT NULL,
  `rack_location`     VARCHAR(50)     DEFAULT NULL,
  `created_at`        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_batch_tenant`    (`tenant_id`),
  INDEX `idx_batch_product`   (`product_id`),
  INDEX `idx_batch_expiry`    (`expiry_date`),
  INDEX `idx_batch_fefo`      (`tenant_id`, `product_id`, `expiry_date`),
  CONSTRAINT `fk_batch_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_batch_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 9. STOCK TRANSACTIONS TABLE (All stock movements audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `stock_transactions` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`       INT             NOT NULL,
  `product_id`      INT             NOT NULL,
  `batch_id`        INT             DEFAULT NULL,
  `type`            VARCHAR(20)     NOT NULL COMMENT 'stock_in | stock_out | adjustment | return',
  `quantity`        INT             NOT NULL,
  `reference_no`    VARCHAR(100)    DEFAULT NULL,
  `notes`           TEXT            DEFAULT NULL,
  `performed_by`    INT             DEFAULT NULL COMMENT 'user_id',
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_stx_tenant`   (`tenant_id`),
  INDEX `idx_stx_product`  (`product_id`),
  INDEX `idx_stx_type`     (`type`),
  CONSTRAINT `fk_stx_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stx_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 10. CUSTOMERS TABLE (Optional customer tracking per tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `customers` (
  `id`          INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`   INT             NOT NULL,
  `name`        VARCHAR(255)    NOT NULL,
  `phone`       VARCHAR(50)     DEFAULT NULL,
  `email`       VARCHAR(255)    DEFAULT NULL,
  `address`     TEXT            DEFAULT NULL,
  `due_balance` DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `created_at`  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cust_tenant` (`tenant_id`),
  CONSTRAINT `fk_cust_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 11. SALES TABLE (POS sale header)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sales` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`       INT             NOT NULL,
  `invoice_no`      VARCHAR(100)    NOT NULL,
  `customer_id`     INT             DEFAULT NULL,
  `customer_name`   VARCHAR(255)    DEFAULT NULL,
  `subtotal`        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `discount`        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `tax`             DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `total`           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `paid_amount`     DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `due_amount`      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `payment_method`  VARCHAR(50)     NOT NULL DEFAULT 'cash',
  `status`          VARCHAR(50)     NOT NULL DEFAULT 'completed',
  `notes`           TEXT            DEFAULT NULL,
  `sold_by`         INT             DEFAULT NULL COMMENT 'user_id',
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoice` (`tenant_id`, `invoice_no`),
  INDEX `idx_sale_tenant`   (`tenant_id`),
  INDEX `idx_sale_customer` (`customer_id`),
  INDEX `idx_sale_date`     (`created_at`),
  CONSTRAINT `fk_sale_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 12. SALE ITEMS TABLE (POS sale line items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id`          INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`   INT             NOT NULL,
  `sale_id`     INT             NOT NULL,
  `product_id`  INT             NOT NULL,
  `batch_id`    INT             DEFAULT NULL,
  `product_name`VARCHAR(255)    NOT NULL,
  `quantity`    INT             NOT NULL DEFAULT 1,
  `unit_price`  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `discount`    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `subtotal`    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  INDEX `idx_si_sale`    (`sale_id`),
  INDEX `idx_si_product` (`product_id`),
  CONSTRAINT `fk_si_sale`    FOREIGN KEY (`sale_id`)    REFERENCES `sales`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_si_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 13. PURCHASE ORDERS TABLE (Supplier purchase orders)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id`            INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`     INT             NOT NULL,
  `supplier_id`   INT             DEFAULT NULL,
  `po_number`     VARCHAR(100)    NOT NULL,
  `total_amount`  DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `paid_amount`   DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `due_amount`    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `status`        VARCHAR(50)     NOT NULL DEFAULT 'pending',
  `order_date`    DATE            NOT NULL,
  `received_date` DATE            DEFAULT NULL,
  `notes`         TEXT            DEFAULT NULL,
  `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_po_tenant`   (`tenant_id`),
  INDEX `idx_po_supplier` (`supplier_id`),
  CONSTRAINT `fk_po_tenant`   FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 14. AUDIT LOGS TABLE (Sensitive action audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`          INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`   INT             DEFAULT NULL,
  `user_id`     INT             DEFAULT NULL,
  `action`      VARCHAR(255)    NOT NULL,
  `entity`      VARCHAR(100)    DEFAULT NULL,
  `entity_id`   INT             DEFAULT NULL,
  `details`     JSON            DEFAULT NULL,
  `ip_address`  VARCHAR(45)     DEFAULT NULL,
  `severity`    VARCHAR(20)     NOT NULL DEFAULT 'info',
  `created_at`  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_tenant` (`tenant_id`),
  INDEX `idx_audit_date`   (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 15. NOTIFICATIONS TABLE (In-app alerts per tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`          INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`   INT             NOT NULL,
  `type`        VARCHAR(50)     NOT NULL COMMENT 'low_stock | near_expiry | subscription | payment',
  `title`       VARCHAR(255)    NOT NULL,
  `message`     TEXT            NOT NULL,
  `is_read`     TINYINT(1)      NOT NULL DEFAULT 0,
  `entity_id`   INT             DEFAULT NULL,
  `created_at`  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_tenant` (`tenant_id`),
  INDEX `idx_notif_read`   (`is_read`),
  CONSTRAINT `fk_notif_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Subscription Plans
INSERT INTO `subscription_plans` (`id`, `name`, `price_monthly`, `price_yearly`, `max_users`, `max_products`, `max_branches`, `max_sms`, `trial_days`, `features`, `is_active`)
VALUES
  ('starter',    'Starter',         49.00,   470.00,  3,   500,  1,    0,    14, '{"posRegister":true,"fefoExpiry":"Basic","rxVerification":false,"smsReceipts":false,"purchaseOrders":false,"multipleReports":false,"support":"Email Support"}', 1),
  ('pro',        'Pro',            149.00,  1430.00,  10, 5000,  3,  500,    14, '{"posRegister":true,"fefoExpiry":"Advanced","rxVerification":true,"smsReceipts":"500/mo","purchaseOrders":true,"multipleReports":true,"support":"Priority Chat"}', 1),
  ('enterprise', 'Enterprise',     399.00,  3830.00, 999,99999, 99, 9999,   14, '{"posRegister":true,"fefoExpiry":"AI Reorder","rxVerification":true,"smsReceipts":"Unlimited","purchaseOrders":true,"multipleReports":true,"support":"24/7 Dedicated"}', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Demo Tenants
INSERT INTO `tenants` (`id`, `store_name`, `slug`, `owner_name`, `email`, `phone`, `address`, `plan_id`, `status`, `subscription_start`, `subscription_end`, `mrr`)
VALUES
  (1, 'MediCare Central Pharmacy', 'medicare-central', 'Dr. Robert Vance',  'robert@medicare-central.com', '+1 (555) 234-5678', '123 Pharmacy Ave, New York, NY', 'pro',        'active',    '2026-01-15', '2028-12-31', 149.00),
  (2, 'HealthPlus Retail Pharma',  'healthplus-pharma', 'Sarah Jenkins',     'sarah@healthplus.com',        '+1 (555) 876-5432', '456 Health Blvd, Boston, MA',   'starter',    'trial',     '2026-08-01', '2026-08-15', 49.00),
  (3, 'Apex City Pharmacy Chain',  'apex-city-pharma',  'David Sterling',    'david@apexpharma.com',        '+1 (555) 999-0000', '789 Med Street, Chicago, IL',   'enterprise', 'active',    '2025-11-10', '2028-11-10', 399.00),
  (4, 'HealthFirst Express Rx',    'healthfirst-rx',    'Amanda Foster',     'billing@healthfirstrx.com',   '+1 (555) 321-7654', '321 Rx Lane, Miami, FL',        'pro',        'suspended', '2026-03-20', '2026-08-01', 0.00)
ON DUPLICATE KEY UPDATE `store_name` = VALUES(`store_name`);

-- Users (Super Admin + Store Owners)
-- Passwords: admin@pharmasaas.com = admin123  |  others = 1234
INSERT INTO `users` (`id`, `tenant_id`, `name`, `email`, `phone`, `password_hash`, `role`, `is_active`)
VALUES
  (1, NULL, 'Platform Super Admin', 'admin@pharmasaas.com',        '+1 (555) 000-0001', '$2b$10$k1wK.8jH5hN41rKk1OqKueE8e35O9dO4zL2d4RkH56bN8Vw9uI2mC', 'SUPER_ADMIN',  1),
  (2, 1,    'Dr. Robert Vance',     'robert@medicare-central.com', '+1 (555) 234-5678', '$2b$10$eAccYoNOB45Ew9qGffuXdu7H3WwXbQj/8G7Q0.yL0J10s4oQnfmSm', 'STORE_ADMIN',  1),
  (3, 2,    'Sarah Jenkins',        'sarah@healthplus.com',        '+1 (555) 876-5432', '$2b$10$eAccYoNOB45Ew9qGffuXdu7H3WwXbQj/8G7Q0.yL0J10s4oQnfmSm', 'STORE_ADMIN',  1),
  (4, 3,    'David Sterling',       'david@apexpharma.com',        '+1 (555) 999-0000', '$2b$10$eAccYoNOB45Ew9qGffuXdu7H3WwXbQj/8G7Q0.yL0J10s4oQnfmSm', 'STORE_ADMIN',  1),
  (5, 1,    'John Cashier',         'cashier@medicare-central.com','+1 (555) 111-2222', '$2b$10$eAccYoNOB45Ew9qGffuXdu7H3WwXbQj/8G7Q0.yL0J10s4oQnfmSm', 'CASHIER',      1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Demo Categories (Tenant 1)
INSERT INTO `categories` (`id`, `tenant_id`, `name`, `icon`, `is_active`)
VALUES
  (1, 1, 'Antibiotics',      '💊', 1), (2, 1, 'Analgesics',        '💊', 1),
  (3, 1, 'Gastric & Ulcer',  '🫃', 1), (4, 1, 'Vitamins & Supplements','💉', 1),
  (5, 1, 'Cardiac',          '❤️', 1), (6, 1, 'Diabetes Care',     '🩺', 1),
  (7, 2, 'Antibiotics',      '💊', 1), (8, 2, 'General Medicine',  '💊', 1),
  (9, 3, 'Cardiology',       '❤️', 1),(10, 3, 'Oncology',          '🔬', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Demo Suppliers (Tenant 1)
INSERT INTO `suppliers` (`id`, `tenant_id`, `name`, `contact_person`, `phone`, `email`, `due_amount`)
VALUES
  (1, 1, 'GSK Official Distributor', 'John Smith',  '+1-800-GSK-0001', 'orders@gsk-dist.com',   0.00),
  (2, 1, 'Pfizer Supply Chain',      'Jane Doe',    '+1-800-PFZ-0002', 'supply@pfizer-dist.com',500.00),
  (3, 1, 'Square Pharma BD',         'Rahim Uddin', '+880-2-9990001',  'orders@squarepharma.com',0.00),
  (4, 2, 'National Drug Dist.',      'Ali Hassan',  '+1-555-300-4000', 'ndd@pharma.com',        200.00)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Demo Products (Tenant 1)
INSERT INTO `products` (`id`, `tenant_id`, `category_id`, `name`, `generic_name`, `manufacturer`, `dosage_form`, `strength`, `unit`, `purchase_price`, `sale_price`, `stock_quantity`, `reorder_level`, `rack_location`, `rx_required`)
VALUES
  (1,  1, 1, 'Amoxil 500mg Cap',         'Amoxicillin',         'GSK',            'Capsule',          '500mg',    'strip',  8.50,  12.50, 250, 50, 'A-01', 1),
  (2,  1, 2, 'Napa Extra 500mg',          'Paracetamol+Caffeine','Beximco Pharma', 'Tablet',           '500mg',    'strip',  2.10,   3.50, 500, 100,'A-02', 0),
  (3,  1, 3, 'Seclo 20mg Cap',            'Omeprazole',          'Square Pharma',  'Capsule',          '20mg',     'strip',  4.50,   7.00, 320, 60, 'B-01', 0),
  (4,  1, 3, 'Sergel 20mg Cap',           'Esomeprazole',        'AstraZeneca',    'Capsule',          '20mg',     'strip',  5.20,   8.00, 180, 40, 'B-02', 0),
  (5,  1, 2, 'Ace 500mg Tablet',          'Paracetamol',         'Aristopharma',   'Tablet',           '500mg',    'strip',  1.50,   2.50, 600, 100,'A-03', 0),
  (6,  1, 1, 'Azithrin 500mg',            'Azithromycin',        'Square Pharma',  'Tablet',           '500mg',    'strip',  24.00, 35.00, 90,  20, 'A-04', 1),
  (7,  1, 6, 'Glucophage 850mg',          'Metformin HCl',       'Merck',          'Tablet',           '850mg',    'strip',  10.00, 14.20, 200, 30, 'C-01', 1),
  (8,  1, 5, 'Cardace 5mg',               'Ramipril',            'Sanofi',         'Tablet',           '5mg',      'strip',  18.00, 28.00, 150, 25, 'D-01', 1),
  (9,  1, 4, 'Neurobion Forte',           'B1+B6+B12',           'Procter&Gamble', 'Tablet',           '-',        'strip',  4.00,   6.50, 400, 80, 'E-01', 0),
  (10, 1, 1, 'Ciprofloxacin 500mg',       'Ciprofloxacin',       'Opsonin Pharma', 'Tablet',           '500mg',    'strip',  15.00, 22.00, 120, 30, 'A-05', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Demo Inventory Batches (Tenant 1)
INSERT INTO `inventory_batches` (`id`, `tenant_id`, `product_id`, `batch_number`, `manufacture_date`, `expiry_date`, `quantity_received`, `quantity_remaining`, `unit_cost_price`, `supplier_id`)
VALUES
  (1,  1, 1, 'BATCH-2025A', '2024-06-01', '2026-11-30', 200, 150, 8.50,  1),
  (2,  1, 1, 'BATCH-2027B', '2025-01-10', '2027-08-15', 350, 100, 8.50,  1),
  (3,  1, 2, 'BATCH-2028A', '2025-03-01', '2028-06-15', 500, 500, 2.10,  3),
  (4,  1, 3, 'BATCH-2027C', '2024-09-01', '2027-09-30', 320, 320, 4.50,  3),
  (5,  1, 4, 'BATCH-2027D', '2025-01-01', '2027-12-31', 200, 180, 5.20,  2),
  (6,  1, 5, 'BATCH-2028B', '2025-06-01', '2028-01-20', 600, 600, 1.50,  3),
  (7,  1, 6, 'BATCH-2025B', '2024-11-01', '2026-09-15', 100,  90, 24.00, 1),
  (8,  1, 7, 'BATCH-2027E', '2025-01-05', '2027-10-31', 200, 200, 10.00, 2),
  (9,  1, 8, 'BATCH-2028C', '2025-03-10', '2028-03-10', 150, 150, 18.00, 2),
  (10, 1, 9, 'BATCH-2027F', '2025-05-01', '2027-05-01', 400, 400, 4.00,  3)
ON DUPLICATE KEY UPDATE `batch_number` = VALUES(`batch_number`);

-- Demo Payments
INSERT INTO `payments` (`id`, `tenant_id`, `amount`, `currency`, `gateway`, `gateway_ref`, `invoice_no`, `plan_id`, `billing_cycle`, `status`, `paid_at`)
VALUES
  (1, 1, 149.00, 'USD', 'stripe', 'pi_test_001', 'INV-2026-001', 'pro',        'monthly', 'paid',   '2026-01-15 10:00:00'),
  (2, 1, 149.00, 'USD', 'stripe', 'pi_test_002', 'INV-2026-002', 'pro',        'monthly', 'paid',   '2026-02-15 10:00:00'),
  (3, 3, 399.00, 'USD', 'stripe', 'pi_test_003', 'INV-2025-001', 'enterprise', 'monthly', 'paid',   '2025-11-10 09:00:00'),
  (4, 2,  49.00, 'USD', 'stripe', 'pi_test_004', 'INV-2026-003', 'starter',    'monthly', 'pending', NULL),
  (5, 4, 149.00, 'USD', 'stripe', 'pi_test_005', 'INV-2026-004', 'pro',        'monthly', 'failed',  NULL)
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- ============================================================================
-- SYSTEM SETTINGS TABLE (Global platform settings like maintenance mode)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `setting_key`     VARCHAR(100)    NOT NULL,
  `setting_value`   JSON            NOT NULL,
  `description`     VARCHAR(255)    DEFAULT NULL,
  `updated_by`      INT             DEFAULT NULL,
  `updated_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sys_setting_key` (`setting_key`),
  CONSTRAINT `fk_sys_settings_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TENANT SETTINGS TABLE (Pharmacy-specific configurations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `tenant_settings` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`       INT             NOT NULL,
  `setting_key`     VARCHAR(100)    NOT NULL,
  `setting_value`   JSON            NOT NULL,
  `updated_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_setting` (`tenant_id`, `setting_key`),
  CONSTRAINT `fk_tenant_settings_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Demo System Settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`)
VALUES
  ('maintenance_mode', '{"is_active": false, "message": "System is under maintenance. Please try again later."}', 'Global platform maintenance mode'),
  ('platform_name', '{"name": "PharmaCare SaaS"}', 'The main platform name')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
