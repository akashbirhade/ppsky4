import Link from 'next/link'
import { Shield, Brain, Star, Users, CheckCircle, ArrowRight, Sparkles, Crown, Video, MessageCircle, BadgeCheck, TrendingUp } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'
import AuthRedirect from '@/components/AuthRedirect'

export default function Home() {
  return (
    <div className="bg-transparent">
      {/* Auto redirect logged-in users to dashboard */}
      <AuthRedirect />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/15 dark:bg-purple-600/20 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 dark:bg-fuchsia-600/15 rounded-full blur-[120px] animate-float" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-300/5 dark:bg-purple-500/5 rounded-full blur-[150px]" />
          {/* Orbiting particles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-orbit"><HalfHeart className="h-4 w-4 opacity-40" /></div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{animationDelay:'4s'}}>
            <div className="animate-orbit" style={{animationDuration:'15s'}}><Sparkles className="h-3 w-3 text-teal-400/40 dark:text-purple-400/40" /></div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center pt-20">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-purple-500/10 border border-teal-200/50 dark:border-purple-400/20 text-teal-700 dark:text-purple-300 px-5 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              India&apos;s #1 AI-Powered Matchmaking Platform
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 animate-fade-in-up delay-100" style={{opacity:0}}>
            <span className="text-slate-800 dark:text-white">Find Your</span>
            <br />
            <span className="gradient-text">Forever Love</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-purple-200/60 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200" style={{opacity:0}}>
            Where AI meets destiny. Millions of verified profiles, smart compatibility matching, and a luxurious experience designed to help you find your perfect life partner.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300" style={{opacity:0}}>
            <Link href="/register" className="btn-primary text-lg px-10 py-4 flex items-center justify-center gap-2">
              Begin Your Journey <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/search" className="btn-secondary text-lg px-10 py-4 flex items-center justify-center gap-2">
              <Search className="h-5 w-5" /> Browse Profiles
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-slate-400 dark:text-purple-300/50 animate-fade-in-up delay-500" style={{opacity:0}}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span>80 Lakh+ Success Stories</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span>100% Verified Profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-teal-500 dark:text-purple-400" />
              <span>Bank-Grade Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Floating Section */}
      <section className="relative py-16 -mt-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '80L+', label: 'Matches Made', color: 'text-teal-600 dark:text-purple-300' },
              { value: '35L+', label: 'Active Profiles', color: 'text-cyan-600 dark:text-fuchsia-300' },
              { value: '98%', label: 'AI Accuracy', color: 'text-sky-600 dark:text-pink-300' },
              { value: '24/7', label: 'AI Support', color: 'text-amber-600 dark:text-amber-300' },
            ].map((stat, i) => (
              <div key={i} className="animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`, opacity: 0}}>
                <div className={`text-3xl lg:text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-400 dark:text-purple-300/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-4">
              The <span className="gradient-text">Luxury</span> Experience
            </h2>
            <p className="text-slate-500 dark:text-purple-200/50 text-lg max-w-2xl mx-auto">
              Every feature designed to make your journey to finding love extraordinary
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'AI Matchmaking', desc: '50+ compatibility parameters analyzed by our advanced AI to find your ideal match', color: 'from-purple-500 to-fuchsia-500' },
              { icon: Video, title: 'Video Calls', desc: 'Get to know your matches face-to-face with HD video calling built right in', color: 'from-blue-500 to-purple-500' },
              { icon: Shield, title: 'Verified Profiles', desc: 'ID verification, photo verification, and background checks for your safety', color: 'from-green-500 to-emerald-500' },
              { icon: MessageCircle, title: 'Secure Chat', desc: 'End-to-end encrypted messaging with read receipts and media sharing', color: 'from-pink-500 to-rose-500' },
              { icon: Crown, title: 'VIP Treatment', desc: 'Personal matchmaking consultants, priority support, and exclusive events', color: 'from-amber-500 to-yellow-500' },
              { icon: TrendingUp, title: 'Smart Insights', desc: 'Track profile views, match suggestions, and daily compatibility reports', color: 'from-cyan-500 to-blue-500' },
            ].map((feature, i) => (
              <div key={i} className="glass-card group hover:-translate-y-2 transition-all duration-500">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-purple-200/50 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative bg-mesh">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-4">
              Your Journey to <span className="gradient-text-gold">Forever</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Profile', desc: 'Sign up and tell us about yourself', icon: '✨' },
              { step: '02', title: 'AI Matches', desc: 'Get personalized recommendations', icon: '🤖' },
              { step: '03', title: 'Connect', desc: 'Chat, video call, and bond', icon: '💬' },
              { step: '04', title: 'Celebrate', desc: 'Write your love story', icon: '💑' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-purple-600 dark:to-fuchsia-600 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(20,184,166,0.3)] dark:shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-teal-600 dark:text-purple-400 bg-white dark:bg-dark-900 px-1.5 py-0.5 rounded-full border border-teal-200 dark:border-purple-500/30">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400 dark:text-purple-300/50">{item.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-teal-400/30 dark:from-purple-500/30 to-transparent" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-4">
              Love Stories <span className="gradient-text">Written Here</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { names: 'Rohit & Meera', score: '92%', story: 'The AI matching was incredible! Connected instantly on our first video call. Married within 6 months!', city: 'Mumbai' },
              { names: 'Karthik & Divya', score: '88%', story: 'Different cities, same hearts. Soulmate Sync proved that when the connection is right, distance is nothing.', city: 'Bangalore' },
              { names: 'Ajinkya & Ashwini', score: '95%', story: 'From the first chat, everything clicked. Our families loved each other too. Best decision ever!', city: 'Pune' },
            ].map((story, i) => (
              <div key={i} className="glass-card group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-pink-500/20 dark:to-purple-500/20 flex items-center justify-center border border-teal-200/50 dark:border-pink-500/20">
                    <HalfHeart className="h-5 w-5 group-hover:animate-heartbeat" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{story.names}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-purple-300/50">{story.city} • {story.score} Match</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-purple-200/60 italic leading-relaxed">&ldquo;{story.story}&rdquo;</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/success-stories" className="btn-secondary inline-flex items-center gap-2">
              View All Stories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-teal-500/5 dark:from-purple-600/10 dark:via-fuchsia-600/5 dark:to-purple-600/10" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card p-12 border-teal-200/40 dark:border-purple-400/20">
            <HalfHeart className="h-12 w-12 mx-auto mb-6 animate-heartbeat" />
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Your Perfect Match is Waiting
            </h2>
            <p className="text-lg text-slate-500 dark:text-purple-200/50 mb-8">
              Join millions who found their life partner on Soulmate Sync. Start free today.
            </p>
            <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Start Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-teal-100 dark:border-purple-500/10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HalfHeart className="h-6 w-6" />
                <span className="font-bold text-slate-800 dark:text-white">Soulmate Sync</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-purple-300/40">India&apos;s #1 AI Matchmaking Platform</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/search" className="block text-xs text-slate-500 dark:text-purple-300/50 hover:text-teal-600 dark:hover:text-purple-200 transition-colors">Search Profiles</Link>
                <Link href="/premium" className="block text-xs text-slate-500 dark:text-purple-300/50 hover:text-teal-600 dark:hover:text-purple-200 transition-colors">Premium Plans</Link>
                <Link href="/success-stories" className="block text-xs text-slate-500 dark:text-purple-300/50 hover:text-teal-600 dark:hover:text-purple-200 transition-colors">Success Stories</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Safety</h4>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-slate-500 dark:text-purple-300/50 hover:text-teal-600 dark:hover:text-purple-200 transition-colors">Safety Tips</a>
                <a href="#" className="block text-xs text-slate-500 dark:text-purple-300/50 hover:text-teal-600 dark:hover:text-purple-200 transition-colors">Privacy Policy</a>
                <a href="#" className="block text-xs text-slate-500 dark:text-purple-300/50 hover:text-teal-600 dark:hover:text-purple-200 transition-colors">Terms of Use</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-slate-500 dark:text-purple-300/50 hover:text-teal-600 dark:hover:text-purple-200 transition-colors">Help Center</a>
                <a href="#" className="block text-xs text-slate-500 dark:text-purple-300/50 hover:text-teal-600 dark:hover:text-purple-200 transition-colors">Contact Us</a>
                <a href="#" className="block text-xs text-slate-500 dark:text-purple-300/50 hover:text-teal-600 dark:hover:text-purple-200 transition-colors">Report Issue</a>
              </div>
            </div>
          </div>
          <div className="border-t border-teal-100 dark:border-purple-500/10 pt-6 text-center">
            <p className="text-xs text-slate-400 dark:text-purple-400/30">© 2024-2026 Soulmate Sync. Made with 💜 in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Search({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}
