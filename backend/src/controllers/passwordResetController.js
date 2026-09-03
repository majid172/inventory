// ============================================================================
// PharmaCare SaaS — Password Reset Controller
// Routes:
//   POST /api/auth/forgot-password  → generate token, send email
//   POST /api/auth/reset-password   → validate token, update password
// ============================================================================

const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

const EXPIRY_MINUTES = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || '30', 10);

// ---------------------------------------------------------------------------
// Ensure password_reset_tokens table exists (auto-create on first use)
// ---------------------------------------------------------------------------
const ensureResetTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`password_reset_tokens\` (
      \`id\`         INT          NOT NULL AUTO_INCREMENT,
      \`user_id\`    INT          NOT NULL,
      \`email\`      VARCHAR(255) NOT NULL,
      \`token_hash\` VARCHAR(255) NOT NULL,
      \`expires_at\` DATETIME     NOT NULL,
      \`used\`       TINYINT(1)   NOT NULL DEFAULT 0,
      \`created_at\` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      INDEX \`idx_prt_email\` (\`email\`),
      INDEX \`idx_prt_token\` (\`token_hash\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
};

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// Body: { email }
// ---------------------------------------------------------------------------
const forgotPassword = async (req, res) => {
  try {
    await ensureResetTable();

    const email = (req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    // Look up user — always return success message to avoid email enumeration
    const [[user]] = await db.query(
      'SELECT id, name, email FROM users WHERE LOWER(email) = ? LIMIT 1',
      [email]
    );

    if (!user) {
      // Don't reveal whether email exists
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

    // Invalidate any existing unused tokens for this user
    await db.query(
      'UPDATE password_reset_tokens SET used = 1 WHERE email = ? AND used = 0',
      [email]
    );

    // Generate a secure random token
    const rawToken   = crypto.randomBytes(32).toString('hex');
    const tokenHash  = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt  = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, email, token_hash, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, email, tokenHash, expiresAt]
    );

    // Send email — log to console in dev if SMTP not configured
    try {
      await sendPasswordResetEmail(email, rawToken, user.name);
      console.log(`[ForgotPassword] Reset email sent to ${email}`);
    } catch (emailErr) {
      // Log error but still return success (don't expose email failure to client)
      console.error('[ForgotPassword] Email send failed:', emailErr.message);
      // In development: log the token so you can test without email
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);
        console.log(`[DEV] Reset URL: ${process.env.APP_URL || 'http://localhost:3000'}/login/reset-password?token=${rawToken}`);
      }
    }

    return res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// Body: { token, newPassword }
// ---------------------------------------------------------------------------
const resetPassword = async (req, res) => {
  try {
    await ensureResetTable();

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Hash the incoming raw token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [[record]] = await db.query(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = ? AND used = 0 AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [tokenHash]
    );

    if (!record) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'This reset link is invalid or has expired. Please request a new one.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, record.user_id]);

    // Mark token as used
    await db.query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [record.id]);

    // Also invalidate all other unused tokens for this user
    await db.query(
      'UPDATE password_reset_tokens SET used = 1 WHERE email = ? AND used = 0',
      [record.email]
    );

    console.log(`[ResetPassword] Password reset successful for user_id=${record.user_id} email=${record.email}`);

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/auth/verify-reset-token?token=xxx
// Used by frontend to validate token before showing the new password form
// ---------------------------------------------------------------------------
const verifyResetToken = async (req, res) => {
  try {
    await ensureResetTable();

    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, valid: false, message: 'Token is required.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [[record]] = await db.query(
      `SELECT id, email, expires_at FROM password_reset_tokens
       WHERE token_hash = ? AND used = 0 AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (!record) {
      return res.json({ success: false, valid: false, message: 'This reset link is invalid or has expired.' });
    }

    return res.json({
      success: true,
      valid: true,
      email: record.email,
      expiresAt: record.expires_at
    });
  } catch (err) {
    console.error('verifyResetToken error:', err);
    return res.status(500).json({ success: false, valid: false, message: 'Server error.' });
  }
};

module.exports = { forgotPassword, resetPassword, verifyResetToken };
