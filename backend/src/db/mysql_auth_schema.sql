-- ============================================================================
-- 🚀 MySQL Schema for Pharmacy SaaS Multi-Tenant & User Authentication
-- Clean Normalized Design (Foreign Key: users.tenant_id -> pharmacy_tenants.id)
-- Compatible with MySQL 5.7+ / 8.0+ and phpMyAdmin
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PHARMACY TENANTS TABLE (Stores & Business Organizations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pharmacy_tenants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `store_name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(100) DEFAULT NULL,
  `plan_tier` VARCHAR(50) NOT NULL DEFAULT 'pro',
  `status` VARCHAR(50) NOT NULL DEFAULT 'trial',
  `terminals_count` INT NOT NULL DEFAULT 1,
  `branches_count` INT NOT NULL DEFAULT 1,
  `joined_date` DATE DEFAULT NULL,
  `next_billing_date` DATE DEFAULT NULL,
  `mrr` DECIMAL(10, 2) NOT NULL DEFAULT 149.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tenant_slug` (`slug`),
  INDEX `idx_tenant_status` (`status`),
  INDEX `idx_tenant_plan` (`plan_tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 2. USERS TABLE (Store Owners, Pharmacists, Cashiers & Super Admins)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` INT DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(100) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'STORE_ADMIN',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_tenant` (`tenant_id`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `pharmacy_tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 3. SEED DEFAULT PHARMACY TENANT STORES
-- ----------------------------------------------------------------------------
INSERT INTO `pharmacy_tenants` 
  (`id`, `store_name`, `slug`, `phone`, `plan_tier`, `status`, `terminals_count`, `branches_count`, `joined_date`, `next_billing_date`, `mrr`) 
VALUES 
  (1, 'MediCare Central Pharmacy', 'medicare-central', '+1 (555) 234-5678', 'pro', 'active', 3, 1, '2026-01-15', '2028-12-31', 149.00),
  (2, 'HealthPlus Retail Pharma', 'healthplus-pharma', '+1 (555) 876-5432', 'starter', 'trial', 1, 1, '2026-02-01', '2026-02-15', 49.00),
  (3, 'Apex City Pharmacy Chain', 'apex-city-pharma', '+1 (555) 999-0000', 'enterprise', 'active', 5, 3, '2025-11-10', '2028-11-10', 399.00)
ON DUPLICATE KEY UPDATE `store_name` = VALUES(`store_name`);

-- ----------------------------------------------------------------------------
-- 4. SEED DEFAULT USERS
-- Super Admin: admin@pharmasaas.com (Pass: admin123)
-- Store Admins: Dr. Vance, Sarah, David (PIN / Pass: 1234)
-- ----------------------------------------------------------------------------
INSERT INTO `users` 
  (`id`, `tenant_id`, `name`, `email`, `phone`, `password_hash`, `role`) 
VALUES 
  (1, 1, 'Platform Super Admin', 'admin@pharmasaas.com', '+1 (555) 000-0001', '$2a$10$k1wK.8jH5hN41rKk1OqKueE8e35O9dO4zL2d4RkH56bN8Vw9uI2mC', 'SUPER_ADMIN'),
  (2, 2, 'Dr. Robert Vance', 'robert@medicare-central.com', '+1 (555) 234-5678', '$2a$10$eAccYoNOB45Ew9qGffuXdu7H3WwXbQj/8G7Q0.yL0J10s4oQnfmSm', 'STORE_ADMIN'),
  (3, 3, 'Sarah Jenkins', 'sarah@healthplus.com', '+1 (555) 876-5432', '$2a$10$eAccYoNOB45Ew9qGffuXdu7H3WwXbQj/8G7Q0.yL0J10s4oQnfmSm', 'STORE_ADMIN'),
  (4, 4, 'David Sterling', 'david@apexpharma.com', '+1 (555) 999-0000', '$2a$10$eAccYoNOB45Ew9qGffuXdu7H3WwXbQj/8G7Q0.yL0J10s4oQnfmSm', 'STORE_ADMIN')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
