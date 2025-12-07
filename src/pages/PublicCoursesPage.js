import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaBook, FaUsers, FaStar, FaRupeeSign, FaClock, FaChartLine,
  FaPlayCircle, FaCertificate, FaGraduationCap, FaFilter,
  FaSearch, FaTimes, FaCheck, FaShieldAlt, FaUndo
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import MenteoLogo from '../components/MenteoLogo';

const PublicCoursesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    priceType: 'all',
    duration: 'all',
    sort: 'popular'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesRef = collection(db, 'courses');
      const querySnapshot = await getDocs(coursesRef);
      
      const coursesList = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(course => course.published !== false); // Only show published courses
      
      setCourses(coursesList);
      setLoading(false);
      
      // Analytics: view_course_list
      console.log('📊 Analytics: view_course_list', { count: coursesList.length });
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
    
    // Analytics: click_course_card
    console.log('📊 Analytics: click_course_card', { 
      courseId: course.id, 
      courseName: course.title 
    });
  };

  const handleBuyNow = (course) => {
    if (!currentUser) {
      // Redirect to signup with course info
      navigate('/signup', { state: { returnTo: `/courses/${course.id}/checkout` } });
      return;
    }
    
    // Analytics: start_payment
    console.log('📊 Analytics: start_payment', { 
      courseId: course.id, 
      courseName: course.title,
      amount: course.price 
    });
    
    // Navigate directly to checkout page
    navigate(`/courses/${course.id}/checkout`);
  };

  // Apply filters and sorting
  const filteredCourses = courses
    .filter(course => {
      // Search filter
      const matchesSearch = 
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = 
        filters.category === 'all' || 
        course.category?.toLowerCase() === filters.category.toLowerCase();
      
      // Level filter
      const matchesLevel = 
        filters.level === 'all' || 
        course.level?.toLowerCase() === filters.level.toLowerCase();
      
      // Price type filter
      const matchesPriceType = 
        filters.priceType === 'all' || 
        (filters.priceType === 'free' && (!course.price || course.price === 0)) ||
        (filters.priceType === 'paid' && course.price > 0);
      
      // Duration filter
      const matchesDuration = filters.duration === 'all' || checkDuration(course, filters.duration);
      
      return matchesSearch && matchesCategory && matchesLevel && matchesPriceType && matchesDuration;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'new':
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        case 'popular':
        default:
          return (b.enrollments || 0) - (a.enrollments || 0);
      }
    });

  const checkDuration = (course, durationType) => {
    const hours = course.duration || 0;
    switch (durationType) {
      case 'short': return hours <= 10;
      case 'medium': return hours > 10 && hours <= 30;
      case 'long': return hours > 30;
      default: return true;
    }
  };

  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-md fixed w-full z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <MenteoLogo />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <Link 
                  to="/student/student-dashboard" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-extrabold mb-6"
            >
              Learn frontend — fast.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto"
            >
              Master in-demand tech skills with expert-led courses. Build real projects, earn certificates, and advance your career.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all"
            >
              Browse Courses
            </motion.button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-lg">
            <div className="flex items-center">
              <FaBook className="mr-2 text-2xl" />
              <span>{courses.length}+ Courses</span>
            </div>
            <div className="flex items-center">
              <FaUsers className="mr-2 text-2xl" />
              <span>Expert Instructors</span>
            </div>
            <div className="flex items-center">
              <FaCertificate className="mr-2 text-2xl" />
              <span>Certifications</span>
            </div>
            <div className="flex items-center">
              <FaShieldAlt className="mr-2 text-2xl" />
              <span>30-Day Refund</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div id="courses-section" className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3 items-center">
            <FaFilter className="text-gray-500" />
            
            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            {/* Level */}
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {levels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>

            {/* Price Type */}
            <select
              value={filters.priceType}
              onChange={(e) => setFilters({ ...filters, priceType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>

            {/* Duration */}
            <select
              value={filters.duration}
              onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Durations</option>
              <option value="short">Short (≤10 hrs)</option>
              <option value="medium">Medium (11-30 hrs)</option>
              <option value="long">Long (30+ hrs)</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ml-auto"
            >
              <option value="popular">Popular</option>
              <option value="new">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          {/* Active Filters Count */}
          {(filters.category !== 'all' || filters.level !== 'all' || filters.priceType !== 'all' || filters.duration !== 'all' || searchQuery) && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredCourses.length} of {courses.length} courses
              </p>
              <button
                onClick={() => {
                  setFilters({ category: 'all', level: 'all', priceType: 'all', duration: 'all', sort: 'popular' });
                  setSearchQuery('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setFilters({ category: 'all', level: 'all', priceType: 'all', duration: 'all', sort: 'popular' });
                setSearchQuery('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onBuyClick={handleBuyNow}
                onCardClick={handleCourseClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      <AnimatePresence>
        {showModal && selectedCourse && (
          <CourseDetailModal 
            course={selectedCourse} 
            onClose={() => setShowModal(false)}
            onBuyClick={handleBuyNow}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, onBuyClick, onCardClick }) => {
  const isFree = !course.price || course.price === 0;
  const hasDiscount = course.originalPrice && course.originalPrice > course.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all"
      onClick={() => onCardClick(course)}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {course.thumbnailUrl || course.thumbnail ? (
          <img 
            src={course.thumbnailUrl || course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FaGraduationCap className="text-white text-6xl opacity-50" />
          </div>
        )}
        
        {/* Tags */}
        <div className="absolute top-3 left-3 flex gap-2">
          {course.level && (
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
              {course.level}
            </span>
          )}
          {isFree && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              FREE
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description || 'Learn with this comprehensive course'}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          {course.duration && (
            <div className="flex items-center">
              <FaClock className="mr-1" />
              <span>{course.duration} hrs</span>
            </div>
          )}
          {course.rating && (
            <div className="flex items-center">
              <FaStar className="mr-1 text-yellow-400" />
              <span>{course.rating}</span>
            </div>
          )}
          {course.enrollments && (
            <div className="flex items-center">
              <FaUsers className="mr-1" />
              <span>{course.enrollments}</span>
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            {isFree ? (
              <span className="text-2xl font-bold text-green-600">FREE</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaRupeeSign className="text-xl" />
                  {course.price}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through flex items-center">
                    <FaRupeeSign className="text-xs" />
                    {course.originalPrice}
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Includes certificate • 30-day refund
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyClick(course);
            }}
            className={`${
              isFree 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold py-2 px-6 rounded-lg transition-colors`}
          >
            {isFree ? 'Enroll' : 'Buy Now'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Course Detail Modal Component
const CourseDetailModal = ({ course, onClose, onBuyClick }) => {
  const isFree = !course.price || course.price === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Preview Video/Image */}
          <div className="mb-6 relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden">
            {course.thumbnailUrl || course.thumbnail ? (
              <img 
                src={course.thumbnailUrl || course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FaPlayCircle className="text-white text-8xl opacity-50 cursor-pointer hover:opacity-70 transition-opacity" />
              </div>
            )}
            {course.previewVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <FaPlayCircle className="text-white text-8xl opacity-70 cursor-pointer hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">About This Course</h3>
            <p className="text-gray-600 leading-relaxed">
              {course.description || 'Learn with this comprehensive course designed for all skill levels.'}
            </p>
          </div>

          {/* What You'll Learn */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {course.duration && (
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <FaClock className="text-blue-600 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-bold text-gray-900">{course.duration} hrs</p>
              </div>
            )}
            {course.level && (
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <FaChartLine className="text-purple-600 text-2xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-lg font-bold text-gray-900">{course.level}</p>
              </div>
            )}
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <FaCertificate className="text-green-600 text-2xl mx-auto mb-2" />
              <p className="text-sm text-gray-600">Certificate</p>
              <p className="text-lg font-bold text-gray-900">Included</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <FaUndo className="text-yellow-600 text-2xl mx-auto mb-2" />
              <p className="text-sm text-gray-600">Refund</p>
              <p className="text-lg font-bold text-gray-900">30 Days</p>
            </div>
          </div>

          {/* Syllabus */}
          {course.modules && course.modules.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Course Syllabus</h3>
              <div className="space-y-2">
                {course.modules.map((module, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">{module.title}</p>
                    {module.topics && (
                      <p className="text-sm text-gray-600 mt-1">{module.topics.length} lessons</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructor */}
          {course.instructor && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instructor</h3>
              <p className="text-gray-700">{course.instructor}</p>
            </div>
          )}

          {/* FAQs */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Is this course suitable for beginners?</p>
                <p className="text-sm text-gray-600">
                  {course.level === 'beginner' 
                    ? 'Yes! This course is designed for complete beginners with no prior experience required.' 
                    : 'This course requires some basic knowledge. Check the prerequisites above.'}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Do I get lifetime access?</p>
                <p className="text-sm text-gray-600">Yes, you get lifetime access to all course materials and updates.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">What if I'm not satisfied?</p>
                <p className="text-sm text-gray-600">We offer a 30-day money-back guarantee, no questions asked.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg">
          <div>
            {isFree ? (
              <span className="text-3xl font-bold text-green-600">FREE</span>
            ) : (
              <div>
                <span className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaRupeeSign className="text-2xl" />
                  {course.price}
                </span>
                <p className="text-xs text-gray-500">Includes certificate • 30-day refund</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              onClose();
              onBuyClick(course);
            }}
            className={`${
              isFree 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors`}
          >
            {isFree ? 'Enroll for Free' : 'Buy Now'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PublicCoursesPage;
