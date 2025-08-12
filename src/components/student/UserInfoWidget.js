import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FaClock, FaUsers, FaListAlt, FaUserCheck, FaUser, FaExclamationTriangle, FaChalkboardTeacher } from 'react-icons/fa';

const UserInfoWidget = ({ darkMode }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalMentors, setTotalMentors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        if (!currentUser) return;
        
        // Fetch current user's data
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Fetch user counts (if admin role or allowed for students)
        // Note: You may want to restrict this based on user roles
        const usersQuery = query(collection(db, "users"));
        const userDocs = await getDocs(usersQuery);
        
        setTotalUsers(userDocs.size);
        
        // Count by role
        let students = 0;
        let mentors = 0;
        
        userDocs.forEach(doc => {
          const data = doc.data();
          if (data.role === 'student') students++;
          if (data.role === 'mentor') mentors++;
        });
        
        setTotalStudents(students);
        setTotalMentors(mentors);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user stats:", err);
        setError("Failed to load user statistics");
        setLoading(false);
      }
    }

    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-4 animate-pulse`}>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow rounded-lg p-4`}>
        <div className="flex items-center">
          <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-medium">User Information</h3>
        </div>
        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {error}
        </p>
      </div>
    );
  }

  // Safely format dates
  const formatDate = (dateField) => {
    if (!dateField) return 'N/A';
    try {
      const date = dateField.toDate ? dateField.toDate() : new Date(dateField);
      return date.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateField) => {
    if (!dateField) return 'N/A';
    try {
      const date = dateField.toDate ? dateField.toDate() : new Date(dateField);
      return date.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return 'Invalid date';
    }
  };

  const lastLogin = userData?.lastLogin;
  const formattedLastLogin = formatDateTime(lastLogin);

  const accountCreated = userData?.createdAt;
  const formattedAccountCreated = formatDate(accountCreated);

  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow rounded-lg p-4`}>
      <h3 className="text-lg font-medium">User Information</h3>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-center">
          <FaUser className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-2 flex-shrink-0`} />
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Account Type: <span className="font-medium">{userData?.role || 'Student'}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <FaClock className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-2 flex-shrink-0`} />
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Last Login: <span className="font-medium">{formattedLastLogin}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <FaUserCheck className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-2 flex-shrink-0`} />
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Account Created: <span className="font-medium">{formattedAccountCreated}</span>
            </p>
          </div>
        </div>
        
        {userData?.subscriptionStatus && (
          <div className="flex items-center">
            <FaListAlt className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-2 flex-shrink-0`} />
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Subscription: <span className={`font-medium ${userData.subscriptionStatus === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {userData.subscriptionStatus.charAt(0).toUpperCase() + userData.subscriptionStatus.slice(1)}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Community Stats - Optional, can be removed if you don't want to show this to students */}
      <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Community Stats
        </h4>
        
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center">
              <FaUsers className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-1`} />
              <span className="text-xs font-medium">Total Users</span>
            </div>
            <p className={`mt-1 text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {totalUsers}
            </p>
          </div>
          
          <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center">
              <FaUser className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-1`} />
              <span className="text-xs font-medium">Students</span>
            </div>
            <p className={`mt-1 text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {totalStudents}
            </p>
          </div>
          
          <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center">
              <FaChalkboardTeacher className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-1`} />
              <span className="text-xs font-medium">Mentors</span>
            </div>
            <p className={`mt-1 text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {totalMentors}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoWidget;
