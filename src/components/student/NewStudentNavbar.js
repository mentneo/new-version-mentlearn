import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaHome as HomeIcon,
  FaBook as BookOpenIcon,
  FaGraduationCap as AcademicCapIcon, 
  FaClipboardList as ClipboardListIcon,
  FaUser as UserIcon,
  FaSignOutAlt as LogoutIcon,
  FaBars as MenuIcon,
  FaTimes as XIcon,
  FaSun,
  FaMoon
} from 'react-icons/fa';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NewStudentNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/student/new-dashboard', icon: HomeIcon },
    { name: 'Courses', href: '/student/courses', icon: BookOpenIcon },
    { name: 'Quizzes', href: '/student/quizzes', icon: ClipboardListIcon },
    { name: 'Profile', href: '/student/profile', icon: UserIcon },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        {/* Sidebar panel */}
        <div className={`relative flex-1 flex flex-col max-w-xs w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link to="/student/dashboard">
                <img className="h-10 w-auto" src="/logo.png" alt="Mentneo" />
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? `${darkMode ? 'bg-gray-900 text-blue-400' : 'bg-blue-50 text-blue-700'}`
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`,
                    'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      location.pathname === item.href
                        ? `${darkMode ? 'text-blue-400' : 'text-blue-500'}`
                        : `${darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500'}`,
                      'mr-4 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className={`${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-base font-medium rounded-md w-full`}
              >
                <LogoutIcon
                  className={`${darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500'} mr-4 flex-shrink-0 h-6 w-6`}
                  aria-hidden="true"
                />
                Logout
              </button>
              
              <button
                onClick={toggleDarkMode}
                className={`mt-4 ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-base font-medium rounded-md w-full`}
              >
                {darkMode ? (
                  <FaSun className="text-yellow-400 mr-4 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                ) : (
                  <FaMoon className="text-gray-400 mr-4 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                )}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>
          </div>
          <div className={`flex-shrink-0 flex border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            <div className="flex items-center">
              <div>
                <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-500'} flex items-center justify-center font-semibold`}>
                  {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-700'} truncate`}>
                  {currentUser?.displayName || currentUser?.email}
                </p>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className={`flex-1 flex flex-col min-h-0 border-r ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/student/dashboard">
                <img className="h-10 w-auto" src="/logo.png" alt="Mentneo" />
              </Link>
            </div>
            <nav className={`mt-5 flex-1 px-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} space-y-1`}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? `${darkMode ? 'bg-gray-900 text-blue-400' : 'bg-blue-50 text-blue-700'}`
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`,
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      location.pathname === item.href
                        ? `${darkMode ? 'text-blue-400' : 'text-blue-500'}`
                        : `${darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500'}`,
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className={`${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
              >
                <LogoutIcon
                  className={`${darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0 h-6 w-6`}
                  aria-hidden="true"
                />
                Logout
              </button>
              
              <button
                onClick={toggleDarkMode}
                className={`mt-4 ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
              >
                {darkMode ? (
                  <FaSun className="text-yellow-400 mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                ) : (
                  <FaMoon className="text-gray-400 mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                )}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>
          </div>
          <div className={`flex-shrink-0 flex border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            <div className="flex items-center">
              <div>
                <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-500'} flex items-center justify-center font-semibold`}>
                  {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'} truncate`}>
                  {currentUser?.displayName || currentUser?.email}
                </p>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile top navbar */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className={`sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            type="button"
            className={`-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
