import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase.js';
import { useAuth } from '../contexts/AuthContext';
import { FaRupeeSign, FaLock, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RazorpayCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }
    fetchCourse();
  }, [currentUser, courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        setError('Course not found');
        return;
      }
      
      setCourse({ id: courseDoc.id, ...courseDoc.data() });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details');
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!currentUser) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }

    setProcessing(true);
    setError(null);

    // Analytics: start_payment
    console.log('📊 Analytics: start_payment', {
      userId: currentUser.uid,
      courseId: course.id,
      courseName: course.title,
      amount: course.price
    });

    try {
      // Get Firebase auth token
      const token = await auth.currentUser.getIdToken();

      // Create Razorpay order
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: course.id,
          couponCode: couponCode || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      console.log('✅ Order created:', data.orderId);

      // Open Razorpay Checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'Mentlearn',
        description: `Course: ${course.title}`,
        image: '/logo192.png', // Your logo
        handler: async function (response) {
          await verifyPayment(response);
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          contact: currentUser.phoneNumber || ''
        },
        theme: {
          color: '#3B82F6' // Blue-600
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            console.log('📊 Analytics: payment_cancelled', {
              userId: currentUser.uid,
              courseId: course.id
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);

      // Analytics: payment_failed
      console.log('📊 Analytics: payment_failed', {
        userId: currentUser.uid,
        courseId: course.id,
        reason: err.message
      });
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      console.log('🔐 Verifying payment...');
      
      const token = await auth.currentUser.getIdToken();

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/razorpay/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentResponse)
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      console.log('✅ Payment verified successfully');

      // Analytics: payment_success
      console.log('📊 Analytics: payment_success', {
        userId: currentUser.uid,
        courseId: course.id,
        courseName: course.title,
        amount: course.price,
        orderId: paymentResponse.razorpay_order_id,
        paymentId: paymentResponse.razorpay_payment_id
      });

      // Redirect to success page
      navigate(`/payment/success?courseId=${course.id}&enrollmentId=${data.enrollmentId}`, {
        state: { 
          courseName: course.title,
          amount: course.price 
        }
      });

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Payment verification failed');
      setProcessing(false);

      // Analytics: payment_failed
      console.log('📊 Analytics: payment_failed', {
        userId: currentUser.uid,
        courseId: course.id,
        reason: 'verification_failed'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaTimes className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const isFree = !course?.price || course?.price === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6">
            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-blue-100">You're one step away from starting your learning journey</p>
          </div>

          <div className="p-8">
            {/* Course Details */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Details</h2>
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                {(course.thumbnailUrl || course.thumbnail) && (
                  <img 
                    src={course.thumbnailUrl || course.thumbnail} 
                    alt={course.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {course.description?.substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {course.duration && <span>⏱️ {course.duration} hrs</span>}
                    {course.level && <span>📊 {course.level}</span>}
                    <span>🎓 Certificate included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Lifetime access to course content',
                  'Certificate of completion',
                  'Access to all course materials',
                  '30-day money-back guarantee',
                  'Expert instructor support',
                  'Real-world projects'
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Code (only for paid courses) */}
            {!isFree && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Have a Coupon Code?</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2 rounded-lg transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Price Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Course Price:</span>
                  <span className="text-lg font-semibold text-gray-900 flex items-center">
                    {isFree ? (
                      'FREE'
                    ) : (
                      <>
                        <FaRupeeSign className="text-base" />
                        {course.price}
                      </>
                    )}
                  </span>
                </div>
                {course.originalPrice && course.originalPrice > course.price && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount:</span>
                    <span className="flex items-center">
                      -<FaRupeeSign className="text-sm" />
                      {course.originalPrice - course.price}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600 flex items-center">
                      {isFree ? (
                        'FREE'
                      ) : (
                        <>
                          <FaRupeeSign />
                          {course.price}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <FaTimes className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Payment Failed</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className={`w-full ${
                isFree
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-bold py-4 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {processing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaLock className="mr-2" />
                  {isFree ? 'Enroll for Free' : `Pay ₹${course.price}`}
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <FaLock className="mr-2" />
                <span>Secure payment powered by Razorpay</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </motion.div>

        {/* Refund Policy */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong>30-Day Money-Back Guarantee</strong>
          </p>
          <p>
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RazorpayCheckout;
