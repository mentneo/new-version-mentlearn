import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FaGraduationCap, 
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMoon, 
  FaSun,
  FaBars,
  FaTimes,
  FaHome,
  FaInfoCircle,
  FaUserPlus,
  FaSignInAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const ContactUs = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
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
              <Link to="/about" className="text-base font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">About Us</Link>
              <Link to="/contact" className="text-base font-medium text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400">Contact</Link>
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
                    <Link to="/about" className="flex items-center p-3 -m-3 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700">
                      <FaInfoCircle className="flex-shrink-0 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="ml-3 text-base font-medium text-gray-900 dark:text-white">About Us</span>
                    </Link>
                    <Link to="/contact" className="flex items-center p-3 -m-3 rounded-md bg-gray-50 dark:bg-slate-700">
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
              <span className="block">Get in Touch</span>
              <span className="block text-indigo-600 dark:text-indigo-400">We'd Love to Hear From You</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Have questions about our learning methodology, courses, or need help? Our team is ready to assist you.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Information & Form */}
      <div className="bg-white dark:bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white dark:bg-slate-800 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Contact information */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden py-10 px-6 bg-indigo-700 dark:bg-indigo-800 sm:px-10 xl:p-12"
              >
                <div className="absolute inset-0 pointer-events-none sm:hidden" aria-hidden="true">
                  <svg className="absolute inset-0 w-full h-full" width="343" height="388" viewBox="0 0 343 388" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-99 461.107L608.107-246l707.103 707.107-707.103 707.103L-99 461.107z" fill="url(#linear1)" fillOpacity=".1" />
                    <defs>
                      <linearGradient id="linear1" x1="254.553" y1="107.554" x2="961.66" y2="814.66" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fff" />
                        <stop offset="1" stopColor="#fff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="hidden absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none sm:block lg:hidden" aria-hidden="true">
                  <svg className="absolute inset-0 w-full h-full" width="359" height="339" viewBox="0 0 359 339" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-161 382.107L546.107-325l707.103 707.107-707.103 707.103L-161 382.107z" fill="url(#linear2)" fillOpacity=".1" />
                    <defs>
                      <linearGradient id="linear2" x1="192.553" y1="28.553" x2="899.66" y2="735.66" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fff" />
                        <stop offset="1" stopColor="#fff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="hidden absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none lg:block" aria-hidden="true">
                  <svg className="absolute inset-0 w-full h-full" width="160" height="678" viewBox="0 0 160 678" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-161 679.107L546.107-28l707.103 707.107-707.103 707.103L-161 679.107z" fill="url(#linear3)" fillOpacity=".1" />
                    <defs>
                      <linearGradient id="linear3" x1="192.553" y1="325.553" x2="899.66" y2="1032.66" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fff" />
                        <stop offset="1" stopColor="#fff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">Contact Information</h3>
                <p className="mt-6 text-base text-indigo-50 max-w-3xl">
                  Our team is ready to assist you with any questions you may have about our learning platform, courses, or methodology.
                </p>
                <dl className="mt-8 space-y-6">
                  <dt><span className="sr-only">Phone number</span></dt>
                  <dd className="flex text-base text-indigo-50">
                    <FaPhoneAlt className="flex-shrink-0 w-6 h-6 text-indigo-200" aria-hidden="true" />
                    <span className="ml-3">+1 (555) 123-4567</span>
                  </dd>
                  <dt><span className="sr-only">Email</span></dt>
                  <dd className="flex text-base text-indigo-50">
                    <FaEnvelope className="flex-shrink-0 w-6 h-6 text-indigo-200" aria-hidden="true" />
                    <span className="ml-3">contact@mentneo.com</span>
                  </dd>
                  <dt><span className="sr-only">Address</span></dt>
                  <dd className="flex text-base text-indigo-50">
                    <FaMapMarkerAlt className="flex-shrink-0 w-6 h-6 text-indigo-200" aria-hidden="true" />
                    <span className="ml-3">123 Learning Avenue, Education District<br />San Francisco, CA 94158</span>
                  </dd>
                </dl>
                <ul className="mt-12 flex space-x-6">
                  <li>
                    <a className="text-indigo-200 hover:text-indigo-100" href="#">
                      <span className="sr-only">Facebook</span>
                      <FaFacebookF className="h-6 w-6" aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a className="text-indigo-200 hover:text-indigo-100" href="#">
                      <span className="sr-only">Twitter</span>
                      <FaTwitter className="h-6 w-6" aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a className="text-indigo-200 hover:text-indigo-100" href="#">
                      <span className="sr-only">Instagram</span>
                      <FaInstagram className="h-6 w-6" aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a className="text-indigo-200 hover:text-indigo-100" href="#">
                      <span className="sr-only">LinkedIn</span>
                      <FaLinkedinIn className="h-6 w-6" aria-hidden="true" />
                    </a>
                  </li>
                </ul>
              </motion.div>

              {/* Contact form */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12 bg-white dark:bg-slate-800"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Send us a message</h3>
                <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows="6"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      ></textarea>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    {submitSuccess ? (
                      <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Message sent successfully</h3>
                            <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                              <p>Thank you for reaching out! We'll get back to you as soon as possible.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : submitError ? (
                      <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">There was an error sending your message</h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                              <p>Please try again later or contact us directly at contact@mentneo.com.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
              Can't find the answer you're looking for? Contact our team.
            </p>
          </motion.div>
          <div className="mt-12">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <dt className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  How does the Mentneo learning platform work?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  Our platform combines evidence-based learning techniques with personalized guidance. We focus on teaching you how to learn effectively using spaced repetition, retrieval practice, and other scientifically proven methods.
                </dd>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <dt className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Are Mentneo certificates recognized by employers?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  Yes, our certificates are recognized by many leading employers who value the learning methodology skills our students develop. The ability to learn effectively is a key skill in today's fast-changing workplace.
                </dd>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <dt className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  How long does it take to complete a course?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  Course duration varies depending on the specific program, but our learning methodology courses typically take 4-8 weeks to complete. We emphasize quality learning over speed, focusing on true understanding and retention.
                </dd>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <dt className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Can I access courses on mobile devices?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  Yes, our platform is fully responsive and works on all devices including smartphones and tablets. We recommend using larger screens for some interactive exercises, but all content is accessible on mobile.
                </dd>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <dt className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Is there a free trial available?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  Yes, we offer a 7-day free trial that gives you access to sample lessons from our courses. This allows you to experience our unique approach to learning before making a commitment.
                </dd>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <dt className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  How can I get support if I'm struggling with a course?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  We provide multiple support channels including direct mentor assistance, community forums, and detailed help resources. Our goal is to ensure every student succeeds in mastering effective learning techniques.
                </dd>
              </motion.div>
            </dl>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white dark:bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Visit Our Office
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
              We're located in the heart of San Francisco's tech district.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-lg overflow-hidden shadow-lg"
          >
            <div className="relative h-96 w-full">
              {/* This would be a real map in production */}
              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-400 text-lg">
                  Interactive Map Would Be Displayed Here
                </span>
              </div>
            </div>
          </motion.div>
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            <p>123 Learning Avenue, Education District, San Francisco, CA 94158</p>
            <p className="mt-2">Open Monday - Friday, 9AM - 6PM PT</p>
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

export default ContactUs;
