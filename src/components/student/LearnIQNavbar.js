import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiBookOpen, FiFileText, FiUser, FiSettings, FiLogOut, FiBell, FiCalendar, FiAward, FiHelpCircle, FiMenu, FiX, FiChevronRight, FiBarChart2 } from 'react-icons/fi/index.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import MenteoLogo from '../MenteoLogo.js';

export default function LearnIQNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [userData, setUserData] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
    const navigation = [
    { name: 'Dashboard', href: '/student/student-dashboard', icon: FiHome },
    { name: 'My Courses', href: '/student/courses', icon: FiBookOpen },
    { name: 'Our Courses', href: '/student/our-courses', icon: FiBookOpen },
    { name: 'Progress', href: '/student/student-dashboard/progress', icon: FiBarChart2 },
    { name: 'Assignments', href: '/student/student-dashboard/assignments', icon: FiFileText },
    { name: 'Calendar', href: '/student/student-dashboard/calendar', icon: FiCalendar },
    { name: 'Certificates', href: '/student/student-dashboard/certificates', icon: FiAward },
    { name: 'Notifications', href: '/student/student-dashboard/notifications', icon: FiBell },
    { name: 'Profile', href: '/student/student-dashboard/profile', icon: FiUser },
  ];
  
  const bottomNavigation = [
    { name: 'Settings', href: '/student/student-dashboard/settings', icon: FiSettings },
    { name: 'Help & Support', href: '/student/student-dashboard/support', icon: FiHelpCircle },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
        
        // Check for unread notifications
        const notificationsDoc = await getDoc(doc(db, "notifications", currentUser.uid));
        if (notificationsDoc.exists()) {
          const unreadCount = notificationsDoc.data().unreadCount || 0;
          setNotifications(unreadCount);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  return (
    <>
      {/* Hamburger Menu Button - Mobile Only */}
      <button
        type="button"
        className="lg:hidden absolute top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu className="h-6 w-6 text-gray-700" aria-hidden="true" />
      </button>

      {/* Mobile menu */}
      <div className={`lg:hidden fixed inset-0 flex z-40 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: sidebarOpen ? 0.5 : 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${sidebarOpen ? '' : 'pointer-events-none'}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        
        {/* Sidebar */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative flex-1 flex flex-col max-w-xs w-full bg-white focus:outline-none"
        >
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <FiX className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
            <div className="flex-shrink-0 flex items-center px-4">
              <MenteoLogo size="small" />
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-base font-medium rounded-lg ${
                    location.pathname === item.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 ${
                      location.pathname === item.href
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 p-4 space-y-1">
            {bottomNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center px-3 py-2 text-base font-medium rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <item.icon
                  className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-3 py-2 text-base font-medium rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <FiLogOut
                className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              Sign Out
            </button>
          </div>
        </motion.div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          {/* Sidebar component */}
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <MenteoLogo size="small" />
              </div>
              <div className="mt-8 px-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={userData?.photoURL || "https://via.placeholder.com/40?text=User"}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.displayName || "Student"}
                    </p>
                    <Link
                      to="/student/profile"
                      className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center"
                    >
                      View Profile <FiChevronRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
              <nav className="mt-8 flex-1 px-4 space-y-2" aria-label="Sidebar">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl ${
                      location.pathname === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    } transition-all duration-200`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        location.pathname === item.href
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                    {item.name === 'Dashboard' && notifications > 0 && (
                      <span className="ml-auto inline-block py-0.5 px-2 text-xs bg-red-100 text-red-800 rounded-full">
                        {notifications}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 border-t border-gray-200 p-4 space-y-2">
              {bottomNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <item.icon
                    className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="group flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200"
              >
                <FiLogOut
                  className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}