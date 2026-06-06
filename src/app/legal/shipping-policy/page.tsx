'use client';

import { useEffect } from 'react';

export default function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Policy</h1>
          <p className="text-lg opacity-90">Last updated: June 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl space-y-8">
          
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Shipping Overview</h2>
            <p className="text-slate-300 leading-relaxed">
              The orders for the user are shipped through registered domestic courier companies and/or speed post only. This policy outlines our shipping practices, timelines, and important information you need to know about your orders.
            </p>
          </section>

          {/* Shipping Timeline */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Shipping Timeline</h2>
            <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg border border-purple-500 mb-6">
              <p className="text-slate-100 text-lg mb-3">
                <span className="font-bold text-pink-300">Orders are shipped within <span className="text-pink-200">1 day</span> from the date of the order and/or payment</span>
              </p>
              <p className="text-slate-200">
                Or as per the delivery date agreed at the time of order confirmation and delivering of the shipment, subject to courier company / post office norms.
              </p>
            </div>
          </section>

          {/* Delivery Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Delivery Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 bg-slate-700 p-4 rounded-lg">
                <div className="text-pink-400 text-2xl flex-shrink-0">📦</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Delivery Address</h3>
                  <p className="text-slate-300">
                    Delivery of all orders will be made to the address provided by the buyer at the time of purchase.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-slate-700 p-4 rounded-lg">
                <div className="text-pink-400 text-2xl flex-shrink-0">📧</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Delivery Confirmation</h3>
                  <p className="text-slate-300">
                    Delivery of our services will be confirmed on your email ID as specified at the time of registration.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-slate-700 p-4 rounded-lg">
                <div className="text-pink-400 text-2xl flex-shrink-0">🚚</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Courier Partners</h3>
                  <p className="text-slate-300">
                    We work with registered domestic courier companies and/or speed post services to ensure reliable delivery.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Costs */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Shipping Costs</h2>
            <div className="bg-red-900 border-l-4 border-red-400 p-6 rounded-lg">
              <p className="text-slate-200 mb-3">
                <span className="font-semibold">If there are any shipping cost(s) levied by the seller or the Platform Owner (as the case be), the same is NOT REFUNDABLE.</span>
              </p>
              <p className="text-slate-300 text-sm">
                Please review the total cost breakdown at checkout, which will include any applicable shipping charges.
              </p>
            </div>
          </section>

          {/* Delay Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Delivery Delays</h2>
            <div className="bg-yellow-900 border-l-4 border-yellow-400 p-6 rounded-lg">
              <p className="text-slate-200 mb-3">
                <span className="font-semibold">Platform Owner shall not be liable for any delay in delivery by the courier company / postal authority.</span>
              </p>
              <p className="text-slate-300 text-sm">
                Delivery timelines are estimates and depend on courier company performance and postal authority operations. We recommend tracking your shipment using the provided tracking number for real-time updates.
              </p>
            </div>
          </section>

          {/* Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Order Tracking</h2>
            <div className="bg-slate-700 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <h3 className="text-pink-400 font-semibold mb-2">📍 How to Track Your Order</h3>
                  <ol className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2 font-bold">1.</span>
                      <span>Check your order confirmation email for tracking details</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2 font-bold">2.</span>
                      <span>Use the tracking number provided by your courier</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2 font-bold">3.</span>
                      <span>Visit the {`courier's`} website for real-time delivery status</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2 font-bold">4.</span>
                      <span>Contact our support team if you have tracking concerns</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Special Circumstances */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Special Circumstances</h2>
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="text-pink-400 font-semibold mb-2">📋 Holidays & Weekends</h3>
                <p className="text-slate-300 text-sm">
                  Shipping timelines are business days and may be extended during public holidays, weekends, or courier company holidays.
                </p>
              </div>
              
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="text-pink-400 font-semibold mb-2">🌍 Geographic Coverage</h3>
                <p className="text-slate-300 text-sm">
                  We ship to all locations within India. Remote or hard-to-reach areas may experience longer delivery times.
                </p>
              </div>
              
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="text-pink-400 font-semibold mb-2">⚠️ Damaged in Transit</h3>
                <p className="text-slate-300 text-sm">
                  If your package arrives damaged, please report it to our customer service within 1 day with photographic evidence.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Tips for Smooth Delivery</h2>
            <div className="bg-blue-900 border-l-4 border-blue-400 p-6 rounded-lg space-y-3">
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  <span>Ensure delivery address is accurate and complete at checkout</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  <span>Keep your phone number updated for delivery coordination</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  <span>Be available to receive your order or arrange someone to receive it</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  <span>Inspect package condition upon receipt before accepting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  <span>Track your shipment regularly for updates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  <span>Report any issues immediately to customer support</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Shipping Support</h2>
            <div className="bg-slate-700 p-6 rounded-lg space-y-3">
              <div>
                <p className="text-pink-400 font-semibold">Customer Service</p>
                <p className="text-slate-300">8459210421</p>
              </div>
              <div>
                <p className="text-pink-400 font-semibold">Address</p>
                <p className="text-slate-300">Farshi road, Amalner, Jalgaon, India</p>
              </div>
              <div>
                <p className="text-pink-400 font-semibold">Business Hours</p>
                <p className="text-slate-300">Monday - Friday (9:00 AM - 6:00 PM)</p>
              </div>
              <div>
                <p className="text-pink-400 font-semibold">Email Support</p>
                <p className="text-slate-300">Available through our {`platform's`} contact form</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
