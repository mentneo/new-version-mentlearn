import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaBook, 
  FaUserGraduate,
  FaTachometerAlt, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import Logo from '../common/Logo';

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error('Failed to log out');
    }
  };

  const navigationItems = [
    { path: '/creator/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/creator/courses', icon: <FaBook />, label: 'My Courses' },
    { path: '/creator/enrollments', icon: <FaUserGraduate />, label: 'Enrollments' },
    { path: '/creator/profile', icon: <FaUser />, label: 'Profile' }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed lg:hidden z-50 top-4 left-4 p-2 rounded-md bg-indigo-600 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Logo />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${
                    location.pathname === item.path
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-white'
                      : `text-gray-600 hover:bg-gray-50 hover:text-gray-900 
                        dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white`
                  }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md
                dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="mr-3 text-lg">
                {darkMode ? <FaSun /> : <FaMoon />}
              </span>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 mt-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md
                dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300"
            >
              <span className="mr-3 text-lg">
                <FaSignOutAlt />
              </span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
