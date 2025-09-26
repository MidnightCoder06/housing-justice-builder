import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-center mb-8">Terms and Conditions</h1>
            
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <p className="text-gray-600 mb-8">
                <strong>Effective Date:</strong> September 16, 2025
              </p>
              
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. INTRODUCTION AND ACCEPTANCE OF TERMS</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to Equity Works ("we," "us," or "our"). Equity Works is a web-based platform designed to expedite the eviction notice process by offering document automation and compliance tools for landlords, property managers, and attorneys. By accessing or using our website, platform, or services (collectively, the "Services"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms, you must not use our Services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. NOT A LAW FIRM / NO LEGAL ADVICE</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Equity Works is not a law firm and does not engage in the practice of law. We do not offer legal representation or legal advice of any kind. The materials, templates, or content provided through our Services are for informational and operational use only and are not a substitute for the advice or services of an attorney licensed in your jurisdiction.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    While we strive for accuracy and reliability, we make no warranties or guarantees as to the legal sufficiency, accuracy, or compliance of any notice or document generated using our platform. Use of our Services does not create any attorney-client relationship. You are solely responsible for ensuring that any document used complies with applicable laws and court rules.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. NO GUARANTEES / DISCLAIMER</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We do not warrant or guarantee the outcome of any legal proceeding. We are not responsible for the results of any eviction or related court action. Your use of our platform is at your own risk.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. LIMITATION OF LIABILITY</h2>
                  <p className="text-gray-700 leading-relaxed">
                    To the maximum extent permitted by law, our liability to you is limited to damages arising solely from our gross negligence or willful misconduct. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, legal fees, or court outcomes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. PAYMENT TERMS</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Basic Plan:</strong> Monthly billing. Includes 1–5 eviction notice checks/drafting per month.</li>
                    <li><strong>Advanced Plan:</strong> Billed every three (3) months. Includes up to 15 notice checks/drafting per month.</li>
                    <li><strong>Premium Plan:</strong> Annual billing. Includes unlimited notice checks/drafting per month.</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    You agree to pay all fees associated with your selected plan in accordance with the billing cycle. Failure to pay may result in suspension or termination of access.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. CANCELLATION POLICY</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Bronze Tier (Basic):</strong> Requires at least thirty (30) days' written notice prior to cancellation.</li>
                    <li><strong>Silver Tier (Advanced):</strong> Requires at least ninety (90) days' written notice.</li>
                    <li><strong>Gold Tier (Premium):</strong> Must provide cancellation notice at least six (6) months in advance.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. GOVERNING LAW</h2>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to conflict of laws principles.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. DISPUTE RESOLUTION / ARBITRATION</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Any dispute or claim arising out of or relating to these Terms or your use of our Services shall be resolved exclusively through binding arbitration administered by JAMS or the American Arbitration Association (AAA), in accordance with their respective rules.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. ATTORNEYS' FEES</h2>
                  <p className="text-gray-700 leading-relaxed">
                    In the event of any dispute, arbitration, or legal proceeding, each party shall bear its own attorneys' fees and costs, regardless of the outcome.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. AMENDMENTS TO TERMS</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify or update these Terms at any time in our sole discretion. Changes will become effective upon posting to our website. You are encouraged to review these Terms periodically. Continued use of our Services constitutes acceptance of any changes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. SEVERABILITY</h2>
                  <p className="text-gray-700 leading-relaxed">
                    If any provision of these Terms is found to be invalid, unlawful, or unenforceable, that provision shall be severed from the remaining provisions, which shall remain in full force and effect.
                  </p>
                </section>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Contact Information:</strong><br />
                    <strong>Email:</strong> hello@equityworks.tech
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
