import { NextRequest, NextResponse } from 'next/server'
import { checkPhonePePaymentStatus } from '@/lib/phonepe'
import { activatePremium, getUserById } from '@/lib/database'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/phonepe/callback
 * Handles PhonePe payment callback/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { response: responseBase64 } = body

    if (!responseBase64) {
      return NextResponse.json({ error: 'Missing response payload' }, { status: 400 })
    }

    // Decode the base64 response
    const decodedPayload = JSON.parse(
      Buffer.from(responseBase64, 'base64').toString('utf-8')
    )

    const { code, merchantTransactionId, data: paymentData } = decodedPayload

    if (code !== 'PAYMENT_SUCCESS') {
      return NextResponse.json(
        { success: false, code, message: 'Payment failed or pending' },
        { status: 400 }
      )
    }

    // Double-check payment status via PhonePe API
    const statusResponse = await checkPhonePePaymentStatus(merchantTransactionId)

    if (statusResponse.code === 'PAYMENT_SUCCESS') {
      const userId = paymentData?.merchantUserId || statusResponse.data?.merchantUserId
      const amount = statusResponse.data?.amount || decodedPayload.amount || 0
      const amountInRupees = Math.round(amount / 100)

      // Determine plan from amount
      let plan: 'silver' | 'gold' | 'platinum' = 'gold'
      if (amountInRupees <= 1800) plan = 'silver'
      else if (amountInRupees <= 3600) plan = 'gold'
      else plan = 'platinum'

      if (userId) {
        const user = getUserById(userId)
        if (user) {
          const subscription = activatePremium(userId, plan, amountInRupees, 'phonepe', null)
          return NextResponse.json({
            success: true,
            code: 'PAYMENT_SUCCESS',
            subscription,
            transactionId: statusResponse.data?.transactionId || merchantTransactionId,
            message: 'Payment verified and subscription activated',
          })
        }
      }

      return NextResponse.json({
        success: true,
        code: 'PAYMENT_SUCCESS',
        transactionId: merchantTransactionId,
        message: 'Payment verified successfully',
      })
    } else {
      return NextResponse.json(
        { success: false, code: statusResponse.code, message: 'Payment verification failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('PhonePe callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process callback', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payment/phonepe/callback
 * Handles PhonePe GET callback (redirect after payment)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const response = searchParams.get('response')

    if (!response) {
      return NextResponse.json(
        { error: 'Response payload is missing' },
        { status: 400 }
      )
    }

    // Redirect to payment success page with decoded response
    const successUrl = new URL('/payment/success', req.nextUrl.origin)
    successUrl.searchParams.set('response', response)

    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error('PhonePe GET callback error:', error)
    return NextResponse.redirect(
      new URL('/payment/error?message=Payment%20verification%20failed', req.nextUrl.origin)
    )
  }
}
