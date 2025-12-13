import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { 
  FaBook, FaUsers, FaStar, FaRupeeSign, FaClock, FaChartLine,
  FaPlayCircle, FaCertificate, FaGraduationCap
} from 'react-icons/fa/index.esm.js';

const OurCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const db = getFirestore();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('🔍 OUR COURSES PAGE - Fetching all courses...');
      
      const coursesRef = collection(db, 'courses');
      // Fetch ALL courses first
      const querySnapshot = await getDocs(coursesRef);
      
      console.log(`📊 Total courses in database: ${querySnapshot.size}`);
      
      // Filter to show only published courses (published === true OR published is undefined)
      const coursesList = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(course => {
          // Show course if published is true OR undefined (backward compatibility)
          // Hide only if explicitly false
          const shouldShow = course.published !== false;
          
          console.log(`📚 Course: "${course.title}"`);
          console.log(`   Published: ${course.published} (${typeof course.published})`);
          console.log(`   Status: ${course.status || 'N/A'}`);
          console.log(`   Creator: ${course.creatorId || 'N/A'}`);
          console.log(`   Show on page: ${shouldShow ? '✅ YES' : '❌ NO'}`);
          console.log('---');
          
          return shouldShow;
        });
      
      console.log('✅ Courses to display:', coursesList.length);
      console.log('� Course titles:', coursesList.map(c => c.title));
      
      setCourses(coursesList);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      console.error('Error details:', error.message);
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || course.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-4 animate-fade-in">
              Explore Our Courses
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Learn from industry experts and take your skills to the next level with our comprehensive courses
            </p>
            <div className="flex justify-center items-center gap-6 text-lg">
              <div className="flex items-center">
                <FaBook className="mr-2" />
                <span>{courses.length} Courses</span>
              </div>
              <div className="flex items-center">
                <FaUsers className="mr-2" />
                <span>Expert Instructors</span>
              </div>
              <div className="flex items-center">
                <FaCertificate className="mr-2" />
                <span>Certifications</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Courses Found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No published courses available at the moment'}
            </p>
            {!searchQuery && filter === 'all' && courses.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>🔧 For Developers:</strong> Open browser console (F12) to see detailed course information.
                </p>
                <p className="text-xs text-yellow-700">
                  If courses exist in the database but aren't showing, they may need the 'published' field set to true.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col"
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FaGraduationCap className="text-white text-6xl opacity-50" />
                    </div>
                  )}
                  {course.category && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {course.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Creator */}
                  <p className="text-sm text-indigo-600 mb-3 flex items-center">
                    <FaUsers className="mr-2" />
                    {course.creatorName || 'Expert Instructor'}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                    {course.description || 'Learn comprehensive skills and advance your career with this course.'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-2 text-indigo-500" />
                      <span>{course.enrollments || 0} enrolled</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaStar className="mr-2 text-yellow-500" />
                      <span>{course.rating || 0} rating</span>
                    </div>
                    {course.duration && (
                      <div className="flex items-center text-gray-600">
                        <FaClock className="mr-2 text-green-500" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    {course.level && (
                      <div className="flex items-center text-gray-600">
                        <FaChartLine className="mr-2 text-purple-500" />
                        <span>{course.level}</span>
                      </div>
                    )}
                  </div>

                  {/* Curriculum Link */}
                  {course.curriculumUrl && (
                    <div className="mb-3">
                      <a
                        href={course.curriculumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Curriculum
                      </a>
                    </div>
                  )}

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-2xl font-bold text-indigo-600 flex items-center">
                        <FaRupeeSign className="text-xl" />
                        {course.price || 0}
                      </span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          ₹{course.originalPrice}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/signup`}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 font-medium"
                    >
                      <FaPlayCircle />
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of students already learning on our platform
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/signup"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition-all duration-300 font-semibold"
              >
                Sign Up Now
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-indigo-600 transition-all duration-300 font-semibold"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurCourses;
