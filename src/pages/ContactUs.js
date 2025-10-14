import React, { useState } from 'react'; // Remove unused useEffect
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
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Kakinada coordinates
const center = {
  lat: 16.9891,
  lng: 82.2475
};

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save the contact form data to Firestore
      await addDoc(collection(db, "contactSubmissions"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new' // Status field for admin to track (new, read, responded)
      });
      
      // Success handling
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setIsSubmitting(false);
      setSubmitError(true);
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmitError(false);
      }, 5000);
    }
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
                <div className="relative">
                  <h2 className="text-lg font-semibold text-white">Contact Information</h2>
                  <p className="mt-4 text-base text-indigo-200">
                    Have questions or feedback? Reach out to us through any of the following channels:
                  </p>
                  <div className="mt-6">
                    <div className="flex items-center text-indigo-100">
                      <FaPhoneAlt className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                      <span className="ml-3 text-base">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center text-indigo-100 mt-4">
                      <FaEnvelope className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                      <span className="ml-3 text-base">info@mentneo.com</span>
                    </div>
                    <div className="flex items-center text-indigo-100 mt-4">
                      <FaMapMarkerAlt className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                      <span className="ml-3 text-base">123 Mentneo St, Kakinada, AP 533001</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-md font-semibold text-white">Follow Us</h3>
                    <div className="flex space-x-4 mt-2">
                      <a href="#" className="text-indigo-200 hover:text-white transition duration-150">
                        <FaFacebookF className="h-5 w-5" />
                        <span className="sr-only">Facebook</span>
                      </a>
                      <a href="#" className="text-indigo-200 hover:text-white transition duration-150">
                        <FaTwitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                      </a>
                      <a href="#" className="text-indigo-200 hover:text-white transition duration-150">
                        <FaInstagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                      </a>
                      <a href="#" className="text-indigo-200 hover:text-white transition duration-150">
                        <FaLinkedinIn className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact form */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative bg-white dark:bg-slate-800 py-10 px-6 sm:px-10 xl:p-12"
              >
                <div className="absolute inset-0 pointer-events-none sm:hidden" aria-hidden="true">
                  <svg className="absolute inset-0 w-full h-full" width="343" height="388" viewBox="0 0 343 388" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-99 461.107L608.107-246l707.103 707.107-707.103 707.103L-99 461.107z" fill="url(#linear3)" fillOpacity=".1" />
                    <defs>
                      <linearGradient id="linear3" x1="254.553" y1="107.554" x2="961.66" y2="814.66" gradientUnits="userSpace
