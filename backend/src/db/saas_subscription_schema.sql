-- ============================================================================
-- 🚀 PharmaCare Multi-Tenant SaaS Platform Database Schema (PostgreSQL)
-- ============================================================================
-- Subscription Tiers, Tenant Isolation (RLS), Categories, Products, FEFO Inventory Batches & Master Drug Catalog

-- 1. Create Custom ENUM Types
CREATE TYPE plan_tier_enum AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE tenant_status_enum AS ENUM ('active', 'trial', 'suspended', 'expired');
CREATE TYPE severity_enum AS ENUM ('info', 'success', 'warning', 'error');

-- ----------------------------------------------------------------------------
-- 2. SUBSCRIPTION PLANS TABLE (Pricing Tiers & Feature Matrix)
-- ----------------------------------------------------------------------------
CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY, -- 'starter', 'pro', 'enterprise'
    name VARCHAR(100) NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL,
    price_yearly NUMERIC(10, 2) NOT NULL,
    terminals_limit INT NOT NULL DEFAULT 1,
    branches_limit INT NOT NULL DEFAULT 1,
    master_drug_limit_description TEXT NOT NULL,
    allowed_drug_tiers VARCHAR(50)[] NOT NULL, -- Array e.g., ARRAY['starter'], ARRAY['starter','pro']
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. TENANTS TABLE (Subscriber Pharmacy Stores Directory)
-- ----------------------------------------------------------------------------
CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'TENANT_101' or UUID
    store_name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    plan_tier plan_tier_enum NOT NULL DEFAULT 'pro',
    status tenant_status_enum NOT NULL DEFAULT 'trial',
    terminals_count INT NOT NULL DEFAULT 1,
    branches_count INT NOT NULL DEFAULT 1,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_billing_date DATE NOT NULL,
    mrr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_plan_tier ON tenants(plan_tier);

-- ----------------------------------------------------------------------------
-- 4. MASTER DRUG CATALOG TABLE (Plan-Wise Certified Global Medicines)
-- ----------------------------------------------------------------------------
CREATE TABLE master_drug_catalog (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'MDRUG_1001'
    brand_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    dosage_form VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL, -- Global Drug Manufacturer (e.g. GSK, Pfizer, Square)
    default_retail_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    rx_required BOOLEAN NOT NULL DEFAULT TRUE,
    plan_tier_access plan_tier_enum NOT NULL DEFAULT 'starter', -- 'starter' (10k), 'pro' (50k), 'enterprise' (Specialty)
    barcode VARCHAR(100) UNIQUE,
    therapeutic_class VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_master_drugs_plan_access ON master_drug_catalog(plan_tier_access);
CREATE INDEX idx_master_drugs_generic ON master_drug_catalog(generic_name);
CREATE INDEX idx_master_drugs_brand ON master_drug_catalog(brand_name);

-- ----------------------------------------------------------------------------
-- 5. STORE CATEGORIES TABLE (Tenant Level Store Organization)
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. 'Antibiotics', 'Surgical', 'Baby Care'
    icon VARCHAR(50) DEFAULT '💊',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_tenant ON categories(tenant_id);

-- ----------------------------------------------------------------------------
-- 6. STORE PRODUCTS INVENTORY TABLE (Tenant Level POS Shelf Stock)
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    master_drug_id VARCHAR(50) REFERENCES master_drug_catalog(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    manufacturer VARCHAR(255), -- Local store supplier / brand manufacturer
    retail_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_stock_quantity INT NOT NULL DEFAULT 0,
    rack_location VARCHAR(50), -- e.g. 'Shelf A-3'
    rx_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_master_drug ON products(master_drug_id);

-- ----------------------------------------------------------------------------
-- 7. INVENTORY BATCHES TABLE (FEFO Batch Number & Expiry Date Tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE inventory_batches (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL, -- e.g. 'LOT-2026A', 'BATCH-99412'
    manufacture_date DATE,              -- Date when batch was manufactured
    expiry_date DATE NOT NULL,          -- Expiry Date (Crucial for FEFO alert)
    quantity_received INT NOT NULL DEFAULT 0,
    quantity_remaining INT NOT NULL DEFAULT 0,
    unit_cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier_name VARCHAR(255),
    rack_location VARCHAR(50),
    is_expired BOOLEAN GENERATED ALWAYS AS (expiry_date < CURRENT_DATE) STORED,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast FEFO sorting (First Expired First Out)
CREATE INDEX idx_batches_fefo ON inventory_batches(tenant_id, product_id, expiry_date ASC);
CREATE INDEX idx_batches_expiry ON inventory_batches(expiry_date);
CREATE INDEX idx_batches_batch_number ON inventory_batches(batch_number);

-- ----------------------------------------------------------------------------
-- 8. AUDIT LOGS TELEMETRY TABLE (Security & RLS Monitoring)
-- ----------------------------------------------------------------------------
CREATE TABLE tenant_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    event VARCHAR(255) NOT NULL,
    details TEXT,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE SET NULL,
    severity severity_enum DEFAULT 'info'
);

-- ----------------------------------------------------------------------------
-- 9. POSTGRESQL ROW-LEVEL SECURITY (RLS) POLICY EXAMPLE (TENANT ISOLATION)
-- ----------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_categories ON categories
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_products ON products
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_batches ON inventory_batches
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));


-- ============================================================================
-- 10. INITIAL SEED DATA
-- ============================================================================

-- Seed Subscription Tiers
INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, terminals_limit, branches_limit, master_drug_limit_description, allowed_drug_tiers, features)
VALUES 
('starter', 'Starter Plan', 49.00, 470.00, 1, 1, '10,000 Essential Generics', ARRAY['starter'], '{"posRegister": true, "fefoExpiry": "Basic", "rxVerification": false}'::jsonb),
('pro', 'Pro Plan (Popular)', 149.00, 1430.00, 3, 1, '50,000+ Full National Catalog', ARRAY['starter', 'pro'], '{"posRegister": true, "fefoExpiry": "Advanced FEFO Alerts", "rxVerification": true}'::jsonb),
('enterprise', 'Enterprise Chain Plan', 399.00, 3830.00, 999, 99, 'Unlimited + Biologics & Custom Catalog', ARRAY['starter', 'pro', 'enterprise'], '{"posRegister": true, "fefoExpiry": "Automated AI Reordering"}'::jsonb);

