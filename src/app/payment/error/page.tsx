'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function PaymentErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Payment could not be processed'

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4 flex items-center justify-center">
      <div className="glass-card max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Failed</h1>
        <p className="text-slate-500 dark:text-purple-200/50 text-sm mb-6">{decodeURIComponent(message)}</p>
        
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-xl p-4 mb-6 text-left">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">What you can do:</h3>
          <ul className="text-sm text-red-600/70 dark:text-red-300/70 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Verify payment method details</li>
            <li>• Ensure sufficient balance/limit</li>
            <li>• Contact your bank if issue persists</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/checkout" className="btn-primary py-3 text-sm w-full">
            Try Again
          </Link>
          <Link href="/premium" className="btn-secondary py-3 text-sm w-full">
            View All Plans
          </Link>
        </div>

        <p className="text-[10px] text-slate-300 dark:text-purple-300/30 mt-4">
          If you continue to experience issues, please contact our support team
        </p>
      </div>
    </div>
  )
}

function PaymentErrorFallback() {
  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4 flex items-center justify-center">
      <div className="glass-card max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Failed</h1>
        <p className="text-slate-500 dark:text-purple-200/50 text-sm mb-6">An error occurred processing your payment</p>
      </div>
    </div>
  )
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={<PaymentErrorFallback />}>
      <PaymentErrorContent />
    </Suspense>
  )
}
