import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Icons
import { 
  FaEdit, 
  FaBook, 
  FaDollarSign, 
  FaLayerGroup, 
  FaCog, 
  FaBell, 
  FaUserPlus, 
  FaSignOutAlt, 
  FaHome, 
  FaGraduationCap, 
  FaChartBar, 
  FaUser,
  FaCheck
} from 'react-icons/fa';

const CreatorProfilePage = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    photoURL: '',
    completionPercentage: 65, // Default value, should be fetched from backend
    isVerified: true, // Default value, should be fetched from backend
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (currentUser && currentUser.uid) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileData({
              name: userData.displayName || currentUser.displayName || 'Creator',
              email: userData.email || currentUser.email || '',
              photoURL: userData.photoURL || currentUser.photoURL || '',
              completionPercentage: userData.completionPercentage || 65,
              isVerified: userData.isVerified || true,
            });
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
    };

    fetchProfileData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirection will be handled by auth context/protected routes
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const menuItems = [
    { id: 1, icon: <FaEdit />, text: "Edit Profile", link: "/creator/edit-profile", color: "text-blue-600" },
    { id: 2, icon: <FaBook />, text: "My Courses", link: "/creator/courses", color: "text-blue-600" },
    { id: 3, icon: <FaDollarSign />, text: "Revenue & Analytics", link: "/creator/analytics", color: "text-blue-600" },
    { id: 4, icon: <FaLayerGroup />, text: "Manage Quizzes & Assignments", link: "/creator/content", color: "text-blue-600" },
    { id: 5, icon: <FaCog />, text: "Settings", link: "/creator/settings", color: "text-blue-600" },
    { id: 6, icon: <FaBell />, text: "Notifications Sent", link: "/creator/notifications", color: "text-blue-600" },
    { id: 7, icon: <FaUserPlus />, text: "Invite a Friend / Collaborator", link: "/creator/invite", color: "text-blue-600" },
    { id: 8, icon: <FaSignOutAlt />, text: "Logout", action: handleLogout, color: "text-red-500" }
  ];

  const handleImageUpload = () => {
    // This would open a file upload dialog
    console.log('Image upload functionality to be implemented');
    // Implementation would involve Firebase Storage upload
  };

  return (
    <div className="min-h-screen bg-[#F2F6FC] pb-20 md:pb-0">
      {/* Desktop Sidebar - visible on md and larger screens */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="h-8 w-auto" src="/logo.png" alt="Mentneo Logo" />
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <Link to="/creator/dashboard" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <FaHome className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                Dashboard
              </Link>
              <Link to="/creator/courses" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <FaBook className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                My Courses
              </Link>
              <Link to="/creator/analytics" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <FaChartBar className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                Analytics
              </Link>
              <Link to="/creator/new-profile" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50">
                <FaUser className="mr-3 flex-shrink-0 h-6 w-6 text-blue-500" />
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <div className="md:hidden">
              <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
            </div>
            
            {/* Profile Section */}
            <div className="mt-5 md:mt-0">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Profile Header */}
                <div className="px-4 py-6 sm:px-6 flex flex-col items-center relative">
                  {/* Profile Image with Progress Ring */}
                  <div className="relative inline-block">
                    {/* Progress Ring */}
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#e6e6e6" 
                        strokeWidth="8"
                      />
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#3B82F6" 
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="282.7"
                        strokeDashoffset={282.7 - (282.7 * profileData.completionPercentage / 100)}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    
                    {/* Profile Image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={profileData.photoURL || "https://via.placeholder.com/150?text=Profile"} 
                        alt="Profile" 
                        className="h-24 w-24 rounded-full object-cover border-2 border-white"
                      />
                    </div>
                    
                    {/* Edit Icon */}
                    <button 
                      onClick={handleImageUpload}
                      className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 text-white border-2 border-white hover:bg-blue-600 transition"
                    >
                      <FaEdit size={14} />
                    </button>
                  </div>
                  
                  {/* Name and Email */}
                  <div className="mt-4 text-center">
                    <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                    <div className="flex items-center justify-center mt-1">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {profileData.email}
                      </span>
                    </div>
                    
                    {/* Verified Badge */}
                    {profileData.isVerified && (
                      <div className="flex items-center justify-center mt-2">
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <FaCheck size={12} className="mr-1" />
                          Mentneo Verified Creator
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Settings List */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <ul className="divide-y divide-gray-200">
                    {menuItems.map((item) => (
                      <li key={item.id}>
                        {item.link ? (
                          <Link 
                            to={item.link} 
                            className="flex items-center py-4 hover:bg-gray-50 px-2 rounded-md transition-colors"
                          >
                            <div className={`flex-shrink-0 ${item.color}`}>
                              {item.icon}
                            </div>
                            <div className="ml-4 flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.text}</p>
                            </div>
                            <div className="ml-2 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        ) : (
                          <button
                            onClick={item.action}
                            className="w-full flex items-center py-4 hover:bg-gray-50 px-2 rounded-md transition-colors"
                          >
                            <div className={`flex-shrink-0 ${item.color}`}>
                              {item.icon}
                            </div>
                            <div className="ml-4 flex-1 text-left">
                              <p className={`text-sm font-medium ${item.color}`}>{item.text}</p>
                            </div>
                            <div className="ml-2 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation - Visible only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white md:hidden">
        <div className="flex items-center justify-around p-3 border-t border-gray-200">
          <Link to="/creator/dashboard" className="flex flex-col items-center text-gray-500 hover:text-blue-500">
            <FaHome className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link to="/creator/courses" className="flex flex-col items-center text-gray-500 hover:text-blue-500">
            <FaBook className="h-6 w-6" />
            <span className="text-xs mt-1">Courses</span>
          </Link>
          <Link to="/creator/analytics" className="flex flex-col items-center text-gray-500 hover:text-blue-500">
            <FaChartBar className="h-6 w-6" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          <Link to="/creator/new-profile" className="flex flex-col items-center text-blue-500">
            <FaUser className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfilePage;