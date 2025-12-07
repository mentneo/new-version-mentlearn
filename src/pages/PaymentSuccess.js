import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaBook, FaCertificate, FaArrowRight } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const courseId = searchParams.get('courseId');
  const enrollmentId = searchParams.get('enrollmentId');
  const courseName = location.state?.courseName || 'the course';
  const amount = location.state?.amount;

  useEffect(() => {
    // Fire confetti on success
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <FaCheckCircle className="text-8xl mx-auto mb-4" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-green-100 text-lg">
              Welcome to {courseName}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Success Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                🎉 Congratulations!
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You've successfully enrolled in <strong>{courseName}</strong>. 
                Your learning journey starts now!
              </p>
              {amount && (
                <p className="text-sm text-gray-500 mt-2">
                  Amount paid: ₹{amount}
                </p>
              )}
            </div>

            {/* What's Next */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaBook className="mr-2 text-blue-600" />
                What's Next?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-sm font-bold">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Check your email</p>
                    <p className="text-sm text-gray-600">
                      We've sent you a confirmation email with course access details
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-sm font-bold">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Start learning</p>
                    <p className="text-sm text-gray-600">
                      Access your course dashboard and begin your first lesson
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-sm font-bold">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Earn your certificate</p>
                    <p className="text-sm text-gray-600">
                      Complete the course and receive your certificate of completion
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Benefits Reminder */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FaBook className="text-3xl text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Lifetime Access</p>
                <p className="text-xs text-gray-600">Learn at your own pace</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FaCertificate className="text-3xl text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Certificate</p>
                <p className="text-xs text-gray-600">On course completion</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FaCheckCircle className="text-3xl text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">30-Day Refund</p>
                <p className="text-xs text-gray-600">Money-back guarantee</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/student/student-dashboard`)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg text-lg transition-all flex items-center justify-center"
              >
                Go to My Dashboard
                <FaArrowRight className="ml-2" />
              </button>
              
              <button
                onClick={() => navigate('/courses')}
                className="w-full bg-white border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 font-semibold py-3 rounded-lg transition-all"
              >
                Explore More Courses
              </button>
            </div>

            {/* Support */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Need help? Contact us at <a href="mailto:support@mentlearn.com" className="text-blue-600 hover:underline">support@mentlearn.com</a></p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        {(enrollmentId || courseId) && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              {enrollmentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrollment ID:</span>
                  <span className="text-gray-900 font-mono">{enrollmentId}</span>
                </div>
              )}
              {courseId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Course ID:</span>
                  <span className="text-gray-900 font-mono">{courseId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
