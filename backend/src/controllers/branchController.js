// ============================================================================
// PharmaCare SaaS — Branch (Multi-Outlet / Store) Controller
// ============================================================================

const db = require('../config/db');

// Helper: Get tenant active subscription plan limits
const getTenantPlanLimits = async (tenantId) => {
  try {
    const [[sub]] = await db.query(
      `SELECT sp.max_branches, sp.max_terminals, sp.name as plan_name, ts.status as sub_status 
       FROM tenant_subscriptions ts
       JOIN subscription_plans sp ON sp.id = ts.plan_id
       WHERE ts.tenant_id = ? AND ts.status IN ('active', 'trial')
       ORDER BY ts.id DESC LIMIT 1`,
      [tenantId]
    );
    if (sub) {
      return {
        maxBranches: sub.max_branches || 1,
        maxTerminals: sub.max_terminals || 1,
        planName: sub.plan_name || 'Starter',
        status: sub.sub_status
      };
    }
  } catch (e) {
    console.warn('getTenantPlanLimits error:', e.message);
  }
  return { maxBranches: 1, maxTerminals: 1, planName: 'Starter', status: 'active' };
};

// ---------------------------------------------------------------------------
// GET /api/branches — List all Branches for Tenant
// ---------------------------------------------------------------------------
const getBranches = async (req, res) => {
  try {
    const tenantId = req.tenantId || 1;
    const limits = await getTenantPlanLimits(tenantId);

    let [branches] = await db.query(
      `SELECT b.*, 
        COUNT(DISTINCT t.id) as terminals_count,
        COUNT(DISTINCT u.id) as staff_count
       FROM branches b
       LEFT JOIN pos_terminals t ON t.branch_id = b.id AND t.status = 'active'
       LEFT JOIN users u ON u.branch_id = b.id AND u.status = 'active'
       WHERE b.tenant_id = ?
       GROUP BY b.id
       ORDER BY b.is_main DESC, b.id ASC`,
      [tenantId]
    );

    if (branches.length === 0) {
      try {
        const [insertRes] = await db.query(
          `INSERT INTO branches (tenant_id, name, code, is_main, status) VALUES (?, 'Main Branch', 'HQ', 1, 'active')`,
          [tenantId]
        );
        // Link any unassigned users/terminals to this main branch
        await db.query(`UPDATE users SET branch_id = ? WHERE tenant_id = ? AND branch_id IS NULL`, [insertRes.insertId, tenantId]);
        await db.query(`UPDATE pos_terminals SET branch_id = ? WHERE tenant_id = ? AND branch_id IS NULL`, [insertRes.insertId, tenantId]);

        const [recheck] = await db.query(
          `SELECT b.*, 
            COUNT(DISTINCT t.id) as terminals_count,
            COUNT(DISTINCT u.id) as staff_count
           FROM branches b
           LEFT JOIN pos_terminals t ON t.branch_id = b.id AND t.status = 'active'
           LEFT JOIN users u ON u.branch_id = b.id AND u.status = 'active'
           WHERE b.tenant_id = ?
           GROUP BY b.id
           ORDER BY b.is_main DESC, b.id ASC`,
          [tenantId]
        );
        branches = recheck;
      } catch (autoErr) {
        console.warn('Auto-create main branch error:', autoErr.message);
      }
    }

    const activeCount = branches.filter(b => b.status === 'active').length;

    return res.json({
      success: true,
      data: branches,
      branches,
      meta: {
        totalBranches: branches.length,
        activeBranches: activeCount,
        maxAllowed: limits.maxBranches,
        planName: limits.planName,
        canAddMore: activeCount < limits.maxBranches
      }
    });
  } catch (err) {
    console.error('getBranches error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/branches — Add New Branch (Owner Action)
// ---------------------------------------------------------------------------
const addBranch = async (req, res) => {
  try {
    const tenantId = req.tenantId || 1;
    const { name, code, address, phone } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Branch name is required.' });
    }

    const limits = await getTenantPlanLimits(tenantId);

    // 1. Check Active Branches vs Plan Limit
    const [[countRow]] = await db.query(
      `SELECT COUNT(*) as activeTotal FROM branches WHERE tenant_id = ? AND status = 'active'`,
      [tenantId]
    );

    if (countRow.activeTotal >= limits.maxBranches) {
      return res.status(403).json({
        success: false,
        code: 'BRANCH_LIMIT_REACHED',
        message: `⚠️ Branch Limit Reached! Your "${limits.planName}" plan supports maximum ${limits.maxBranches} Branch(es). Multi-branch is an Enterprise feature. Please upgrade to Enterprise Chain Plan.`
      });
    }

    // 2. Determine Branch Code
    const [allBranches] = await db.query(
      `SELECT COUNT(*) as total FROM branches WHERE tenant_id = ?`,
      [tenantId]
    );
    const nextCode = code || `BR-0${allBranches[0].total + 1}`;

    const [insertResult] = await db.query(
      `INSERT INTO branches (tenant_id, name, code, address, phone, is_main, status)
       VALUES (?, ?, ?, ?, ?, 0, 'active')`,
      [tenantId, name, nextCode, address || '', phone || '']
    );

    const newBranchId = insertResult.insertId;

    // 3. Auto create a default counter for this new branch
    try {
      await db.query(
        `INSERT INTO pos_terminals (tenant_id, branch_id, terminal_code, device_name, status)
         VALUES (?, ?, ?, ?, 'active')`,
        [tenantId, newBranchId, `POS-${newBranchId}-01`, `${name} - Counter 1`]
      );
    } catch (tErr) {
      console.warn('Auto terminal creation notice:', tErr.message);
    }

    const [[newBranch]] = await db.query(`SELECT * FROM branches WHERE id = ?`, [newBranchId]);

    return res.status(201).json({
      success: true,
      message: `New Branch "${name}" (${nextCode}) added successfully!`,
      branch: newBranch,
      data: newBranch
    });
  } catch (err) {
    console.error('addBranch error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/branches/:id — Update Branch
// ---------------------------------------------------------------------------
const updateBranch = async (req, res) => {
  try {
    const tenantId = req.tenantId || 1;
    const branchId = req.params.id;
    const { name, code, address, phone, status } = req.body;

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (code) { updates.push('code = ?'); params.push(code); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length > 0) {
      params.push(branchId, tenantId);
      await db.query(
        `UPDATE branches SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`,
        params
      );
    }

    const [[updated]] = await db.query(
      `SELECT * FROM branches WHERE id = ? AND tenant_id = ?`,
      [branchId, tenantId]
    );

    return res.json({
      success: true,
      message: 'Branch updated successfully.',
      branch: updated,
      data: updated
    });
  } catch (err) {
    console.error('updateBranch error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/branches/:id — Delete Branch
// ---------------------------------------------------------------------------
const deleteBranch = async (req, res) => {
  try {
    const tenantId = req.tenantId || 1;
    const branchId = req.params.id;

    const [[branch]] = await db.query(
      `SELECT * FROM branches WHERE id = ? AND tenant_id = ?`,
      [branchId, tenantId]
    );

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    if (branch.is_main === 1) {
      return res.status(400).json({ success: false, message: 'Cannot delete the Main Branch.' });
    }

    await db.query(`DELETE FROM branches WHERE id = ? AND tenant_id = ?`, [branchId, tenantId]);

    return res.json({
      success: true,
      message: `Branch "${branch.name}" deleted successfully.`
    });
  } catch (err) {
    console.error('deleteBranch error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getBranches,
  addBranch,
  updateBranch,
  deleteBranch
};
