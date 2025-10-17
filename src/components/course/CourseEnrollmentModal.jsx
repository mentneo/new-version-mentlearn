import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import razorpayService from '../../utils/RazorpayService';

const CourseEnrollmentModal = ({ courseId, isOpen, onClose, userData }) => {
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (!courseSnap.exists()) {
          throw new Error('Course not found');
        }
        
        setCourseDetails(courseSnap.data());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && courseId) {
      fetchCourseDetails();
    }
  }, [courseId, isOpen]);

  const handleEnrollClick = async () => {
    try {
      // Show loading state
      setLoading(true);

      // Create Razorpay form container
      const form = document.createElement('form');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', 'pl_RSSAYO6egPDVqu');
      script.async = true;
      
      form.appendChild(script);
      document.body.appendChild(form);

      // Listen for Razorpay success event
      window.addEventListener('razorpay.payment.success', async (e) => {
        try {
          // Create enrollment
          await razorpayService.enrollUserInCourse(userData.id, courseId);
          
          // Redirect to course page
          navigate(`/course/${courseId}`);
          
          // Show success message
          alert('Successfully enrolled in the course!');
        } catch (error) {
          console.error('Enrollment error:', error);
          alert('Payment successful but enrollment failed. Please contact support.');
        }
      });

    } catch (err) {
      setError(err.message);
      alert('Error initiating enrollment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="modal-loading">Loading...</div>;
  if (error) return <div className="modal-error">{error}</div>;
  if (!courseDetails) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-black bg-opacity-50 fixed inset-0" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">{courseDetails.name}</h2>
        
        {/* Course Details */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Course Details:</h3>
              <p>{courseDetails.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">What you'll learn:</h3>
              <ul className="list-disc pl-4">
                {courseDetails.learningPoints?.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Price and Duration */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="font-bold text-xl">₹{courseDetails.price}</span>
            <span className="text-gray-600 ml-2">({courseDetails.duration})</span>
          </div>
        </div>

        {/* Enrollment Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEnrollClick}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollmentModal;