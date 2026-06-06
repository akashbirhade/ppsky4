import crypto from 'crypto'
import axios from 'axios'

// PhonePe Configuration
export const PHONEPE_CONFIG = {
  // For production, use: https://api.phonepe.com/apis/hermes
  // For sandbox/staging, use: https://api-sandbox.phonepe.com/apis/hermes
  BASE_URL: process.env.PHONEPE_ENV === 'production'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-sandbox.phonepe.com/apis/hermes',
  MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID || 'MERCHANTUAT',
  MERCHANT_KEY: process.env.PHONEPE_MERCHANT_KEY || 'MerchantKey123',
  APP_ID: process.env.PHONEPE_APP_ID || '1111',
}

/**
 * Generate PhonePe request signature
 */
export function generatePhonePeSignature(payload: string): string {
  const keyIndex = 1
  const hashPayload = payload + '/pg/v1/pay' + PHONEPE_CONFIG.MERCHANT_KEY
  const sha256Hash = crypto
    .createHash('sha256')
    .update(hashPayload)
    .digest('hex')
  return sha256Hash + '###' + keyIndex
}

/**
 * Verify PhonePe response signature (for webhook)
 */
export function verifyPhonePeSignature(
  responsePayload: string,
  signature: string
): boolean {
  try {
    const [receivedHash, keyIndex] = signature.split('###')
    const hashPayload = responsePayload + '/pg/v1/pay' + PHONEPE_CONFIG.MERCHANT_KEY
    const calculatedHash = crypto
      .createHash('sha256')
      .update(hashPayload)
      .digest('hex')
    
    return receivedHash === calculatedHash
  } catch (error) {
    console.error('Error verifying PhonePe signature:', error)
    return false
  }
}

/**
 * Create PhonePe payment request
 */
export async function createPhonePePayment(paymentData: {
  orderId: string
  amount: number // in paise (1 rupee = 100 paise)
  customerId: string
  mobileNumber: string
  redirectUrl: string
  callbackUrl: string
  description?: string
  productName?: string
}) {
  try {
    const payload = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantUserId: paymentData.customerId,
      mobileNumber: paymentData.mobileNumber,
      amount: paymentData.amount,
      orderId: paymentData.orderId,
      redirectUrl: paymentData.redirectUrl,
      callbackUrl: paymentData.callbackUrl,
      merchantTransactionId: `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      deviceContext: {
        deviceOS: 'WEB',
      },
      paymentInstrument: {
        type: 'UPI',
      },
    }

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64')
    const signature = generatePhonePeSignature(payloadBase64)

    const response = await axios.post(
      `${PHONEPE_CONFIG.BASE_URL}/pg/v1/pay`,
      {
        request: payloadBase64,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': signature,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('PhonePe payment creation error:', error)
    throw error
  }
}

/**
 * Check PhonePe payment status
 */
export async function checkPhonePePaymentStatus(merchantTransactionId: string) {
  try {
    const keyIndex = 1
    const statusCheckPayload = `${PHONEPE_CONFIG.MERCHANT_ID}${merchantTransactionId}/pg/v1/status${PHONEPE_CONFIG.MERCHANT_KEY}`
    const sha256 = crypto
      .createHash('sha256')
      .update(statusCheckPayload)
      .digest('hex')
    const finalXHeaders = sha256 + '###' + keyIndex

    const response = await axios.get(
      `${PHONEPE_CONFIG.BASE_URL}/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': finalXHeaders,
          'X-MERCHANT-ID': PHONEPE_CONFIG.MERCHANT_ID,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('PhonePe status check error:', error)
    throw error
  }
}

/**
 * Refund PhonePe payment
 */
export async function refundPhonePePayment(
  merchantTransactionId: string,
  amount: number
) {
  try {
    const refundPayload = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      originalTransactionId: merchantTransactionId,
      refundAmount: amount,
      refundMerchantTransactionId: `REFUND_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    }

    const payloadBase64 = Buffer.from(JSON.stringify(refundPayload)).toString('base64')
    const signature = generatePhonePeSignature(payloadBase64)

    const response = await axios.post(
      `${PHONEPE_CONFIG.BASE_URL}/pg/v1/refund`,
      {
        request: payloadBase64,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': signature,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('PhonePe refund error:', error)
    throw error
  }
}
