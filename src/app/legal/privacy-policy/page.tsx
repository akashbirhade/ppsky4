'use client';

import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg opacity-90">Last updated: June 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              This Privacy Policy describes how <span className="font-semibold">8459210421</span> and its affiliates (collectively {`"8459210421, we, our, us"`}) collect, use, share, protect or otherwise process your information/ personal data through our website <span className="text-purple-400">https://ppsky4.vercel.app/</span> (hereinafter referred to as Platform).
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Please note that you may be able to browse certain sections of the Platform without registering with us. We do not offer any product/service under this Platform outside India and your personal data will primarily be stored and processed in India.
            </p>
            <p className="text-slate-300 leading-relaxed">
              By visiting this Platform, providing your information or availing any product/service offered on the Platform, you expressly agree to be bound by the terms and conditions of this Privacy Policy, the Terms of Use and the applicable service/product terms and conditions, and agree to be governed by the laws of India including but not limited to the laws applicable to data protection and privacy. If you do not agree please do not use or access our Platform.
            </p>
          </section>

          {/* Collection */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information Collection</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We collect your personal data when you use our Platform, services or otherwise interact with us during the course of our relationship and related information provided from time to time.
            </p>
            <div className="bg-slate-700 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-pink-400 mb-3">Types of Information Collected:</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  <span>Name, date of birth, address, telephone/mobile number, email ID</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  <span>Proof of identity or address documents</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  <span>Bank account or credit/debit card information (with consent)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  <span>Biometric information such as facial features (with consent)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  <span>Your behavior, preferences, and transaction information</span>
                </li>
              </ul>
            </div>
            <p className="text-slate-300 leading-relaxed">
              You always have the option to not provide information, by choosing not to use a particular service or feature on the Platform. This information is compiled and analysed on an aggregated basis. We will also collect your information related to your transactions on Platform and such third-party business partner platforms.
            </p>
          </section>

          {/* Usage */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information Usage</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We use personal data to provide the services you request. To the extent we use your personal data to market to you, we will provide you the ability to opt-out of such uses.
            </p>
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-pink-400 mb-3">We use your data for:</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">→</span>
                  <span>Assisting with handling and fulfilling orders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">→</span>
                  <span>Enhancing customer experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">→</span>
                  <span>Resolving disputes and troubleshooting problems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">→</span>
                  <span>Informing you about offers, products, and updates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">→</span>
                  <span>Customizing your experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">→</span>
                  <span>Detecting and preventing fraud and criminal activity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">→</span>
                  <span>Conducting marketing research and analysis</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information Sharing</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We may share your personal data internally within our group entities, our other corporate entities, and affiliates to provide you access to the services and products offered by them. These entities and affiliates may market to you as a result of such sharing unless you explicitly opt-out.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              We may disclose personal data to third parties such as sellers, business partners, third party service providers including logistics partners, prepaid payment instrument issuers, third-party reward programs and other payment methods opted by you.
            </p>
            <div className="bg-purple-900 border-l-4 border-purple-400 p-4 rounded-lg">
              <p className="text-slate-200">
                <span className="font-semibold text-white">⚠️ Important:</span> If you receive an email, a call from a person/association claiming to be 8459210421 seeking any personal data like debit/credit card PIN, net-banking or mobile banking password, <span className="font-bold">never provide such information</span>. If you have already revealed such information, report it immediately to an appropriate law enforcement agency.
              </p>
            </div>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Security Precautions</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              To protect your personal data from unauthorised access or disclosure, loss or misuse we adopt reasonable security practices and procedures. Once your information is in our possession or whenever you access your account information, we adhere to our security guidelines to protect it against unauthorised access and offer the use of a secure server.
            </p>
            <p className="text-slate-300 leading-relaxed">
              However, the transmission of information is not completely secure for reasons beyond our control. By using the Platform, the users accept the security implications of data transmission over the internet and the World Wide Web which cannot always be guaranteed as completely secure. Users are responsible for ensuring the protection of login and password records for their account.
            </p>
          </section>

          {/* Data Deletion */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Deletion and Retention</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              You have an option to delete your account by visiting your profile and settings on our Platform. This action would result in you losing all information related to your account. You may also write to us at the contact information provided below to assist you with these requests.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              We may in event of any pending grievance, claims, pending shipments or any other services refuse or delay deletion of the account. Once the account is deleted, you will lose access to the account.
            </p>
            <p className="text-slate-300 leading-relaxed">
              We retain your personal data information for a period no longer than is required for the purpose for which it was collected or as required under any applicable law. However, we may retain data related to you if we believe it may be necessary to prevent fraud or future abuse or for other legitimate purposes. We may continue to retain your data in anonymised form for analytical and research purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-slate-300 leading-relaxed">
              You may access, rectify, and update your personal data directly through the functionalities provided on the Platform.
            </p>
          </section>

          {/* Consent */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Consent</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              By visiting our Platform or by providing your information, you consent to the collection, use, storage, disclosure and otherwise processing of your information on the Platform in accordance with this Privacy Policy.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              You, while providing your personal data over the Platform or any partner platforms or establishments, consent to us (including our other corporate entities, affiliates, lending partners, technology partners, marketing channels, business partners and other third parties) to contact you through SMS, instant messaging apps, call and/or e-mail for the purposes specified in this Privacy Policy.
            </p>
            <p className="text-slate-300 leading-relaxed">
              You have an option to withdraw your consent that you have already provided by writing to the Grievance Officer at the contact information provided below. Please mention {`"Withdrawal of consent for processing personal data"`} in your subject line of your communication.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to this Privacy Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              Please check our Privacy Policy periodically for changes. We may update this Privacy Policy to reflect changes to our information practices. We may alert/notify you about the significant changes to the Privacy Policy, in the manner as may be required under applicable laws.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <div className="bg-slate-700 p-6 rounded-lg space-y-3">
              <div>
                <p className="text-pink-400 font-semibold">Grievance Officer</p>
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
