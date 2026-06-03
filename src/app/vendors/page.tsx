'use client'

import { useState } from 'react'
import { Store, Star, MapPin, Phone, Filter, Search, Crown, Camera, Music, Palette, Utensils, Gift, Gem, Flower, Building } from 'lucide-react'
import HalfHeart from '@/components/HalfHeart'

interface Vendor {
  id: string
  name: string
  category: string
  rating: number
  reviews: number
  price: string
  city: string
  image: string
  verified: boolean
  premium: boolean
  description: string
  tags: string[]
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Store },
  { id: 'venue', label: 'Venues', icon: Building },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'catering', label: 'Catering', icon: Utensils },
  { id: 'decoration', label: 'Decoration', icon: Flower },
  { id: 'music', label: 'Music & DJ', icon: Music },
  { id: 'makeup', label: 'Makeup', icon: Palette },
  { id: 'jewelry', label: 'Jewelry', icon: Gem },
  { id: 'invitation', label: 'Invitations', icon: Gift },
]

const VENDORS: Vendor[] = [
  {
    id: '1', name: 'Royal Palace Banquets', category: 'venue',
    rating: 4.8, reviews: 234, price: '₹5-15L', city: 'Mumbai',
    image: '🏰', verified: true, premium: true,
    description: 'Luxury banquet hall with 5-star amenities, can host 500-2000 guests',
    tags: ['Large Events', 'Valet Parking', 'In-house Catering']
  },
  {
    id: '2', name: 'Candid Click Studios', category: 'photography',
    rating: 4.9, reviews: 189, price: '₹1-3L', city: 'Delhi',
    image: '📸', verified: true, premium: true,
    description: 'Award-winning candid photography team, drone shots, same-day edits',
    tags: ['Candid', 'Pre-wedding', 'Cinematic']
  },
  {
    id: '3', name: 'Spice Garden Caterers', category: 'catering',
    rating: 4.7, reviews: 312, price: '₹800-1500/plate', city: 'Bangalore',
    image: '🍽️', verified: true, premium: false,
    description: 'Multi-cuisine catering with live counters, 15+ years experience',
    tags: ['Veg & Non-Veg', 'Live Counters', 'Custom Menu']
  },
  {
    id: '4', name: 'Floral Fantasy', category: 'decoration',
    rating: 4.6, reviews: 98, price: '₹2-8L', city: 'Pune',
    image: '🌸', verified: true, premium: false,
    description: 'Themed decorations, mandap design, flower walls, entrance arches',
    tags: ['Themed', 'Flower Walls', 'LED']
  },
  {
    id: '5', name: 'DJ Beats Entertainment', category: 'music',
    rating: 4.5, reviews: 156, price: '₹50K-2L', city: 'Ahmedabad',
    image: '🎵', verified: false, premium: false,
    description: 'Professional DJ + live band for sangeet, cocktail & reception',
    tags: ['Bollywood', 'Live Band', 'Sangeet Special']
  },
  {
    id: '6', name: 'Glow Up by Priya', category: 'makeup',
    rating: 4.9, reviews: 423, price: '₹30K-1.5L', city: 'Mumbai',
    image: '💄', verified: true, premium: true,
    description: 'Celebrity makeup artist, bridal & family packages, airbrush specialist',
    tags: ['Airbrush', 'HD Makeup', 'Bridal Package']
  },
  {
    id: '7', name: 'Kundan House Jewellers', category: 'jewelry',
    rating: 4.7, reviews: 87, price: '₹2-50L', city: 'Jaipur',
    image: '💎', verified: true, premium: true,
    description: 'Heritage kundan & polki jewelry, custom bridal sets, rent available',
    tags: ['Kundan', 'Polki', 'Rental']
  },
  {
    id: '8', name: 'PaperCraft Invites', category: 'invitation',
    rating: 4.4, reviews: 64, price: '₹50-500/card', city: 'Chennai',
    image: '💌', verified: false, premium: false,
    description: 'Designer wedding cards, digital invites, video invitations',
    tags: ['Digital', 'Laser Cut', 'Video']
  },
  {
    id: '9', name: 'Grand Celebration Venue', category: 'venue',
    rating: 4.6, reviews: 178, price: '₹3-10L', city: 'Hyderabad',
    image: '🏛️', verified: true, premium: false,
    description: 'Open-air & indoor options, poolside ceremonies, up to 1000 guests',
    tags: ['Outdoor', 'Poolside', 'Parking']
  },
]

