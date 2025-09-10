import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import RazorpayService from '../../utils/RazorpayService';
import Navbar from '../../components/student/Navbar';
import { FaGraduationCap, FaCalendarAlt, FaUserGraduate, FaRupeeSign, FaCheckCircle } from 'react-icons/fa';

export default function CourseEnrollment() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        if (!courseId) {
          setError("Course ID is missing");
          setLoading(false);
          return;
        }

        const courseRef = doc(db, "courses", courseId);
        const courseDoc = await getDoc(courseRef);
        
        if (courseDoc.exists()) {
          setCourseDetails({ id: courseDoc.id, ...courseDoc.data() });
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Failed to load course details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetails();
  }, [courseId]);

  const handleEnrollment = async () => {
    try {
      setProcessing(true);
      setPaymentError(null);
      
      if (!currentUser || !courseDetails) {
        setPaymentError("Missing user or course information");
        setProcessing(false);
        return;
      }
      
      // User details for Razorpay
      const userDetails = {
        id: currentUser.uid,
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: '', // You might want to get this from user profile if available
        plan: 'course_' + courseId // Using course ID as plan identifier
      };
      
      // Create an order
      const orderAmount = courseDetails.price || 999;
      const orderData = await RazorpayService.createOrder(
        currentUser.uid,
        orderAmount,
        userDetails,
        'course_' + courseId
      );
      
      // Process payment with Razorpay
      await RazorpayService.processPayment(
        orderData,
        userDetails,
        // Success callback
        (response) => {
          console.log("Payment successful:", response);
          // Navigate to success page with parameters
          navigate(`/payment/success?courseId=${courseId}&orderId=${orderData.id}`);
        },
        // Failure callback
        (error) => {
          console.error("Payment failed:", error);
          setPaymentError(error.message || "Payment failed. Please try again.");
          setProcessing(false);
        }
      );
    } catch (error) {
      console.error("Error during enrollment:", error);
      setPaymentError(error.message || "An error occurred during enrollment. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h1 className="text-2xl font-bold text-gray-900">Enroll in Course</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Complete your enrollment and gain access to this course.</p>
            </div>
            
            {/* Course Details */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex items-center mb-6">
                <img 
                  className="h-24 w-auto object-cover rounded-md mr-4" 
                  src={courseDetails?.thumbnailUrl || 'https://via.placeholder.com/600x400?text=Course'} 
                  alt={courseDetails?.title} 
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{courseDetails?.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{courseDetails?.description}</p>
                </div>
              </div>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FaCalendarAlt className="mr-2 text-indigo-500" />
                    Duration
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{courseDetails?.duration || 'Self-paced'}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FaUserGraduate className="mr-2 text-indigo-500" />
                    Instructor
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{courseDetails?.instructor || 'Mentneo Experts'}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FaGraduationCap className="mr-2 text-indigo-500" />
                    Level
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{courseDetails?.level || 'All Levels'}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FaRupeeSign className="mr-2 text-indigo-500" />
                    Price
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">₹{courseDetails?.price || '999'}</dd>
                </div>
              </dl>
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">What you'll learn</h3>
                <ul className="space-y-2">
                  {courseDetails?.keyPoints ? (
                    courseDetails.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheckCircle className="mt-1 mr-2 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start">
                        <FaCheckCircle className="mt-1 mr-2 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Comprehensive course materials and resources</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="mt-1 mr-2 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Hands-on projects and practical assignments</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="mt-1 mr-2 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Access to mentors for guidance and support</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Payment Section */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
              
              {paymentError && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {paymentError}
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Course Fee</span>
                  <span className="font-medium">₹{courseDetails?.price || '999'}</span>
                </div>
                
                {courseDetails?.discount > 0 && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700">Discount</span>
                    <span className="font-medium text-green-600">-₹{courseDetails.discount}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 my-3"></div>
                
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>₹{courseDetails?.discountedPrice || courseDetails?.price || '999'}</span>
                </div>
              </div>
              
              <button
                onClick={handleEnrollment}
                disabled={processing}
                className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                  </>
                )}
              </button>
              
              <p className="mt-3 text-sm text-gray-500 text-center">
                By proceeding, you agree to our terms and conditions.
              </p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
