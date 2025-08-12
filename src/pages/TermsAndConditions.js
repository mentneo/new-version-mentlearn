import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-blue-600 dark:text-blue-400 mr-6">
              <FaArrowLeft className="mr-2" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms and Conditions</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-8">
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Last Updated: August 13, 2025
                </p>

                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Please read these Terms and Conditions carefully before using the Mentneo platform. By accessing or using our service, you agree to be bound by these terms.
                </p>

                <div className="space-y-8">
                  {/* Section 1 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Services Provided</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>Mentneo offers online educational services, including but not limited to:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Access to training materials, courses, and learning resources.</li>
                        <li>Review and feedback videos created by mentors.</li>
                        <li>Networking and mentorship opportunities.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 2 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Review Videos</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Review videos may be recorded for the purpose of providing feedback, guidance, or educational content.</li>
                        <li>By participating in sessions, you grant Mentneo the right to record, store, and distribute these videos as part of the learning process.</li>
                        <li>Mentneo may use parts of your review videos in promotional content, including social media, marketing campaigns, and advertisements.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 3 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Collection and Use of Personal Data</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>We collect personal information such as name, email, contact details, and other relevant data during registration and usage.</p>
                      <p>This data may be used for:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Account creation and management</li>
                        <li>Payment processing</li>
                        <li>Service improvements</li>
                        <li>Marketing and promotional purposes (with consent where required)</li>
                      </ul>
                      <p>Your data will be handled according to our <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>.</p>
                    </div>
                  </section>

                  {/* Section 4 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Payments and Refunds</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <ul className="list-disc ml-6 space-y-1">
                        <li>All fees are due at the time of registration.</li>
                        <li>Payments are non-refundable once registration is complete, regardless of whether you choose to use the service thereafter.</li>
                        <li>Mentneo reserves the right to change pricing at any time, but changes will not affect already completed transactions.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 5 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. User Responsibilities</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <ul className="list-disc ml-6 space-y-1">
                        <li>You agree not to misuse the platform for illegal or unauthorized purposes.</li>
                        <li>You are responsible for ensuring your account details remain secure.</li>
                        <li>Sharing copyrighted course material without permission is strictly prohibited.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 6 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Intellectual Property</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <ul className="list-disc ml-6 space-y-1">
                        <li>All course materials, videos, and resources provided on the platform remain the property of Mentneo and/or its content creators.</li>
                        <li>You may not reproduce, distribute, or modify any content without prior written consent.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 7 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Liability Disclaimer</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>Mentneo is not responsible for any losses, damages, or disruptions caused by:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Technical issues</li>
                        <li>Third-party service providers</li>
                        <li>Actions of other users</li>
                      </ul>
                      <p>Educational outcomes are not guaranteed.</p>
                    </div>
                  </section>

                  {/* Section 8 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Termination of Services</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>Mentneo reserves the right to suspend or terminate accounts that violate these Terms and Conditions without prior notice.</p>
                    </div>
                  </section>

                  {/* Section 9 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">9. Changes to Terms</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>We may update these Terms and Conditions at any time. Continued use of the platform after changes indicates your acceptance of the updated terms.</p>
                    </div>
                  </section>

                  {/* Section 10 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">10. Contact Information</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>For questions or concerns, please contact us at:</p>
                      <p className="flex items-center">
                        <span role="img" aria-label="Email" className="mr-2">📧</span>
                        <a href="mailto:official@mentlearn.in" className="text-blue-600 dark:text-blue-400 hover:underline">official@mentlearn.in</a>
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              © {new Date().getFullYear()} Mentneo. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link to="/privacy" className="text-gray-600 dark:text-gray-300 text-sm hover:text-blue-600 dark:hover:text-blue-400">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-600 dark:text-gray-300 text-sm hover:text-blue-600 dark:hover:text-blue-400">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
