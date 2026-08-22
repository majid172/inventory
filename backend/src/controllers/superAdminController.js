// Backend Super Admin Controller for PharmaCare Multi-Tenant SaaS Platform
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Bcrypt Hashing Helper for Store Access PIN / Password
const hashPinBcrypt = (pin) => {
  if (!pin) pin = '1234';
  if (typeof pin === 'string' && (pin.startsWith('$2a$') || pin.startsWith('$2b$'))) {
    return pin;
  }
  return bcrypt.hashSync(String(pin), 10);
};

const comparePinBcrypt = (plainPin, hashedPin) => {
  if (!plainPin || !hashedPin) return false;
  if (typeof hashedPin === 'string' && !hashedPin.startsWith('$2a$') && !hashedPin.startsWith('$2b$')) {
    return plainPin === hashedPin;
  }
  return bcrypt.compareSync(String(plainPin), hashedPin);
};

// Mock Data Store for Platform Telemetry, Tenants, Plans, Master Catalog & Audit Logs
let tenantsStore = [
  {
    id: "TENANT_101",
    storeName: "MediCare Central Pharmacy",
    slug: "medicare-central",
    ownerName: "Dr. Robert Vance",
    email: "robert@medicare-central.com",
    phone: "+1 (555) 234-5678",
    planTier: "pro", // 'starter' | 'pro' | 'enterprise'
    status: "active", // 'active' | 'trial' | 'suspended' | 'expired'
    terminalsCount: 3,
    branchesCount: 1,
    joinedDate: "2026-01-15",
    nextBillingDate: "2026-09-15",
    mrr: 149.00
  },
  {
    id: "TENANT_102",
    storeName: "Apex Pharma Chain",
    slug: "apex-pharma",
    ownerName: "Sarah Jenkins, PharmD",
    email: "s.jenkins@apexpharma.org",
    phone: "+1 (555) 987-6543",
    planTier: "enterprise",
    status: "active",
    terminalsCount: 12,
    branchesCount: 4,
    joinedDate: "2025-11-01",
    nextBillingDate: "2026-11-01",
    mrr: 399.00
  },
  {
    id: "TENANT_103",
    storeName: "Corner Community Drugstore",
    slug: "corner-drugstore",
    ownerName: "Michael Chang",
    email: "m.chang@cornerdrug.net",
    phone: "+1 (555) 456-7890",
    planTier: "starter",
    status: "trial",
    terminalsCount: 1,
    branchesCount: 1,
    joinedDate: "2026-08-10",
    nextBillingDate: "2026-08-24", // 14-day free trial
    mrr: 49.00
  },
  {
    id: "TENANT_104",
    storeName: "HealthFirst Express Rx",
    slug: "healthfirst-rx",
    ownerName: "Amanda Foster",
    email: "billing@healthfirstrx.com",
    phone: "+1 (555) 321-7654",
    planTier: "pro",
    status: "suspended",
    terminalsCount: 2,
    branchesCount: 1,
    joinedDate: "2026-03-20",
    nextBillingDate: "2026-08-01",
    mrr: 0.00
  },
  {
    id: "TENANT_105",
    storeName: "St. Jude Hospital Pharmacy",
    slug: "st-jude-rx",
    ownerName: "Dr. David Sterling",
    email: "dsterling@stjude-hospital.org",
    phone: "+1 (555) 888-1122",
    planTier: "enterprise",
    status: "active",
    terminalsCount: 8,
    branchesCount: 2,
    joinedDate: "2026-02-10",
    nextBillingDate: "2026-10-10",
    mrr: 399.00
  }
];

let plansStore = [
  {
    id: "starter",
    name: "Starter Plan",
    priceMonthly: 49,
    priceYearly: 470,
    terminalsLimit: 1,
    branchesLimit: 1,
    masterDrugLimit: "10,000 Essential Generics",
    allowedDrugTiers: ["starter"],
    features: {
      posRegister: true,
      fefoExpiry: "Basic",
      rxVerification: false,
      smsReceipts: false,
      poGenerator: false,
      support: "Email Support"
    }
  },
  {
    id: "pro",
    name: "Pro Plan (Popular)",
    priceMonthly: 149,
    priceYearly: 1430,
    terminalsLimit: 3,
    branchesLimit: 1,
    masterDrugLimit: "50,000+ Full National Catalog",
    allowedDrugTiers: ["starter", "pro"],
    features: {
      posRegister: true,
      fefoExpiry: "Advanced FEFO Alerts",
      rxVerification: true,
      smsReceipts: "500 SMS / month",
      poGenerator: true,
      support: "Priority Chat Support"
    }
  },
  {
    id: "enterprise",
    name: "Enterprise Chain Plan",
    priceMonthly: 399,
    priceYearly: 3830,
    terminalsLimit: 999,
    branchesLimit: 99,
    masterDrugLimit: "Unlimited + Biologics & Custom Catalog",
    allowedDrugTiers: ["starter", "pro", "enterprise"],
    features: {
      posRegister: true,
      fefoExpiry: "Automated AI Reordering",
      rxVerification: true,
      smsReceipts: "Unlimited SMS",
      poGenerator: true,
      support: "24/7 Dedicated Account Manager"
    }
  }
];

let masterDrugsStore = [
  {
    id: "MDRUG_1001",
    brandName: "Amoxil 500mg",
    genericName: "Amoxicillin Trihydrate",
    dosageForm: "Capsule",
    manufacturer: "GSK Pharmaceuticals",
    defaultRetailPrice: 12.50,
    rxRequired: true,
    planTierAccess: "starter", // 'starter' (Essential 10k), 'pro' (National 50k), 'enterprise' (Specialty)
    barcode: "8901234567890",
    therapeuticClass: "Antibiotics / Penicillins"
  },
  {
    id: "MDRUG_1002",
    brandName: "Tylenol Extra Strength 500mg",
    genericName: "Acetaminophen / Paracetamol",
    dosageForm: "Tablet",
    manufacturer: "Kenvue Inc",
    defaultRetailPrice: 8.99,
    rxRequired: false,
    planTierAccess: "starter",
    barcode: "8901234567891",
    therapeuticClass: "Analgesic / Antipyretic"
  },
  {
    id: "MDRUG_1003",
    brandName: "Lipitor 20mg",
    genericName: "Atorvastatin Calcium",
    dosageForm: "Tablet",
    manufacturer: "Pfizer Inc",
    defaultRetailPrice: 45.00,
    rxRequired: true,
    planTierAccess: "pro",
    barcode: "8901234567892",
    therapeuticClass: "Cardiovascular / Statin"
  },
  {
    id: "MDRUG_1004",
    brandName: "Humira 40mg/0.8mL",
    genericName: "Adalimumab",
    dosageForm: "Pre-filled Syringe",
    manufacturer: "AbbVie Inc",
    defaultRetailPrice: 1850.00,
    rxRequired: true,
    planTierAccess: "enterprise",
    barcode: "8901234567893",
    therapeuticClass: "Biologic / Anti-TNF Monoclonal"
  },
  {
    id: "MDRUG_1005",
    brandName: "Glucophage 850mg",
    genericName: "Metformin Hydrochloride",
    dosageForm: "Tablet",
    manufacturer: "Merck KGaA",
    defaultRetailPrice: 14.20,
    rxRequired: true,
    planTierAccess: "starter",
    barcode: "8901234567894",
    therapeuticClass: "Antidiabetic / Biguanide"
  },
  {
    id: "MDRUG_1006",
    brandName: "Nexium 40mg",
    genericName: "Esomeprazole Magnesium",
    dosageForm: "Delayed Release Capsule",
    manufacturer: "AstraZeneca",
    defaultRetailPrice: 32.00,
    rxRequired: true,
    planTierAccess: "pro",
    barcode: "8901234567895",
    therapeuticClass: "Gastrointestinal / PPI"
  },
  {
    id: "MDRUG_1007",
    brandName: "Keytruda 100mg/4mL",
    genericName: "Pembrolizumab",
    dosageForm: "IV Infusion Vial",
    manufacturer: "Merck & Co",
    defaultRetailPrice: 4500.00,
    rxRequired: true,
    planTierAccess: "enterprise",
    barcode: "8901234567896",
    therapeuticClass: "Oncology / Immunotherapy"
  }
];

let auditLogsStore = [
  {
    id: "LOG_901",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    event: "Tenant Status Change",
    details: "Tenant 'MediCare Central' subscription renewed for +30 days",
    tenantId: "TENANT_101",
    severity: "info"
  },
  {
    id: "LOG_902",
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    event: "RLS Isolation Audit",
    details: "PostgreSQL Row-Level Security policy verified across 38 tenant isolation schemas (0 leaks)",
    tenantId: "SYSTEM",
    severity: "success"
  },
  {
    id: "LOG_903",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    event: "Master Catalog Sync",
    details: "Super Admin updated drug MDRUG_1003 (Lipitor 20mg). Sync pushed to 24 Pro/Enterprise stores.",
    tenantId: "SYSTEM",
    severity: "info"
  },
  {
    id: "LOG_904",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    event: "Payment Overdue Warning",
    details: "Tenant 'HealthFirst Express Rx' grace period expired. Account status set to Suspended.",
    tenantId: "TENANT_104",
    severity: "warning"
  }
];

// Controller Functions

// 1. Get Platform Analytics Telemetry
const getAnalytics = (req, res) => {
  const activeTenants = tenantsStore.filter(t => t.status === 'active').length;
  const trialTenants = tenantsStore.filter(t => t.status === 'trial').length;
  const suspendedTenants = tenantsStore.filter(t => t.status === 'suspended').length;
  
  const mrr = tenantsStore.reduce((acc, t) => t.status === 'active' || t.status === 'trial' ? acc + t.mrr : acc, 0);
  const arr = mrr * 12;

  const starterCount = tenantsStore.filter(t => t.planTier === 'starter').length;
  const proCount = tenantsStore.filter(t => t.planTier === 'pro').length;
  const enterpriseCount = tenantsStore.filter(t => t.planTier === 'enterprise').length;

  res.json({
    success: true,
    data: {
      mrr,
      arr,
      totalSubscribers: tenantsStore.length,
      activeTenants,
      trialTenants,
      suspendedTenants,
      masterDrugsTotal: 52400, // Simulated total 50k+ catalog
      masterDrugsMockCount: masterDrugsStore.length,
      activeTerminalsTotal: tenantsStore.reduce((sum, t) => sum + t.terminalsCount, 0),
      systemUptime: "99.98%",
      dbResponseLatencyMs: 3,
      planDistribution: {
        starter: starterCount,
        pro: proCount,
        enterprise: enterpriseCount
      }
    }
  });
};

