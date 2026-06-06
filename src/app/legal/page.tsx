'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function LegalHub() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const policies = [
    {
      title: 'Terms & Conditions',
      description: 'Read our comprehensive terms of service and user agreement',
      icon: '📋',
      href: '/legal/terms-and-conditions',
      color: 'from-purple-600 to-purple-900'
    },
    {
      title: 'Privacy Policy',
      description: 'Learn how we collect, use, and protect your personal data',
      icon: '🔐',
      href: '/legal/privacy-policy',
      color: 'from-pink-600 to-pink-900'
    },
    {
      title: 'Refund & Cancellation',
      description: 'Understand our refund and cancellation procedures',
      icon: '💰',
      href: '/legal/refund-cancellation',
      color: 'from-blue-600 to-blue-900'
    },
    {
      title: 'Return Policy',
      description: 'View details about product returns and exchanges',
      icon: '🔄',
      href: '/legal/return-policy',
      color: 'from-green-600 to-green-900'
    },
    {
      title: 'Shipping Policy',
      description: 'Learn about our shipping processes and timelines',
      icon: '🚚',
      href: '/legal/shipping-policy',
      color: 'from-yellow-600 to-yellow-900'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Legal & Policies</h1>
          <p className="text-xl opacity-90">Important information about Soulmate Sync Terms, Privacy, and Policies</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* Introduction */}
        <div className="bg-slate-800 rounded-xl p-8 mb-12 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Our Legal Center</h2>
          <p className="text-slate-300 leading-relaxed">
            At Soulmate Sync, we believe in transparency and protecting our users&apos; interests. This page provides access to all our important policies and legal documents. Please take time to read through these documents to understand your rights and responsibilities as a user of our platform.
          </p>
        </div>

        {/* Policies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {policies.map((policy, index) => (
            <Link href={policy.href} key={index}>
              <div className={`bg-gradient-to-br ${policy.color} rounded-xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer h-full`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{policy.icon}</div>
                  <div className="text-white opacity-20">→</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{policy.title}</h3>
                <p className="text-white opacity-90 leading-relaxed">{policy.description}</p>
                <div className="mt-6 pt-4 border-t border-white border-opacity-20">
                  <p className="text-white font-semibold text-sm">Read More →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Company Info */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Company Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-pink-400 font-semibold mb-2">Business Name</h3>
              <p className="text-slate-300">8459210421</p>
            </div>
            <div>
              <h3 className="text-pink-400 font-semibold mb-2">Registered Address</h3>
              <p className="text-slate-300">Farshi road, Amalner, Jalgaon, India</p>
            </div>
            <div>
              <h3 className="text-pink-400 font-semibold mb-2">Contact Hours</h3>
              <p className="text-slate-300">Monday - Friday (9:00 AM - 6:00 PM)</p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            Last Updated: June 2026 | All policies are effective immediately upon acceptance
          </p>
        </div>
      </div>
    </div>
  );
}
