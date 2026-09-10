-- ============================================================================
-- 🚀 PharmaCare — Sales Return & Refund Schema
-- Compatible with: MySQL 8.x / MariaDB / phpMyAdmin
-- ============================================================================

-- 1. Create `sales_returns` Table
CREATE TABLE IF NOT EXISTS `sales_returns` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`       INT             NOT NULL DEFAULT 1,
  `sale_id`         INT             NOT NULL,
  `invoice_no`      VARCHAR(100)    NOT NULL,
  `return_no`       VARCHAR(100)    NOT NULL,
  `refund_amount`   DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `refund_method`   VARCHAR(50)     NOT NULL DEFAULT 'cash',
  `reason`          TEXT            DEFAULT NULL,
  `returned_by`     INT             DEFAULT NULL COMMENT 'user_id of cashier/admin',
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenant_return` (`tenant_id`, `return_no`),
  INDEX `idx_ret_tenant`        (`tenant_id`),
  INDEX `idx_ret_sale`          (`sale_id`),
  INDEX `idx_ret_invoice`       (`invoice_no`),
  INDEX `idx_ret_date`          (`created_at`),
  CONSTRAINT `fk_ret_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Create `sales_return_items` Table
CREATE TABLE IF NOT EXISTS `sales_return_items` (
  `id`              INT             NOT NULL AUTO_INCREMENT,
  `tenant_id`       INT             NOT NULL DEFAULT 1,
  `return_id`       INT             NOT NULL,
  `sale_item_id`    INT             DEFAULT NULL,
  `product_id`      INT             NOT NULL,
  `batch_id`        INT             DEFAULT NULL,
  `quantity`        INT             NOT NULL DEFAULT 1,
  `unit_price`      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `refund_subtotal` DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  INDEX `idx_sri_tenant`   (`tenant_id`),
  INDEX `idx_sri_return`   (`return_id`),
  INDEX `idx_sri_item`     (`sale_item_id`),
  INDEX `idx_sri_product`  (`product_id`),
  INDEX `idx_sri_batch`    (`batch_id`),
  CONSTRAINT `fk_sri_return` FOREIGN KEY (`return_id`) REFERENCES `sales_returns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Add `returned_quantity` to `sale_items` (to prevent over-refunding)
ALTER TABLE `sale_items` 
  ADD COLUMN `returned_quantity` INT NOT NULL DEFAULT 0 AFTER `quantity`;

-- 4. Add `refunded_amount` to `sales` (to track total refunds per invoice)
ALTER TABLE `sales` 
  ADD COLUMN `refunded_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER `paid_amount`;
