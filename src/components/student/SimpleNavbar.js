import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { useTheme } from '../../contexts/ThemeContext.js';
import { FaSun, FaMoon, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa/index.esm.js';
import MenteoLogo from '../MenteoLogo.js';

const SimpleNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className={`bg-white dark:bg-gray-800 shadow-md transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <MenteoLogo size="small" />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/student/simple-dashboard"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/student/courses"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Courses
              </Link>
              <Link
                to="/student/quizzes"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Quizzes
              </Link>
              <Link
                to="/student/profile"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              type="button"
              className="bg-white dark:bg-gray-700 p-1.5 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {darkMode ? (
                <FaSun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <FaMoon className="h-5 w-5" aria-hidden="true" />
              )}
              <span className="sr-only">Toggle theme</span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FaSignOutAlt className="h-4 w-4 mr-1.5" />
              Logout
            </button>
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              className="bg-white dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {menuOpen ? (
                <FaTimes className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FaBars className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/student/simple-dashboard"
              className="bg-primary-50 dark:bg-gray-700 border-primary-500 text-primary-700 dark:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/student/courses"
              className="border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              to="/student/quizzes"
              className="border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Quizzes
            </Link>
            <Link
              to="/student/profile"
              className="border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={toggleDarkMode}
                className="flex items-center text-gray-600 dark:text-gray-300"
              >
                {darkMode ? (
                  <>
                    <FaSun className="h-5 w-5 mr-2" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <FaMoon className="h-5 w-5 mr-2" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center text-red-600 dark:text-red-400"
              >
                <FaSignOutAlt className="h-5 w-5 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SimpleNavbar;
