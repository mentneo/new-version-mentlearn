import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaSearch, 
  FaArrowLeft 
} from 'react-icons/fa';
import MenteoLogo from '../components/MenteoLogo';

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByProgress, setFilterByProgress] = useState('all');
  const [sortBy, setSortBy] = useState('progress');

  // All student reviews from the provided data
  const allReviews = [
    {
      name: "abhi yeduru",
      email: "swathi@gmail.com",
      course: "Frontend Development",
      progress: 100,
      enrollDate: "15/6/2025",
      quote: "Completed the entire frontend development course! The journey was incredible with excellent mentorship and hands-on projects. Now I'm ready to take on any frontend challenge!",
      rating: 5
    },
    {
      name: "K. Varshitha",
      email: "varshithakalidindi339@gmail.com",
      course: "Frontend Development",
      progress: 82,
      enrollDate: "11/8/2025",
      quote: "I'm almost done with the frontend course and I can't believe how much I've learned! The practical approach and mentor support made complex concepts easy to understand. Highly recommend Mentneo to anyone serious about coding!",
      rating: 5
    },
    {
      name: "Sharmila Dokala",
      email: "sharmiladokala10@gmail.com",
      course: "Frontend Development",
      progress: 58,
      enrollDate: "5/7/2025",
      quote: "Mentneo's frontend development course has been amazing! The structured curriculum and hands-on projects helped me build a strong foundation in web development. I'm already 58% through the course and loving every module!",
      rating: 5
    },
    {
      name: "Nalla Saransai",
      email: "saransainalla@gmail.com",
      course: "Frontend Development",
      progress: 50,
      enrollDate: "5/7/2025",
      quote: "Halfway through my journey with Mentneo and it's been incredible! The project-based learning approach really helps in understanding real-world applications. The community support is fantastic too!",
      rating: 5
    },
    {
      name: "Padma Anupoju",
      email: "padmaanupoju2@gmail.com",
      course: "Frontend Development",
      progress: 50,
      enrollDate: "11/8/2025",
      quote: "The quality of education at Mentneo is top-notch. The mentors are always available to help, and the course content is updated with latest industry trends. Great investment for my career!",
      rating: 5
    },
    {
      name: "ACHANTA Siva Rama Krishna",
      email: "asivaramakrishna018@gmail.com",
      course: "Frontend Development",
      progress: 45,
      enrollDate: "5/7/2025",
      quote: "Mentneo has exceeded my expectations! The interactive learning modules and practical assignments have significantly improved my coding skills. Looking forward to completing the remaining course!",
      rating: 5
    },
    {
      name: "Asritha Dasari",
      email: "asrithadasari13@gmail.com",
      course: "Frontend Development",
      progress: 42,
      enrollDate: "30/7/2025",
      quote: "The learning experience at Mentneo is phenomenal. From basic HTML to advanced React concepts, everything is explained clearly with practical examples. The support system is excellent!",
      rating: 5
    },
    {
      name: "K Sandhya",
      email: "sandhyakakarla63763@gmail.com",
      course: "Frontend Development",
      progress: 37,
      enrollDate: "11/8/2025",
      quote: "The course structure is well-organized and the learning pace is perfect for working professionals. The mentors are very supportive and patient.",
      rating: 5
    },
    {
      name: "P.N. Sasank",
      email: "sasank@gmail.com",
      course: "Frontend Development",
      progress: 32,
      enrollDate: "5/7/2025",
      quote: "Excellent mentorship and practical projects that prepare you for real-world development challenges. The curriculum is comprehensive and industry-relevant.",
      rating: 5
    },
    {
      name: "Edupuganti Harshitha",
      email: "edupugantiharshitha3@gmail.com",
      course: "Frontend Development",
      progress: 32,
      enrollDate: "12/8/2025",
      quote: "Mentneo's approach to teaching frontend development is comprehensive and easy to follow. The hands-on projects really help solidify the concepts.",
      rating: 4
    },
    {
      name: "Komali Rama Siri",
      email: "ramasirikomali@gmail.com",
      course: "Frontend Development",
      progress: 26,
      enrollDate: "11/8/2025",
      quote: "Great platform for learning web development with hands-on experience and community support. The learning materials are well-structured.",
      rating: 4
    },
    {
      name: "Y Saikrishna",
      email: "saikrishnay146@gmail.com",
      course: "Frontend Development",
      progress: 24,
      enrollDate: "5/7/2025",
      quote: "The course content is up-to-date with industry standards and the projects are very practical. Great experience so far!",
      rating: 4
    },
    {
      name: "Pappala Rajeswari",
      email: "rajeswaripappala926@gmail.com",
      course: "Frontend Development",
      progress: 24,
      enrollDate: "11/8/2025",
      quote: "Amazing learning experience! The step-by-step approach makes complex topics easy to understand. The mentor feedback is very helpful.",
      rating: 5
    },
    {
      name: "M. Lasya",
      email: "munurulasya@gmail.com",
      course: "Frontend Development",
      progress: 21,
      enrollDate: "11/8/2025",
      quote: "Just started my journey with Mentneo and I'm already impressed with the quality of content and teaching methodology. Very promising start!",
      rating: 4
    },
    {
      name: "Sunkara Venkata Ramana",
      email: "siddusunkara203@gmail.com",
      course: "Frontend Development",
      progress: 21,
      enrollDate: "5/7/2025",
      quote: "The practical approach to learning is what sets Mentneo apart. Real projects and real-world applications make learning effective.",
      rating: 4
    },
    {
      name: "Kallagunta Surya",
      email: "kallaguntasurya2@gmail.com",
      course: "Frontend Development",
      progress: 18,
      enrollDate: "5/7/2025",
      quote: "Good learning platform with quality content. The mentors are knowledgeable and always ready to help with doubts.",
      rating: 4
    },
    {
      name: "Ponnada Sai Harinadh",
      email: "saiponnada29@gmali.com",
      course: "Frontend Development",
      progress: 18,
      enrollDate: "11/8/2025",
      quote: "Enjoying the learning process at Mentneo. The course structure is logical and builds concepts progressively.",
      rating: 4
    },
    {
      name: "Baddi Reddy Nagachakra",
      email: "nandhinibaddireddy@gmail.com",
      course: "Frontend Development",
      progress: 16,
      enrollDate: "11/8/2025",
      quote: "Early in my journey but very satisfied with the quality of education. The practical exercises are particularly helpful.",
      rating: 4
    },
    {
      name: "Munuru Sravani",
      email: "munurusravani13@gmail.com",
      course: "Frontend Development",
      progress: 16,
      enrollDate: "5/7/2025",
      quote: "Great start to my coding journey! The fundamentals are explained clearly and the support system is excellent.",
      rating: 4
    },
    {
      name: "Chennamsetti Mounika Ganga Bhavani",
      email: "mounikachennamsetti177@gmail.com",
      course: "Frontend Development",
      progress: 16,
      enrollDate: "11/8/2025",
      quote: "Learning frontend development has been a great experience. The course content is comprehensive and easy to follow.",
      rating: 4
    }
  ];

  // Filter and sort reviews
  const filteredReviews = allReviews
    .filter(review => {
      const matchesSearch = review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.quote.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProgress = filterByProgress === 'all' ||
                             (filterByProgress === 'beginner' && review.progress < 25) ||
                             (filterByProgress === 'intermediate' && review.progress >= 25 && review.progress < 75) ||
                             (filterByProgress === 'advanced' && review.progress >= 75);
      return matchesSearch && matchesProgress;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'progress':
          return b.progress - a.progress;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.enrollDate) - new Date(a.enrollDate);
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    totalReviews: allReviews.length,
    averageRating: (allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1),
    averageProgress: Math.round(allReviews.reduce((sum, review) => sum + review.progress, 0) / allReviews.length),
    completedStudents: allReviews.filter(review => review.progress === 100).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md fixed w-full z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center mr-4">
                <FaArrowLeft className="h-5 w-5 text-gray-600 hover:text-[#007bff]" />
              </Link>
              <Link to="/" className="flex items-center">
                <MenteoLogo />
              </Link>
            </div>
            <div className="flex items-center">
              <Link to="/login" className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium">Log In</Link>
              <Link to="/signup" className="bg-gradient-to-r from-[#007bff] to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md ml-4">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Student <span className="bg-gradient-to-r from-[#007bff] to-purple-500 text-transparent bg-clip-text">Reviews</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Real reviews from our students who are transforming their careers through Mentneo's programs
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-[#007bff]">{stats.totalReviews}</div>
              <div className="text-gray-600">Total Reviews</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-[#007bff] flex items-center justify-center">
                {stats.averageRating} <FaStar className="text-yellow-500 ml-1" />
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-[#007bff]">{stats.averageProgress}%</div>
              <div className="text-gray-600">Avg Progress</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-[#007bff]">{stats.completedStudents}</div>
              <div className="text-gray-600">Completed</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Filters and Search */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007bff] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Progress Filter */}
            <div>
              <select
                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007bff] focus:border-transparent"
                value={filterByProgress}
                onChange={(e) => setFilterByProgress(e.target.value)}
              >
                <option value="all">All Progress Levels</option>
                <option value="beginner">Beginner (0-24%)</option>
                <option value="intermediate">Intermediate (25-74%)</option>
                <option value="advanced">Advanced (75-100%)</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007bff] focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="progress">Sort by Progress</option>
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="recent">Sort by Recent</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Student Info */}
                <div className="flex items-center mb-4">
                  <img
                    className="h-12 w-12 rounded-full bg-gray-200 object-cover"
                    src={`https://ui-avatars.com/api/?name=${review.name.replace(' ', '+')}&background=0062ff&color=fff`}
                    alt={review.name}
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{review.name}</h3>
                    <p className="text-sm text-gray-500">{review.course}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {review.progress}% Complete
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                </div>

                {/* Review Text */}
                <div className="relative">
                  <div className="absolute -top-2 -left-2 text-4xl text-[#007bff]/20">"</div>
                  <p className="text-gray-600 pl-4 leading-relaxed">{review.quote}</p>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Course Progress</span>
                    <span>{review.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#007bff] to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${review.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Enrollment Date */}
                <div className="mt-4 text-xs text-gray-500">
                  Enrolled: {review.enrollDate}
                </div>
              </div>

              {/* Verified Badge */}
              <div className="bg-gray-50 px-6 py-3 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Verified Student
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No reviews found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterByProgress('all');
                setSortBy('progress');
              }}
              className="mt-4 px-6 py-2 bg-[#007bff] text-white rounded-lg hover:bg-blue-600"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#007bff] to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Success Stories?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your journey with Mentneo and become the next success story
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup" className="px-8 py-3 bg-white text-[#007bff] font-medium rounded-lg hover:bg-gray-100 shadow-md">
              Start Learning Now
            </Link>
            <Link to="/demo" className="px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-[#007bff]">
              Book Free Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reviews;
