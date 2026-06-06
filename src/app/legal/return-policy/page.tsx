'use client';

import { useEffect } from 'react';

export default function ReturnPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Return Policy</h1>
          <p className="text-lg opacity-90">Last updated: June 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl space-y-8">
          
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Return Window</h2>
            <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg border border-purple-500 mb-6">
              <p className="text-white text-lg">
                <span className="font-bold">We offer refund / exchange within first <span className="text-pink-400">1 day</span> from the date of your purchase.</span>
              </p>
              <p className="text-slate-200 mt-3">
                If 1 day has passed since your purchase, you will not be offered a return, exchange or refund of any kind.
              </p>
            </div>
          </section>

          {/* Eligibility Requirements */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Eligibility Requirements</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              In order to become eligible for a return or an exchange, the following conditions must be met:
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 bg-slate-700 p-4 rounded-lg">
                <div className="bg-purple-600 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Unused Condition</h3>
                  <p className="text-slate-300">
                    The purchased item should be unused and in the same condition as you received it.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-slate-700 p-4 rounded-lg">
                <div className="bg-purple-600 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Original Packaging</h3>
                  <p className="text-slate-300">
                    The item must have original packaging intact.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-slate-700 p-4 rounded-lg">
                <div className="bg-purple-600 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Sale Items</h3>
                  <p className="text-slate-300">
                    If the item that you purchased is on a sale, then the item may not be eligible for a return / exchange.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Exchange Process */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Exchange & Replacement</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Only such items are replaced by us (based on an exchange request), if such items are found defective or damaged.
            </p>
            <div className="bg-slate-700 p-6 rounded-lg">
              <h3 className="text-pink-400 font-semibold mb-3">Exchange Process:</h3>
              <ol className="space-y-3 text-slate-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 font-bold">Step 1:</span>
                  <span>Initiate return or exchange request through our platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 font-bold">Step 2:</span>
                  <span>Ship the item back to us with original packaging</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 font-bold">Step 3:</span>
                  <span>We receive and inspect your returned product</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 font-bold">Step 4:</span>
                  <span>Receive email notification about receipt confirmation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3 font-bold">Step 5:</span>
                  <span>If approved after quality check, we process your request</span>
                </li>
              </ol>
            </div>
          </section>

          {/* Exemptions */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Return Exemptions</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              There may be a certain category of products / items that are exempted from returns or refunds. Such categories of the products would be identified to you at the time of purchase.
            </p>
            <div className="bg-red-900 border-l-4 border-red-400 p-4 rounded-lg">
              <p className="text-slate-200">
                Please check the product details page carefully during checkout to identify any return exemptions that may apply to your purchase.
              </p>
            </div>
          </section>

          {/* Inspection & Processing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Quality Check & Processing</h2>
            <div className="bg-slate-700 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="text-pink-400 font-semibold mb-2">🔍 Upon Return Receipt</h3>
                <p className="text-slate-300">
                  Once your returned product / item is received and inspected by us, we will send you an email to notify you about receipt of the returned / exchanged product.
                </p>
              </div>
              <div>
                <h3 className="text-pink-400 font-semibold mb-2">✅ Quality Check</h3>
                <p className="text-slate-300">
                  If the same has been approved after the quality check at our end, your request (i.e. return / exchange) will be processed in accordance with our policies.
                </p>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <div className="bg-blue-900 border-l-4 border-blue-400 p-6 rounded-lg space-y-3">
            <p className="text-white font-bold text-lg">💡 Important Tips</p>
            <ul className="space-y-2 text-slate-200">
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-bold">→</span>
                <span>Return requests must be made within 1 day of purchase</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-bold">→</span>
                <span>Keep all original packaging, tags, and documentation</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-bold">→</span>
                <span>Items must not show any signs of use or wear</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-bold">→</span>
                <span>Sale items may not be returnable - check product page</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-bold">→</span>
                <span>{`We'll`} notify you via email at each stage of the process</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Have Questions?</h2>
            <div className="bg-slate-700 p-6 rounded-lg space-y-3">
              <div>
                <p className="text-pink-400 font-semibold">Customer Support</p>
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
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
