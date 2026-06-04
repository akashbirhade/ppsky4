'use client'

import { Heart, Star, Quote } from 'lucide-react'
import Link from 'next/link'

const stories = [
  {
    couple: 'Rahul & Priya',
    location: 'Mumbai, Maharashtra',
    year: '2024',
    image: '💑',
    quote: 'We matched 94% on the AI compatibility score and after our first video call, we knew this was special. Within 6 months, we were married!',
    story: 'Rahul, a software engineer from Pune, was looking for a partner who shared his love for travel and spirituality. Priya, a doctor from Mumbai, had almost given up hope. The AI matched them based on deep compatibility metrics beyond just religion and caste.'
  },
  {
    couple: 'Vikram & Ananya',
    location: 'Bangalore, Karnataka',
    year: '2024',
    image: '💕',
    quote: 'The video calling feature made it so easy to connect. We talked for hours before meeting in person. It felt like destiny.',
    story: 'Long-distance wasn\'t a barrier for Vikram from Delhi and Ananya from Bangalore. The platform\'s video calling feature allowed them to build a genuine connection before their families met.'
  },
  {
    couple: 'Arjun & Meera',
    location: 'Chennai, Tamil Nadu',
    year: '2023',
    image: '💞',
    quote: 'Our families were skeptical about online matchmaking, but the verified profiles and background checks gave everyone confidence.',
    story: 'Traditional values meet modern technology. Arjun\'s family wanted a partner from the same community. The advanced filters and AI recommendations found Meera, who shared not just their background but also Arjun\'s passion for music.'
  },
  {
    couple: 'Sahil & Kavitha',
    location: 'Hyderabad, Telangana',
    year: '2023',
    image: '💗',
    quote: 'The AI chatbot actually helped me write a better bio! After that, I got so many more interests. That\'s how Kavitha found me.',
    story: 'Sahil struggled with his profile for months until the AI assistant suggested improvements. His revamped profile caught Kavitha\'s attention, and their shared love for cooking and fitness brought them together.'
  },
  {
    couple: 'Nikhil & Deepa',
    location: 'Delhi NCR',
    year: '2024',
    image: '💝',
    quote: 'Being an NRI, finding someone who understood both cultures was important. This platform helped me find exactly that.',
    story: 'Nikhil, working in the US, wanted to find a partner back home who would be open to relocating. Deepa, a CA from Delhi, was looking for exactly such an opportunity. The AI matched them with a 97% score.'
  },
  {
    couple: 'Amit & Sneha',
    location: 'Jaipur, Rajasthan',
    year: '2023',
    image: '💖',
    quote: 'We attended the same premium matchmaking event organized by the platform. One look and we both knew!',
    story: 'Premium members get access to exclusive events. Amit and Sneha both attended a cultural evening in Jaipur. The platform had already suggested them to each other, and meeting in person sealed the deal.'
  },
]

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-mesh pt-[104px] pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs px-4 py-2 rounded-full mb-4">
            <Heart className="h-3.5 w-3.5" /> Love Stories
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white mb-3">
            Real <span className="gradient-text">Success Stories</span>
          </h1>
          <p className="text-purple-200/40 max-w-lg mx-auto text-sm">
            Thousands of couples have found their perfect match through our AI-powered platform. Here are some of their beautiful journeys.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-12 animate-fade-in-up delay-100" style={{opacity:0}}>
          {[
            ['10,000+', 'Happy Couples'],
            ['94%', 'Match Success'],
            ['50 Lakhs+', 'Active Members']
          ].map(([num, label], i) => (
            <div key={i} className="glass-card !p-4 text-center">
              <p className="text-lg sm:text-xl font-bold gradient-text">{num}</p>
              <p className="text-[10px] text-slate-300 dark:text-purple-300/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {stories.map((story, i) => (
            <div key={i} className="glass-card group hover:border-pink-500/20 transition-all duration-300 animate-fade-in-up" style={{animationDelay: `${i * 0.1 + 0.2}s`, opacity: 0}}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-3xl border border-pink-500/10">
                  {story.image}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-pink-200 transition-colors">{story.couple}</h3>
                  <p className="text-[11px] text-slate-300 dark:text-purple-300/40">{story.location} • {story.year}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
                </div>
              </div>

              <div className="relative pl-4 border-l-2 border-pink-500/20 mb-4">
                <Quote className="absolute -top-1 -left-3 h-5 w-5 text-pink-400/30 bg-white dark:bg-dark-900 p-0.5" />
                <p className="text-sm text-slate-500 dark:text-purple-200/60 italic leading-relaxed">{story.quote}</p>
              </div>

              <p className="text-xs text-slate-300 dark:text-purple-300/40 leading-relaxed">{story.story}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="glass-card text-center border-pink-500/10 animate-fade-in-up delay-500" style={{opacity:0}}>
          <Heart className="h-10 w-10 text-pink-400/60 mx-auto mb-3 animate-heartbeat" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Write Your Own Love Story</h2>
          <p className="text-sm text-slate-300 dark:text-purple-300/40 mb-5 max-w-md mx-auto">
            Join millions who found their life partner. Your story could be next.
          </p>
          <Link href="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            Start Free Today <Heart className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
