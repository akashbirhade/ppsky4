'use client';

import { useEffect } from 'react';

export default function RefundCancellationPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Refund & Cancellation Policy</h1>
          <p className="text-lg opacity-90">Last updated: June 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 leading-relaxed">
              This refund and cancellation policy outlines how you can cancel or seek a refund for a product / service that you have purchased through the Platform under the following terms:
            </p>
          </section>

          {/* Point 1 */}
          <section>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">Cancellation Window</h3>
                <p className="text-slate-300 leading-relaxed">
                  Cancellations will only be considered if the request is made within <span className="font-semibold text-pink-400">1 day</span> of placing the order. However, cancellation requests may not be entertained if the orders have been communicated to such sellers / merchant(s) listed on the Platform and they have initiated the process of shipping them, or the product is out for delivery. In such an event, you may choose to reject the product at the doorstep.
                </p>
              </div>
            </div>
          </section>

          {/* Point 2 */}
          <section>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">Perishable Items</h3>
                <p className="text-slate-300 leading-relaxed">
                  <span className="font-semibold">8459210421</span> does not accept cancellation requests for perishable items like flowers, eatables, etc. However, the refund / replacement can be made if the user establishes that the quality of the product delivered is not good.
                </p>
              </div>
            </div>
          </section>

          {/* Point 3 */}
          <section>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">Damaged or Defective Items</h3>
                <p className="text-slate-300 leading-relaxed mb-3">
                  In case of receipt of damaged or defective items, please report to our customer service team. The request would be entertained once the seller/ merchant listed on the Platform, has checked and determined the same at its own end.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  <span className="font-semibold text-pink-400">⏰ Timeline:</span> This should be reported within <span className="font-semibold">1 day</span> of receipt of products.
                </p>
              </div>
            </div>
          </section>

          {/* Point 4 */}
          <section>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">Product Quality Issues</h3>
                <p className="text-slate-300 leading-relaxed mb-3">
                  In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <span className="font-semibold">1 day</span> of receiving the product.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  The customer service team after looking into your complaint will take an appropriate decision.
                </p>
              </div>
            </div>
          </section>

          {/* Point 5 */}
          <section>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">5</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">Warranty Claims</h3>
                <p className="text-slate-300 leading-relaxed">
                  In case of complaints regarding the products that come with a warranty from the manufacturers, please refer the issue to them directly.
                </p>
              </div>
            </div>
          </section>

          {/* Point 6 */}
          <section>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">6</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">Refund Processing</h3>
                <p className="text-slate-300 leading-relaxed">
                  In case of any refunds approved by <span className="font-semibold">8459210421</span>, it will take <span className="font-semibold text-pink-400">1 day</span> for the refund to be processed to your account.
                </p>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <div className="bg-yellow-900 border-l-4 border-yellow-400 p-6 rounded-lg space-y-3">
            <p className="text-white font-bold text-lg">📋 Important Reminders</p>
            <ul className="space-y-2 text-slate-200">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 font-bold">→</span>
                <span>Always report issues within 1 day of receiving the product</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 font-bold">→</span>
                <span>Keep all original packaging and documentation</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 font-bold">→</span>
                <span>Contact our customer service team immediately for issues</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 font-bold">→</span>
                <span>Provide clear photos/evidence of damaged items if applicable</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
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
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
