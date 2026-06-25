import { NextRequest, NextResponse } from 'next/server'
import { createPhonePePayment } from '@/lib/phonepe'
import { getUserById, validateCoupon } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PLANS = {
  silver: { name: 'Silver', price: 1499, duration: '3 Months', days: 90 },
  gold: { name: 'Gold', price: 2999, duration: '6 Months', days: 180 },
  platinum: { name: 'Platinum', price: 4999, duration: '12 Months', days: 365 },
}

/**
 * POST /api/payment/phonepe/initiate
 * Initiates a PhonePe payment request
 */
export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const body = await req.json()
    const { userId, plan, couponCode, mobileNumber } = body

    // Validate required fields
    if (!userId || !plan || !mobileNumber) {
      return NextResponse.json(
        { error: 'userId, plan, and mobileNumber are required' },
        { status: 400 }
      )
    }

    // Ensure user can only initiate payment for themselves
    if (userId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
    }

    // Validate plan
    if (!PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Validate user
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get plan details
    const planDetails = PLANS[plan as keyof typeof PLANS]
    let finalAmount = planDetails.price
    let discountPercent = 0
    let couponMessage = ''

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = validateCoupon(couponCode, plan)
      if (couponResult.valid) {
        discountPercent = couponResult.discount
        finalAmount = Math.round(planDetails.price * (1 - discountPercent / 100))
        couponMessage = couponResult.message
      } else {
        return NextResponse.json({ error: couponResult.message }, { status: 400 })
      }
    }

    // Add GST (18%)
    const gst = Math.round(finalAmount * 0.18)
    const totalAmount = finalAmount + gst

    // Generate order ID
    const orderId = `ORDER_${userId}_${plan}_${Date.now()}`

    // PhonePe requires amount in paise (1 rupee = 100 paise)
    const amountInPaise = totalAmount * 100

    // Determine callback/redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/payment/success?orderId=${orderId}`
    const callbackUrl = `${baseUrl}/api/payment/phonepe/callback`

    // Create PhonePe payment
    const phonePeResponse = await createPhonePePayment({
      orderId,
      amount: amountInPaise,
      customerId: userId,
      mobileNumber,
      redirectUrl,
      callbackUrl,
      description: `${planDetails.name} Plan - Soulmate Sync`,
      productName: `Premium ${planDetails.name}`,
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        merchantTransactionId: phonePeResponse.merchantTransactionId,
        paymentUrl: phonePeResponse.data?.instrumentResponse?.redirectInfo?.url,
        amount: totalAmount,
        amountInPaise,
        plan,
        discount: discountPercent,
        couponMessage,
        gst,
      },
      message: 'PhonePe payment initiated successfully',
    })
  } catch (error) {
    console.error('PhonePe initiation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to initiate payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
