// ============================================================================
// PharmaCare SaaS — Terminal (POS PC / Counter) Controller
// ============================================================================

const db = require('../config/db');

// Helper: Get tenant active subscription plan limits
const getTenantPlanLimits = async (tenantId) => {
  try {
    const [[sub]] = await db.query(
      `SELECT sp.max_terminals, sp.max_branches, sp.name as plan_name, ts.status as sub_status 
       FROM tenant_subscriptions ts
       JOIN subscription_plans sp ON sp.id = ts.plan_id
       WHERE ts.tenant_id = ? AND ts.status IN ('active', 'trial')
       ORDER BY ts.id DESC LIMIT 1`,
      [tenantId]
    );
    if (sub) {
      return {
        maxTerminals: sub.max_terminals || 1,
        maxBranches: sub.max_branches || 1,
        planName: sub.plan_name || 'Starter',
        status: sub.sub_status
      };
    }
  } catch (e) {
    console.warn('getTenantPlanLimits error:', e.message);
  }
  return { maxTerminals: 1, maxBranches: 1, planName: 'Starter', status: 'active' };
};

// ---------------------------------------------------------------------------
// GET /api/terminals — List all POS Terminals / Counters for Tenant
// ---------------------------------------------------------------------------
const getTerminals = async (req, res) => {
  try {
    const tenantId = req.tenantId || 1;
    const limits = await getTenantPlanLimits(tenantId);

    const [terminals] = await db.query(
      `SELECT t.*, b.name as branch_name, b.code as branch_code 
       FROM pos_terminals t
       LEFT JOIN branches b ON b.id = t.branch_id
       WHERE t.tenant_id = ?
       ORDER BY t.id ASC`,
      [tenantId]
    );

    const activeCount = terminals.filter(t => t.status === 'active').length;

    return res.json({
      success: true,
      data: terminals,
      terminals,
      meta: {
        totalTerminals: terminals.length,
        activeTerminals: activeCount,
        maxAllowed: limits.maxTerminals,
        planName: limits.planName,
        canAddMore: activeCount < limits.maxTerminals
      }
    });
  } catch (err) {
    console.error('getTerminals error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/terminals — Add New POS PC / Counter (Owner Action)
// ---------------------------------------------------------------------------
const addTerminal = async (req, res) => {
  try {
    const tenantId = req.tenantId || 1;
    const { branchId, deviceName, terminalCode } = req.body;

    const limits = await getTenantPlanLimits(tenantId);

    // 1. Check Active Terminals vs Plan Limit
    const [[countRow]] = await db.query(
      `SELECT COUNT(*) as activeTotal FROM pos_terminals WHERE tenant_id = ? AND status = 'active'`,
      [tenantId]
    );

    if (countRow.activeTotal >= limits.maxTerminals) {
      return res.status(403).json({
        success: false,
        code: 'TERMINAL_LIMIT_REACHED',
        message: `⚠️ Terminal Limit Reached! Your "${limits.planName}" plan supports maximum ${limits.maxTerminals} active POS PC(s). Please upgrade your plan to connect more counters.`
      });
    }

    // 2. Determine Branch ID (fallback to main branch if not provided)
    let assignedBranchId = branchId;
    if (!assignedBranchId) {
      const [[mainBranch]] = await db.query(
        `SELECT id FROM branches WHERE tenant_id = ? AND is_main = 1 LIMIT 1`,
        [tenantId]
      );
      assignedBranchId = mainBranch?.id || null;
    }

    // 3. Generate Terminal Code (e.g. POS-02)
    const [allTerminals] = await db.query(
      `SELECT COUNT(*) as total FROM pos_terminals WHERE tenant_id = ?`,
      [tenantId]
    );
    const nextCode = terminalCode || `POS-0${allTerminals[0].total + 1}`;
    const nextName = deviceName || `Counter-0${allTerminals[0].total + 1}`;

    const [insertResult] = await db.query(
      `INSERT INTO pos_terminals (tenant_id, branch_id, terminal_code, device_name, status, last_active_at)
       VALUES (?, ?, ?, ?, 'active', NOW())`,
      [tenantId, assignedBranchId, nextCode, nextName]
    );

    const [[newTerminal]] = await db.query(
      `SELECT t.*, b.name as branch_name FROM pos_terminals t 
       LEFT JOIN branches b ON b.id = t.branch_id 
       WHERE t.id = ?`,
      [insertResult.insertId]
    );

    return res.status(201).json({
      success: true,
      message: `POS Counter "${nextName}" (${nextCode}) added successfully!`,
      terminal: newTerminal,
      data: newTerminal
    });
  } catch (err) {
    console.error('addTerminal error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/terminals/:id — Update POS Terminal
// ---------------------------------------------------------------------------
const updateTerminal = async (req, res) => {
  try {
    const tenantId = req.tenantId || 1;
    const terminalId = req.params.id;
    const { deviceName, branchId, status } = req.body;

    const updates = [];
    const params = [];

    if (deviceName) { updates.push('device_name = ?'); params.push(deviceName); }
    if (branchId !== undefined) { updates.push('branch_id = ?'); params.push(branchId); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length > 0) {
      params.push(terminalId, tenantId);
      await db.query(
        `UPDATE pos_terminals SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`,
        params
      );
    }

    const [[updated]] = await db.query(
      `SELECT t.*, b.name as branch_name FROM pos_terminals t 
       LEFT JOIN branches b ON b.id = t.branch_id 
       WHERE t.id = ? AND t.tenant_id = ?`,
      [terminalId, tenantId]
    );

    return res.json({
      success: true,
      message: 'Terminal updated successfully.',
      terminal: updated,
      data: updated
    });
  } catch (err) {
    console.error('updateTerminal error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/terminals/:id — Deactivate / Remove POS Terminal
// ---------------------------------------------------------------------------
const deleteTerminal = async (req, res) => {
  try {
    const tenantId = req.tenantId || 1;
    const terminalId = req.params.id;

    // Check if terminal exists
    const [[term]] = await db.query(
      `SELECT * FROM pos_terminals WHERE id = ? AND tenant_id = ?`,
      [terminalId, tenantId]
    );

    if (!term) {
      return res.status(404).json({ success: false, message: 'Terminal not found.' });
    }

    await db.query(`DELETE FROM pos_terminals WHERE id = ? AND tenant_id = ?`, [terminalId, tenantId]);

    return res.json({
      success: true,
      message: `Terminal ${term.terminal_code} removed successfully.`
    });
  } catch (err) {
    console.error('deleteTerminal error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTerminals,
  addTerminal,
  updateTerminal,
  deleteTerminal
};