-- Seed Subscriber Pharmacy Tenants
INSERT INTO tenants (id, store_name, slug, owner_name, email, phone, plan_tier, status, terminals_count, branches_count, joined_date, next_billing_date, mrr)
VALUES 
('TENANT_101', 'MediCare Central Pharmacy', 'medicare-central', 'Dr. Robert Vance', 'robert@medicare-central.com', '+1 (555) 234-5678', 'pro', 'active', 3, 1, '2026-01-15', '2026-09-15', 149.00);

-- Seed Master Drug Catalog
INSERT INTO master_drug_catalog (id, brand_name, generic_name, dosage_form, manufacturer, default_retail_price, rx_required, plan_tier_access, barcode, therapeutic_class)
VALUES 
('MDRUG_1001', 'Amoxil 500mg', 'Amoxicillin Trihydrate', 'Capsule', 'GSK Pharmaceuticals', 12.50, TRUE, 'starter', '8901234567890', 'Antibiotics / Penicillins');

-- Seed Store Categories (TENANT_101)
INSERT INTO categories (tenant_id, name, icon) VALUES 
('TENANT_101', 'Antibiotics & Anti-Infectives', '💊');

-- Seed Store Products (TENANT_101)
INSERT INTO products (tenant_id, category_id, master_drug_id, name, manufacturer, retail_price, cost_price, total_stock_quantity, rack_location, rx_required) VALUES 
('TENANT_101', 1, 'MDRUG_1001', 'Amoxil 500mg Capsule', 'GSK Pharmaceuticals', 12.50, 8.50, 500, 'Shelf A-1', TRUE);

-- Seed FEFO Inventory Batches (TENANT_101)
INSERT INTO inventory_batches (tenant_id, product_id, batch_number, manufacture_date, expiry_date, quantity_received, quantity_remaining, unit_cost_price, supplier_name, rack_location) VALUES 
('TENANT_101', 1, 'BATCH-2026A', '2024-06-01', '2026-11-30', 200, 150, 8.50, 'GSK Official Distributor', 'Shelf A-1'), -- Expiring soon
('TENANT_101', 1, 'BATCH-2027B', '2025-01-10', '2027-08-15', 350, 350, 8.50, 'GSK Official Distributor', 'Shelf A-1');
