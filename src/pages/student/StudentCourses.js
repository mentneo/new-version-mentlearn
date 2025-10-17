import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiCheckCircle, FiClock, FiPlay, FiSearch, FiLock } from 'react-icons/fi/index.js';
import LearnIQNavbar from '../../components/student/LearnIQNavbar.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.js';

const StudentCourses = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [currentUser]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, where('published', '==', true));
      const coursesSnapshot = await getDocs(coursesQuery);
      const allCourses = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const enrollmentsRef = collection(db, 'enrollments');
      const enrollmentsQuery = query(
        enrollmentsRef,
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active')
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);

      const enrolled = allCourses.filter(course => enrolledCourseIds.includes(course.id));
      const available = allCourses.filter(course => !enrolledCourseIds.includes(course.id));

      setEnrolledCourses(enrolled);
      setAvailableCourses(available);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId) => {
    navigate(`/student/student-dashboard/course/${courseId}`);
  };

  const handleRequestAccess = async (courseId) => {
    try {
      await addDoc(collection(db, 'courseRequests'), {
        courseId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        status: 'pending',
        requestedAt: new Date()
      });
      alert('Access requested successfully!');
    } catch (error) {
      console.error('Error requesting access:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const CourseCard = ({ course, isEnrolled }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiBook className="text-white text-6xl opacity-50" />
          </div>
        )}
        
        {isEnrolled && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
            <FiCheckCircle className="text-sm" />
            Enrolled
          </div>
        )}
        
        {!isEnrolled && course.price && (
          <div className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            ${course.price}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description || 'No description available'}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <FiBook className="text-blue-500" />
            <span>{course.modules?.length || 0} Modules</span>
          </div>
          {course.duration && (
            <div className="flex items-center gap-1">
              <FiClock className="text-purple-500" />
              <span>{course.duration}</span>
            </div>
          )}
        </div>

        {isEnrolled ? (
          <button
            onClick={() => handleContinueLearning(course.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FiPlay />
            Continue Learning
          </button>
        ) : (
          <button
            onClick={() => handleRequestAccess(course.id)}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 border border-gray-300"
          >
            Request Access
          </button>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex h-screen">
        <LearnIQNavbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <LearnIQNavbar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Courses</h1>
            <p className="text-gray-600">Explore and manage your learning journey</p>
          </div>

          <div className="mb-8">
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`relative px-6 py-3 font-semibold transition-colors duration-300 ${
                  activeTab === 'enrolled'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Enrolled Courses ({enrolledCourses.length})
                {activeTab === 'enrolled' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`relative px-6 py-3 font-semibold transition-colors duration-300 ${
                  activeTab === 'available'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Available Courses ({availableCourses.length})
                {activeTab === 'available' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
                  />
                )}
              </button>
            </div>
          </div>

          {activeTab === 'enrolled' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseCard course={course} isEnrolled={true} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSearch className="text-blue-600 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Enrolled Courses</h3>
                  <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                  <button
                    onClick={() => setActiveTab('available')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Browse Available Courses
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'available' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {availableCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseCard course={course} isEnrolled={false} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiBook className="text-purple-600 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Available Courses</h3>
                  <p className="text-gray-600">All courses are currently enrolled or unavailable</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
