'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { CheckCircle, Loader, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  const orderId = searchParams.get('orderId')
  const response = searchParams.get('response')

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (response) {
          // PhonePe callback response
          const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'))
          
          if (decodedResponse.code === 'PAYMENT_SUCCESS') {
            setSuccess(true)
            setPaymentDetails(decodedResponse)
          } else {
            setError('Payment verification failed. Please contact support.')
          }
        } else if (orderId) {
          // Other payment method
          setSuccess(true)
          setPaymentDetails({ orderId })
        }
      } catch (err) {
        console.error('Error verifying payment:', err)
        setError('Failed to verify payment. Please contact support.')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [response, orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4 flex items-center justify-center">
        <div className="glass-card max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Verifying Payment</h2>
          <p className="text-sm text-slate-500 dark:text-purple-200/50">Please wait while we process your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4 flex items-center justify-center">
        <div className="glass-card max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Failed</h1>
          <p className="text-slate-500 dark:text-purple-200/50 text-sm mb-6">{error}</p>
          <div className="flex gap-3">
            <Link href="/checkout" className="btn-secondary flex-1 py-3 text-sm">Try Again</Link>
            <Link href="/premium" className="btn-primary flex-1 py-3 text-sm">View Plans</Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4 flex items-center justify-center">
        <div className="glass-card max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Successful! 🎉</h1>
          <p className="text-slate-500 dark:text-purple-200/50 text-sm mb-4">Welcome to your Premium membership</p>
          
          <div className="bg-teal-50 dark:bg-purple-500/10 border border-teal-200/50 dark:border-purple-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-slate-500 dark:text-purple-200/70">Order ID: <span className="text-slate-800 dark:text-white font-mono text-xs">{paymentDetails?.orderId || orderId}</span></p>
            {paymentDetails?.transactionId && (
              <p className="text-sm text-slate-500 dark:text-purple-200/70 mt-1">Transaction ID: <span className="text-slate-800 dark:text-white font-mono text-xs">{paymentDetails.transactionId}</span></p>
            )}
            <p className="text-sm text-slate-500 dark:text-purple-200/70 mt-2">Status: <span className="text-green-400 font-semibold">Confirmed</span></p>
          </div>

          <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 mb-6 text-left">
            <p className="text-xs font-semibold text-green-300 mb-2">Premium Features Unlocked:</p>
            {['View contact numbers', 'Audio & Video calls', 'Unlimited chat', 'See who viewed your profile', 'Priority support', 'Advanced filters'].map(f => (
              <p key={f} className="text-[11px] text-green-200/70 flex items-center gap-1.5 mt-1"><CheckCircle className="h-3 w-3" /> {f}</p>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="btn-primary py-3 text-sm flex items-center justify-center gap-2 w-full">
              <CheckCircle className="h-4 w-4" /> Go to Dashboard
            </Link>
            <Link href="/search" className="btn-secondary py-3 text-sm w-full">Browse Matches</Link>
          </div>

          <p className="text-[10px] text-slate-300 dark:text-purple-300/30 mt-4">
            A confirmation email has been sent to your registered email address
          </p>
        </div>
      </div>
    )
  }

  return null
}

function PaymentSuccessFallback() {
  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4 flex items-center justify-center">
      <div className="glass-card max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Processing</h2>
        <p className="text-sm text-slate-500 dark:text-purple-200/50">Loading payment status...</p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
