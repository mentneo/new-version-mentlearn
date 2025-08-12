import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userType, setUserType] = useState('student');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 shadow-md fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-white">
                MentorConnect
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6 items-center">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">Home</Link>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">About</Link>
              <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">Contact</Link>
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</Link>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? <FaSun className="h-5 w-5 text-yellow-400" /> : <FaMoon className="h-5 w-5 text-gray-700" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {mobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 px-4 pb-4 space-y-2">
            <Link to="/" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">Home</Link>
            <Link to="/about" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">About</Link>
            <Link to="/contact" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">Contact</Link>
            <Link to="/login" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">Login</Link>
            <Link to="/signup" className="block text-blue-600 font-medium hover:text-blue-700">Sign Up</Link>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? <FaSun className="h-5 w-5 text-yellow-400" /> : <FaMoon className="h-5 w-5 text-gray-700" />}
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            Find Your Perfect Mentor or Mentee
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Connect, learn, and grow with the right guidance.
          </p>
        </motion.div>

        {/* Sign Up Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Sign up as:
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setUserType('student')}
                className={`px-4 py-2 rounded-full text-sm font-medium flex-1 transition ${
                  userType === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setUserType('mentor')}
                className={`px-4 py-2 rounded-full text-sm font-medium flex-1 transition ${
                  userType === 'mentor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Mentor
              </button>
            </div>
          </div>

          <Link
            to="/signup"
            className="w-full flex items-center justify-center px-5 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
          >
            Continue
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
