import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft } from 'react-icons/fa/index.esm.js';

const CookiesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="Mentneo" className="h-8 w-auto mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mentneo</span>
              </Link>
            </div>
            <Link to="/" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cookie Policy</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What Are Cookies</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners. These cookies may be stored on your device temporarily (session cookies) or for a longer period (persistent cookies).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Cookies</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                At Mentneo, we use cookies for several purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li className="mb-2"><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly and cannot be turned off in our systems. They are usually set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.</li>
                <li className="mb-2"><strong>Analytical/Performance Cookies:</strong> These cookies allow us to recognize and count the number of visitors and to see how visitors move around our website. This helps us to improve the way our website works, for example, by ensuring that users are finding what they are looking for easily.</li>
                <li className="mb-2"><strong>Functionality Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</li>
                <li className="mb-2"><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Third-Party Cookies</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on. These third parties may include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li className="mb-2">Google Analytics</li>
                <li className="mb-2">Facebook</li>
                <li className="mb-2">Payment processors</li>
                <li className="mb-2">Other advertising networks</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Managing Your Cookies</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, or to alert you when cookies are being sent. The Help function within your browser should tell you how.
              </p>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Please note that if you disable cookies, some features of Mentneo may not function correctly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Changes to This Cookie Policy</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date at the top of this page.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                You are advised to review this Cookie Policy periodically for any changes. Changes to this Cookie Policy are effective when they are posted on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have any questions about this Cookie Policy, please contact us at:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li className="mb-2">Email: support@mentneo.com</li>
                <li className="mb-2">
                  <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Contact Form
                  </Link>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-12 flex justify-center">
            <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <FaHome className="mr-2" />
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Mentneo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CookiesPage;
