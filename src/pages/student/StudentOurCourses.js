import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { db } from '../../firebase/firebase.js';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiBook, FiSearch, FiFilter, FiStar, FiUsers, FiClock, 
  FiAward, FiPlay, FiBookOpen, FiCheckCircle, FiLock,
  FiTrendingUp, FiZap, FiTarget, FiGift
} from 'react-icons/fi/index.js';
import LearnIQNavbar from '../../components/student/LearnIQNavbar.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.js';

const StudentOurCourses = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 STUDENT OUR COURSES - Fetching all courses...');

      // Fetch ALL courses
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesRef);

      console.log(`📊 Total courses in database: ${coursesSnapshot.size}`);

      // Filter to show only published courses
      const coursesList = coursesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(course => {
          const shouldShow = course.published !== false;
          console.log(`📚 Course: "${course.title}" - Show: ${shouldShow ? '✅' : '❌'}`);
          return shouldShow;
        });

      console.log('✅ Courses to display:', coursesList.length);

      // Fetch user enrollments
      if (currentUser) {
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(
          enrollmentsRef,
          where('studentId', '==', currentUser.uid)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const enrolledIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
        setEnrolledCourseIds(enrolledIds);
        console.log('📝 Enrolled course IDs:', enrolledIds);
      }

      setAllCourses(coursesList);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await addDoc(collection(db, 'courseRequests'), {
        courseId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
        status: 'pending',
        requestedAt: new Date()
      });
      alert('Enrollment request submitted! You will be notified when approved.');
    } catch (error) {
      console.error('Error requesting enrollment:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const handleContinueCourse = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  // Get unique categories and levels
  const categories = ['all', ...new Set(allCourses.map(c => c.category).filter(Boolean))];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter and sort courses
  const filteredCourses = allCourses
    .filter(course => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          course.category?.toLowerCase().includes(searchLower) ||
          course.creatorName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && course.category !== categoryFilter) {
        return false;
      }

      // Level filter
      if (levelFilter !== 'all' && course.level !== levelFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.enrollments || 0) - (a.enrollments || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const enrolledCourses = filteredCourses.filter(c => enrolledCourseIds.includes(c.id));
  const availableCourses = filteredCourses.filter(c => !enrolledCourseIds.includes(c.id));

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-5xl font-extrabold mb-4">
                Discover Your Next Course
              </h1>
              <p className="text-xl text-indigo-100 mb-6 max-w-3xl mx-auto">
                Explore our comprehensive catalog of courses and take your skills to the next level
              </p>
              <div className="flex justify-center items-center gap-8 text-lg">
                <div className="flex items-center gap-2">
                  <FiBook className="text-2xl" />
                  <span>{allCourses.length} Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="text-2xl" />
                  <span>Expert Instructors</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward className="text-2xl" />
                  <span>Certificates</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Enrolled</p>
                  <p className="text-3xl font-bold text-gray-900">{enrolledCourseIds.length}</p>
                </div>
                <FiCheckCircle className="text-4xl text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available</p>
                  <p className="text-3xl font-bold text-gray-900">{availableCourses.length}</p>
                </div>
                <FiBookOpen className="text-4xl text-purple-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length - 1}</p>
                </div>
                <FiTarget className="text-4xl text-green-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">New This Week</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {allCourses.filter(c => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(c.createdAt) > weekAgo;
                    }).length}
                  </p>
                </div>
                <FiZap className="text-4xl text-yellow-500" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search courses, categories, instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="relative">
                <FiTrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{allCourses.length}</span> courses
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="title">A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enrolled Courses Section */}
          {enrolledCourses.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Continue Learning ({enrolledCourses.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course, index) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={true}
                    onAction={() => handleContinueCourse(course.id)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available Courses Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiGift className="text-purple-500" />
              Explore New Courses ({availableCourses.length})
            </h2>
            {availableCourses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FiBook className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Courses Found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course, index) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={false}
                    onAction={() => handleEnroll(course.id)}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, isEnrolled, onAction, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
  >
    {/* Course Image */}
    <div className="relative h-48 overflow-hidden">
      {course.thumbnailUrl || course.imageUrl ? (
        <img
          src={course.thumbnailUrl || course.imageUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={`w-full h-full bg-gradient-to-br ${
          isEnrolled
            ? 'from-green-500 to-teal-600'
            : 'from-purple-500 to-pink-600'
        } flex items-center justify-center ${
          course.thumbnailUrl || course.imageUrl ? 'hidden' : 'flex'
        }`}
        style={{ display: course.thumbnailUrl || course.imageUrl ? 'none' : 'flex' }}
      >
        <FiBook size={48} className="text-white opacity-50" />
      </div>
      
      {/* Badges */}
      <div className="absolute top-4 left-4">
        {course.category && (
          <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            {course.category}
          </span>
        )}
      </div>
      <div className="absolute top-4 right-4">
        {isEnrolled ? (
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
            <FiCheckCircle size={14} />
            Enrolled
          </span>
        ) : course.price ? (
          <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
            ₹{course.price}
          </span>
        ) : null}
      </div>
    </div>

    {/* Course Content */}
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
        {course.title}
      </h3>
      
      {/* Creator */}
      {course.creatorName && (
        <p className="text-sm text-indigo-600 mb-3 flex items-center gap-1">
          <FiUsers size={14} />
          {course.creatorName}
        </p>
      )}
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {course.description || 'Enhance your skills with this comprehensive course.'}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
        {course.modules && (
          <span className="flex items-center gap-1">
            <FiBookOpen size={14} />
            {course.modules.length} modules
          </span>
        )}
        {course.duration && (
          <span className="flex items-center gap-1">
            <FiClock size={14} />
            {course.duration}
          </span>
        )}
        {course.rating !== undefined && (
          <span className="flex items-center gap-1">
            <FiStar size={14} className="text-yellow-500" />
            {course.rating || 0}
          </span>
        )}
        {course.enrollments !== undefined && (
          <span className="flex items-center gap-1">
            <FiUsers size={14} />
            {course.enrollments || 0} enrolled
          </span>
        )}
        {course.level && (
          <span className="flex items-center gap-1 col-span-2">
            <FiTrendingUp size={14} />
            {course.level}
          </span>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onAction}
        className={`block w-full text-center px-4 py-3 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg ${
          isEnrolled
            ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          {isEnrolled ? (
            <>
              <FiPlay size={18} />
              Continue Learning
            </>
          ) : (
            <>
              <FiAward size={18} />
              Enroll Now
            </>
          )}
        </span>
      </button>
    </div>
  </motion.div>
);

export default StudentOurCourses;
