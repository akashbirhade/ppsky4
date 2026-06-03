import { NextRequest, NextResponse } from 'next/server'
import { validateCoupon, getStoredCoupons } from '@/lib/database'

// POST - Validate a coupon code
export async function POST(req: NextRequest) {
  try {
    const { code, plan } = await req.json()

    if (!code || !plan) {
      return NextResponse.json({ error: 'Coupon code and plan are required' }, { status: 400 })
    }

    const result = validateCoupon(code, plan)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}

// GET - List available coupons (for display)
export async function GET() {
  const coupons = getStoredCoupons()
  const activeCoupons = coupons
    .filter(c => c.active && new Date(c.validTill) > new Date() && c.usedCount < c.maxUses)
    .map(c => ({
      code: c.code,
      discount: c.discount,
      validTill: c.validTill,
      minPlan: c.minPlan,
    }))

  return NextResponse.json({ coupons: activeCoupons })
}
