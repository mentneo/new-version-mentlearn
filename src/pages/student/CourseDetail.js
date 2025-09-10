import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/student/Navbar';
import { FaArrowLeft, FaBook, FaClock, FaGraduationCap, FaChalkboardTeacher, FaCheckCircle, FaRegStar, FaStar } from 'react-icons/fa';

export default function CourseDetails() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setCourse({
            id: courseId,
            ...courseDoc.data()
          });
        } else {
          setError("Course not found");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Failed to load course details. Please try again later.");
        setLoading(false);
      }
    }

    fetchCourseDetails();
  }, [courseId]);

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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FaArrowLeft className="mr-2" /> Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">Course Not Found</h2>
              <p className="mt-2 text-gray-500">The course you're looking for doesn't exist or has been removed.</p>
              <div className="mt-6">
                <Link
                  to="/student/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FaArrowLeft className="mr-2" /> Back to Dashboard
                </Link>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="relative">
              <img 
                className="w-full h-64 sm:h-80 object-cover" 
                src={course.thumbnailUrl || course.imageUrl || 'https://via.placeholder.com/1200x400?text=Course+Banner'} 
                alt={course.title} 
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
                <div className="p-6 text-white">
                  <h1 className="text-3xl sm:text-4xl font-bold">{course.title}</h1>
                  {course.tagline && <p className="mt-2 text-lg text-gray-200">{course.tagline}</p>}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                {course.duration && (
                  <div className="flex items-center text-gray-600">
                    <FaClock className="mr-2 text-indigo-500" />
                    <span>{course.duration}</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex items-center text-gray-600">
                    <FaGraduationCap className="mr-2 text-indigo-500" />
                    <span>{course.level}</span>
                  </div>
                )}
                {course.instructor && (
                  <div className="flex items-center text-gray-600">
                    <FaChalkboardTeacher className="mr-2 text-indigo-500" />
                    <span>Instructor: {course.instructor}</span>
                  </div>
                )}
                {course.rating && (
                  <div className="flex items-center text-gray-600">
                    <div className="flex items-center mr-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        i < Math.floor(course.rating) ? 
                          <FaStar key={i} className="w-4 h-4" /> : 
                          <FaRegStar key={i} className="w-4 h-4" />
                      ))}
                    </div>
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Course</h2>
                <p className="text-gray-700">{course.description}</p>
                
                {course.topics && course.topics.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      {course.topics.map((topic, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheckCircle className="mt-1 mr-2 flex-shrink-0 text-green-500" />
                          <span>{topic.title || topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {course.requirements && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                    <p className="text-gray-700">{course.requirements}</p>
                  </div>
                )}
                
                {course.features && course.features.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Features</h3>
                    <ul className="space-y-2">
                      {course.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheckCircle className="mt-1 mr-2 flex-shrink-0 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mt-10 flex justify-center">
                <Link
                  to={`/student/enroll/${course.id}`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaBook className="mr-2" /> Enroll in this Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
