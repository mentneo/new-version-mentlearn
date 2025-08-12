import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import SimpleLayout from '../../components/layouts/SimpleLayout';
import ProfileCard from '../../components/student/ProfileCard';
import UserInfoWidget from '../../components/student/UserInfoWidget';
import { useTheme } from '../../contexts/ThemeContext';
import { FaBook, FaChartLine, FaGraduationCap } from 'react-icons/fa';

export default function SimplifiedDashboard() {
  const { currentUser } = useAuth();
  const { darkMode, toggleDarkMode, forceThemeRefresh } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Force theme refresh on component mount
    forceThemeRefresh && forceThemeRefresh();
    
    async function fetchUserData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load your data. Please try again later.");
        setLoading(false);
      }
    }

    fetchUserData();
  }, [currentUser, forceThemeRefresh]);

  // Simplified loading state
  if (loading) {
    return (
      <SimpleLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </SimpleLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <SimpleLayout>
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </SimpleLayout>
    );
  }

  // No user state
  if (!currentUser) {
    return (
      <SimpleLayout>
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Not logged in!</strong>
          <span className="block sm:inline"> Please log in to view your dashboard.</span>
          <Link to="/login" className="mt-3 inline-block bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
            Go to Login
          </Link>
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Profile and Account Info */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Profile</h2>
              {userData && <ProfileCard currentUser={currentUser} userData={userData} darkMode={darkMode} loading={loading} />}
            </div>
            
            {/* Account Info Widget */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Account Info</h2>
              <UserInfoWidget />
            </div>
            
            {/* Theme Control */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Theme Settings</h2>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
                <button
                  onClick={toggleDarkMode}
                  className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                >
                  Toggle Theme
                </button>
              </div>
              
              <button
                onClick={forceThemeRefresh}
                className="mt-3 px-4 py-2 w-full bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Force Theme Refresh
              </button>
            </div>
          </div>
          
          {/* Right Column - Activity Overview */}
          <div className="w-full md:w-2/3 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Learning Journey</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaBook className="text-blue-500 dark:text-blue-400 mr-2" />
                    <h3 className="font-medium text-gray-800 dark:text-white">My Courses</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Access your enrolled courses and continue learning
                  </p>
                  <Link to="/student/courses" className="mt-3 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    View My Courses →
                  </Link>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaChartLine className="text-green-500 dark:text-green-400 mr-2" />
                    <h3 className="font-medium text-gray-800 dark:text-white">My Progress</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Track your learning progress and achievements
                  </p>
                  <Link to="/student/progress" className="mt-3 inline-block text-sm text-green-600 dark:text-green-400 hover:underline">
                    View My Progress →
                  </Link>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaGraduationCap className="text-purple-500 dark:text-purple-400 mr-2" />
                    <h3 className="font-medium text-gray-800 dark:text-white">Upcoming Quizzes</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    View and take your assigned quizzes
                  </p>
                  <Link to="/student/quizzes" className="mt-3 inline-block text-sm text-purple-600 dark:text-purple-400 hover:underline">
                    View Quizzes →
                  </Link>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaChartLine className="text-orange-500 dark:text-orange-400 mr-2" />
                    <h3 className="font-medium text-gray-800 dark:text-white">Interview Prep</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Prepare for technical interviews with practice questions
                  </p>
                  <Link to="/student/interview-prep" className="mt-3 inline-block text-sm text-orange-600 dark:text-orange-400 hover:underline">
                    Start Preparing →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Navigation Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link 
                  to="/theme-test"
                  className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded text-center transition-colors"
                >
                  Theme Test Page
                </Link>
                <Link 
                  to="/simple"
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded text-center transition-colors"
                >
                  Simple Dashboard
                </Link>
                <Link 
                  to="/debug"
                  className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-center transition-colors"
                >
                  Debug Page
                </Link>
                <Link 
                  to="/"
                  className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded text-center transition-colors"
                >
                  Home Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
}
