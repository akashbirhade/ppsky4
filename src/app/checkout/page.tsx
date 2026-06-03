'use client'

import { useState, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Smartphone, Building2, Shield, CheckCircle, ArrowLeft, Crown, Lock, Zap, Tag, X, Gift, Percent } from 'lucide-react'
import Link from 'next/link'

const PLANS: Record<string, { name: string; price: number; duration: string }> = {
  silver: { name: 'Silver', price: 1499, duration: '3 Months' },
  gold: { name: 'Gold', price: 2999, duration: '6 Months' },
  platinum: { name: 'Platinum', price: 4999, duration: '12 Months' },
}

type PaymentMethod = 'upi' | 'card' | 'netbanking'

function CheckoutContent() {
  const { user, updateUserData } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') || 'gold'
  const plan = PLANS[planId] || PLANS.gold

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [bank, setBank] = useState('')
  const [orderId, setOrderId] = useState('')
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponError, setCouponError] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const basePrice = plan.price
  const discountAmount = couponApplied ? Math.round(basePrice * couponDiscount / 100) : 0
  const afterDiscount = basePrice - discountAmount
  const gst = Math.round(afterDiscount * 0.18)
  const totalAmount = afterDiscount + gst

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    setCouponError('')
    setCouponMessage('')
    
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), plan: planId })
      })
      const data = await res.json()
      
      if (data.valid) {
        setCouponApplied(true)
        setCouponDiscount(data.discount)
        setCouponMessage(data.message)
        setCouponError('')
      } else {
        setCouponError(data.message || data.error || 'Invalid coupon')
        setCouponApplied(false)
        setCouponDiscount(0)
      }
    } catch {
      setCouponError('Failed to validate coupon')
    }
    setValidatingCoupon(false)
  }

  const removeCoupon = () => {
    setCouponApplied(false)
    setCouponDiscount(0)
    setCouponCode('')
    setCouponMessage('')
    setCouponError('')
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    setProcessing(true)

    try {
      const paymentDetails: any = {}
      if (paymentMethod === 'upi') paymentDetails.upiId = upiId
      if (paymentMethod === 'card') paymentDetails.cardNumber = cardData.number, paymentDetails.expiry = cardData.expiry, paymentDetails.cvv = cardData.cvv
      if (paymentMethod === 'netbanking') paymentDetails.bank = bank

      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          plan: planId,
          paymentMethod,
          couponCode: couponApplied ? couponCode : null,
          paymentDetails
        })
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        setOrderId(data.subscription.paymentId)
        setSuccess(true)
        // Update local user state
        updateUserData({
          premium: true,
          premiumPlan: planId,
          premiumExpiry: data.subscription.endDate
        })
      } else {
        alert(data.error || 'Payment failed. Please try again.')
      }
    } catch (err) {
      alert('Payment processing failed. Please try again.')
    }
    setProcessing(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-mesh pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="glass-card max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful! 🎉</h1>
          <p className="text-purple-200/50 text-sm mb-2">Welcome to Soulmate Sync {plan.name} membership</p>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-purple-200/70">Order ID: <span className="text-white font-mono">{orderId}</span></p>
            <p className="text-sm text-purple-200/70 mt-1">Amount Paid: <span className="text-white font-semibold">₹{totalAmount.toLocaleString()}</span></p>
            {couponApplied && <p className="text-sm text-green-300/70 mt-1">Discount: <span className="text-green-300">-₹{discountAmount.toLocaleString()} ({couponDiscount}% off)</span></p>}
            <p className="text-sm text-purple-200/70 mt-1">Plan: <span className="text-white">{plan.name} ({plan.duration})</span></p>
          </div>
          <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 mb-6 text-left">
            <p className="text-xs font-semibold text-green-300 mb-2">Premium Features Unlocked:</p>
            {['View contact numbers', 'Audio & Video calls', 'Unlimited chat', 'See who viewed your profile', 'Priority support', 'Advanced filters'].map(f => (
              <p key={f} className="text-[11px] text-green-200/70 flex items-center gap-1.5 mt-1"><CheckCircle className="h-3 w-3" /> {f}</p>
            ))}
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" /> Go to Dashboard
            </Link>
            <Link href="/search" className="btn-secondary flex-1 py-3 text-sm">Browse Matches</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/premium" className="inline-flex items-center gap-2 text-sm text-purple-300/50 hover:text-purple-200 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Plans
        </Link>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            <div className="glass-card animate-fade-in-up">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" /> Payment Method
              </h2>

              {/* Method Tabs */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { id: 'upi' as const, icon: Smartphone, label: 'UPI' },
                  { id: 'card' as const, icon: CreditCard, label: 'Card' },
                  { id: 'netbanking' as const, icon: Building2, label: 'Net Banking' },
                ].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === m.id
                        ? 'border-purple-500/40 bg-purple-500/10 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                        : 'border-purple-500/10 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}>
                    <m.icon className={`h-5 w-5 mx-auto mb-1 ${paymentMethod === m.id ? 'text-purple-300' : 'text-purple-400/40'}`} />
                    <span className={`text-xs ${paymentMethod === m.id ? 'text-white' : 'text-purple-300/50'}`}>{m.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                {/* UPI */}
                {paymentMethod === 'upi' && (
                  <div className="animate-fade-in-up">
                    <label className="block text-xs text-purple-200/50 mb-1.5">UPI ID</label>
                    <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                      className="input-field" placeholder="yourname@upi" required />
                    <div className="flex gap-2 mt-3">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                        <button key={app} type="button" onClick={() => setUpiId(`user@${app.toLowerCase().replace(' ', '')}`)}
                          className="text-[10px] bg-white/5 text-purple-300/60 px-3 py-1.5 rounded-lg border border-purple-500/10 hover:bg-purple-500/10 transition-all">
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 animate-fade-in-up">
                    <div>
                      <label className="block text-xs text-purple-200/50 mb-1.5">Card Number</label>
                      <input type="text" value={cardData.number}
                        onChange={e => setCardData(prev => ({ ...prev, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) }))}
                        className="input-field font-mono" placeholder="4242 4242 4242 4242" maxLength={19} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-purple-200/50 mb-1.5">Expiry</label>
                        <input type="text" value={cardData.expiry}
                          onChange={e => {
                            let val = e.target.value.replace(/\D/g, '').slice(0, 4)
                            if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2)
                            setCardData(prev => ({ ...prev, expiry: val }))
                          }}
                          className="input-field font-mono" placeholder="MM/YY" maxLength={5} required />
                      </div>
                      <div>
                        <label className="block text-xs text-purple-200/50 mb-1.5">CVV</label>
                        <input type="password" value={cardData.cvv}
                          onChange={e => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                          className="input-field font-mono" placeholder="•••" maxLength={3} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-purple-200/50 mb-1.5">Cardholder Name</label>
                      <input type="text" value={cardData.name}
                        onChange={e => setCardData(prev => ({ ...prev, name: e.target.value }))}
                        className="input-field" placeholder="Name on card" required />
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div className="animate-fade-in-up">
                    <label className="block text-xs text-purple-200/50 mb-1.5">Select Bank</label>
                    <select value={bank} onChange={e => setBank(e.target.value)} className="input-field" required>
                      <option value="" className="bg-dark-900">Choose your bank</option>
                      {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank', 'Bank of Baroda', 'Union Bank'].map(b => (
                        <option key={b} value={b} className="bg-dark-900">{b}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-purple-300/30 mt-2">You will be redirected to your bank&apos;s secure payment page</p>
                  </div>
                )}

                <button type="submit" disabled={processing}
                  className="w-full btn-primary py-4 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-6">
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Pay ₹{plan.price.toLocaleString()}
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <Shield className="h-3.5 w-3.5 text-green-400/60" />
                  <span className="text-[10px] text-purple-300/40">256-bit SSL encrypted. Your data is secure.</span>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-400" /> Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200/50">{plan.name} Plan</span>
                  <span className="text-white">₹{basePrice.toLocaleString()}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-300">
                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Coupon ({couponDiscount}% off)</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-purple-200/50">Duration</span>
                  <span className="text-white">{plan.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/50">GST (18%)</span>
                  <span className="text-white">₹{gst.toLocaleString()}</span>
                </div>
                <div className="border-t border-purple-500/10 pt-3 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white font-bold text-lg">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="mt-5 border-t border-purple-500/10 pt-4">
                <p className="text-xs font-semibold text-purple-200/70 mb-2 flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-purple-400" /> Have a coupon code?
                </p>
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-xs font-bold text-green-300">{couponCode.toUpperCase()}</p>
                        <p className="text-[10px] text-green-200/60">{couponMessage}</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-red-300/60 hover:text-red-300"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode} 
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                      placeholder="Enter code" 
                      className="input-field flex-1 text-xs !py-2 uppercase"
                    />
                    <button 
                      onClick={handleApplyCoupon} 
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="btn-secondary text-xs px-4 py-2 disabled:opacity-40"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[10px] text-red-400 mt-1.5">{couponError}</p>}
                <div className="mt-3 space-y-1">
                  <p className="text-[9px] text-purple-300/30">Try: SHADI50, FIRST25, WELCOME30</p>
                </div>
              </div>

              <div className="mt-5 bg-green-500/5 border border-green-500/10 rounded-xl p-3">
                <p className="text-[11px] text-green-300/70 flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" /> 7-day money-back guarantee
                </p>
                <p className="text-[11px] text-green-300/70 flex items-center gap-1.5 mt-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Cancel anytime, no questions asked
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="glass-card mt-4 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2">
                  <p className="text-lg font-bold text-white">1M+</p>
                  <p className="text-[9px] text-purple-300/40">Happy Users</p>
                </div>
                <div className="p-2">
                  <p className="text-lg font-bold text-white">10K+</p>
                  <p className="text-[9px] text-purple-300/40">Matches Made</p>
                </div>
                <div className="p-2">
                  <p className="text-lg font-bold text-white">4.8★</p>
                  <p className="text-[9px] text-purple-300/40">App Rating</p>
                </div>
                <div className="p-2">
                  <p className="text-lg font-bold text-white">100%</p>
                  <p className="text-[9px] text-purple-300/40">Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mesh pt-24 flex items-center justify-center"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
