'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Check, Star, Zap, Shield, Phone, Eye, MessageCircle, Sparkles, Diamond } from 'lucide-react'

const plans = [
  {
    id: 'gold',
    name: 'Gold',
    price: '₹2,999',
    monthlyPrice: '₹499/mo',
    duration: '6 Months',
    popular: false,
    icon: Crown,
    color: 'from-amber-400 to-yellow-500',
    glow: 'rgba(245,158,11,0.3)',
    features: [
      'Unlimited profile views',
      'Send 30 interests/day',
      'Priority messaging',
      'Video calling feature',
      'AI match recommendations',
      'Profile highlighted in search',
      'See who viewed your profile',
      'Advanced privacy controls',
    ]
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: '₹4,999',
    monthlyPrice: '₹416/mo',
    duration: '12 Months',
    popular: true,
    icon: Diamond,
    color: 'from-blue-400 to-cyan-500',
    glow: 'rgba(59,130,246,0.3)',
    features: [
      'Everything in Gold',
      'Unlimited interests',
      'Priority customer support',
      'Personal relationship advisor',
      'Profile verification badge',
      'Featured profile placement',
      'Audio & Video calling',
      'Smart AI matchmaking',
      'Dedicated relationship manager',
      'Access to premium events',
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '₹7,999',
    monthlyPrice: '₹666/mo',
    duration: '12 Months',
    popular: false,
    icon: Shield,
    color: 'from-purple-400 to-fuchsia-500',
    glow: 'rgba(147,51,234,0.3)',
    features: [
      'Everything in Diamond',
      'Background check included',
      'AI-powered scam detection',
      'Exclusive matchmaking service',
      'Priority profile boost (weekly)',
      'Family meeting coordinator',
      'Wedding planning assistance',
      'Dedicated account manager',
      'Lifetime verification badge',
      'VIP event invitations',
      'Profile featured on homepage',
    ]
  }
]

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState('gold')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const router = useRouter()

  const handleGetStarted = () => {
    router.push(`/checkout?plan=${selectedPlan}`)
  }

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-4 py-2 rounded-full mb-4">
            <Crown className="h-3.5 w-3.5" /> Premium Membership
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white mb-3">
            Find Love <span className="gradient-text">Faster</span>
          </h1>
          <p className="text-purple-200/40 max-w-lg mx-auto text-sm">
            Unlock premium features to connect with verified profiles and find your soulmate with AI-powered matchmaking.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in-up delay-100" style={{opacity:0}}>
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-purple-300/40'}`}>Monthly</span>
          <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="relative w-12 h-6 bg-purple-600/30 rounded-full border border-teal-200/50 dark:border-purple-500/20 transition-colors">
            <div className={`absolute top-0.5 w-5 h-5 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-purple-300/40'}`}>Yearly</span>
          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Save 40%</span>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative glass-card cursor-pointer transition-all duration-300 animate-fade-in-up ${
                selectedPlan === plan.id
                  ? 'border-purple-500/40 shadow-[0_0_40px_' + plan.glow + '] scale-[1.02]'
                  : 'hover:border-teal-200/50 dark:border-purple-500/20 hover:scale-[1.01]'
              } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              style={{animationDelay: `${i * 0.1 + 0.2}s`, opacity: 0}}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-bold px-4 py-1 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <plan.icon className="h-7 w-7 text-slate-800 dark:text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-slate-800 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-slate-300 dark:text-purple-300/40">/{plan.duration}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-500 dark:text-purple-200/60">{feature}</span>
                  </li>
                ))}
              </ul>

              <button onClick={selectedPlan === plan.id ? handleGetStarted : () => setSelectedPlan(plan.id)} className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${
                selectedPlan === plan.id
                  ? 'btn-primary'
                  : 'bg-white/5 text-slate-400 dark:text-purple-300/60 border border-teal-100 dark:border-purple-500/10 hover:bg-teal-50 dark:bg-purple-500/10'
              }`}>
                {selectedPlan === plan.id ? 'Get Started →' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="glass-card animate-fade-in-up delay-500" style={{opacity:0}}>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-8">
            Why Go <span className="gradient-text">Premium?</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Eye, title: 'See Who Viewed', desc: 'Know who is checking your profile' },
              { icon: Phone, title: 'Video Calling', desc: 'Connect face-to-face before meeting' },
              { icon: Sparkles, title: 'AI Matchmaking', desc: 'Smart algorithm finds best matches' },
              { icon: Shield, title: 'Verified Profiles', desc: 'Connect only with real, verified people' },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-purple-500/10 border border-teal-200/50 dark:border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <f.icon className="h-5 w-5 text-teal-600 dark:text-purple-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{f.title}</h4>
                <p className="text-[11px] text-slate-300 dark:text-purple-300/40">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up delay-500" style={{opacity:0}}>
          <div className="text-center p-4 glass-card !bg-white/[0.02]">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">50L+</p>
            <p className="text-[10px] text-slate-300 dark:text-purple-300/40">Active Members</p>
          </div>
          <div className="text-center p-4 glass-card !bg-white/[0.02]">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">10L+</p>
            <p className="text-[10px] text-slate-300 dark:text-purple-300/40">Success Stories</p>
          </div>
          <div className="text-center p-4 glass-card !bg-white/[0.02]">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">99.2%</p>
            <p className="text-[10px] text-slate-300 dark:text-purple-300/40">Verified Profiles</p>
          </div>
          <div className="text-center p-4 glass-card !bg-white/[0.02]">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">4.8★</p>
            <p className="text-[10px] text-slate-300 dark:text-purple-300/40">User Rating</p>
          </div>
        </div>
      </div>
    </div>
  )
}