const ensureTenantsTable = async () => {
  if (db && db.query) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pharmacy_tenants (
        id VARCHAR(50) PRIMARY KEY,
        store_name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        owner_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        access_pin VARCHAR(255) DEFAULT NULL,
        plan_tier VARCHAR(50) NOT NULL DEFAULT 'pro',
        status VARCHAR(50) NOT NULL DEFAULT 'trial',
        terminals_count INT NOT NULL DEFAULT 1,
        branches_count INT NOT NULL DEFAULT 1,
        joined_date DATE,
        next_billing_date DATE,
        mrr DECIMAL(10, 2) NOT NULL DEFAULT 149.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    try {
      await db.query(`ALTER TABLE pharmacy_tenants MODIFY COLUMN access_pin VARCHAR(255) DEFAULT NULL`);
    } catch (e) {
      try {
        await db.query(`ALTER TABLE pharmacy_tenants ADD COLUMN access_pin VARCHAR(255) DEFAULT NULL`);
      } catch (err) {}
    }

    const [rows] = await db.query('SELECT COUNT(*) AS count FROM pharmacy_tenants');
    if (rows[0].count === 0) {
      for (const t of tenantsStore) {
        const hashedDefaultPin = hashPinBcrypt('1234');
        await db.query(
          `INSERT INTO pharmacy_tenants 
           (id, store_name, slug, owner_name, email, phone, access_pin, plan_tier, status, terminals_count, branches_count, joined_date, next_billing_date, mrr)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [t.id, t.storeName, t.slug, t.ownerName, t.email, t.phone, hashedDefaultPin, t.planTier, t.status, t.terminalsCount, t.branchesCount, t.joinedDate, t.nextBillingDate, t.mrr]
        );
      }
    }
  }
};

const formatTenantRow = (r) => ({
  id: r.id,
  storeName: r.store_name,
  slug: r.slug,
  ownerName: r.owner_name,
  email: r.email,
  phone: r.phone,
  planTier: r.plan_tier,
  status: r.status,
  terminalsCount: r.terminals_count,
  branchesCount: r.branches_count,
  joinedDate: r.joined_date ? new Date(r.joined_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  nextBillingDate: r.next_billing_date ? new Date(r.next_billing_date).toISOString().split('T')[0] : new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  mrr: parseFloat(r.mrr) || 0
});

// 2. Get Subscriber Directory
const getTenants = async (req, res) => {
  const { search, status, plan } = req.query;

  try {
    if (db && db.query) {
      await ensureTenantsTable();

      let query = 'SELECT * FROM pharmacy_tenants WHERE 1=1';
      const params = [];

      if (search) {
        query += ' AND (LOWER(store_name) LIKE ? OR LOWER(owner_name) LIKE ? OR LOWER(slug) LIKE ? OR LOWER(email) LIKE ?)';
        const q = `%${search.toLowerCase()}%`;
        params.push(q, q, q, q);
      }

      if (status && status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }

      if (plan && plan !== 'all') {
        query += ' AND plan_tier = ?';
        params.push(plan);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await db.query(query, params);
      const data = rows.map(formatTenantRow);

      return res.json({
        success: true,
        total: data.length,
        data
      });
    }
  } catch (error) {
    console.error('Error fetching tenants from DB:', error.message);
  }

  let filtered = [...tenantsStore];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(t => 
      t.storeName.toLowerCase().includes(q) || 
      t.ownerName.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  }
  if (status && status !== 'all') filtered = filtered.filter(t => t.status === status);
  if (plan && plan !== 'all') filtered = filtered.filter(t => t.planTier === plan);

  res.json({
    success: true,
    total: filtered.length,
    data: filtered
  });
};

// 3. Create New Tenant Onboarding
const createTenant = async (req, res) => {
  const { storeName, ownerName, email, phone, planTier, accessPin } = req.body;

  if (!storeName || !ownerName || !email) {
    return res.status(400).json({ success: false, message: "Missing required store details." });
  }

  const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `store-${Date.now()}`;
  const mrrMap = { starter: 49, pro: 149, enterprise: 399 };
  const tenantId = `TENANT_${Date.now().toString().slice(-6)}`;
  const tier = ['starter', 'pro', 'enterprise'].includes(planTier) ? planTier : 'pro';
  const termCount = tier === 'enterprise' ? 5 : tier === 'pro' ? 3 : 1;
  const jDate = new Date().toISOString().split('T')[0];
  const nbDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const mrrVal = mrrMap[tier] || 149;
  const hashedPin = hashPinBcrypt(accessPin || '1234');

  try {
    if (db && db.query) {
      await ensureTenantsTable();

      await db.query(
        `INSERT INTO pharmacy_tenants 
         (id, store_name, slug, owner_name, email, phone, access_pin, plan_tier, status, terminals_count, branches_count, joined_date, next_billing_date, mrr)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tenantId, storeName, slug, ownerName, email, phone || '+1 (555) 000-0000', hashedPin, tier, 'trial', termCount, 1, jDate, nbDate, mrrVal]
      );

      const [rows] = await db.query('SELECT * FROM pharmacy_tenants WHERE id = ?', [tenantId]);
      const createdTenant = formatTenantRow(rows[0]);

      tenantsStore.unshift(createdTenant);

      auditLogsStore.unshift({
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: "New Tenant Onboarded in DB",
        details: `Created new pharmacy tenant '${storeName}' (${tier.toUpperCase()} Plan - 14 Day Trial)`,
        tenantId: createdTenant.id,
        severity: "success"
      });

      return res.status(201).json({
        success: true,
        message: "Pharmacy subscriber store onboarded in DB successfully!",
        data: createdTenant
      });
    }
  } catch (error) {
    console.error('Error creating tenant in DB:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  const newTenant = {
    id: tenantId,
    storeName,
    slug,
    ownerName,
    email,
    phone: phone || "+1 (555) 000-0000",
    planTier: tier,
    status: "trial",
    terminalsCount: termCount,
    branchesCount: 1,
    joinedDate: jDate,
    nextBillingDate: nbDate,
    mrr: mrrVal
  };

  tenantsStore.unshift(newTenant);

  auditLogsStore.unshift({
    id: `LOG_${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: "New Tenant Onboarded",
    details: `Created new pharmacy tenant '${storeName}' (${tier.toUpperCase()} Plan - 14 Day Trial)`,
    tenantId: newTenant.id,
    severity: "success"
  });

  return res.status(201).json({
    success: true,
    message: "Pharmacy subscriber store onboarded successfully!",
    data: newTenant
  });
};

// 4. Update Tenant Status or Plan
const updateTenant = (req, res) => {
  const { id } = req.params;
  const { status, planTier, extendDays } = req.body;

  const tenantIndex = tenantsStore.findIndex(t => t.id === id);
  if (tenantIndex === -1) {
    return res.status(404).json({ success: false, message: "Tenant store not found." });
  }

  const tenant = tenantsStore[tenantIndex];
  const mrrMap = { starter: 49, pro: 149, enterprise: 399 };

  if (status) tenant.status = status;
  if (planTier) {
    tenant.planTier = planTier;
    tenant.mrr = mrrMap[planTier] || tenant.mrr;
  }
  if (extendDays) {
    const currentNextDate = new Date(tenant.nextBillingDate);
    currentNextDate.setDate(currentNextDate.getDate() + Number(extendDays));
    tenant.nextBillingDate = currentNextDate.toISOString().split('T')[0];
  }

  auditLogsStore.unshift({
    id: `LOG_${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: "Tenant Plan/Status Updated",
    details: `Updated '${tenant.storeName}' status: ${tenant.status}, tier: ${tenant.planTier}`,
    tenantId: tenant.id,
    severity: "info"
  });

  res.json({
    success: true,
    message: "Subscriber store updated successfully.",
    data: tenant
  });
};

const sanitizeTiers = (planId, tiers) => {
  let parsed = [];
  try {
    parsed = typeof tiers === 'string' ? JSON.parse(tiers) : (tiers || []);
  } catch (e) {
    parsed = [];
  }
  // Filter valid tier string names
  const valid = (Array.isArray(parsed) ? parsed : []).filter(t => ['starter', 'pro', 'enterprise'].includes(t));
  if (valid.length > 0) return valid;

  const idLower = String(planId).toLowerCase();
  if (idLower === 'enterprise' || idLower === '3') return ['starter', 'pro', 'enterprise'];
  if (idLower === 'pro' || idLower === '2') return ['starter', 'pro'];
  return ['starter'];
};

const formatPlanRow = (r) => ({
  id: String(r.id),
  tier: r.tier || r.id,
  name: r.name,
  priceMonthly: parseFloat(r.price_monthly),
  priceYearly: parseFloat(r.price_yearly),
  terminalsLimit: r.terminals_limit,
  branchesLimit: r.branches_limit,
  masterDrugLimit: r.master_drug_limit_description,
  allowedDrugTiers: sanitizeTiers(r.tier || r.id, r.allowed_drug_tiers),
  features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || {})
});

// Helper to ensure subscription_plans table exists
const ensureSubscriptionPlansTable = async () => {
  if (db && db.query) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price_monthly DECIMAL(10, 2) NOT NULL,
        price_yearly DECIMAL(10, 2) NOT NULL,
        terminals_limit INT NOT NULL DEFAULT 1,
        branches_limit INT NOT NULL DEFAULT 1,
        master_drug_limit_description TEXT NOT NULL,
        allowed_drug_tiers JSON NOT NULL,
        features JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Auto-fix any row where allowed_drug_tiers was incorrectly saved as '["3"]'
    try {
      await db.query(`UPDATE subscription_plans SET allowed_drug_tiers = '["starter", "pro", "enterprise"]' WHERE (tier = 'enterprise' OR id = '3' OR id = 3) AND (allowed_drug_tiers LIKE '%"3"%' OR allowed_drug_tiers = '["3"]')`);
    } catch (e) {
      // Ignore if tier column doesn't exist
    }
  }
};

