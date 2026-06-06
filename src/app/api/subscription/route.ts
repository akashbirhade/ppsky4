import { NextRequest, NextResponse } from 'next/server'
import { validateCoupon, activatePremium, getUserById, isPremiumActive, getUserSubscription } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PLANS = {
  silver: { name: 'Silver', price: 1499, duration: '3 Months', days: 90 },
  gold: { name: 'Gold', price: 2999, duration: '6 Months', days: 180 },
  platinum: { name: 'Platinum', price: 4999, duration: '12 Months', days: 365 },
}

// POST - Process payment and activate premium
export async function POST(req: NextRequest) {
  try {
    // Verify JWT token
    const authResult = authenticateRequest(req)
    if ('error' in authResult) return authResult.error

    const body = await req.json()
    const { userId, plan, paymentMethod, couponCode, paymentDetails } = body

    if (!userId || !plan || !paymentMethod) {
      return NextResponse.json({ error: 'userId, plan, and paymentMethod are required' }, { status: 400 })
    }

    // Ensure user can only activate subscription for themselves
    if (userId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
    }

    if (!PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

    // Add GST
    const gst = Math.round(finalAmount * 0.18)
    const totalAmount = finalAmount + gst

    // Validate payment method details
    if (paymentMethod === 'upi' && !paymentDetails?.upiId) {
      return NextResponse.json({ error: 'UPI ID is required' }, { status: 400 })
    }
    if (paymentMethod === 'card') {
      if (!paymentDetails?.cardNumber || !paymentDetails?.expiry || !paymentDetails?.cvv) {
        return NextResponse.json({ error: 'Card details are required' }, { status: 400 })
      }
    }
    if (paymentMethod === 'netbanking' && !paymentDetails?.bank) {
      return NextResponse.json({ error: 'Bank selection is required' }, { status: 400 })
    }

    // Simulate payment processing (in production, integrate with Razorpay/Stripe)
    // Payment is always successful in this simulation
    const subscription = activatePremium(userId, plan as 'silver' | 'gold' | 'platinum', totalAmount, paymentMethod, couponCode || null)

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        paymentId: subscription.paymentId,
        amount: totalAmount,
        discount: discountPercent,
        couponMessage,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
      message: `${planDetails.name} plan activated successfully!`
    })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 })
  }
}

// GET - Check subscription status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const user = getUserById(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const isActive = isPremiumActive(userId)
  const subscription = getUserSubscription(userId)

  return NextResponse.json({
    isPremium: isActive,
    plan: user.premiumPlan,
    expiry: user.premiumExpiry,
    subscription: subscription ? {
      id: subscription.id,
      plan: subscription.plan,
      paymentId: subscription.paymentId,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status
    } : null,
    features: isActive ? {
      viewContacts: true,
      audioCall: true,
      videoCall: true,
      unlimitedChat: true,
      seeWhoViewed: true,
      prioritySupport: true,
      advancedFilters: true,
      verifiedBadge: user.premiumPlan === 'platinum',
    } : {
      viewContacts: false,
      audioCall: false,
      videoCall: false,
      unlimitedChat: false,
      seeWhoViewed: false,
      prioritySupport: false,
      advancedFilters: false,
      verifiedBadge: false,
    }
  })
}
