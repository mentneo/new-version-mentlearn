import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/LandingPage.css';
import { 
  FaGraduationCap, 
  FaLaptopCode, 
  FaComments, 
  FaProjectDiagram, 
  FaChartLine, 
  FaGithub, 
  FaTwitter, 
  FaLinkedin, 
  FaYoutube, 
  FaInstagram,
  FaMoon, 
  FaSun,
  FaBars,
  FaTimes,
  FaHome,
  FaBook,
  FaUserFriends,
  FaDollarSign,
  FaSignInAlt,
  FaUserPlus,
  FaInfoCircle,
  FaEnvelope,
  FaCreditCard
} from 'react-icons/fa';

const ModernLandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const showPaymentButton = location.pathname.includes('/abhi');

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 min-h-screen">
        
        {/* Header / Navigation */}
        <header className="relative z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 md:py-6">
              {/* Logo */}
              <div className="flex justify-start lg:w-0 lg:flex-1">
                <Link to="/" className="flex items-center">
                  <img src="/logo.png" alt="Mentneo" className="h-10 w-auto mr-2" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mentneo</span>
                </Link>
              </div>
              
              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                  <FaHome className="mr-2" />
                  Home
                </Link>
                <Link to="/about" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                  <FaInfoCircle className="mr-2" />
                  About Us
                </Link>
                <Link to="/contact" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                  <FaEnvelope className="mr-2" />
                  Contact
                </Link>
                <Link to="/courses/full-stack-development" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                  <FaBook className="mr-2" />
                  Courses
                </Link>
                <Link to="/mentors" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                  <FaUserFriends className="mr-2" />
                  Mentors
                </Link>
              </nav>
              
              {/* Login & Dark Mode Buttons */}
              <div className="hidden md:flex items-center justify-end space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
                </button>
                
                {showPaymentButton && (
                  <a 
                    href="https://mentneodashboard.vercel.app/login" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center whitespace-nowrap text-base font-medium text-white bg-green-600 px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
                  >
                    <FaCreditCard className="mr-2" />
                    Payments
                  </a>
                )}
                
                <Link to="/login" className="flex items-center whitespace-nowrap text-base font-medium text-gray-700 dark:text-gray-200 border border-blue-500 dark:border-blue-400 px-4 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                  <FaSignInAlt className="mr-2" />
                  Log In
                </Link>
                
                <Link to="/signup" className="flex items-center whitespace-nowrap text-base font-medium text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">
                  <FaUserPlus className="mr-2" />
                  Sign Up
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="bg-blue-50 dark:bg-blue-900/30 rounded-full p-2 inline-flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={toggleMobileMenu}
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle menu"
                >
                  <FaBars className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-25" onClick={toggleMobileMenu}></div>
              <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-slate-900 shadow-xl z-50 overflow-y-auto">
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-center">
                    <img src="/logo.png" alt="Mentneo" className="h-8 w-auto mr-2" />
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mentneo</span>
                  </div>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-slate-700 focus:outline-none"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="pt-5 pb-6 px-5">
                  <nav className="grid gap-y-2">
                    <Link 
                      to="/" 
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <FaHome className="mr-4 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Home
                    </Link>
                    <Link 
                      to="/about" 
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <FaInfoCircle className="mr-4 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      About Us
                    </Link>
                    <Link 
                      to="/contact" 
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <FaEnvelope className="mr-4 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Contact
                    </Link>
                    <Link 
                      to="/courses/full-stack-development" 
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <FaBook className="mr-4 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Courses
                    </Link>
                    <Link 
                      to="/mentors" 
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      <FaUserFriends className="mr-4 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Mentors
                    </Link>
                  </nav>
                </div>
                
                <div className="py-6 px-5 space-y-6">
                  <div className="flex flex-col space-y-4">
                    {showPaymentButton && (
                      <a 
                        href="https://mentneodashboard.vercel.app/login" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full flex items-center justify-center px-4 py-3 rounded-full text-base font-medium text-white bg-green-600 hover:bg-green-700"
                        onClick={toggleMobileMenu}
                      >
                        <FaCreditCard className="mr-2" />
                        Payments Dashboard
                      </a>
                    )}
                    <Link 
                      to="/login" 
                      className="w-full flex items-center justify-center px-4 py-3 rounded-full text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                      onClick={toggleMobileMenu}
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="w-full flex items-center justify-center px-4 py-3 border border-blue-600 rounded-full text-base font-medium text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-slate-800"
                      onClick={toggleMobileMenu}
                    >
                      Sign Up
                    </Link>
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={toggleDarkMode}
                        className="p-3 rounded-full text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-slate-700 flex items-center"
                      >
                        {darkMode ? <><FaSun className="h-5 w-5 mr-2" /> <span>Light Mode</span></> : <><FaMoon className="h-5 w-5 mr-2" /> <span>Dark Mode</span></>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
        
        {/* Hero Section */}
        <section className="relative z-10 pt-8 sm:pt-16 lg:pt-24 pb-12 lg:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    <span className="block">Personalized Learning</span>
                    <span className="block text-blue-600 dark:text-blue-400">For The Digital Age</span>
                  </h1>
                  <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300">
                    Connect with expert mentors, access quality courses, and accelerate your tech career with personalized guidance and real-world projects.
                  </p>
                  <div className="mt-8 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center px-8 py-3 text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors">
                      Get Started
                    </Link>
                    <Link to="/courses/full-stack-development" className="w-full sm:w-auto flex items-center justify-center px-8 py-3 text-base font-medium rounded-full text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 md:py-4 md:text-lg md:px-10 transition-colors">
                      Browse Courses
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6">
                <div className="relative">
                  <div className="aspect-w-5 aspect-h-4 lg:aspect-none">
                    <img
                      className="relative rounded-lg shadow-2xl object-cover object-center"
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                      alt="Students collaborating"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 lg:py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Why Students Choose Mentneo
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
                We combine quality content with personalized mentorship to help you achieve your goals faster.
              </p>
            </div>
            
            <div className="mt-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                    <FaGraduationCap className="text-blue-600 dark:text-blue-400 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Expert Mentors</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Learn from industry professionals with years of experience in their respective fields.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                    <FaLaptopCode className="text-blue-600 dark:text-blue-400 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Practical Projects</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Build a portfolio of real-world projects that demonstrate your skills to potential employers.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                    <FaComments className="text-blue-600 dark:text-blue-400 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Personalized Feedback</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Receive detailed feedback on your work and personalized guidance for improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-1">
                <Link to="/" className="flex items-center">
                  <img src="/logo.png" alt="Mentneo" className="h-8 w-auto mr-2" />
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mentneo</span>
                </Link>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Mentneo is a modern learning platform that connects students with expert mentors for personalized guidance.
                </p>
              </div>
              
              <div className="col-span-1 md:col-span-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Platform</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/courses" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      Courses
                    </Link>
                  </li>
                  <li>
                    <Link to="/mentors" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      Mentors
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="col-span-1 md:col-span-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/about" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="col-span-1 md:col-span-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/privacy" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 border-t border-gray-200 dark:border-slate-800 pt-8">
              <p className="text-base text-center text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Mentneo. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ModernLandingPage;