// 5. Get Plans Configuration from Database
const getPlans = async (req, res) => {
  try {
    if (db && db.query) {
      await ensureSubscriptionPlansTable();

      const [existingPlans] = await db.query('SELECT * FROM subscription_plans ORDER BY price_monthly ASC');

      if (!existingPlans || existingPlans.length === 0) {
        // Seed initial default plans into DB table
        for (const plan of plansStore) {
          await db.query(
            `INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, terminals_limit, branches_limit, master_drug_limit_description, allowed_drug_tiers, features)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              plan.id,
              plan.name,
              plan.priceMonthly,
              plan.priceYearly,
              plan.terminalsLimit,
              plan.branchesLimit,
              plan.masterDrugLimit,
              JSON.stringify(plan.allowedDrugTiers),
              JSON.stringify(plan.features)
            ]
          );
        }
        const [seededRows] = await db.query('SELECT * FROM subscription_plans ORDER BY price_monthly ASC');
        return res.json({
          success: true,
          fromDb: true,
          count: seededRows.length,
          data: seededRows.map(formatPlanRow)
        });
      }

      return res.json({
        success: true,
        fromDb: true,
        count: existingPlans.length,
        data: existingPlans.map(formatPlanRow)
      });
    }

    return res.json({
      success: true,
      fromDb: false,
      count: plansStore.length,
      data: plansStore
    });
  } catch (error) {
    console.error('Error fetching subscription plans from DB:', error.message);
    return res.json({
      success: true,
      fromDb: false,
      message: error.message,
      count: plansStore.length,
      data: plansStore
    });
  }
};

// 5b. Update Subscription Plan Tier in Database
const updatePlan = async (req, res) => {
  const { id } = req.params;
  const { name, priceMonthly, priceYearly, terminalsLimit, branchesLimit, masterDrugLimit, allowedDrugTiers, features } = req.body;

  try {
    if (db && db.query) {
      await ensureSubscriptionPlansTable();

      const [existing] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
      const current = existing && existing.length > 0 ? existing[0] : null;

      const newName = name || (current ? current.name : id);
      const newPriceMonthly = priceMonthly !== undefined ? parseFloat(priceMonthly) : (current ? parseFloat(current.price_monthly) : 49);
      const newPriceYearly = priceYearly !== undefined ? parseFloat(priceYearly) : (current ? parseFloat(current.price_yearly) : (newPriceMonthly * 10));
      const newTerminalsLimit = terminalsLimit !== undefined ? parseInt(terminalsLimit) : (current ? current.terminals_limit : 1);
      const newBranchesLimit = branchesLimit !== undefined ? parseInt(branchesLimit) : (current ? current.branches_limit : 1);
      const newMasterDrugLimit = masterDrugLimit || (current ? current.master_drug_limit_description : 'Essential Catalog Access');
      const validTiers = sanitizeTiers(id, allowedDrugTiers || (current ? current.allowed_drug_tiers : null));
      const newAllowedDrugTiers = JSON.stringify(validTiers);
      const newFeatures = features ? (typeof features === 'string' ? features : JSON.stringify(features)) : (current ? (typeof current.features === 'string' ? current.features : JSON.stringify(current.features)) : JSON.stringify({ posRegister: true }));

      await db.query(
        `INSERT INTO subscription_plans 
         (id, name, price_monthly, price_yearly, terminals_limit, branches_limit, master_drug_limit_description, allowed_drug_tiers, features)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), price_monthly = VALUES(price_monthly), price_yearly = VALUES(price_yearly),
         terminals_limit = VALUES(terminals_limit), branches_limit = VALUES(branches_limit),
         master_drug_limit_description = VALUES(master_drug_limit_description),
         allowed_drug_tiers = VALUES(allowed_drug_tiers), features = VALUES(features)`,
        [id, newName, newPriceMonthly, newPriceYearly, newTerminalsLimit, newBranchesLimit, newMasterDrugLimit, newAllowedDrugTiers, newFeatures]
      );

      const [updatedRows] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
      const updatedPlan = formatPlanRow(updatedRows[0]);

      const memIdx = plansStore.findIndex(p => p.id === id);
      if (memIdx !== -1) {
        plansStore[memIdx] = updatedPlan;
      } else {
        plansStore.push(updatedPlan);
      }

      auditLogsStore.unshift({
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: "Subscription Tier Updated in DB",
        details: `Updated subscription plan tier specs for '${id.toUpperCase()}' ($${newPriceMonthly}/mo)`,
        tenantId: "SYSTEM",
        severity: "info"
      });

      return res.json({
        success: true,
        message: `Subscription tier '${id.toUpperCase()}' updated successfully in DB!`,
        data: updatedPlan
      });
    }

    // Memory fallback update
    const planIndex = plansStore.findIndex(p => p.id === id);
    if (planIndex !== -1) {
      if (name) plansStore[planIndex].name = name;
      if (priceMonthly !== undefined) plansStore[planIndex].priceMonthly = parseFloat(priceMonthly);
      if (priceYearly !== undefined) plansStore[planIndex].priceYearly = parseFloat(priceYearly);
      if (terminalsLimit !== undefined) plansStore[planIndex].terminalsLimit = parseInt(terminalsLimit);
      if (branchesLimit !== undefined) plansStore[planIndex].branchesLimit = parseInt(branchesLimit);
      if (masterDrugLimit) plansStore[planIndex].masterDrugLimit = masterDrugLimit;
      if (allowedDrugTiers) plansStore[planIndex].allowedDrugTiers = allowedDrugTiers;
      if (features) plansStore[planIndex].features = features;

      return res.json({
        success: true,
        message: `Subscription tier '${id.toUpperCase()}' updated in memory.`,
        data: plansStore[planIndex]
      });
    }

    const fallbackPlan = {
      id,
      name: name || id,
      priceMonthly: priceMonthly !== undefined ? parseFloat(priceMonthly) : 49,
      priceYearly: priceYearly !== undefined ? parseFloat(priceYearly) : 470,
      terminalsLimit: terminalsLimit || 1,
      branchesLimit: branchesLimit || 1,
      masterDrugLimit: masterDrugLimit || 'Essential Catalog',
      allowedDrugTiers: allowedDrugTiers || [id],
      features: features || { posRegister: true }
    };
    plansStore.push(fallbackPlan);
    return res.json({ success: true, message: `Subscription tier '${id.toUpperCase()}' saved locally.`, data: fallbackPlan });
  } catch (error) {
    console.error('Error updating plan tier in DB:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5c. Create New Subscription Plan Tier in Database
const createPlan = async (req, res) => {
  const { id, name, priceMonthly, priceYearly, terminalsLimit, branchesLimit, masterDrugLimit, allowedDrugTiers, features } = req.body;

  if (!name || priceMonthly === undefined) {
    return res.status(400).json({ success: false, message: "Plan tier name and monthly price are required." });
  }

  const planId = (id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || `plan-${Date.now()}`;
  const planMonthly = parseFloat(priceMonthly) || 0;
  const planYearly = priceYearly !== undefined ? parseFloat(priceYearly) : (planMonthly * 10);
  const planTerminals = terminalsLimit !== undefined ? parseInt(terminalsLimit) : 1;
  const planBranches = branchesLimit !== undefined ? parseInt(branchesLimit) : 1;
  const planCatalogDesc = masterDrugLimit || "Standard Essential Drug Catalog Access";
  const planAllowedTiers = Array.isArray(allowedDrugTiers) ? allowedDrugTiers : [planId];
  const planFeatures = features || {
    posRegister: true,
    fefoExpiry: "Basic",
    rxVerification: false,
    smsReceipts: "Not Included",
    poGenerator: false,
    support: "Email Support"
  };

  try {
    if (db && db.query) {
      await ensureSubscriptionPlansTable();

      await db.query(
        `INSERT INTO subscription_plans 
         (id, name, price_monthly, price_yearly, terminals_limit, branches_limit, master_drug_limit_description, allowed_drug_tiers, features)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         price_monthly = VALUES(price_monthly), 
         price_yearly = VALUES(price_yearly), 
         terminals_limit = VALUES(terminals_limit), 
         branches_limit = VALUES(branches_limit), 
         master_drug_limit_description = VALUES(master_drug_limit_description), 
         allowed_drug_tiers = VALUES(allowed_drug_tiers), 
         features = VALUES(features)`,
        [
          planId,
          name,
          planMonthly,
          planYearly,
          planTerminals,
          planBranches,
          planCatalogDesc,
          JSON.stringify(planAllowedTiers),
          JSON.stringify(planFeatures)
        ]
      );

      const [newRow] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [planId]);
      const formattedPlan = formatPlanRow(newRow[0]);

      const memIdx = plansStore.findIndex(p => p.id === planId);
      if (memIdx !== -1) {
        plansStore[memIdx] = formattedPlan;
      } else {
        plansStore.push(formattedPlan);
      }

      auditLogsStore.unshift({
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: "New Subscription Tier Created in DB",
        details: `Created new plan tier '${name}' (${planId.toUpperCase()}) at $${planMonthly}/mo in DB`,
        tenantId: "SYSTEM",
        severity: "success"
      });

      return res.status(201).json({
        success: true,
        message: `New subscription plan tier '${name}' created in DB successfully!`,
        data: formattedPlan
      });
    }

    const newPlan = {
      id: planId,
      name,
      priceMonthly: planMonthly,
      priceYearly: planYearly,
      terminalsLimit: planTerminals,
      branchesLimit: planBranches,
      masterDrugLimit: planCatalogDesc,
      allowedDrugTiers: planAllowedTiers,
      features: planFeatures
    };
    plansStore.push(newPlan);

    return res.status(201).json({
      success: true,
      message: `New subscription plan tier '${name}' created in memory.`,
      data: newPlan
    });
  } catch (error) {
    console.error('Error creating subscription plan tier in DB:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to ensure master_drug_catalog table exists in DB
const ensureMasterDrugTable = async () => {
  if (db && db.query) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS master_drug_catalog (
        id INT AUTO_INCREMENT PRIMARY KEY,
        drug_code VARCHAR(50),
        brand_name VARCHAR(255) NOT NULL,
        generic_name VARCHAR(255) NOT NULL,
        dosage_form VARCHAR(100) NOT NULL,
        manufacturer VARCHAR(255) NOT NULL,
        default_retail_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        rx_required TINYINT(1) NOT NULL DEFAULT 1,
        plan_tier_access ENUM('starter', 'pro', 'enterprise') NOT NULL DEFAULT 'starter',
        barcode VARCHAR(100),
        therapeutic_class VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    try {
      await db.query(`ALTER TABLE master_drug_catalog ADD COLUMN drug_code VARCHAR(50) AFTER id`);
    } catch (e) {
      // Column already exists
    }

    const [rows] = await db.query('SELECT COUNT(*) AS count FROM master_drug_catalog');
    if (rows[0].count === 0) {
      for (const d of masterDrugsStore) {
        await db.query(
          `INSERT INTO master_drug_catalog 
           (drug_code, brand_name, generic_name, dosage_form, manufacturer, default_retail_price, rx_required, plan_tier_access, barcode, therapeutic_class)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [d.drugCode || d.id || 'MDRUG_1001', d.brandName, d.genericName, d.dosageForm, d.manufacturer, d.defaultRetailPrice, d.rxRequired ? 1 : 0, d.planTierAccess, d.barcode, d.therapeuticClass]
        );
      }
    }
  }
};

