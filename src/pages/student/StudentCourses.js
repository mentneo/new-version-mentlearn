import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import StudentLayout from '../../components/layouts/StudentLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentCourses = () => {
  const { currentUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Fetch all courses
        const coursesCollection = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesCollection);
        const allCourses = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch enrolled courses
        const enrollmentsCollection = query(
          collection(db, 'enrollments'),
          where('userId', '==', currentUser.uid)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsCollection);
        
        const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
        
        // Filter enrolled and available courses
        const enrolled = allCourses.filter(course => enrolledCourseIds.includes(course.id));
        const available = allCourses.filter(course => !enrolledCourseIds.includes(course.id));
        
        setEnrolledCourses(enrolled);
        setAvailableCourses(available);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [currentUser]);
  
  const handleRequestAccess = async (courseId) => {
    try {
      // Create a request document in Firestore
      await addDoc(collection(db, 'courseRequests'), {
        courseId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        status: 'pending',
        requestedAt: new Date()
      });
      
      // Show success message
      alert('Your request has been submitted. You will be notified when access is granted.');
    } catch (error) {
      console.error('Error requesting course access:', error);
      alert('Failed to submit request. Please try again later.');
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>
          
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Enrolled Courses</h2>
            {enrolledCourses.length === 0 ? (
              <p className="mt-2 text-gray-500">You haven't enrolled in any courses yet.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="relative h-48">
                      {course.imageUrl ? (
                        <img 
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                          <svg className="h-12 w-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-3">{course.description}</p>
                    </div>
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <Link
                        to={`/student/course/${course.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Continue Learning →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-12">
            <h2 className="text-lg font-medium text-gray-900">Available Courses</h2>
            {availableCourses.length === 0 ? (
              <p className="mt-2 text-gray-500">No additional courses available at this time.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {availableCourses.map((course) => (
                  <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="relative h-48">
                      {course.imageUrl ? (
                        <img 
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                          <svg className="h-12 w-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-3">{course.description}</p>
                    </div>
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <button
                        onClick={() => handleRequestAccess(course.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Request Access
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentCourses;
