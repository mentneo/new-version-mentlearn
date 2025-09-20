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
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [permissionStatus, setPermissionStatus] = useState({
    checking: true,
    hasPermission: false,
    message: null
  });
  const [isDemoMode, setIsDemoMode] = useState(true); // Enable demo mode to bypass actual Firebase operations

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        if (!courseId) {
          setError("Course ID is missing");
          setLoading(false);
          return;
        }

        // Check if the user is authenticated
        if (!currentUser) {
          setError("You must be logged in to enroll in a course");
          setLoading(false);
          return;
        }

        // In demo mode, automatically grant permissions
        if (isDemoMode) {
          console.log("Demo mode: Skipping permission checks");
          setPermissionStatus({
            checking: false,
            hasPermission: true,
            message: null
          });
        } else {
          // Check user permission status
          try {
            const userRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Check if user role has permission to enroll
              if (userData.role === 'banned' || userData.role === 'suspended') {
                setPermissionStatus({
                  checking: false,
                  hasPermission: false,
                  message: "Your account does not have permission to enroll in courses. Please contact support for assistance."
                });
              } else {
                setPermissionStatus({
                  checking: false,
                  hasPermission: true,
                  message: null
                });
              }
            } else {
              // Create user if doesn't exist
              setPermissionStatus({
                checking: false,
                hasPermission: true,
                message: null
              });
            }
          } catch (permErr) {
            console.error("Error checking permissions:", permErr);
            setPermissionStatus({
              checking: false,
              hasPermission: true, // Default to allowing enrollment if permission check fails
              message: null
            });
          }
        }

        // In demo mode, use mock course data instead of fetching from Firebase
        if (isDemoMode) {
          console.log("Demo mode: Using mock course data");
          const mockCourseData = {
            id: courseId,
            title: "Demo Course",
            description: "This is a demo course for testing payment integration",
            price: 999,
            currency: "INR",
            thumbnail: "https://via.placeholder.com/300x200?text=Demo+Course",
            instructorName: "Demo Instructor",
            duration: "4 weeks",
            level: "Beginner",
            enrollmentCount: 42,
            rating: 4.7,
            lessons: [
              { title: "Introduction to Demo", duration: "15 min" },
              { title: "Demo Fundamentals", duration: "30 min" },
              { title: "Advanced Demo Techniques", duration: "45 min" }
            ]
          };
          setCourseDetails(mockCourseData);
        } else {
          // Fetch real course data from Firebase
          const courseRef = doc(db, "courses", courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            setCourseDetails({ id: courseDoc.id, ...courseDoc.data() });
          } else {
            setError("Course not found");
          }
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Failed to load course details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetails();
  }, [courseId, currentUser, isDemoMode]);

  const handleEnrollment = async () => {
    try {
      setProcessing(true);
      setPaymentError(null);
      
      if (!currentUser || !courseDetails) {
        setPaymentError("Missing user or course information");
        setProcessing(false);
        return;
      }
      
      // Check permissions again before proceeding
      if (!permissionStatus.hasPermission && !isDemoMode) {
        setPaymentError(permissionStatus.message || "You don't have permission to enroll in this course");
        setProcessing(false);
        return;
      }
      
      // Validate custom amount if enabled
      if (useCustomAmount) {
        const amount = parseFloat(customAmount);
        if (isNaN(amount) || amount <= 0) {
          setPaymentError("Please enter a valid amount greater than 0");
          setProcessing(false);
          return;
        }
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
      const orderAmount = useCustomAmount ? parseFloat(customAmount) : (courseDetails.price || 999);
      
      try {
        let orderData;
        
        if (isDemoMode) {
          // Demo mode - create mock order data using RazorpayService's demo mode
          console.log("DEMO MODE: Creating order with RazorpayService demo mode");
          orderData = await RazorpayService.createOrder(
            currentUser.uid,
            orderAmount,
            userDetails,
            'course_' + courseId,
            useCustomAmount,
            isDemoMode
          );
        } else {
          // Normal mode - use RazorpayService
          orderData = await RazorpayService.createOrder(
            currentUser.uid,
            orderAmount,
            userDetails,
            'course_' + courseId,
            useCustomAmount
          );
        }
        
        // Process payment with Razorpay
        await RazorpayService.processPayment(
          orderData,
          userDetails,
          // Success callback
          (response) => {
            console.log("Payment successful:", response);
            // In demo mode, just navigate to success
            navigate(`/payment/success?courseId=${courseId}&orderId=${orderData.id}`);
          },
          // Failure callback
          (error) => {
            console.error("Payment failed:", error);
            
            // Handle specific permission errors
            if (error.code === "PERMISSION_DENIED" || error.message?.includes("permission")) {
              setPaymentError("You don't have permission to complete this payment. This is a demo version, so Firestore operations may fail due to security rules.");
            } else {
              setPaymentError(error.message || "Payment failed. Please try again.");
            }
            
            setProcessing(false);
          },
          useCustomAmount,
          isDemoMode
        );
      } catch (orderError) {
        console.error("Order creation error:", orderError);
        
        // Handle specific permission errors
        if (orderError.code === "permission-denied" || orderError.message?.includes("permission")) {
          setPaymentError("This is a demo version. Firebase security rules are preventing writing to the database. You can still test the Razorpay flow in demo mode.");
        } else {
          setPaymentError(orderError.message || "Failed to create payment order. Please try again.");
        }
        
        setProcessing(false);
      }
    } catch (error) {
      console.error("Error during enrollment:", error);
      
      // Handle general permission errors
      if (error.code === "PERMISSION_DENIED" || error.message?.includes("permission")) {
        setPaymentError("Demo mode: You don't have permission to complete this action due to Firebase security rules.");
      } else {
        setPaymentError(error.message || "An error occurred during enrollment. Please try again.");
      }
      
      setProcessing(false);
    }
  };

  if (loading || permissionStatus.checking) {
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
  
  if (!permissionStatus.hasPermission) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
              <h3 className="text-lg font-medium">Permission Error</h3>
              <p className="mt-2">{permissionStatus.message || "You don't have permission to enroll in this course."}</p>
              <p className="mt-2">If you believe this is an error, please contact support for assistance.</p>
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
              
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <input
                    id="default-amount"
                    name="payment-type"
                    type="radio"
                    checked={!useCustomAmount}
                    onChange={() => setUseCustomAmount(false)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="default-amount" className="ml-2 block text-sm text-gray-700">
                    Pay course fee
                  </label>
                </div>
                <div className="flex items-center mb-3">
                  <input
                    id="custom-amount"
                    name="payment-type"
                    type="radio"
                    checked={useCustomAmount}
                    onChange={() => setUseCustomAmount(true)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="custom-amount" className="ml-2 block text-sm text-gray-700">
                    Enter custom amount
                  </label>
                </div>
                
                {useCustomAmount && (
                  <div className="mt-3 mb-4">
                    <label htmlFor="custom-amount-input" className="block text-sm font-medium text-gray-700">
                      Custom Amount (₹)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        name="custom-amount-input"
                        id="custom-amount-input"
                        min="1"
                        step="1"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Enter the amount you wish to pay</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {useCustomAmount ? 'Custom Amount' : 'Course Fee'}
                  </span>
                  <span className="font-medium">
                    {useCustomAmount 
                      ? (customAmount ? `₹${parseFloat(customAmount).toFixed(2)}` : '₹0.00')
                      : `₹${courseDetails?.price || '999'}`}
                  </span>
                </div>
                
                {!useCustomAmount && courseDetails?.discount > 0 && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700">Discount</span>
                    <span className="font-medium text-green-600">-₹{courseDetails.discount}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 my-3"></div>
                
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>
                    {useCustomAmount 
                      ? (customAmount ? `₹${parseFloat(customAmount).toFixed(2)}` : '₹0.00')
                      : `₹${courseDetails?.discountedPrice || courseDetails?.price || '999'}`}
                  </span>
                </div>
              </div>
              
              {/* Demo Mode Toggle (for development/testing) */}
              <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <input
                    id="demo-mode-toggle"
                    type="checkbox"
                    checked={isDemoMode}
                    onChange={() => setIsDemoMode(!isDemoMode)}
                    className="h-4 w-4 text-yellow-600 border-yellow-300 focus:ring-yellow-500"
                  />
                  <label htmlFor="demo-mode-toggle" className="font-medium text-yellow-800">
                    Demo Mode
                  </label>
                </div>
                {isDemoMode && (
                  <p className="mt-2 text-sm text-yellow-700">
                    In demo mode, you can test the payment flow without requiring Firebase database write permissions.
                    No actual data will be stored in the database.
                  </p>
                )}
              </div>
              
              <button
                onClick={handleEnrollment}
                disabled={processing || (useCustomAmount && (!customAmount || parseFloat(customAmount) <= 0))}
                className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  processing || (useCustomAmount && (!customAmount || parseFloat(customAmount) <= 0)) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
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
              
              {isDemoMode && (
                <div className="mt-3 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-sm">
                  <p className="font-bold">Demo Mode Active</p>
                  <p>This is running in demo mode. Firebase operations are simulated and no actual database writes will occur.</p>
                  <p>You can still test the Razorpay payment interface (no actual charges will be made).</p>
                </div>
              )}
              
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
