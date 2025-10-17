import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import Navbar from '../../components/student/Navbar.js';
import { FaGraduationCap, FaCalendarAlt, FaUserGraduate, FaRupeeSign, FaCheckCircle } from 'react-icons/fa/index.esm.js';

export default function CourseEnrollment() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    try {
      setIsProcessing(true);
      
      // Create and append the Razorpay payment form
      const container = document.createElement('div');
      container.innerHTML = `
        <form>
          <script src="https://checkout.razorpay.com/v1/payment-button.js" 
            data-payment_button_id="pl_RSSwaF2hu2HE26" 
            async>
          </script>
        </form>
      `;
      
      // Add the form to the body and click it
      document.body.appendChild(container);
      const button = container.querySelector('form script');
      if (button) {
        button.scrollIntoView();
        setTimeout(() => {
          const razorpayButton = document.querySelector('.razorpay-payment-button');
          if (razorpayButton) razorpayButton.click();
        }, 1000);
      }

      // Clean up after the payment window closes
      const cleanup = () => {
        if (container && document.body.contains(container)) {
          document.body.removeChild(container);
        }
        setIsProcessing(false);
      };

      // Listen for the payment completion
      window.addEventListener('message', function handler(event) {
        if (event.data.type === 'razorpay:complete') {
          cleanup();
          window.removeEventListener('message', handler);
        }
      });

    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Get the container element
    const container = document.getElementById('razorpay-container');
    if (!container) return;

    // Create and append the form and script elements
    const form = document.createElement('form');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', 'pl_RSSwaF2hu2HE26');
    script.async = true;

    form.appendChild(script);
    container.innerHTML = ''; // Clear any existing content
    container.appendChild(form);

    return () => {
      // Cleanup when component unmounts
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []); // Empty dependency array since we only want this to run once
  
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState({
    checking: true,
    hasPermission: false,
    message: null
  });

  // Effect for fetching course details
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

        // Add retry logic for Firestore access
        let retries = 3;
        while (retries > 0) {
          try {
            const userRef = doc(db, "users", currentUser.uid);
            await getDoc(userRef); // Just verify we can access Firestore
            break; // If successful, break the retry loop
          } catch (error) {
            retries--;
            if (retries === 0) {
              console.error("Failed to access Firestore after multiple attempts:", error);
              setError("Unable to verify permissions. Please try again later.");
              setLoading(false);
              return;
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

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

        // Fetch course data from Firebase
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
  }, [courseId, currentUser]);



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
              

              
              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  Click the button below to proceed with the payment.
                </p>
              </div>
              
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
              

              
                            <div className="w-full mb-6">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                    isProcessing 
                      ? 'bg-indigo-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
              

              
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
