import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEdit, FaGraduationCap, FaCalendarAlt, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa/index.esm.js';

const ProfileCard = ({ userData, loading, darkMode, currentUser }) => {
  // Default image if no profile image is available
  const defaultImage = "https://via.placeholder.com/150?text=User";
  
  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg animate-pulse`}>
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 flex flex-col sm:flex-row items-center">
            <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 sm:mb-0 sm:mr-6"></div>
            <div className="flex-1 text-center sm:text-left">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow overflow-hidden sm:rounded-lg`}>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium">Profile Information</h3>
          <p className={`mt-1 max-w-2xl text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Unable to load user profile.
          </p>
        </div>
      </div>
    );
  }

  const joinDate = userData.createdAt ? userData.createdAt.toDate().toLocaleDateString() : 'Unknown';
  
  // Calculate days enrolled
  const daysEnrolled = userData.createdAt ? 
    Math.floor((new Date() - userData.createdAt.toDate()) / (1000 * 60 * 60 * 24)) : 
    0;

  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow overflow-hidden sm:rounded-lg`}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium">Profile Information</h3>
        <Link 
          to="/student/profile" 
          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
            darkMode 
              ? 'bg-blue-700 hover:bg-blue-600 text-white' 
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          }`}
        >
          <FaEdit className="mr-1.5 -ml-0.5 h-4 w-4" /> Edit
        </Link>
      </div>
      <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="px-4 py-5 flex flex-col sm:flex-row items-center">
          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
            <div className="relative">
              <img 
                className="h-32 w-32 rounded-full object-cover border-4 border-blue-500 shadow-md" 
                src={userData.profileImageUrl || defaultImage} 
                alt={userData.firstName || 'User'} 
              />
              <div className={`absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 ${
                darkMode ? 'border-gray-800' : 'border-white'
              } ${
                true ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">
              {userData.firstName ? `${userData.firstName} ${userData.lastName || ''}` : (currentUser && currentUser.email)}
            </h2>
            
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 items-center">
              <div className="flex items-center">
                <FaEnvelope className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {userData.email || (currentUser && currentUser.email)}
                </span>
              </div>
              
              {userData.phone && (
                <div className="flex items-center">
                  <FaPhone className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {userData.phone}
                  </span>
                </div>
              )}
              
              <div className="flex items-center">
                <FaGraduationCap className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Student
                </span>
              </div>
              
              <div className="flex items-center">
                <FaCalendarAlt className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Joined: {joinDate} ({daysEnrolled} days)
                </span>
              </div>
            </div>
            
            {userData.bio && (
              <div className="mt-4">
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</h4>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userData.bio}
                </p>
              </div>
            )}
            
            {userData.skills && userData.skills.length > 0 && (
              <div className="mt-4">
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Skills</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {userData.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        darkMode 
                          ? 'bg-blue-800 text-blue-100' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
