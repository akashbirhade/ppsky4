import { NextRequest, NextResponse } from 'next/server'
import { checkPhonePePaymentStatus } from '@/lib/phonepe'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payment/phonepe/status?merchantTransactionId=TXN_XXXX
 * Check the status of a PhonePe payment
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const merchantTransactionId = searchParams.get('merchantTransactionId')

    if (!merchantTransactionId) {
      return NextResponse.json(
        { error: 'merchantTransactionId is required' },
        { status: 400 }
      )
    }

    const statusResponse = await checkPhonePePaymentStatus(merchantTransactionId)

    return NextResponse.json({
      success: statusResponse.success,
      code: statusResponse.code,
      data: statusResponse.data,
      message: statusResponse.message,
    })
  } catch (error) {
    console.error('PhonePe status check error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