export default function VendorsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showContact, setShowContact] = useState<string | null>(null)

  const filtered = VENDORS.filter(v => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false
    if (searchQuery && !v.name.toLowerCase().includes(searchQuery.toLowerCase()) && !v.city.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
            <Store className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-amber-300">Wedding Planning Made Easy</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">Wedding Marketplace</h1>
          <p className="text-slate-500 dark:text-purple-200/50 max-w-lg mx-auto">Find trusted vendors for your dream wedding — venues, photography, catering & more</p>
        </div>

        {/* Search */}
        <div className="glass-card !p-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-slate-300 dark:text-purple-300/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vendors by name or city..."
              className="flex-1 bg-transparent text-slate-800 dark:text-white text-sm placeholder-purple-300/30 focus:outline-none"
            />
            <button className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-purple-600/30 text-slate-800 dark:text-white border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.2)]'
                  : 'bg-white/[0.02] text-slate-500 dark:text-purple-200/60 border-teal-100 dark:border-purple-500/10 hover:bg-white/[0.05]'
              }`}
            >
              <cat.icon className="h-3.5 w-3.5" /> {cat.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-purple-200/50">{filtered.length} vendors found</p>
          <select className="text-xs bg-white/5 text-slate-500 dark:text-purple-200/60 border border-teal-100 dark:border-purple-500/10 rounded-lg px-3 py-1.5 focus:outline-none">
            <option>Sort by Rating</option>
            <option>Sort by Price (Low)</option>
            <option>Sort by Price (High)</option>
            <option>Sort by Reviews</option>
          </select>
        </div>

        {/* Vendor Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vendor, i) => (
            <div key={vendor.id} className="glass-card !p-0 overflow-hidden group hover:border-teal-200/50 dark:border-purple-400/30 transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              {/* Header */}
              <div className="h-32 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-pink-500/10 flex items-center justify-center relative">
                <span className="text-5xl">{vendor.image}</span>
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {vendor.verified && (
                    <span className="bg-blue-500/80 backdrop-blur-sm text-slate-800 dark:text-white px-2 py-0.5 rounded-lg text-[9px] font-semibold">✓ Verified</span>
                  )}
                  {vendor.premium && (
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-2 py-0.5 rounded-lg text-[9px] font-bold">★ Featured</span>
                  )}
                </div>
                {/* Price */}
                <div className="absolute bottom-3 right-3 bg-white dark:bg-dark-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-teal-200/50 dark:border-purple-500/20">
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-white">{vendor.price}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-slate-700 dark:text-purple-200 transition-colors">{vendor.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-amber-300 font-medium">{vendor.rating}</span>
                    <span className="text-[10px] text-slate-300 dark:text-purple-300/40">({vendor.reviews})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-purple-200/50 mb-2">
                  <MapPin className="h-3 w-3" /> {vendor.city}
                </div>

                <p className="text-xs text-purple-200/40 mb-3 line-clamp-2">{vendor.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {vendor.tags.map(tag => (
                    <span key={tag} className="text-[9px] bg-teal-50 dark:bg-purple-500/10 text-slate-600 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/15">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setShowContact(showContact === vendor.id ? null : vendor.id)}
                    className="flex-1 py-2 text-xs font-medium text-slate-800 dark:text-white bg-purple-600/40 rounded-xl border border-teal-200 dark:border-purple-500/30 hover:bg-purple-600/60 transition-all flex items-center justify-center gap-1.5">
                    <Phone className="h-3 w-3" /> Contact
                  </button>
                  <button className="py-2 px-3 text-xs text-slate-600 dark:text-purple-300 bg-white/5 rounded-xl border border-purple-400/10 hover:bg-white/10 transition-all">
                    <HalfHeart className="h-3.5 w-3.5" />
                  </button>
                </div>

                {showContact === vendor.id && (
                  <div className="mt-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20 animate-fade-in-up">
                    <p className="text-xs text-green-300 font-medium mb-1">Contact Details</p>
                    <p className="text-[11px] text-slate-500 dark:text-purple-200/60">📞 +91 98765 XXXXX</p>
                    <p className="text-[11px] text-slate-500 dark:text-purple-200/60">📧 contact@{vendor.name.toLowerCase().replace(/\s/g, '')}.com</p>
                    <p className="text-[9px] text-slate-300 dark:text-purple-300/30 mt-1">* Premium members see full contact details</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 glass-card p-8 text-center border-amber-500/20 animate-fade-in-up">
          <Store className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Are you a wedding vendor?</h3>
          <p className="text-sm text-slate-500 dark:text-purple-200/50 mb-5">List your business and reach thousands of couples planning their wedding</p>
          <button className="btn-gold text-sm py-2.5 px-6">Register as Vendor →</button>
        </div>
      </div>
    </div>
  )
}
