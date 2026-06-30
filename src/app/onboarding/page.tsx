'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Camera, MapPin, GraduationCap, Briefcase, Users, Star, ArrowRight, ArrowLeft, CheckCircle, Sparkles, Moon, User } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'
import LocationSelector from '@/components/LocationSelector'

const STEPS = [
  { title: 'Profile Photo', icon: Camera, subtitle: 'First impressions matter' },
  { title: 'About You', icon: User, subtitle: 'Tell us about yourself' },
  { title: 'Education & Career', icon: GraduationCap, subtitle: 'Your achievements' },
  { title: 'Family & Lifestyle', icon: Users, subtitle: 'Background details' },
  { title: 'Partner Preferences', icon: HalfHeart, subtitle: 'Who are you looking for?' },
]

// Map section names to step indices
const SECTION_TO_STEP: Record<string, number> = {
  'photo': 0,
  'about': 1,
  'career': 2,
  'family': 3,
  'preferences': 4,
  'basic': 1,
  'location': 3,
  'religion': 1,
}

function OnboardingContent() {
  const { user, authFetch, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const section = searchParams.get('section') || 'basic'
  const initialStep = SECTION_TO_STEP[section] || 0
  const [step, setStep] = useState(initialStep)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Photo
    photoUrl: '',
    // Step 2: About
    about: '',
    religion: '',
    caste: '',
    motherTongue: '',
    height: '',
    // Step 3: Education & Career
    education: '',
    occupation: '',
    income: '',
    // Step 4: Family & Lifestyle
    familyType: '',
    city: '',
    state: '',
    diet: '',
    smoke: '',
    drink: '',
    // Step 5: Partner Preferences
    prefAgeMin: '24',
    prefAgeMax: '35',
    prefReligion: '',
    prefEducation: '',
    prefCity: '',
  })

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    // Update step when section parameter changes
    const newStep = SECTION_TO_STEP[section] || 0
    setStep(newStep)
  }, [section])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const completionPercent = () => {
    const fields = Object.values(formData)
    const filled = fields.filter(v => v.trim() !== '').length
    return Math.round((filled / fields.length) * 100)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await authFetch('/api/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          about: formData.about,
          religion: formData.religion,
          caste: formData.caste,
          motherTongue: formData.motherTongue,
          height: formData.height,
          education: formData.education,
          occupation: formData.occupation,
          income: formData.income,
          city: formData.city,
          state: formData.state,
          diet: formData.diet,
          maritalStatus: 'Never Married',
          hobbies: [],
          familyDetails: { father: '', mother: '', siblings: '', familyType: formData.familyType, familyStatus: '', familyIncome: '' },
          partnerAgeMin: formData.prefAgeMin,
          partnerAgeMax: formData.prefAgeMax,
          partnerReligion: formData.prefReligion,
          partnerEducation: formData.prefEducation,
          partnerCity: formData.prefCity,
        })
      })
      router.push('/dashboard')
    } catch {
      router.push('/dashboard')
    }
    setSaving(false)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    
    const fd = new FormData()
    fd.append('photo', file)
    fd.append('userId', user.id)
    
    try {
      const res = await authFetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, photoUrl: data.photoUrl }))
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const canSkip = step < STEPS.length - 1

  if (!user) return null

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-purple-500/10 border border-teal-200/50 dark:border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-purple-400" />
            <span className="text-xs text-slate-600 dark:text-purple-300">Complete your profile for better matches</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Let&apos;s set up your profile</h1>
          <p className="text-slate-500 dark:text-purple-200/50 mt-2">Profiles with more details get 4x more responses</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 dark:text-purple-300/60">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs text-teal-600 dark:text-purple-400 font-medium">{completionPercent()}% complete</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-teal-100 dark:border-purple-500/10">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`flex flex-col items-center gap-1 transition-all ${i <= step ? 'opacity-100' : 'opacity-40'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  i < step ? 'bg-green-500/30 border border-green-400/40' :
                  i === step ? 'bg-purple-600 border border-purple-400/50 shadow-[0_0_15px_rgba(147,51,234,0.4)]' :
                  'bg-white/5 border border-teal-200/50 dark:border-purple-500/20'
                }`}>
                  {i < step ? <CheckCircle className="h-4 w-4 text-green-400" /> : <s.icon className="h-3.5 w-3.5 text-slate-700 dark:text-purple-200" />}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-purple-300/50 hidden sm:block">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            {(() => { const Icon = STEPS[step].icon; return <Icon className="h-6 w-6 text-teal-600 dark:text-purple-400" /> })()}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{STEPS[step].title}</h2>
              <p className="text-sm text-slate-400 dark:text-purple-300/50">{STEPS[step].subtitle}</p>
            </div>
          </div>

          {/* Step 0: Photo */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <label htmlFor="photo-upload" className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-2 border-dashed border-teal-200/50 dark:border-purple-400/30 flex items-center justify-center cursor-pointer hover:border-purple-400/60 transition-all group overflow-hidden">
                  {formData.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-slate-400 dark:text-purple-300/50 mx-auto group-hover:text-slate-700 dark:text-purple-200 transition-colors" />
                      <span className="text-[10px] text-slate-300 dark:text-purple-300/40 mt-1 block">Upload Photo</span>
                    </div>
                  )}
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <p className="text-xs text-slate-300 dark:text-purple-300/40 text-center">
                  {formData.photoUrl ? '✓ Photo uploaded! Click to change' : 'Click to upload your photo (JPEG, PNG, WebP, max 5MB)'}
                </p>
                <p className="text-[10px] text-teal-600 dark:text-purple-400/60 text-center">Photos increase profile views by 10x</p>
              </div>
            </div>
          )}

          {/* Step 1: About */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">About Me *</label>
                <textarea name="about" value={formData.about} onChange={handleChange}
                  placeholder="Write a brief description about yourself, your hobbies, values..."
                  rows={4} className="input-field w-full resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Religion *</label>
                  <select name="religion" value={formData.religion} onChange={handleChange} className="input-field w-full">
                    <option value="">Select</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Jain">Jain</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Caste</label>
                  <input type="text" name="caste" value={formData.caste} onChange={handleChange}
                    placeholder="Enter caste" className="input-field w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Mother Tongue *</label>
                  <select name="motherTongue" value={formData.motherTongue} onChange={handleChange} className="input-field w-full">
                    <option value="">Select</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="English">English</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Height *</label>
                  <select name="height" value={formData.height} onChange={handleChange} className="input-field w-full">
                    <option value="">Select</option>
                    {["4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\"","6'3\"","6'4\""].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education & Career */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Highest Education *</label>
                <select name="education" value={formData.education} onChange={handleChange} className="input-field w-full">
                  <option value="">Select</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's">Bachelor&apos;s</option>
                  <option value="B.Tech/B.E.">B.Tech/B.E.</option>
                  <option value="B.Com">B.Com</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MS (Abroad)">MS (Abroad)</option>
                  <option value="CA">CA</option>
                  <option value="MBBS/MD">MBBS/MD</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Occupation *</label>
                <select name="occupation" value={formData.occupation} onChange={handleChange} className="input-field w-full">
                  <option value="">Select</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Lawyer">Lawyer</option>
                  <option value="CA/Finance">CA/Finance</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Government Job">Government Job</option>
                  <option value="Teacher/Professor">Teacher/Professor</option>
                  <option value="Manager">Manager</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Designer">Designer</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Annual Income *</label>
                <select name="income" value={formData.income} onChange={handleChange} className="input-field w-full">
                  <option value="">Select</option>
                  <option value="Below 5 LPA">Below 5 LPA</option>
                  <option value="5-8 LPA">5-8 LPA</option>
                  <option value="8-12 LPA">8-12 LPA</option>
                  <option value="12-18 LPA">12-18 LPA</option>
                  <option value="18-25 LPA">18-25 LPA</option>
                  <option value="25-40 LPA">25-40 LPA</option>
                  <option value="40-60 LPA">40-60 LPA</option>
                  <option value="60 LPA+">60 LPA+</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Family & Lifestyle */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Location *</label>
                <LocationSelector
                  compact
                  onChange={(loc) => {
                    setFormData(prev => ({
                      ...prev,
                      city: loc.city,
                      state: loc.state || loc.stateCode,
                      country: loc.country || 'India',
                      district: loc.district,
                      taluka: loc.taluka,
                      pincode: loc.pincode,
                    }))
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Family Type</label>
                <select name="familyType" value={formData.familyType} onChange={handleChange} className="input-field w-full">
                  <option value="">Select</option>
                  <option value="Joint Family">Joint Family</option>
                  <option value="Nuclear Family">Nuclear Family</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Diet</label>
                  <select name="diet" value={formData.diet} onChange={handleChange} className="input-field w-full">
                    <option value="">Select</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Smoke</label>
                  <select name="smoke" value={formData.smoke} onChange={handleChange} className="input-field w-full">
                    <option value="">Select</option>
                    <option value="No">No</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Drink</label>
                  <select name="drink" value={formData.drink} onChange={handleChange} className="input-field w-full">
                    <option value="">Select</option>
                    <option value="No">No</option>
                    <option value="Socially">Socially</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Partner Preferences */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Preferred Age Min</label>
                  <input type="number" name="prefAgeMin" value={formData.prefAgeMin} onChange={handleChange}
                    min="18" max="60" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Preferred Age Max</label>
                  <input type="number" name="prefAgeMax" value={formData.prefAgeMax} onChange={handleChange}
                    min="18" max="60" className="input-field w-full" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Preferred Religion</label>
                <select name="prefReligion" value={formData.prefReligion} onChange={handleChange} className="input-field w-full">
                  <option value="">Any Religion</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Jain">Jain</option>
                  <option value="Same as mine">Same as mine</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Preferred Education</label>
                <select name="prefEducation" value={formData.prefEducation} onChange={handleChange} className="input-field w-full">
                  <option value="">Any Education</option>
                  <option value="Graduate+">Graduate or above</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Professional (MBA/CA/Doctor)">Professional (MBA/CA/Doctor)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-purple-200 mb-2 block">Preferred City</label>
                <input type="text" name="prefCity" value={formData.prefCity} onChange={handleChange}
                  placeholder="Any city or specific preferences" className="input-field w-full" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-teal-100 dark:border-purple-500/10">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-purple-300 hover:text-slate-800 dark:text-white transition-colors px-4 py-2.5 rounded-xl hover:bg-white/5">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              {canSkip && (
                <button onClick={() => setStep(s => s + 1)}
                  className="text-sm text-slate-400 dark:text-purple-300/50 hover:text-slate-700 dark:text-purple-200 transition-colors px-3 py-2">
                  Skip for now
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)}
                  className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Complete Profile'} <Star className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 glass-card p-5 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
            <Moon className="h-4 w-4 text-teal-600 dark:text-purple-400" /> Profile Tips
          </h3>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-purple-200/60">
            <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" /> Profiles with photos get 10x more views</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" /> A detailed &apos;About Me&apos; increases interest by 5x</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" /> Setting partner preferences helps AI find better matches</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" /> Verified profiles appear higher in search results</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mesh flex items-center justify-center"><div className="text-slate-600 dark:text-purple-300">Loading...</div></div>}>
      <OnboardingContent />
    </Suspense>
  )
}
