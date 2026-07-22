"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendProfileUpdateAlert = sendProfileUpdateAlert;
exports.sendPhotoUploadAlert = sendPhotoUploadAlert;
const index_1 = require("@config/index");
const logger_1 = __importDefault(require("@utils/logger"));
async function sendEmail(opts) {
    try {
        if (!index_1.config.smtp.user || !index_1.config.smtp.pass) {
            logger_1.default.warn('[AlertService] SMTP not configured — skipping email');
            return false;
        }
        // Dynamically import nodemailer to avoid hard dependency
        const nodemailer = await Promise.resolve().then(() => __importStar(require('nodemailer')));
        const transporter = nodemailer.createTransport({
            host: index_1.config.smtp.host,
            port: index_1.config.smtp.port,
            secure: index_1.config.smtp.secure,
            auth: { user: index_1.config.smtp.user, pass: index_1.config.smtp.pass },
        });
        await transporter.sendMail({
            from: index_1.config.smtp.from,
            to: opts.to,
            subject: opts.subject,
            text: opts.text,
            html: opts.html || opts.text.replace(/\n/g, '<br>'),
        });
        logger_1.default.info(`[AlertService] Email sent → ${opts.to} | ${opts.subject}`);
        return true;
    }
    catch (err) {
        logger_1.default.error('[AlertService] Email send failed:', err);
        return false;
    }
}
// ─── SMS ALERT SERVICE ────────────────────────────────────────────────────────
async function sendSMS(to, body) {
    try {
        if (!index_1.config.twilio.accountSid || !index_1.config.twilio.authToken || !index_1.config.twilio.phoneNumber) {
            logger_1.default.warn('[AlertService] Twilio not configured — skipping SMS');
            return false;
        }
        // Load Twilio lazily only when SMS credentials are configured.
        // Using require here avoids a hard compile-time dependency in minimal setups.
        const twilio = require('twilio');
        const client = twilio(index_1.config.twilio.accountSid, index_1.config.twilio.authToken);
        await client.messages.create({
            body,
            from: index_1.config.twilio.phoneNumber,
            to,
        });
        logger_1.default.info(`[AlertService] SMS sent → ${to}`);
        return true;
    }
    catch (err) {
        logger_1.default.error('[AlertService] SMS send failed:', err);
        return false;
    }
}
// ─── PROFILE UPDATE ALERT ─────────────────────────────────────────────────────
async function sendProfileUpdateAlert(opts) {
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
async function sendPhotoUploadAlert(opts) {
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
//# sourceMappingURL=alert.service.js.map