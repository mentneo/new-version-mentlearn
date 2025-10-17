import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase.js';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const CourseEnrollment = ({ courseId, userId }) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (!courseSnap.exists()) {
          throw new Error('Course not found');
        }

        setCourseData(courseSnap.data());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  // Listen for Razorpay payment success
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Get user data
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        // Create enrollment
        await addDoc(collection(db, 'enrollments'), {
          userId: userId,
          courseId: courseId,
          status: 'active',
          enrolledAt: serverTimestamp(),
          accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year access
        });

        // Send notifications
        await Promise.all([
          // Admin notification
          addDoc(collection(db, 'adminNotifications'), {
            type: 'new_enrollment',
            courseId: courseId,
            courseName: courseData.name,
            userId: userId,
            userName: userData.name,
            createdAt: serverTimestamp(),
            status: 'unread',
            title: 'New Course Enrollment',
            message: `${userData.name} has enrolled in ${courseData.name}`
          }),
          // Creator notification
          courseData.creatorId && addDoc(collection(db, 'creatorNotifications'), {
            type: 'new_enrollment',
            courseId: courseId,
            courseName: courseData.name,
            userId: userId,
            userName: userData.name,
            createdAt: serverTimestamp(),
            status: 'unread',
            title: 'New Student Enrollment',
            message: `${userData.name} has enrolled in your course ${courseData.name}`,
            creatorId: courseData.creatorId
          })
        ]);

        // Navigate to course page
        navigate(`/course/${courseId}/learn`);
      } catch (error) {
        console.error('Error processing enrollment:', error);
        alert('There was an error completing your enrollment. Please contact support.');
      }
    };

    // Listen for Razorpay payment success event
    window.addEventListener('razorpay.payment.success', handlePaymentSuccess);
    return () => window.removeEventListener('razorpay.payment.success', handlePaymentSuccess);
  }, [courseId, userId, courseData, navigate]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!courseData) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Course Details */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-6">{courseData.name}</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
            <p className="text-gray-600">{courseData.description}</p>
            
            {courseData.highlights && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Highlights:</h3>
                <ul className="list-disc pl-5">
                  {courseData.highlights.map((highlight, index) => (
                    <li key={index} className="text-gray-600">{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
            <ul className="list-disc pl-5">
              {courseData.learningPoints?.map((point, index) => (
                <li key={index} className="text-gray-600 mb-2">{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Enroll Now</h2>
            <p className="text-gray-600">Get instant access to the full course</p>
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            ₹{courseData.price}
          </div>
        </div>

        {/* Razorpay Payment Button */}
        <div className="flex justify-center">
          <form>
            <script 
              src="https://checkout.razorpay.com/v1/payment-button.js" 
              data-payment_button_id="pl_RSSAYO6egPDVqu" 
              async
            >
            </script>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollment;