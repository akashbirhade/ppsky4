'use client';

import Link from 'next/link';
import { Heart, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 border-t border-purple-500/10 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Footer Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <div className="relative">
                <Heart className="h-6 w-6 text-pink-500 fill-pink-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg font-bold text-white">Soulmate Sync</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              Find your perfect life partner through intelligent matchmaking and real connections.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0" />
                <span>Amalner, Jalgaon, India</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-purple-400 flex-shrink-0" />
                <span>support@soulmatesync.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-purple-400 flex-shrink-0" />
                <span>8459210421</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-purple-400 transition-colors">Home</Link></li>
              <li><Link href="/search" className="hover:text-purple-400 transition-colors">Browse Profiles</Link></li>
              <li><Link href="/hosts" className="hover:text-purple-400 transition-colors">Become a Host</Link></li>
              <li><Link href="/premium" className="hover:text-purple-400 transition-colors">Premium Plans</Link></li>
              <li><Link href="/settings" className="hover:text-purple-400 transition-colors">Account Settings</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/messages" className="hover:text-purple-400 transition-colors">Messaging</Link></li>
              <li><Link href="/call" className="hover:text-purple-400 transition-colors">Video Calling</Link></li>
              <li><Link href="/kundali" className="hover:text-purple-400 transition-colors">Kundali Matching</Link></li>
              <li><Link href="/community" className="hover:text-purple-400 transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal & Policies</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal" className="hover:text-purple-400 transition-colors">Legal Center</Link></li>
              <li><Link href="/legal/terms-and-conditions" className="hover:text-purple-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/legal/privacy-policy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/refund-cancellation" className="hover:text-purple-400 transition-colors">Refund Policy</Link></li>
              <li><Link href="/legal/return-policy" className="hover:text-purple-400 transition-colors">Return Policy</Link></li>
              <li><Link href="/legal/shipping-policy" className="hover:text-purple-400 transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-400">
            <p>&copy; 2026 Soulmate Sync. All rights reserved.</p>
            <p className="mt-1">Company Registration: 8459210421</p>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link href="/legal/terms-and-conditions" className="text-slate-400 hover:text-purple-400 transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy-policy" className="text-slate-400 hover:text-purple-400 transition-colors">
              Privacy
            </Link>
            <Link href="/legal" className="text-slate-400 hover:text-purple-400 transition-colors">
              Legal Center
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">🔒 Secure</div>
              <div className="text-xs font-semibold text-purple-300">SSL Encrypted</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">✅ Verified</div>
              <div className="text-xs font-semibold text-purple-300">Registered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-slate-800/50 border-t border-slate-700 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-slate-400 text-center">
            ⚠️ <span className="font-semibold text-slate-300">Safety Alert:</span> Never share personal banking details, OTP, or passwords with anyone. Report suspicious activity immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
