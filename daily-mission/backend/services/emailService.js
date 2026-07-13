/**
 * Email service (Resend).
 *
 * Uses the Resend HTTP API (no SDK dependency needed — Node 18+ has global fetch).
 * If RESEND_API_KEY is not set, emails are logged to the console instead of sent,
 * so local development still works without credentials.
 *
 * Required env vars for production:
 *   RESEND_API_KEY   e.g. re_xxxxxxxx      (from https://resend.com)
 *   EMAIL_FROM       e.g. "BioNEET <noreply@yourdomain.com>"
 *                    (defaults to onboarding@resend.dev if unset)
 *   FRONTEND_URL     e.g. https://your-app.vercel.app
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'BioNEET <onboarding@resend.dev>';
const BRAND = 'BioNEET';

/**
 * Low-level send. Never throws — returns { ok, id?, error? } so callers
 * (e.g. registration) are never blocked by email failures.
 */
async function sendEmail({ to, subject, html, replyTo }) {
  if (!RESEND_API_KEY) {
    console.log(`[emailService] RESEND_API_KEY not set — email NOT sent.`);
    console.log(`[emailService] Would send to: ${to} | subject: ${subject}`);
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo && { reply_to: replyTo }),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[emailService] Resend error:', res.status, data);
      return { ok: false, error: data?.message || `HTTP ${res.status}` };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error('[emailService] Send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

/* ----------------------------- HTML template ----------------------------- */

function layout({ title, body }) {
  return `
  <div style="margin:0;padding:0;background:#0f172a;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:24px;font-weight:700;color:#10b981;letter-spacing:0.5px;">${BRAND}</span>
      </div>
      <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;color:#e2e8f0;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff;">${title}</h1>
        ${body}
      </div>
      <p style="text-align:center;color:#64748b;font-size:12px;margin-top:24px;">
        &copy; ${new Date().getFullYear()} ${BRAND} — AI-powered NEET &amp; EAPCET preparation.
      </p>
    </div>
  </div>`;
}

function button(href, label) {
  return `<a href="${href}" style="display:inline-block;background:#10b981;color:#0f172a;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;margin:8px 0;">${label}</a>`;
}

/* ------------------------------ Templates ------------------------------ */

async function sendPasswordResetEmail(to, resetUrl) {
  return sendEmail({
    to,
    subject: `Reset your ${BRAND} password`,
    html: layout({
      title: 'Reset your password',
      body: `
        <p style="line-height:1.6;">We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>60 minutes</strong>.</p>
        <p style="text-align:center;margin:24px 0;">${button(resetUrl, 'Reset Password')}</p>
        <p style="line-height:1.6;color:#94a3b8;font-size:13px;">If the button doesn't work, copy and paste this link:<br/><a href="${resetUrl}" style="color:#34d399;word-break:break-all;">${resetUrl}</a></p>
        <p style="line-height:1.6;color:#94a3b8;font-size:13px;margin-top:20px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      `,
    }),
  });
}

async function sendWelcomeEmail(to, name) {
  return sendEmail({
    to,
    subject: `Welcome to ${BRAND}! 🎉`,
    html: layout({
      title: `Welcome, ${name || 'student'}!`,
      body: `
        <p style="line-height:1.6;">Your ${BRAND} account is ready. Get started with AI study plans, chapter notes, previous EAPCET papers, mock tests, and your personal NEET/EAPCET tutor.</p>
        <p style="text-align:center;margin:24px 0;">${button((process.env.FRONTEND_URL || 'http://localhost:5173') + '/dashboard', 'Go to Dashboard')}</p>
        <p style="line-height:1.6;color:#94a3b8;font-size:13px;">All the best for your preparation! 🚀</p>
      `,
    }),
  });
}

/** Sent to the site admin when someone submits the contact form. */
async function sendContactNotification({ name, email, message, adminEmail, subject }) {
  return sendEmail({
    to: adminEmail,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    html: layout({
      title: 'New contact form submission',
      body: `
        <p style="line-height:1.6;"><strong style="color:#fff;">From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        ${subject ? `<p style="line-height:1.6;"><strong style="color:#fff;">Subject:</strong> ${escapeHtml(subject)}</p>` : ''}
        <p style="line-height:1.6;"><strong style="color:#fff;">Message:</strong></p>
        <p style="line-height:1.6;background:#0f172a;border-radius:10px;padding:16px;white-space:pre-wrap;">${escapeHtml(message)}</p>
      `,
    }),
  });
}

/** Generic important-update notification (used by admin announcements, etc.). */
async function sendUpdateEmail(to, title, messageHtml) {
  return sendEmail({
    to,
    subject: `${BRAND}: ${title}`,
    html: layout({ title, body: `<div style="line-height:1.6;">${messageHtml}</div>` }),
  });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendContactNotification,
  sendUpdateEmail,
};
