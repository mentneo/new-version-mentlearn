import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa/index.esm.js';

export default function CancellationRefunds() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Cancellation & Refunds Policy</h1>
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
              <h2 className="text-lg leading-6 font-medium text-gray-900">Cancellation & Refund Policy</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Last updated: September 10, 2025</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6 prose max-w-none">
              <p>
                At Mentneo, we strive to ensure your complete satisfaction with our services. This Cancellation and Refund Policy outlines the terms and conditions regarding course cancellations, refunds, and related matters.
              </p>
              
              <h3>1. Course Cancellation by Students</h3>
              <p>
                Students may request to cancel their enrollment in a course under the following conditions:
              </p>
              <ul>
                <li><strong>Within 7 days of purchase:</strong> If you cancel within 7 days of your purchase and have completed less than 20% of the course content, you are eligible for a full refund.</li>
                <li><strong>After 7 days but within 14 days:</strong> If you cancel after 7 days but within 14 days of purchase and have completed less than 30% of the course content, you may receive a partial refund of 50% of the course fee.</li>
                <li><strong>After 14 days:</strong> No refunds will be provided for cancellations made after 14 days from the date of purchase.</li>
              </ul>
              
              <h3>2. Course Cancellation by Mentneo</h3>
              <p>
                In rare circumstances, Mentneo may need to cancel or reschedule a course due to unforeseen circumstances. In such cases:
              </p>
              <ul>
                <li>Students will be notified as soon as possible about the cancellation.</li>
                <li>Students will be offered the option to either transfer to another available course, receive a full refund, or receive credit for future courses.</li>
                <li>Mentneo is not responsible for any incidental expenses incurred by the student due to course cancellation.</li>
              </ul>
              
              <h3>3. Refund Process</h3>
              <p>
                To request a refund, please follow these steps:
              </p>
              <ol>
                <li>Log in to your Mentneo account.</li>
                <li>Navigate to "My Courses" section.</li>
                <li>Select the course you wish to cancel and click on "Request Refund."</li>
                <li>Fill out the refund request form, providing the reason for cancellation.</li>
                <li>Submit your request.</li>
              </ol>
              <p>
                All refund requests will be processed within 7-10 business days. Refunds will be issued using the original payment method. Depending on your payment provider, it may take additional time for the refunded amount to reflect in your account.
              </p>
              
              <h3>4. Non-Refundable Items</h3>
              <p>
                The following items or services are non-refundable:
              </p>
              <ul>
                <li>Downloadable resources or materials that have already been accessed or downloaded.</li>
                <li>Membership fees for premium services or subscription plans.</li>
                <li>Administrative fees or processing charges.</li>
                <li>Courses where a student has completed more than 30% of the content.</li>
              </ul>
              
              <h3>5. Special Circumstances</h3>
              <p>
                In cases of extended illness, emergency, or other exceptional circumstances that prevent a student from completing a course, Mentneo may consider refund requests on a case-by-case basis. Supporting documentation may be required.
              </p>
              
              <h3>6. Changes to This Policy</h3>
              <p>
                Mentneo reserves the right to modify this Cancellation and Refund Policy at any time. Changes will be effective immediately upon posting on our website. It is your responsibility to review this policy periodically.
              </p>
              
              <h3>7. Contact Us</h3>
              <p>
                If you have any questions or concerns regarding our Cancellation and Refund Policy, please contact our support team at:
              </p>
              <p>
                Email: support@mentneo.com<br />
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