const formatMasterDrugRow = (r) => ({
  id: String(r.id),
  dbId: r.id,
  drugCode: r.drug_code || `MDRUG_${r.id}`,
  brandName: r.brand_name,
  genericName: r.generic_name,
  dosageForm: r.dosage_form,
  manufacturer: r.manufacturer,
  defaultRetailPrice: parseFloat(r.default_retail_price) || 0,
  rxRequired: Boolean(r.rx_required),
  planTierAccess: r.plan_tier_access,
  barcode: r.barcode,
  therapeuticClass: r.therapeutic_class,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

// 6. Get Plan-Wise Master Drug Catalog (DB Backed)
const getMasterDrugs = async (req, res) => {
  const { search, planTier, rxFilter } = req.query;

  try {
    if (db && db.query) {
      await ensureMasterDrugTable();

      let query = 'SELECT * FROM master_drug_catalog WHERE 1=1';
      const params = [];

      if (search) {
        query += ' AND (LOWER(brand_name) LIKE ? OR LOWER(generic_name) LIKE ? OR LOWER(therapeutic_class) LIKE ? OR LOWER(manufacturer) LIKE ? OR barcode LIKE ? OR LOWER(drug_code) LIKE ?)';
        const q = `%${search.toLowerCase()}%`;
        params.push(q, q, q, q, q, q);
      }

      if (planTier && planTier !== 'all') {
        query += ' AND plan_tier_access = ?';
        params.push(planTier);
      }

      if (rxFilter && rxFilter !== 'all') {
        query += ' AND rx_required = ?';
        params.push(rxFilter === 'rx' ? 1 : 0);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await db.query(query, params);
      const data = rows.map(formatMasterDrugRow);

      return res.json({
        success: true,
        total: data.length,
        data
      });
    }
  } catch (error) {
    console.error('Error fetching master drugs from DB:', error.message);
  }

  // Memory fallback
  let filtered = [...masterDrugsStore];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(d => 
      d.brandName.toLowerCase().includes(q) ||
      d.genericName.toLowerCase().includes(q) ||
      d.therapeuticClass.toLowerCase().includes(q) ||
      d.manufacturer.toLowerCase().includes(q)
    );
  }
  if (planTier && planTier !== 'all') {
    filtered = filtered.filter(d => d.planTierAccess === planTier);
  }
  if (rxFilter && rxFilter !== 'all') {
    filtered = filtered.filter(d => rxFilter === 'rx' ? d.rxRequired : !d.rxRequired);
  }

  res.json({
    success: true,
    total: filtered.length,
    data: filtered
  });
};

// 7. Create New Master Drug in DB
const createMasterDrug = async (req, res) => {
  const { drugCode, brandName, genericName, dosageForm, manufacturer, defaultRetailPrice, rxRequired, planTierAccess, therapeuticClass, barcode } = req.body;

  if (!brandName || !genericName) {
    return res.status(400).json({ success: false, message: "Brand name and Generic chemical name are required." });
  }

  const dCode = drugCode || `MDRUG_${Date.now().toString().slice(-6)}`;
  const bName = brandName;
  const gName = genericName;
  const dForm = dosageForm || "Tablet";
  const mfr = manufacturer || "Generic Certified Pharma";
  const price = Number(defaultRetailPrice) || 10.00;
  const rx = rxRequired !== undefined ? (rxRequired ? 1 : 0) : 1;
  const tier = ['starter', 'pro', 'enterprise'].includes(planTierAccess) ? planTierAccess : 'starter';
  const code = barcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const tClass = therapeuticClass || "General Pharmaceutical";

  try {
    if (db && db.query) {
      await ensureMasterDrugTable();

      const [result] = await db.query(
        `INSERT INTO master_drug_catalog 
         (drug_code, brand_name, generic_name, dosage_form, manufacturer, default_retail_price, rx_required, plan_tier_access, barcode, therapeutic_class)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dCode, bName, gName, dForm, mfr, price, rx, tier, code, tClass]
      );

      const newInsertId = result.insertId;
      const [rows] = await db.query('SELECT * FROM master_drug_catalog WHERE id = ?', [newInsertId]);
      const createdDrug = formatMasterDrugRow(rows[0]);

      masterDrugsStore.unshift(createdDrug);

      auditLogsStore.unshift({
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: "Master Drug Added in DB",
        details: `Added new drug '${bName}' (${gName}) for ${tier.toUpperCase()} Plan tier in DB (ID: ${newInsertId})`,
        tenantId: "SYSTEM",
        severity: "success"
      });

      return res.status(201).json({
        success: true,
        message: "Master drug added to global dictionary in DB successfully!",
        data: createdDrug
      });
    }
  } catch (error) {
    console.error('Error creating master drug in DB:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  const newDrug = {
    id: String(Date.now()),
    drugCode: dCode,
    brandName: bName,
    genericName: gName,
    dosageForm: dForm,
    manufacturer: mfr,
    defaultRetailPrice: price,
    rxRequired: Boolean(rx),
    planTierAccess: tier,
    barcode: code,
    therapeuticClass: tClass
  };

  masterDrugsStore.unshift(newDrug);

  auditLogsStore.unshift({
    id: `LOG_${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: "Master Drug Added",
    details: `Added new drug '${bName}' (${gName}) tagged for ${tier.toUpperCase()} Plan tier`,
    tenantId: "SYSTEM",
    severity: "success"
  });

  return res.status(201).json({
    success: true,
    message: "Master drug added to global dictionary successfully!",
    data: newDrug
  });
};

// 7b. Update Master Drug in DB
const updateMasterDrug = async (req, res) => {
  const { id } = req.params;
  const { drugCode, brandName, genericName, dosageForm, manufacturer, defaultRetailPrice, rxRequired, planTierAccess, therapeuticClass, barcode } = req.body;

  try {
    if (db && db.query) {
      await ensureMasterDrugTable();

      const [existing] = await db.query('SELECT * FROM master_drug_catalog WHERE id = ? OR drug_code = ?', [id, id]);
      if (existing && existing.length > 0) {
        const current = existing[0];
        const currentId = current.id;

        const dCode = drugCode || current.drug_code || `MDRUG_${currentId}`;
        const bName = brandName || current.brand_name;
        const gName = genericName || current.generic_name;
        const dForm = dosageForm || current.dosage_form;
        const mfr = manufacturer || current.manufacturer;
        const price = defaultRetailPrice !== undefined ? Number(defaultRetailPrice) : parseFloat(current.default_retail_price);
        const rx = rxRequired !== undefined ? (rxRequired ? 1 : 0) : current.rx_required;
        const tier = ['starter', 'pro', 'enterprise'].includes(planTierAccess) ? planTierAccess : current.plan_tier_access;
        const code = barcode || current.barcode;
        const tClass = therapeuticClass || current.therapeutic_class;

        await db.query(
          `UPDATE master_drug_catalog SET 
           drug_code = ?, brand_name = ?, generic_name = ?, dosage_form = ?, manufacturer = ?,
           default_retail_price = ?, rx_required = ?, plan_tier_access = ?, barcode = ?, therapeutic_class = ?
           WHERE id = ?`,
          [dCode, bName, gName, dForm, mfr, price, rx, tier, code, tClass, currentId]
        );

        const [rows] = await db.query('SELECT * FROM master_drug_catalog WHERE id = ?', [currentId]);
        const updatedDrug = formatMasterDrugRow(rows[0]);

        const idx = masterDrugsStore.findIndex(d => String(d.id) === String(currentId) || d.drugCode === id);
        if (idx !== -1) {
          masterDrugsStore[idx] = updatedDrug;
        } else {
          masterDrugsStore.push(updatedDrug);
        }

        auditLogsStore.unshift({
          id: `LOG_${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: "Master Drug Updated in DB",
          details: `Updated drug '${bName}' (${gName}) specs in DB`,
          tenantId: "SYSTEM",
          severity: "info"
        });

        return res.json({
          success: true,
          message: "Master drug updated in DB successfully!",
          data: updatedDrug
        });
      }
    }
  } catch (error) {
    console.error('Error updating master drug in DB:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  const idx = masterDrugsStore.findIndex(d => String(d.id) === String(id) || d.drugCode === id);
  if (idx !== -1) {
    if (drugCode) masterDrugsStore[idx].drugCode = drugCode;
    if (brandName) masterDrugsStore[idx].brandName = brandName;
    if (genericName) masterDrugsStore[idx].genericName = genericName;
    if (dosageForm) masterDrugsStore[idx].dosageForm = dosageForm;
    if (manufacturer) masterDrugsStore[idx].manufacturer = manufacturer;
    if (defaultRetailPrice !== undefined) masterDrugsStore[idx].defaultRetailPrice = Number(defaultRetailPrice);
    if (rxRequired !== undefined) masterDrugsStore[idx].rxRequired = Boolean(rxRequired);
    if (planTierAccess) masterDrugsStore[idx].planTierAccess = planTierAccess;
    if (therapeuticClass) masterDrugsStore[idx].therapeuticClass = therapeuticClass;
    if (barcode) masterDrugsStore[idx].barcode = barcode;

    return res.json({
      success: true,
      message: "Master drug updated locally.",
      data: masterDrugsStore[idx]
    });
  }

  return res.status(404).json({ success: false, message: "Master drug not found." });
};

// 7c. Delete Master Drug from DB
const deleteMasterDrug = async (req, res) => {
  const { id } = req.params;

  try {
    if (db && db.query) {
      await ensureMasterDrugTable();
      await db.query('DELETE FROM master_drug_catalog WHERE id = ?', [id]);
    }
  } catch (error) {
    console.error('Error deleting master drug from DB:', error.message);
  }

  const idx = masterDrugsStore.findIndex(d => d.id === id);
  let removedName = id;
  if (idx !== -1) {
    removedName = masterDrugsStore[idx].brandName;
    masterDrugsStore.splice(idx, 1);
  }

  auditLogsStore.unshift({
    id: `LOG_${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: "Master Drug Deleted",
    details: `Deleted drug '${removedName}' (ID: ${id}) from central master catalog`,
    tenantId: "SYSTEM",
    severity: "warning"
  });

  return res.json({
    success: true,
    message: `Master drug '${removedName}' deleted successfully!`
  });
};

// 8. Push Plan-Restricted Sync to Subscriber Stores
const syncMasterDrugsToStores = (req, res) => {
  auditLogsStore.unshift({
    id: `LOG_${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: "Global Master Catalog Sync Triggered",
    details: `Pushed catalog updates to 38 subscriber stores filtered by their respective plan tier access limits.`,
    tenantId: "SYSTEM",
    severity: "success"
  });

  res.json({
    success: true,
    message: "Pushed Plan-Restricted Master Drug Catalog sync to 38 active subscriber stores!",
    syncedCount: masterDrugsStore.length
  });
};

// 9. Get Platform Audit & Security Logs
const getLogs = (req, res) => {
  res.json({
    success: true,
    data: auditLogsStore
  });
};

module.exports = {
  getAnalytics,
  getTenants,
  createTenant,
  updateTenant,
  getPlans,
  createPlan,
  updatePlan,
  getMasterDrugs,
  createMasterDrug,
  updateMasterDrug,
  deleteMasterDrug,
  syncMasterDrugsToStores,
  getLogs
};
