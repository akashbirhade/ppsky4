'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Brain, MessageCircle, BookOpen, Sparkles, ArrowRight, Star, Shield, Users, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

interface CoachTopic {
  id: string
  icon: string
  title: string
  subtitle: string
  color: string
  tips: string[]
}

const COACH_TOPICS: CoachTopic[] = [
  {
    id: 'first-impressions',
    icon: '✨',
    title: 'First Impressions',
    subtitle: 'Make your profile stand out',
    color: 'from-purple-500/20 to-fuchsia-500/10',
    tips: [
      'Use a clear, well-lit photo with a genuine smile — it increases interest by 40%',
      'Write an "About Me" that shows personality, not just facts. Share a hobby or dream.',
      'Mention specific interests rather than generic ones. "I love making pasta from scratch" beats "I like cooking".',
      'Keep your bio positive and future-focused. Talk about what you want to build together.',
      'Update your profile weekly — active profiles rank 3x higher in search results.'
    ]
  },
  {
    id: 'communication',
    icon: '💬',
    title: 'Starting Conversations',
    subtitle: 'Break the ice confidently',
    color: 'from-blue-500/20 to-cyan-500/10',
    tips: [
      'Reference something specific from their profile. "I see you love hiking — what\'s your favorite trail?"',
      'Ask open-ended questions that invite stories, not just yes/no answers.',
      'Share something genuine about yourself when you message — vulnerability builds trust.',
      'Don\'t wait too long to respond. Reply within 24 hours to maintain momentum.',
      'Keep early messages light and fun. Save deeper topics for when you\'re both comfortable.'
    ]
  },
  {
    id: 'first-meeting',
    icon: '☕',
    title: 'First Meeting Tips',
    subtitle: 'Make it memorable & safe',
    color: 'from-green-500/20 to-emerald-500/10',
    tips: [
      'Meet in a public place like a café or park. Tell a friend your plans.',
      'Keep the first meeting short (60-90 min). It leaves room to want more.',
      'Put your phone away and give full attention — it shows respect.',
      'Ask questions and actively listen. Show genuine curiosity about their life.',
      'Be yourself. Authenticity builds real connections that last.',
      'If it doesn\'t click, be graceful. "I enjoyed meeting you" is always appropriate.'
    ]
  },
  {
    id: 'family-involvement',
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Dynamics',
    subtitle: 'Navigate family expectations',
    color: 'from-amber-500/20 to-yellow-500/10',
    tips: [
      'Have honest conversations with your family about your non-negotiables vs. preferences.',
      'When introducing a match to family, prepare both sides with key information.',
      'Set healthy boundaries while respecting traditions. It\'s about balance.',
      'If families disagree, focus on common ground first. Most concerns come from love.',
      'Give relationships time to develop before involving extended family.',
      'Remember: you\'re building a new family, not just joining one.'
    ]
  },
  {
    id: 'compatibility',
    icon: '💕',
    title: 'Building Compatibility',
    subtitle: 'Deepen your connection',
    color: 'from-pink-500/20 to-rose-500/10',
    tips: [
      'Discuss life goals early: career ambitions, where to live, views on children.',
      'Notice how they handle disagreements — it reveals more than agreements do.',
      'Shared values matter more than shared hobbies. Hobbies can be learned, values rarely change.',
      'Financial transparency builds trust. Discuss spending habits openly.',
      'Pay attention to how they treat others — waiters, auto drivers, family members.',
      'Compatibility isn\'t about being similar — it\'s about complementing each other.'
    ]
  },
  {
    id: 'safety',
    icon: '🛡️',
    title: 'Staying Safe',
    subtitle: 'Protect yourself online',
    color: 'from-red-500/20 to-orange-500/10',
    tips: [
      'Never share financial information, Aadhaar, or bank details with matches.',
      'Video call before meeting in person to verify identity.',
      'Trust your instincts. If something feels off, it probably is.',
      'Don\'t send money to anyone you haven\'t met, regardless of the story.',
      'Use our platform\'s chat instead of giving personal numbers immediately.',
      'Report suspicious profiles — you might save someone else from harm.'
    ]
  },
]

