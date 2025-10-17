import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa/index.esm.js';

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
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
                  At Mentneo, we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your personal information when you use our platform.
                </p>

                <div className="space-y-8">
                  {/* Section 1 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>We collect the following types of information:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Personal Information:</strong> Name, email address, phone number, and other contact details provided during registration.</li>
                        <li><strong>Profile Information:</strong> Educational background, skills, interests, and professional experience that you choose to share.</li>
                        <li><strong>Usage Data:</strong> Information about how you interact with our platform, including courses accessed, quizzes completed, and time spent on various activities.</li>
                        <li><strong>Payment Information:</strong> Details necessary to process payments for courses and services.</li>
                        <li><strong>Video Content:</strong> Recordings of review sessions, feedback videos, and other educational content.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 2 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>We use your information for the following purposes:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>To create and manage your account</li>
                        <li>To provide access to courses, resources, and learning materials</li>
                        <li>To process payments and manage subscriptions</li>
                        <li>To communicate with you about your courses, assignments, and platform updates</li>
                        <li>To improve our services and develop new features</li>
                        <li>To personalize your learning experience</li>
                        <li>To analyze usage patterns and optimize platform performance</li>
                        <li>For marketing and promotional purposes (with your consent)</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 3 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Data Sharing and Disclosure</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>We may share your information with:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><strong>Service Providers:</strong> Third-party companies that perform services on our behalf, such as payment processing, data analysis, and hosting services.</li>
                        <li><strong>Mentors and Instructors:</strong> To facilitate the learning process and provide personalized feedback.</li>
                        <li><strong>Other Students:</strong> Limited profile information may be visible to other students in shared courses or discussion forums.</li>
                        <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights, privacy, safety, or property.</li>
                      </ul>
                      <p>We do not sell your personal information to third parties.</p>
                    </div>
                  </section>

                  {/* Section 4 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Security</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Encryption of sensitive data</li>
                        <li>Regular security assessments</li>
                        <li>Access controls and authentication procedures</li>
                        <li>Secure data storage practices</li>
                      </ul>
                      <p>While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
                    </div>
                  </section>

                  {/* Section 5 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Your Rights and Choices</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>You have the right to:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Access, correct, or delete your personal information</li>
                        <li>Object to the processing of your information</li>
                        <li>Restrict certain types of processing</li>
                        <li>Request a copy of your data in a portable format</li>
                        <li>Opt-out of marketing communications</li>
                      </ul>
                      <p>To exercise these rights, please contact us at official@mentlearn.in.</p>
                    </div>
                  </section>

                  {/* Section 6 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Cookies and Tracking Technologies</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Remember your preferences and settings</li>
                        <li>Understand how you use our platform</li>
                        <li>Improve the performance and functionality of our services</li>
                        <li>Provide personalized content and recommendations</li>
                      </ul>
                      <p>You can manage your cookie preferences through your browser settings.</p>
                    </div>
                  </section>

                  {/* Section 7 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Children's Privacy</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
                    </div>
                  </section>

                  {/* Section 8 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Changes to This Privacy Policy</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our platform or by sending you a notification. You are advised to review this Privacy Policy periodically for any changes.</p>
                    </div>
                  </section>

                  {/* Section 9 */}
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">9. Contact Us</h2>
                    <div className="ml-6 text-gray-600 dark:text-gray-300 space-y-2">
                      <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:</p>
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

export default PrivacyPolicy;
