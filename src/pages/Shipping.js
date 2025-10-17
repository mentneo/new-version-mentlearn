import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTruck, FaBox, FaGlobe, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa/index.esm.js';

export default function Shipping() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Shipping Policy</h1>
            <Link 
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <FaArrowLeft className="mr-2" /> Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Shipping Policy</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Last updated: September 10, 2025</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6 prose max-w-none">
              <p>
                While Mentneo primarily offers digital courses and online learning services, we occasionally provide physical learning materials, merchandise, or certificates to our students. This Shipping Policy outlines the terms and conditions regarding the shipping of these physical items.
              </p>
              
              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <FaTruck className="h-6 w-6 text-indigo-500 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900 m-0">Shipping Methods & Timeframes</h3>
                  </div>
                  <p className="text-gray-600">
                    We offer the following shipping options for physical items:
                  </p>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-500 text-xs font-medium mr-3 mt-0.5">1</span>
                      <div>
                        <p className="font-medium text-gray-900">Standard Shipping</p>
                        <p className="text-sm text-gray-500">Delivery within 5-7 business days (within India)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-500 text-xs font-medium mr-3 mt-0.5">2</span>
                      <div>
                        <p className="font-medium text-gray-900">Express Shipping</p>
                        <p className="text-sm text-gray-500">Delivery within 2-3 business days (within India)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-500 text-xs font-medium mr-3 mt-0.5">3</span>
                      <div>
                        <p className="font-medium text-gray-900">International Shipping</p>
                        <p className="text-sm text-gray-500">Delivery within 10-15 business days (international)</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <FaBox className="h-6 w-6 text-indigo-500 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900 m-0">Shipping Costs</h3>
                  </div>
                  <p className="text-gray-600">
                    Shipping costs are calculated based on:
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>Weight and dimensions of the package</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>Shipping destination</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>Selected shipping method</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-600">
                    The exact shipping cost will be calculated and displayed at checkout before payment is processed.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <FaGlobe className="h-6 w-6 text-indigo-500 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900 m-0">International Shipping</h3>
                  </div>
                  <p className="text-gray-600">
                    For international shipments:
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>Customs duties and taxes may apply</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>These additional fees are the responsibility of the recipient</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>Delivery times may vary based on customs processing</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-600">
                    We currently ship to most countries worldwide. If your country is not listed at checkout, please contact our support team.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <FaCalendarAlt className="h-6 w-6 text-indigo-500 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900 m-0">Order Processing</h3>
                  </div>
                  <p className="text-gray-600">
                    All orders are processed within the following timeframes:
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>Orders placed on weekdays before 2:00 PM IST are processed the same day</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>Orders placed after 2:00 PM IST or on weekends/holidays are processed the next business day</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-600">
                    Once your order is processed, you will receive a shipping confirmation email with tracking information.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                <div className="flex items-start">
                  <FaInfoCircle className="h-6 w-6 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Digital Items</h3>
                    <p className="mt-2 text-gray-600">
                      Please note that digital products (online courses, e-books, digital certificates, etc.) are delivered instantly or within 24 hours via email or through your account dashboard. These items are not subject to shipping policies or costs.
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 className="mt-8">Tracking Your Order</h3>
              <p>
                Once your order ships, you will receive a shipping confirmation email with a tracking number. You can track your order by:
              </p>
              <ol>
                <li>Logging into your Mentneo account and viewing your order history</li>
                <li>Clicking the tracking link in your shipping confirmation email</li>
                <li>Contacting our customer support team with your order number</li>
              </ol>
              
              <h3>Delivery Issues</h3>
              <p>
                In case of any delivery issues such as damaged items, incorrect items, or non-delivery:
              </p>
              <ul>
                <li>Contact our support team within 7 days of the expected delivery date</li>
                <li>Provide your order number and details of the issue</li>
                <li>Include photos if reporting damaged items</li>
              </ul>
              <p>
                We will work to resolve any delivery issues promptly and may offer replacements, refunds, or other appropriate solutions.
              </p>
              
              <h3>Contact Us</h3>
              <p>
                If you have any questions about our shipping policy, please contact our support team at:
              </p>
              <p>
                Email: shipping@mentneo.com<br />
                Phone: +91 9876543210<br />
                Address: 123 Education Street, Hyderabad, Telangana, India - 500001
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Mentneo. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            <Link to="/terms-and-conditions" className="text-sm text-gray-500 hover:text-gray-900">Terms & Conditions</Link>
            <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link>
            <Link to="/cancellation-refunds" className="text-sm text-gray-500 hover:text-gray-900">Cancellation & Refunds</Link>
            <Link to="/shipping" className="text-sm text-gray-500 hover:text-gray-900">Shipping</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
