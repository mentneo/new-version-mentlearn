import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import RazorpayService from '../../utils/RazorpayService.js';
import { useAuth } from '../../contexts/AuthContext.js';

const MentneoPaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!courseId) {
          throw new Error('No course ID provided');
        }

        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (!courseDoc.exists()) {
          throw new Error('Course not found');
        }

        setCourse({ id: courseDoc.id, ...courseDoc.data() });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Create order
      const orderData = await RazorpayService.createOrder(
        course.price,
        {
          id: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email
        },
        {
          id: course.id,
          name: course.title,
          type: course.type
        }
      );

      // Process payment
      await RazorpayService.processPayment(
        orderData,
        {
          id: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email
        },
        // Success callback
        () => {
          navigate(`/course/${courseId}/success`);
        },
        // Failure callback
        (error) => {
          setError(error.message);
          setProcessing(false);
        }
      );
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Course Details */}
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-6">{course.description}</p>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Course Price</span>
                <span className="text-2xl font-bold text-gray-900">₹{course.price}</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lifetime Access</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Certificate of Completion</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="mt-8">
              <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full py-4 px-6 rounded-lg text-white text-lg font-semibold transition-all
                  ${processing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark'
                  }`}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>Pay ₹{course.price} Securely</>
                )}
              </button>
            </div>

            {/* Secure Payment Notice */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center text-gray-500">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secured by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentneoPaymentPage;