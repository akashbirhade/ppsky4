import crypto from 'crypto'

// PhonePe Configuration
// UAT/Sandbox: https://api-preprod.phonepe.com/apis/pg-sandbox
// Production: https://api.phonepe.com/apis/hermes
export const PHONEPE_CONFIG = {
  BASE_URL: process.env.PHONEPE_ENV === 'production'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID || (() => {
    if (process.env.NODE_ENV === 'production') throw new Error('PHONEPE_MERCHANT_ID must be set in production')
    return 'PGTESTPAYUAT86'
  })(),
  SALT_KEY: process.env.PHONEPE_SALT_KEY || (() => {
    if (process.env.NODE_ENV === 'production') throw new Error('PHONEPE_SALT_KEY must be set in production')
    return '96434309-7796-489d-8924-ab56988a6076'
  })(),
  SALT_INDEX: parseInt(process.env.PHONEPE_SALT_INDEX || '1'),
}

/**
 * Generate PhonePe X-VERIFY header (SHA256 checksum)
 */
export function generateChecksum(payload: string, endpoint: string): string {
  const string = payload + endpoint + PHONEPE_CONFIG.SALT_KEY
  const sha256 = crypto.createHash('sha256').update(string).digest('hex')
  return sha256 + '###' + PHONEPE_CONFIG.SALT_INDEX
}

/**
 * Verify PhonePe callback response checksum
 */
export function verifyPhonePeSignature(
  responseBase64: string,
  receivedChecksum: string
): boolean {
  try {
    const string = responseBase64 + '/pg/v1/status' + PHONEPE_CONFIG.SALT_KEY
    const sha256 = crypto.createHash('sha256').update(string).digest('hex')
    const expectedChecksum = sha256 + '###' + PHONEPE_CONFIG.SALT_INDEX
    return expectedChecksum === receivedChecksum
  } catch (error) {
    console.error('Error verifying PhonePe signature:', error)
    return false
  }
}

/**
 * Create PhonePe payment request (PAY API)
 */
export async function createPhonePePayment(paymentData: {
  orderId: string
  amount: number // in paise
  customerId: string
  mobileNumber: string
  redirectUrl: string
  callbackUrl: string
  description?: string
  productName?: string
}) {
  const merchantTransactionId = `MT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const payload = {
    merchantId: PHONEPE_CONFIG.MERCHANT_ID,
    merchantTransactionId,
    merchantUserId: paymentData.customerId,
    amount: paymentData.amount,
    redirectUrl: paymentData.redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: paymentData.callbackUrl,
    mobileNumber: paymentData.mobileNumber,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  }

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64')
  const checksum = generateChecksum(payloadBase64, '/pg/v1/pay')

  const response = await fetch(`${PHONEPE_CONFIG.BASE_URL}/pg/v1/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
    },
    body: JSON.stringify({ request: payloadBase64 }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `PhonePe API error: ${response.status}`)
  }

  return { ...data, merchantTransactionId }
}

/**
 * Check PhonePe payment status
 */
export async function checkPhonePePaymentStatus(merchantTransactionId: string) {
  const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${merchantTransactionId}`
  const string = endpoint + PHONEPE_CONFIG.SALT_KEY
  const sha256 = crypto.createHash('sha256').update(string).digest('hex')
  const checksum = sha256 + '###' + PHONEPE_CONFIG.SALT_INDEX

  const response = await fetch(`${PHONEPE_CONFIG.BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': PHONEPE_CONFIG.MERCHANT_ID,
    },
  })

  const data = await response.json()
  return data
}

/**
 * Refund PhonePe payment
 */
export async function refundPhonePePayment(
  originalTransactionId: string,
  amount: number
) {
  const merchantTransactionId = `REFUND_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const payload = {
    merchantId: PHONEPE_CONFIG.MERCHANT_ID,
    merchantUserId: 'system',
    originalTransactionId,
    merchantTransactionId,
    amount,
    callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/phonepe/callback`,
  }

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64')
  const checksum = generateChecksum(payloadBase64, '/pg/v1/refund')

  const response = await fetch(`${PHONEPE_CONFIG.BASE_URL}/pg/v1/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
    },
    body: JSON.stringify({ request: payloadBase64 }),
  })

  return response.json()
}
