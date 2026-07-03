import nodemailer from 'nodemailer'

// Create reusable transporter
function getTransporter() {
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    // Use Ethereal for development testing
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: 'test@ethereal.email', pass: 'test' },
    })
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@soulmatesync.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'

// ─── Base Email Layout ─────────────────────────────────────────────────────
function baseTemplate(content: string, preheader?: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soulmate Sync</title>
  ${preheader ? `<span style="display:none!important;font-size:1px;color:#fff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#0f0a1e;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0f0a1e;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#1a1030;border-radius:16px;border:1px solid rgba(139,92,246,0.2);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1145 0%,#2d1b69 100%);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(139,92,246,0.15);">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                <span style="color:#a78bfa;">💜</span> Soulmate Sync
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(196,181,253,0.6);">Find Your Perfect Life Partner</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid rgba(139,92,246,0.1);text-align:center;">
              <p style="margin:0 0 12px;font-size:12px;color:rgba(196,181,253,0.4);">
                You're receiving this because you have an account on Soulmate Sync.
              </p>
              <p style="margin:0;font-size:12px;color:rgba(196,181,253,0.3);">
                <a href="${APP_URL}/settings" style="color:#a78bfa;text-decoration:none;">Manage email preferences</a> &nbsp;|&nbsp;
                <a href="${APP_URL}/settings" style="color:#a78bfa;text-decoration:none;">Unsubscribe</a>
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:rgba(196,181,253,0.25);">
                © ${new Date().getFullYear()} Soulmate Sync. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function ctaButton(text: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding:24px 0;">
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 4px 20px rgba(124,58,237,0.4);">
          ${text}
        </a>
      </td>
    </tr>
  </table>`
}

function profileCard(profile: { name: string; age?: number; city?: string; occupation?: string; photo?: string; id: string }) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(139,92,246,0.05);border:1px solid rgba(139,92,246,0.15);border-radius:12px;overflow:hidden;margin:16px 0;">
    <tr>
      <td style="padding:16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="56" valign="top">
              <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#3b1d6e,#1e2a5e);overflow:hidden;border:2px solid rgba(139,92,246,0.3);">
                ${profile.photo ? `<img src="${profile.photo}" alt="${profile.name}" width="56" height="56" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:50%;" />` : ''}
              </div>
            </td>
            <td style="padding-left:14px;" valign="middle">
              <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">${profile.name}</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(196,181,253,0.6);">
                ${[profile.age ? `${profile.age} yrs` : '', profile.city, profile.occupation].filter(Boolean).join(' • ')}
              </p>
            </td>
            <td width="80" align="right" valign="middle">
              <a href="${APP_URL}/profile/${profile.id}" style="display:inline-block;background:rgba(139,92,246,0.15);color:#a78bfa;padding:8px 14px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:500;border:1px solid rgba(139,92,246,0.2);">
                View
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

// ─── Email Templates ───────────────────────────────────────────────────────

export function profileViewedTemplate(data: { userName: string; viewerName: string; viewerAge?: number; viewerCity?: string; viewerOccupation?: string; viewerPhoto?: string; viewerId: string }) {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:600;">Someone viewed your profile! 👀</h2>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(196,181,253,0.7);line-height:1.6;">
      Hi <strong style="color:#e9d5ff;">${data.userName}</strong>, great news! Someone checked out your profile.
    </p>
    ${profileCard({ name: data.viewerName, age: data.viewerAge, city: data.viewerCity, occupation: data.viewerOccupation, photo: data.viewerPhoto, id: data.viewerId })}
    <p style="margin:16px 0 0;font-size:14px;color:rgba(196,181,253,0.5);line-height:1.5;">
      Interested? Send them an interest to start connecting!
    </p>
    ${ctaButton('View Their Profile', `${APP_URL}/profile/${data.viewerId}`)}
  `
  return baseTemplate(content, `${data.viewerName} viewed your profile on Soulmate Sync`)
}

export function newMatchesTemplate(data: { userName: string; profiles: Array<{ name: string; age?: number; city?: string; occupation?: string; photo?: string; id: string }> }) {
  const profileCards = data.profiles.slice(0, 5).map(p => profileCard(p)).join('')
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:600;">New profiles matching your preferences! ✨</h2>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(196,181,253,0.7);line-height:1.6;">
      Hi <strong style="color:#e9d5ff;">${data.userName}</strong>, we found ${data.profiles.length} new ${data.profiles.length === 1 ? 'profile' : 'profiles'} that match your preferences.
    </p>
    ${profileCards}
    ${data.profiles.length > 5 ? `<p style="margin:8px 0 0;font-size:13px;color:rgba(196,181,253,0.5);text-align:center;">+ ${data.profiles.length - 5} more matches</p>` : ''}
    ${ctaButton('Browse All Matches', `${APP_URL}/search`)}
  `
  return baseTemplate(content, `${data.profiles.length} new profiles match your preferences`)
}

export function verificationEmailTemplate(data: { userName: string; verifyUrl: string }) {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:600;">Verify your email address ✉️</h2>
    <p style="margin:0 0 8px;font-size:15px;color:rgba(196,181,253,0.7);line-height:1.6;">
      Hi <strong style="color:#e9d5ff;">${data.userName}</strong>, welcome to Soulmate Sync! Please verify your email to unlock all features.
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:rgba(196,181,253,0.5);line-height:1.5;">
      A verified profile gets <strong style="color:#a78bfa;">3x more responses</strong> and appears higher in search results.
    </p>
    ${ctaButton('Verify My Email', data.verifyUrl)}
    <p style="margin:0;font-size:12px;color:rgba(196,181,253,0.4);text-align:center;">
      This link expires in 24 hours. If you didn't create an account, ignore this email.
    </p>
  `
  return baseTemplate(content, 'Verify your email to complete registration')
}

export function interestReceivedTemplate(data: { userName: string; senderName: string; senderAge?: number; senderCity?: string; senderOccupation?: string; senderPhoto?: string; senderId: string }) {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:600;">You received a new interest! 💜</h2>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(196,181,253,0.7);line-height:1.6;">
      Hi <strong style="color:#e9d5ff;">${data.userName}</strong>, someone is interested in connecting with you!
    </p>
    ${profileCard({ name: data.senderName, age: data.senderAge, city: data.senderCity, occupation: data.senderOccupation, photo: data.senderPhoto, id: data.senderId })}
    <p style="margin:16px 0 0;font-size:14px;color:rgba(196,181,253,0.5);line-height:1.5;">
      Accept their interest to start chatting, or view their full profile first.
    </p>
    ${ctaButton('View & Respond', `${APP_URL}/notifications`)}
  `
  return baseTemplate(content, `${data.senderName} sent you an interest on Soulmate Sync`)
}

export function welcomeEmailTemplate(data: { userName: string }) {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:600;">Welcome to Soulmate Sync! 🎉</h2>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(196,181,253,0.7);line-height:1.6;">
      Hi <strong style="color:#e9d5ff;">${data.userName}</strong>, your journey to find a perfect life partner begins here.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(139,92,246,0.1);">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="32" valign="top" style="font-size:20px;">📝</td>
              <td style="padding-left:8px;">
                <p style="margin:0;font-size:14px;color:#ffffff;font-weight:500;">Complete your profile</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(196,181,253,0.5);">Add photos and details to get 5x more views</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(139,92,246,0.1);">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="32" valign="top" style="font-size:20px;">🔍</td>
              <td style="padding-left:8px;">
                <p style="margin:0;font-size:14px;color:#ffffff;font-weight:500;">Set your preferences</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(196,181,253,0.5);">Tell us what you're looking for in a partner</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="32" valign="top" style="font-size:20px;">💜</td>
              <td style="padding-left:8px;">
                <p style="margin:0;font-size:14px;color:#ffffff;font-weight:500;">Send interests</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(196,181,253,0.5);">Express interest in profiles you like</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${ctaButton('Complete My Profile', `${APP_URL}/profile`)}
  `
  return baseTemplate(content, 'Welcome! Your journey to find a perfect partner begins')
}

export function weeklyDigestTemplate(data: { userName: string; viewCount: number; interestCount: number; newMatchCount: number; topProfiles: Array<{ name: string; age?: number; city?: string; occupation?: string; photo?: string; id: string }> }) {
  const profileCards = data.topProfiles.slice(0, 3).map(p => profileCard(p)).join('')
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:600;">Your Weekly Summary 📊</h2>
    <p style="margin:0 0 24px;font-size:15px;color:rgba(196,181,253,0.7);line-height:1.6;">
      Hi <strong style="color:#e9d5ff;">${data.userName}</strong>, here's what happened on your profile this week.
    </p>
    <!-- Stats -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
      <tr>
        <td width="33%" align="center" style="padding:16px 8px;background:rgba(139,92,246,0.08);border-radius:12px 0 0 12px;border:1px solid rgba(139,92,246,0.12);">
          <p style="margin:0;font-size:28px;font-weight:700;color:#a78bfa;">${data.viewCount}</p>
          <p style="margin:4px 0 0;font-size:11px;color:rgba(196,181,253,0.5);text-transform:uppercase;letter-spacing:0.5px;">Profile Views</p>
        </td>
        <td width="33%" align="center" style="padding:16px 8px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.12);border-left:none;border-right:none;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#a78bfa;">${data.interestCount}</p>
          <p style="margin:4px 0 0;font-size:11px;color:rgba(196,181,253,0.5);text-transform:uppercase;letter-spacing:0.5px;">Interests</p>
        </td>
        <td width="33%" align="center" style="padding:16px 8px;background:rgba(139,92,246,0.08);border-radius:0 12px 12px 0;border:1px solid rgba(139,92,246,0.12);">
          <p style="margin:0;font-size:28px;font-weight:700;color:#a78bfa;">${data.newMatchCount}</p>
          <p style="margin:4px 0 0;font-size:11px;color:rgba(196,181,253,0.5);text-transform:uppercase;letter-spacing:0.5px;">New Matches</p>
        </td>
      </tr>
    </table>
    ${data.topProfiles.length > 0 ? `
      <p style="margin:0 0 12px;font-size:14px;color:rgba(196,181,253,0.6);font-weight:500;">Top recommendations for you:</p>
      ${profileCards}
    ` : ''}
    ${ctaButton('View Dashboard', `${APP_URL}/dashboard`)}
  `
  return baseTemplate(content, `${data.viewCount} views, ${data.interestCount} interests this week`)
}

// ─── Send Email Function ───────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Dev mode: log to console
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    console.log(`\n📧 EMAIL SENT (Dev Mode)`)
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log(`Preview: Open the HTML in a browser to see the template`)
    console.log(`---\n`)
    return { success: true, messageId: `dev-${Date.now()}` }
  }

  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: `"Soulmate Sync" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[Email Service] Send failed:', error.message)
    return { success: false, error: error.message }
  }
}

// ─── High-Level Send Functions ─────────────────────────────────────────────

export async function sendProfileViewedEmail(to: string, data: Parameters<typeof profileViewedTemplate>[0]) {
  return sendEmail({
    to,
    subject: `${data.viewerName} viewed your profile - Soulmate Sync`,
    html: profileViewedTemplate(data),
  })
}

export async function sendNewMatchesEmail(to: string, data: Parameters<typeof newMatchesTemplate>[0]) {
  return sendEmail({
    to,
    subject: `${data.profiles.length} new profiles match your preferences - Soulmate Sync`,
    html: newMatchesTemplate(data),
  })
}

export async function sendVerificationMail(to: string, data: Parameters<typeof verificationEmailTemplate>[0]) {
  return sendEmail({
    to,
    subject: 'Verify your email - Soulmate Sync',
    html: verificationEmailTemplate(data),
  })
}

export async function sendInterestReceivedEmail(to: string, data: Parameters<typeof interestReceivedTemplate>[0]) {
  return sendEmail({
    to,
    subject: `${data.senderName} is interested in you - Soulmate Sync`,
    html: interestReceivedTemplate(data),
  })
}

export async function sendWelcomeEmail(to: string, data: Parameters<typeof welcomeEmailTemplate>[0]) {
  return sendEmail({
    to,
    subject: 'Welcome to Soulmate Sync! 💜',
    html: welcomeEmailTemplate(data),
  })
}

export async function sendWeeklyDigestEmail(to: string, data: Parameters<typeof weeklyDigestTemplate>[0]) {
  return sendEmail({
    to,
    subject: `Your weekly update: ${data.viewCount} views, ${data.interestCount} interests - Soulmate Sync`,
    html: weeklyDigestTemplate(data),
  })
}
