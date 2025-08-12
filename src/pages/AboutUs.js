import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FaGraduationCap, 
  FaLaptopCode, 
  FaAward, 
  FaCertificate, 
  FaBrain, 
  FaLightbulb,
  FaMoon, 
  FaSun,
  FaBars,
  FaTimes,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const AboutUs = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header / Navigation */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            {/* Logo */}
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link to="/" className="flex items-center">
                <FaGraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Mentneo</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-10">
              <Link to="/" className="text-base font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">Home</Link>
              <Link to="/about" className="text-base font-medium text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400">About Us</Link>
              <Link to="/contact" className="text-base font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">Contact</Link>
            </nav>

            {/* Right side buttons */}
            <div className="hidden md:flex items-center justify-end space-x-8 md:flex-1 lg:w-0">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none"
                aria-label="Toggle dark mode"
              >
                {darkMode ? 
                  <FaSun className="h-5 w-5" /> : 
                  <FaMoon className="h-5 w-5" />
                }
              </button>
              <Link to="/login" className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <FaSignInAlt className="mr-2" /> Sign In
              </Link>
              <Link to="/signup" className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-indigo-600 bg-white hover:bg-gray-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
                <FaUserPlus className="mr-2" /> Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 -my-2 md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open menu</span>
                {mobileMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-50">
            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white dark:bg-slate-800 divide-y-2 divide-gray-50 dark:divide-slate-700">
              <div className="pt-5 pb-6 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <FaGraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="-mr-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none"
                      onClick={toggleMobileMenu}
                    >
                      <span className="sr-only">Close menu</span>
                      <FaTimes className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid gap-y-8">
                    <Link to="/" className="flex items-center p-3 -m-3 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700">
                      <FaHome className="flex-shrink-0 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="ml-3 text-base font-medium text-gray-900 dark:text-white">Home</span>
                    </Link>
                    <Link to="/about" className="flex items-center p-3 -m-3 rounded-md bg-gray-50 dark:bg-slate-700">
                      <FaInfoCircle className="flex-shrink-0 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="ml-3 text-base font-medium text-gray-900 dark:text-white">About Us</span>
                    </Link>
                    <Link to="/contact" className="flex items-center p-3 -m-3 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700">
                      <FaEnvelope className="flex-shrink-0 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="ml-3 text-base font-medium text-gray-900 dark:text-white">Contact</span>
                    </Link>
                    <button 
                      onClick={toggleDarkMode}
                      className="flex items-center p-3 -m-3 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 text-left w-full"
                    >
                      {darkMode ? (
                        <>
                          <FaSun className="flex-shrink-0 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          <span className="ml-3 text-base font-medium text-gray-900 dark:text-white">Light Mode</span>
                        </>
                      ) : (
                        <>
                          <FaMoon className="flex-shrink-0 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          <span className="ml-3 text-base font-medium text-gray-900 dark:text-white">Dark Mode</span>
                        </>
                      )}
                    </button>
                  </nav>
                </div>
              </div>
              <div className="py-6 px-5 space-y-6">
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <Link to="/login" className="text-base font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                    Sign in
                  </Link>
                  <Link to="/signup" className="text-base font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">About</span>
              <span className="block text-indigo-600 dark:text-indigo-400">Mentneo</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Transforming how students learn with our innovative platform focused on effective learning methodologies and personalized education.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Our Mission */}
      <div className="py-12 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:text-center"
          >
            <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">Our Mission</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Empowering Students Through Learning Science
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              At Mentneo, we believe in transforming education by teaching students how to learn effectively using evidence-based methodologies and techniques.
            </p>
          </motion.div>

          <div className="mt-16">
            <motion.dl 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10"
            >
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 dark:bg-indigo-600 text-white">
                    <FaBrain className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Learning How to Learn</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                  Our platform teaches metacognitive strategies that help students understand how their brain processes information and how to optimize their learning approach.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 dark:bg-indigo-600 text-white">
                    <FaLaptopCode className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Technology-Enhanced Learning</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                  We leverage cutting-edge technology to deliver personalized learning experiences that adapt to each student's needs and learning style.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 dark:bg-indigo-600 text-white">
                    <FaCertificate className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Premium Certificates</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                  Our certification programs are recognized by leading educational institutions and employers, giving students a competitive edge in their academic and professional journeys.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 dark:bg-indigo-600 text-white">
                    <FaLightbulb className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Evidence-Based Methods</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                  Our curriculum is built on proven learning science principles like spaced repetition, retrieval practice, and elaborative questioning to maximize knowledge retention.
                </dd>
              </div>
            </motion.dl>
          </div>
        </div>
      </div>

      {/* Our Certifications */}
      <div className="py-12 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:text-center mb-12"
          >
            <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">Certification</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Premium Learning Certificates
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Our certification programs provide recognition for your learning achievements and open doors to new opportunities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaAward className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Learning Mastery Certificate</h3>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-base text-gray-500 dark:text-gray-300">
                    Demonstrates proficiency in metacognitive strategies, effective study techniques, and learning optimization methods.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 px-5 py-3">
                <div className="text-sm">
                  <Link to="/certificates/learning-mastery" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Learn more about this certificate →
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaAward className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Advanced Learning Specialist</h3>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-base text-gray-500 dark:text-gray-300">
                    For those who have mastered advanced learning techniques and can apply them across multiple domains and subjects.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 px-5 py-3">
                <div className="text-sm">
                  <Link to="/certificates/advanced-specialist" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Learn more about this certificate →
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaAward className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Learning Coach Certification</h3>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-base text-gray-500 dark:text-gray-300">
                    Qualifies graduates to mentor others in effective learning strategies and help them overcome learning challenges.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 px-5 py-3">
                <div className="text-sm">
                  <Link to="/certificates/learning-coach" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Learn more about this certificate →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Learning Approach */}
      <div className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:text-center"
          >
            <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">Our Approach</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              The Science Behind Effective Learning
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Our methodology combines cutting-edge cognitive science with practical techniques that you can apply immediately.
            </p>
          </motion.div>

          <div className="mt-16">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  Evidence-Based Learning Techniques
                </h3>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-300">
                  Our curriculum is built on scientifically proven methods that enhance memory retention, comprehension, and application of knowledge.
                </p>
                <div className="mt-10 space-y-10">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 dark:bg-indigo-600 text-white">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Spaced Repetition</h4>
                      <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                        We use optimized review schedules to help you revisit information just before you're about to forget it, strengthening neural connections.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 dark:bg-indigo-600 text-white">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Retrieval Practice</h4>
                      <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                        Our active recall exercises force your brain to retrieve information, which is far more effective than passive re-reading.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 dark:bg-indigo-600 text-white">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Interleaving</h4>
                      <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                        By mixing different topics and problem types, we help you develop the ability to select appropriate strategies for each situation.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-10 lg:mt-0"
              >
                <div className="bg-indigo-50 dark:bg-slate-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-8 sm:p-10">
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        Our Learning Framework
                      </h3>
                      <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
                        The Mentneo methodology transforms how you approach learning, making it more efficient and effective.
                      </p>
                    </div>
                    <div className="mt-8">
                      <div className="flex items-center">
                        <h4 className="flex-shrink-0 pr-4 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-wide">
                          What you'll learn
                        </h4>
                        <div className="flex-1 border-t-2 border-gray-200 dark:border-slate-600"></div>
                      </div>
                      <ul className="mt-8 space-y-5">
                        <li className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="ml-3 text-base text-gray-700 dark:text-gray-300">
                            Memory enhancement techniques based on brain science
                          </p>
                        </li>
                        <li className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="ml-3 text-base text-gray-700 dark:text-gray-300">
                            How to eliminate procrastination and build productive habits
                          </p>
                        </li>
                        <li className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="ml-3 text-base text-gray-700 dark:text-gray-300">
                            Metacognitive strategies to understand your learning process
                          </p>
                        </li>
                        <li className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="ml-3 text-base text-gray-700 dark:text-gray-300">
                            How to transfer knowledge between different domains
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 dark:bg-indigo-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to transform your learning?</span>
            <span className="block text-indigo-200">Start your journey with Mentneo today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/contact" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <FaGraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Mentneo</span>
              </div>
              <p className="text-gray-500 dark:text-gray-300 text-base">
                Transforming education through the science of learning.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>

                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>

                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>

                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider">
                    Solutions
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link to="/learning-techniques" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Learning Techniques
                      </Link>
                    </li>
                    <li>
                      <Link to="/certificates" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Certification
                      </Link>
                    </li>
                    <li>
                      <Link to="/mentorship" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Mentorship
                      </Link>
                    </li>
                    <li>
                      <Link to="/self-assessment" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Self Assessment
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider">
                    Support
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link to="/help" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link to="/faq" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link to="/community" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Community
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider">
                    Company
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link to="/about" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link to="/team" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Team
                      </Link>
                    </li>
                    <li>
                      <Link to="/careers" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Careers
                      </Link>
                    </li>
                    <li>
                      <Link to="/blog" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Blog
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider">
                    Legal
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link to="/privacy" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link to="/terms" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Terms
                      </Link>
                    </li>
                    <li>
                      <Link to="/cookies" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Cookie Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="/licensing" className="text-base text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Licensing
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-base text-gray-400 dark:text-gray-300 xl:text-center">
              &copy; {new Date().getFullYear()} Mentneo, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