const DAILY_AFFIRMATION = [
  "You deserve a love that makes you feel safe and excited at the same time. 💜",
  "The right person won't require you to shrink. They'll celebrate all of you. ✨",
  "Your timeline is perfect. Trust that good things are coming your way. 🌟",
  "Being selective isn't being difficult — it's being wise about your forever. 💫",
  "Every 'no' is bringing you closer to your 'absolutely yes'. 🦋",
]

export default function CoachPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [expandedTopic, setExpandedTopic] = useState<string | null>('first-impressions')
  const [affirmation] = useState(() => DAILY_AFFIRMATION[Math.floor(Math.random() * DAILY_AFFIRMATION.length)])

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  if (authLoading || !user) return null

  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-purple-500/10 border border-teal-200/50 dark:border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <Brain className="h-4 w-4 text-teal-600 dark:text-purple-400" />
            <span className="text-xs text-slate-600 dark:text-purple-300">AI-Powered Guidance</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">Relationship Coach</h1>
          <p className="text-slate-500 dark:text-purple-200/50 max-w-lg mx-auto">Personalized advice to help you navigate your matchmaking journey with confidence</p>
        </div>

        {/* Daily Affirmation */}
        <div className="glass-card p-6 mb-8 border-teal-200/50 dark:border-purple-500/20 text-center animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-slate-400 dark:text-purple-300/60 uppercase tracking-wider">Today&apos;s Affirmation</span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-lg text-slate-800 dark:text-purple-100 font-medium italic leading-relaxed">&ldquo;{affirmation}&rdquo;</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
          {[
            { icon: BookOpen, label: 'Articles Read', value: '12', color: 'text-blue-400' },
            { icon: Clock, label: 'Coach Sessions', value: '5', color: 'text-green-400' },
            { icon: Star, label: 'Profile Score', value: '86%', color: 'text-amber-400' },
            { icon: HalfHeart, label: 'Matches Made', value: '3', color: 'text-pink-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-card !p-4 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-lg font-bold text-slate-800 dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-300 dark:text-purple-300/40">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Topics */}
        <div className="space-y-3">
          {COACH_TOPICS.map((topic, i) => (
            <div key={topic.id} className="glass-card !p-0 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${(i + 2) * 0.05}s`, opacity: 0 }}>
              <button
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-xl border border-purple-400/10`}>
                  {topic.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{topic.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-purple-200/50">{topic.subtitle}</p>
                </div>
                {expandedTopic === topic.id ? (
                  <ChevronUp className="h-5 w-5 text-slate-300 dark:text-purple-300/40" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-300 dark:text-purple-300/40" />
                )}
              </button>

              {expandedTopic === topic.id && (
                <div className="px-5 pb-5 pt-0 border-t border-teal-100 dark:border-purple-500/10">
                  <div className="pl-16 space-y-3 mt-4">
                    {topic.tips.map((tip, j) => (
                      <div key={j} className="flex items-start gap-3 group">
                        <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-teal-200/50 dark:border-purple-500/20 group-hover:bg-teal-100/50 dark:bg-purple-500/20 transition-colors">
                          <span className="text-[10px] font-bold text-slate-600 dark:text-purple-300">{j + 1}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-purple-200/70 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA to Chat */}
        <div className="mt-10 glass-card p-8 text-center border-teal-200/50 dark:border-purple-500/20 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <Brain className="h-10 w-10 text-teal-600 dark:text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Have a specific question?</h3>
          <p className="text-sm text-slate-500 dark:text-purple-200/50 mb-5 max-w-md mx-auto">Our AI assistant speaks Hindi, English & Marathi and can give you personalized advice anytime.</p>
          <p className="text-xs text-slate-300 dark:text-purple-300/40">Click the chat icon in the bottom-right corner to start a conversation 💬</p>
        </div>
      </div>
    </div>
  )
}
