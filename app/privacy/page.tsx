import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
            
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <p className="text-gray-600 mb-8">
                <strong>Effective Date:</strong> September 18, 2025
              </p>
              
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. INTRODUCTION</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Equity Works ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information, including confidential tenant and legal data, in accordance with applicable state and federal laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. INFORMATION WE COLLECT</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We collect the following categories of personal and legal information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>User Information:</strong> Name, email address, phone number, billing and payment information.</li>
                    <li><strong>Eviction Notice Data:</strong> Tenant name(s), address, unit number, rent amount, notice date, type of notice (e.g., 3-day, 30-day), and reason for eviction.</li>
                    <li><strong>Legal Status Data:</strong> Eviction status, court filing information, or court results (if provided).</li>
                    <li><strong>Metadata:</strong> IP address, login timestamps, device type, browser, cookies.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. HOW WE USE YOUR INFORMATION</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use your data for the following purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>To generate and verify eviction notices using AI-based tools.</li>
                    <li>To ensure compliance with local and state eviction regulations.</li>
                    <li>To process billing and manage your account.</li>
                    <li>To improve our services and platform functionality.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. AI AND AUTOMATION POLICY</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our platform uses artificial intelligence (AI) to review and draft eviction notices. This process is subject to human quality control. While AI helps accelerate compliance review, it does not replace legal counsel. Our AI tools operate within the bounds of data privacy requirements and do not share data externally without authorization.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. DATA CONFIDENTIALITY AND LEGAL COMPLIANCE</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We adhere to all applicable laws, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>California Consumer Privacy Act (CCPA)</li>
                    <li>California Civil Code § 1798.81.5 (reasonable security practices)</li>
                    <li>Federal Trade Commission Act (Section 5 – prohibition against unfair/deceptive practices)</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    All sensitive legal and personal information is encrypted in transit and at rest. Access to this data is restricted to authorized personnel only.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. DATA SHARING AND THIRD PARTIES</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We do not sell or rent your personal data. We only share information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>With payment processors (e.g., Stripe, Square)</li>
                    <li>With cloud infrastructure providers (e.g., AWS, Azure)</li>
                    <li>When required by law, subpoena, or court order</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. YOUR RIGHTS AND CHOICES</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Access the personal data we hold about you</li>
                    <li>Correct or update your personal data</li>
                    <li>Request deletion of your data, subject to legal retention obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. DATA RETENTION</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We retain your data for as long as necessary to provide our Services and comply with legal obligations. Eviction-related documents may be retained for up to 3 years for audit and recordkeeping purposes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. CHANGES TO THIS POLICY</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this Privacy Policy periodically. Updates will be posted on our website with a revised "Effective Date." Your continued use of the platform after any changes constitutes acceptance of the revised policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. CONTACT US</h2>
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">
                      <strong>Email:</strong> hello@equityworks.tech
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
