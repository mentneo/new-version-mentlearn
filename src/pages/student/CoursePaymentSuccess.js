import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import Navbar from '../../components/student/Navbar.js';
import { FaCheckCircle, FaBook, FaArrowRight } from 'react-icons/fa/index.esm.js';

export default function CoursePaymentSuccess() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [error, setError] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState('processing');

  // Get payment details from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');

  useEffect(() => {
    async function processEnrollment() {
      if (!currentUser || !courseId || !orderId) {
        setError("Missing required information");
        setLoading(false);
        return;
      }

      try {
        // Fetch course details
        const courseRef = doc(db, "courses", courseId);
        const courseDoc = await getDoc(courseRef);
        
        if (!courseDoc.exists()) {
          setError("Course not found");
          setLoading(false);
          return;
        }
        
        setCourseDetails({
          id: courseDoc.id,
          ...courseDoc.data()
        });
        
        // Check if order exists and is successful
        const orderRef = doc(db, "razorpayOrders", orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (!orderDoc.exists()) {
          setError("Order information not found");
          setLoading(false);
          return;
        }
        
        const orderData = orderDoc.data();
        
        if (orderData.status !== 'success') {
          // Update order status if not already successful
          await updateDoc(orderRef, {
            status: 'success',
            updatedAt: serverTimestamp()
          });
        }
        
        // Check if user is already enrolled in this course
        const enrollmentsQuery = collection(db, "enrollments");
        const enrollmentData = {
          studentId: currentUser.uid,
          courseId: courseId,
          status: 'active',
          enrolledAt: serverTimestamp(),
          progress: 0,
          orderId: orderId,
          paymentAmount: courseDetails?.price || 999,
          enrollmentType: 'paid',
          completedLessons: [],
          completedQuizzes: []
        };
        
        // Create enrollment document
        await addDoc(enrollmentsQuery, enrollmentData);
        
        // Update user document
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const enrolledCourses = userData.enrolledCourses || [];
          
          if (!enrolledCourses.includes(courseId)) {
            enrolledCourses.push(courseId);
            
            await updateDoc(userRef, {
              enrolledCourses: enrolledCourses,
              updatedAt: serverTimestamp()
            });
          }
        }
        
        setEnrollmentStatus('completed');
        setLoading(false);
      } catch (err) {
        console.error("Error processing enrollment:", err);
        setError("Failed to process enrollment. Please contact support.");
        setLoading(false);
      }
    }

    processEnrollment();
  }, [currentUser, courseId, orderId]);

  const handleStartCourse = () => {
    navigate(`/student/course/${courseId}`);
  };

  const handleReturnToDashboard = () => {
    navigate('/student/dashboard');
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
            <p className="text-center mt-4">Processing your enrollment...</p>
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Enrollment Error</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={handleReturnToDashboard}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Return to Dashboard
                </button>
              </div>
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
            <div className="px-4 py-5 sm:px-6 text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <FaCheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Enrollment Successful!</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 mx-auto">
                You have successfully enrolled in the course.
              </p>
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
              
              <div className="bg-green-50 p-4 rounded-md mb-6 border border-green-200">
                <div className="flex items-start">
                  <FaCheckCircle className="mt-0.5 mr-3 h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Payment Confirmed</h3>
                    <p className="mt-1 text-sm text-green-700">
                      Your payment has been processed successfully. You now have full access to this course.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleStartCourse}
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FaBook className="mr-2" /> Start Learning
                </button>
                <button
                  onClick={handleReturnToDashboard}
                  className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Return to Dashboard <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
            
            {/* What's Next Section */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 text-lg font-medium">
                    1
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">Explore Course Content</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Browse through the course modules and get familiar with the available resources.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 text-lg font-medium">
                    2
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">Complete Assignments</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Work through the exercises and assignments to reinforce your learning.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 text-lg font-medium">
                    3
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">Engage with Mentors</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Reach out to your mentors for guidance and feedback on your progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
