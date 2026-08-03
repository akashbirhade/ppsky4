/**
 * SMS Service - Fast2SMS Integration
 * 
 * Sign up at https://www.fast2sms.com/ to get a free API key.
 * Set FAST2SMS_API_KEY in your .env / .env.local file.
 * 
 * Free tier: 10 messages/day for testing.
 */

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || ''
const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2'

export interface SmsResult {
  success: boolean
  message: string
  error?: string
}

/**
 * Send OTP via Fast2SMS (DLT-compliant OTP route for Indian numbers)
 */
export async function sendOtpSms(phone: string, otp: string): Promise<SmsResult> {
  if (!FAST2SMS_API_KEY) {
    console.warn('[SMS] FAST2SMS_API_KEY not configured — OTP not sent via SMS')
    return { success: false, message: 'SMS provider not configured', error: 'NO_API_KEY' }
  }

  // Clean phone number (remove +91 prefix if present, keep 10 digits)
  const cleanPhone = phone.replace(/^\+?91/, '').replace(/\D/g, '')
  if (cleanPhone.length !== 10) {
    return { success: false, message: 'Invalid phone number', error: 'INVALID_PHONE' }
  }

  try {
    const response = await fetch(FAST2SMS_URL, {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: `Your Soulmate Sync verification code is: ${otp}. Do not share this with anyone.`,
        numbers: cleanPhone,
        flash: '0',
      }),
    })

    const data = await response.json()

    if (data.return === true || data.status_code === 200) {
      console.log(`[SMS] OTP sent to ${cleanPhone}`)
      return { success: true, message: 'OTP sent via SMS' }
    } else {
      console.error('[SMS] Fast2SMS error:', data.message || data)
      return { success: false, message: data.message || 'SMS delivery failed', error: 'DELIVERY_FAILED' }
    }
  } catch (error) {
    console.error('[SMS] Network error:', error)
    return { success: false, message: 'SMS service unavailable', error: 'NETWORK_ERROR' }
  }
}
