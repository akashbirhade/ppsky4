import { NextRequest, NextResponse } from 'next/server'
import { verifyPhonePeSignature, checkPhonePePaymentStatus } from '@/lib/phonepe'
import { activatePremium, getUserById } from '@/lib/database'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payment/phonepe/callback
 * Handles PhonePe payment callback/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { response: responsePayload, signature } = body

    // Verify PhonePe signature
    if (!verifyPhonePeSignature(responsePayload, signature)) {
      console.error('Invalid PhonePe signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      )
    }

    // Decode response payload
    const decodedPayload = JSON.parse(
      Buffer.from(responsePayload, 'base64').toString('utf-8')
    )

    const {
      code,
      merchantTransactionId,
      transactionId,
      amount,
      data: paymentData,
    } = decodedPayload

    // Check payment status
    const statusResponse = await checkPhonePePaymentStatus(merchantTransactionId)

    if (statusResponse.code === 'PAYMENT_SUCCESS') {
      // Extract user and plan info from merchantTransactionId
      // Format: TXN_TIMESTAMP_RANDOM
      const orderId = decodedPayload.orderId || merchantTransactionId
      
      // Parse order data from the request body or session
      // For now, we'll extract from the transaction metadata
      try {
        // In production, you should store this data in a database
        // For now, we're assuming the order data is passed through the response
        const userId = paymentData?.merchantUserId || decodedPayload.merchantUserId
        const plan = decodedPayload.plan || 'gold' // You should store this

        if (userId && plan) {
          const user = getUserById(userId)
          if (user) {
            // Activate premium subscription
            const amountInRupees = Math.round(amount / 100)
            const subscription = activatePremium(
              userId,
              plan as 'silver' | 'gold' | 'platinum',
              amountInRupees,
              'phonepe',
              null
            )

            return NextResponse.json({
              success: true,
              code: 'PAYMENT_SUCCESS',
              subscription,
              transactionId,
              message: 'Payment verified and subscription activated',
            })
          }
        }
      } catch (error) {
        console.error('Error activating subscription:', error)
      }

      return NextResponse.json({
        success: true,
        code: 'PAYMENT_SUCCESS',
        transactionId,
        message: 'Payment verified successfully',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          code: statusResponse.code || code,
          message: 'Payment failed or pending',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('PhonePe callback error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process callback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
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
