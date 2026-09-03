// ============================================================================
// PharmaCare SaaS — Email Utility (nodemailer)
// Config: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
// ============================================================================

const nodemailer = require('nodemailer');

/**
 * Create a reusable nodemailer transporter from .env config
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    tls: {
      rejectUnauthorized: false, // allow self-signed certs in dev
    },
  });
};

/**
 * Send a generic email
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'PharmaCare SaaS <no-reply@pharmacare.com>';

  const info = await transporter.sendMail({ from, to, subject, html, text });
  console.log(`[Email] Sent to ${to} — MessageId: ${info.messageId}`);
  return info;
};

/**
 * Send a Password Reset Email with the reset link
 * @param {string} toEmail - recipient email
 * @param {string} resetToken - the raw reset token
 * @param {string} userName - user's name for greeting
 */
const sendPasswordResetEmail = async (toEmail, resetToken, userName = 'User') => {
  const appUrl   = process.env.APP_URL || 'http://localhost:3000';
  const expiry   = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || '30', 10);
  const resetUrl = `${appUrl}/login/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; }
    .wrapper { max-width: 520px; margin: 40px auto; background: #ffffff; border: 1px solid #e2e8f0; }
    .header { background: #107c41; padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 18px; font-weight: 600; }
    .header p  { color: #d1fae5; margin: 4px 0 0; font-size: 12px; }
    .body { padding: 32px; }
    .body p { color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #107c41; color: #fff !important; text-decoration: none;
           padding: 12px 28px; font-size: 14px; font-weight: 600; border-radius: 4px; margin: 8px 0 24px; }
    .link-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 4px;
                font-size: 11px; color: #64748b; word-break: break-all; margin-bottom: 16px; }
    .link-box a { color: #107c41; }
    .warning { background: #fef9c3; border: 1px solid #fde047; padding: 10px 14px; border-radius: 4px;
               font-size: 12px; color: #713f12; margin-bottom: 16px; }
    .footer { padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>PharmaCare SaaS</h1>
      <p>Password Reset Request</p>
    </div>
    <div class="body">
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We received a request to reset the password for your PharmaCare account. Click the button below to set a new password:</p>
      <a href="${resetUrl}" class="btn">Reset My Password</a>
      <div class="warning">
        This link will expire in <strong>${expiry} minutes</strong>. If you did not request this, please ignore this email.
      </div>
      <p style="font-size: 12px; color: #94a3b8;">If the button does not work, copy and paste this URL into your browser:</p>
      <div class="link-box"><a href="${resetUrl}">${resetUrl}</a></div>
    </div>
    <div class="footer">PharmaCare SaaS — Pharmacy ERP Platform. This is an automated email, please do not reply.</div>
  </div>
</body>
</html>`;

  const text = `Hello ${userName},\n\nReset your PharmaCare password here:\n${resetUrl}\n\nThis link expires in ${expiry} minutes.\n\nIf you did not request this, ignore this email.\n\n— PharmaCare SaaS Team`;

  return sendEmail({ to: toEmail, subject: 'Reset Your PharmaCare Password', html, text });
};

module.exports = { sendEmail, sendPasswordResetEmail };
