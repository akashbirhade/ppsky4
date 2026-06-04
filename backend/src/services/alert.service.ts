import { config } from '@config/index';
import logger from '@utils/logger';

// ─── EMAIL ALERT SERVICE ──────────────────────────────────────────────────────

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

async function sendEmail(opts: EmailOptions): Promise<boolean> {
  try {
    if (!config.smtp.user || !config.smtp.pass) {
      logger.warn('[AlertService] SMTP not configured — skipping email');
      return false;
    }

    // Dynamically import nodemailer to avoid hard dependency
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });

    await transporter.sendMail({
      from: config.smtp.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html || opts.text.replace(/\n/g, '<br>'),
    });

    logger.info(`[AlertService] Email sent → ${opts.to} | ${opts.subject}`);
    return true;
  } catch (err) {
    logger.error('[AlertService] Email send failed:', err);
    return false;
  }
}

// ─── SMS ALERT SERVICE ────────────────────────────────────────────────────────

async function sendSMS(to: string, body: string): Promise<boolean> {
  try {
    if (!config.twilio.accountSid || !config.twilio.authToken || !config.twilio.phoneNumber) {
      logger.warn('[AlertService] Twilio not configured — skipping SMS');
      return false;
    }

    const twilio = await import('twilio');
    const client = twilio.default(config.twilio.accountSid, config.twilio.authToken);

    await client.messages.create({
      body,
      from: config.twilio.phoneNumber,
      to,
    });

    logger.info(`[AlertService] SMS sent → ${to}`);
    return true;
  } catch (err) {
    logger.error('[AlertService] SMS send failed:', err);
    return false;
  }
}

// ─── PROFILE UPDATE ALERT ─────────────────────────────────────────────────────

export async function sendProfileUpdateAlert(opts: {
  email?: string;
  phone?: string;
  userName: string;
  updatedFields: string[];
}) {
  const { email, phone, userName, updatedFields } = opts;
  const fieldList = updatedFields.join(', ');
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const emailSubject = '✅ Your Soulmate Sync profile was updated';
  const emailText = `
Hi ${userName},

Your Soulmate Sync profile has been successfully updated.

Updated fields: ${fieldList}
Updated at: ${timestamp} IST

If you did not make this change, please secure your account:
https://soulmatesync.com/settings

Best wishes,
Team Soulmate Sync
  `.trim();

  const emailHtml = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#f9f9f9;border-radius:12px;">
      <h2 style="color:#7c3aed;">✅ Profile Updated</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your Soulmate Sync profile has been successfully updated.</p>
      <table style="background:#fff;border-radius:8px;padding:16px;width:100%;margin:16px 0;">
        <tr><td style="color:#666;">Updated fields</td><td><strong>${fieldList}</strong></td></tr>
        <tr><td style="color:#666;">Updated at</td><td><strong>${timestamp} IST</strong></td></tr>
      </table>
      <p style="color:#e11d48;font-size:13px;">If you did not make this change, <a href="https://soulmatesync.com/settings">secure your account immediately</a>.</p>
      <p style="color:#888;font-size:12px;">Team Soulmate Sync</p>
    </div>
  `;

  const smsText = `Soulmate Sync: Your profile (${fieldList}) was updated at ${timestamp} IST. If not you, visit soulmatesync.com/settings to secure your account.`;

  const results = await Promise.allSettled([
    email ? sendEmail({ to: email, subject: emailSubject, text: emailText, html: emailHtml }) : Promise.resolve(false),
    phone ? sendSMS(phone, smsText) : Promise.resolve(false),
  ]);

  return {
    email: results[0].status === 'fulfilled' ? results[0].value : false,
    sms: results[1].status === 'fulfilled' ? results[1].value : false,
  };
}

// ─── PHOTO UPLOAD ALERT ───────────────────────────────────────────────────────

export async function sendPhotoUploadAlert(opts: {
  email?: string;
  phone?: string;
  userName: string;
}) {
  const { email, phone, userName } = opts;
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const emailSubject = '📸 New photo added to your Soulmate Sync profile';
  const emailText = `
Hi ${userName},

A new photo was added to your Soulmate Sync profile at ${timestamp} IST.

Profiles with photos get up to 5x more responses!

View your profile: https://soulmatesync.com/profile

If you did not add this photo, please secure your account:
https://soulmatesync.com/settings

Best wishes,
Team Soulmate Sync
  `.trim();

  const smsText = `Soulmate Sync: A new photo was added to your profile at ${timestamp} IST. If not you, visit soulmatesync.com/settings.`;

  await Promise.allSettled([
    email ? sendEmail({ to: email, subject: emailSubject, text: emailText }) : Promise.resolve(false),
    phone ? sendSMS(phone, smsText) : Promise.resolve(false),
  ]);
}
