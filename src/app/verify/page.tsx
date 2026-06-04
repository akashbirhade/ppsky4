'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Shield, Camera, Upload, CheckCircle, AlertCircle, Smartphone, BadgeCheck, FileText, Loader } from 'lucide-react'

type Step = 'choose' | 'photo' | 'id' | 'phone' | 'complete'

export default function VerifyPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('choose')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setIdPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSendOtp = () => {
    if (phone.length >= 10) setOtpSent(true)
  }

  const handleVerify = (type: string) => {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setStep('complete')
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Profile Verification</h1>
          <p className="text-sm text-purple-200/40">Verified profiles get 5x more interests. Build trust with potential matches.</p>
        </div>

        {step === 'complete' ? (
          <div className="glass-card text-center animate-fade-in-up">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Verification Submitted!</h2>
            <p className="text-sm text-slate-300 dark:text-purple-300/40 mb-6">Our team will review your submission within 24 hours. You&apos;ll receive a notification once verified.</p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary px-8 py-3">
              Back to Dashboard
            </button>
          </div>
        ) : step === 'choose' ? (
          <div className="space-y-4 animate-fade-in-up delay-100" style={{opacity:0}}>
            {/* Photo Verification */}
            <button onClick={() => setStep('photo')} className="glass-card w-full text-left flex items-center gap-4 hover:border-teal-200/50 dark:border-purple-400/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Camera className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Photo Verification</h3>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-0.5">Take a selfie to prove it&apos;s really you</p>
              </div>
              <div className="text-[10px] bg-blue-500/10 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/20">Quick</div>
            </button>

            {/* ID Verification */}
            <button onClick={() => setStep('id')} className="glass-card w-full text-left flex items-center gap-4 hover:border-teal-200/50 dark:border-purple-400/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-purple-500/10 border border-teal-200/50 dark:border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-teal-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">ID Verification</h3>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-0.5">Upload Aadhaar, PAN or Passport</p>
              </div>
              <div className="text-[10px] bg-green-500/10 text-green-300 px-2.5 py-1 rounded-full border border-green-500/20">Trusted</div>
            </button>

            {/* Phone Verification */}
            <button onClick={() => setStep('phone')} className="glass-card w-full text-left flex items-center gap-4 hover:border-teal-200/50 dark:border-purple-400/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Smartphone className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Phone Verification</h3>
                <p className="text-xs text-slate-300 dark:text-purple-300/40 mt-0.5">Verify via OTP on your mobile number</p>
              </div>
              <div className="text-[10px] bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20">Instant</div>
            </button>

            <div className="mt-4 bg-teal-50/50 dark:bg-purple-500/5 border border-teal-100 dark:border-purple-500/10 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-teal-600 dark:text-purple-400/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-purple-200/50">Complete any verification to get the <BadgeCheck className="inline h-3.5 w-3.5 text-blue-400" /> badge. Multiple verifications increase your Trust Score.</p>
                </div>
              </div>
            </div>
          </div>
        ) : step === 'photo' ? (
          <div className="glass-card animate-fade-in-up">
            <button onClick={() => setStep('choose')} className="text-xs text-teal-600 dark:text-purple-400 hover:text-slate-600 dark:text-purple-300 mb-4">← Back</button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-400" /> Photo Verification
            </h2>
            <p className="text-xs text-slate-300 dark:text-purple-300/40 mb-6">Take a clear selfie in good lighting. We&apos;ll match it with your profile photo.</p>
            
            <div className="flex flex-col items-center">
              {photoPreview ? (
                <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-blue-500/30 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <img src={photoPreview} alt="Selfie" className="w-full h-full object-cover" />
                </div>
              ) : (
                <label className="w-48 h-48 rounded-2xl border-2 border-dashed border-blue-500/20 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-500/5 transition-colors mb-4">
                  <Camera className="h-10 w-10 text-blue-400/40 mb-2" />
                  <span className="text-xs text-slate-300 dark:text-purple-300/40">Upload Selfie</span>
                  <input type="file" accept="image/*" capture="user" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
              
              <button onClick={() => handleVerify('photo')} disabled={!photoPreview || verifying} className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-40">
                {verifying ? <><Loader className="h-4 w-4 animate-spin" /> Verifying...</> : <><BadgeCheck className="h-4 w-4" /> Submit for Verification</>}
              </button>
            </div>
          </div>
        ) : step === 'id' ? (
          <div className="glass-card animate-fade-in-up">
            <button onClick={() => setStep('choose')} className="text-xs text-teal-600 dark:text-purple-400 hover:text-slate-600 dark:text-purple-300 mb-4">← Back</button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600 dark:text-purple-400" /> ID Document Verification
            </h2>
            <p className="text-xs text-slate-300 dark:text-purple-300/40 mb-6">Upload a clear photo of your government-issued ID. We accept Aadhaar, PAN, Passport or Driving License.</p>
            
            <div className="flex flex-col items-center">
              {idPreview ? (
                <div className="w-full max-w-sm h-48 rounded-2xl overflow-hidden border-2 border-teal-200 dark:border-purple-500/30 mb-4 shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                  <img src={idPreview} alt="ID" className="w-full h-full object-cover" />
                </div>
              ) : (
                <label className="w-full max-w-sm h-48 rounded-2xl border-2 border-dashed border-teal-200/50 dark:border-purple-500/20 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 dark:bg-purple-500/5 transition-colors mb-4">
                  <Upload className="h-10 w-10 text-teal-600 dark:text-purple-400/40 mb-2" />
                  <span className="text-xs text-slate-300 dark:text-purple-300/40">Upload ID Document</span>
                  <span className="text-[10px] text-teal-600 dark:text-purple-400/30 mt-1">Aadhaar / PAN / Passport</span>
                  <input type="file" accept="image/*" onChange={handleIdUpload} className="hidden" />
                </label>
              )}
              
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 mb-4 w-full max-w-sm">
                <p className="text-[10px] text-amber-300/60">🔒 Your documents are encrypted and securely stored. We only verify your identity — no data is shared with third parties.</p>
              </div>

              <button onClick={() => handleVerify('id')} disabled={!idPreview || verifying} className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-40">
                {verifying ? <><Loader className="h-4 w-4 animate-spin" /> Verifying...</> : <><BadgeCheck className="h-4 w-4" /> Submit for Verification</>}
              </button>
            </div>
          </div>
        ) : step === 'phone' ? (
          <div className="glass-card animate-fade-in-up">
            <button onClick={() => setStep('choose')} className="text-xs text-teal-600 dark:text-purple-400 hover:text-slate-600 dark:text-purple-300 mb-4">← Back</button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-amber-400" /> Phone Verification
            </h2>
            <p className="text-xs text-slate-300 dark:text-purple-300/40 mb-6">Enter your mobile number to receive an OTP for instant verification.</p>
            
            <div className="max-w-sm mx-auto">
              <div className="flex gap-2 mb-4">
                <span className="input-field w-16 text-center flex items-center justify-center text-sm">+91</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="Enter mobile number" className="input-field flex-1" maxLength={10} />
              </div>
              
              {!otpSent ? (
                <button onClick={handleSendOtp} disabled={phone.length < 10} className="w-full btn-primary py-3 disabled:opacity-40">
                  Send OTP
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-green-400 mb-2">✓ OTP sent to +91 {phone}</p>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="Enter 6-digit OTP" className="input-field text-center text-lg tracking-[0.5em]" maxLength={6} />
                  <button onClick={() => handleVerify('phone')} disabled={otp.length < 6 || verifying} className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40">
                    {verifying ? <><Loader className="h-4 w-4 animate-spin" /> Verifying...</> : 'Verify Phone'}
                  </button>
                  <button onClick={handleSendOtp} className="w-full text-xs text-teal-600 dark:text-purple-400 hover:text-slate-600 dark:text-purple-300">Resend OTP</button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
