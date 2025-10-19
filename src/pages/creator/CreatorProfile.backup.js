import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { uploadImageWithFallback } from '../../utils/cloudinary.js';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiGlobe, 
  FiAward, 
  FiEdit2, 
  FiCheck, 
  FiX, 
  FiCamera, 
  FiBook, 
  FiUsers, 
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiSettings
} from 'react-icons/fi';

export default function CreatorProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [stats, setStats] = useState({
    coursesCount: 0,
    studentsCount: 0,
    totalRevenue: 0,
    totalLearningHours: 0
  });
  
  // Form fields
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    phone: '',
    address: '',
    website: '',
    expertise: '',
    education: '',
    skills: []
  });
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = (data) => {
    const fieldsToCheck = ['displayName', 'bio', 'phone', 'photoURL', 'expertise', 'education'];
    let filledFields = 0;
    
    fieldsToCheck.forEach(field => {
      if (data[field] && data[field].toString().trim() !== '') {
        filledFields++;
      }
    });
    
    return Math.round((filledFields / fieldsToCheck.length) * 100);
  };
  
  // Fetch user data and related information
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setPhotoURL(data.photoURL || '');
          
          // Initialize form data
          setFormData({
            displayName: data.displayName || '',
            bio: data.bio || '',
            phone: data.phone || '',
            address: data.address || '',
            website: data.website || '',
            expertise: data.expertise || '',
            education: data.education || '',
            skills: data.skills || []
          });
        }
        
        // Fetch created courses
        const coursesQuery = query(
          collection(db, "courses"),
          where("creatorId", "==", currentUser.uid)
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        
        const courses = [];
        let totalStudents = 0;
        let totalRevenue = 0;
        
        coursesSnapshot.forEach(courseDoc => {
          const courseData = courseDoc.data();
          courses.push({ 
            id: courseDoc.id, 
            ...courseData
          });
          
          // Calculate stats
          const enrolledStudents = courseData.enrolledStudents || [];
          totalStudents += enrolledStudents.length;
          
          const coursePrice = parseFloat(courseData.price) || 0;
          totalRevenue += coursePrice * enrolledStudents.length;
        });
        
        setCreatedCourses(courses);
        setStats({
          coursesCount: courses.length,
          studentsCount: totalStudents,
          totalRevenue: totalRevenue,
          totalLearningHours: userData?.totalLearningHours || 0
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, navigate]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle skills input (comma-separated)
  const handleSkillsChange = (e) => {
    const skillsString = e.target.value;
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
    setFormData(prevData => ({
      ...prevData,
      skills: skillsArray
    }));
  };
  
  // Submit profile updates
  const handleSubmit = async () => {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        ...formData,
        updatedAt: new Date()
      });
      
      // Update local user data
      setUserData(prev => ({
        ...prev,
        ...formData
      }));
      
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };
  
  // Handle profile photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }
    
    try {
      setUploadingPhoto(true);
      
      console.log("Starting profile photo upload:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Upload to Cloudinary with Firebase Storage fallback
      const imageUrl = await uploadImageWithFallback(file, currentUser.uid);
      
      if (!imageUrl) {
        throw new Error('Failed to get image URL from upload service');
      }
      
      console.log("Upload successful, image URL:", imageUrl);
      
      // Update user document in Firestore
      await updateDoc(doc(db, "users", currentUser.uid), {
        photoURL: imageUrl,
        updatedAt: new Date()
      });
      
      console.log("Firestore user document updated successfully");
      
      // Update local state
      setPhotoURL(imageUrl);
      setUserData(prev => ({
        ...prev,
        photoURL: imageUrl
      }));
      
      setUploadingPhoto(false);
      alert("Profile photo uploaded successfully!");
      
    } catch (error) {
      console.error("Error uploading photo:", error);
      setUploadingPhoto(false);
      
      // Provide user-friendly error message
      if (error.message.includes('Cloudinary')) {
        alert(`Upload failed: ${error.message}. Please check your internet connection and try again.`);
      } else if (error.message.includes('Firebase')) {
        alert(`Storage error: ${error.message}. Please try again later.`);
      } else {
        alert(`Failed to upload photo: ${error.message}`);
      }
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate?.();
    if (!date) return '';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const profileCompletion = calculateProfileCompletion(userData || {});
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hidden file input for profile image upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange}
        className="hidden" 
        accept="image/*"
      />
      
      {/* Desktop Sidebar - visible on md and larger screens */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className={`flex flex-col flex-grow pt-5 ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-y-auto border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="h-10 w-auto" src="/logo.png" alt="Mentneo Logo" />
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-2">
              <Link to="/creator/dashboard" className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}>
                <FaHome className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                Dashboard
              </Link>
              <Link to="/creator/courses" className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}>
                <FaBook className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                My Courses
              </Link>
              <Link to="/creator/analytics" className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}>
                <FaChartBar className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                Analytics
              </Link>
              <Link to="/creator/profile" className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 ${darkMode && 'bg-blue-900 bg-opacity-30'}`}>
                <FaUser className="mr-3 flex-shrink-0 h-5 w-5 text-blue-500" />
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            {/* Mobile Header - only visible on mobile */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h1>
              <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                {darkMode ? 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  :
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                }
              </button>
            </div>
            
            {/* Stats Overview - Desktop Only */}
            <div className="hidden md:grid md:grid-cols-3 gap-5 mb-6">
              <div className={`flex items-center p-5 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-3 rounded-full bg-blue-50 text-blue-500">
                  <FaBook className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Courses Created</p>
                  {loading ? (
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                  ) : (
                    <h3 className="text-xl font-bold mt-1">{profileData.coursesCount}</h3>
                  )}
                </div>
              </div>
              
              <div className={`flex items-center p-5 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-3 rounded-full bg-green-50 text-green-500">
                  <FaGraduationCap className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Students Enrolled</p>
                  {loading ? (
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                  ) : (
                    <h3 className="text-xl font-bold mt-1">{profileData.studentsCount}</h3>
                  )}
                </div>
              </div>
              
              <div className={`flex items-center p-5 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-3 rounded-full bg-purple-50 text-purple-500">
                  <FaDollarSign className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</p>
                  {loading ? (
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
                  ) : (
                    <h3 className="text-xl font-bold mt-1">₹{profileData.totalRevenue.toLocaleString()}</h3>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Section */}
            <div className="mt-5 md:mt-0">
              {loading ? (
                <div className={`shadow-lg rounded-xl overflow-hidden p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col items-center justify-center`}>
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile data...</p>
                </div>
              ) : (
              <div className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Profile Header */}
                <div className={`px-4 py-8 sm:px-8 flex flex-col items-center relative ${darkMode ? '' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
                  {/* Profile Image with Progress Ring */}
                  <div className="relative inline-block">
                    {/* Progress Ring */}
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke={darkMode ? "#374151" : "#e6e6e6"} 
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
                      <text 
                        x="50" 
                        y="105" 
                        textAnchor="middle" 
                        className="text-xs font-medium" 
                        fill={darkMode ? "#9CA3AF" : "#6B7280"}
                      >
                        {profileData.completionPercentage}% Complete
                      </text>
                    </svg>
                    
                    {/* Profile Image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {uploading ? (
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <div className="h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                        </div>
                      ) : (
                        <img 
                          src={profileData.photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23e5e7eb' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%236b7280'%3EProfile%3C/text%3E%3C/svg%3E"} 
                          alt="Profile" 
                          className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23e5e7eb' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%236b7280'%3EProfile%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Edit Icon */}
                    <button 
                      onClick={handleImageUpload}
                      className="absolute bottom-1 right-1 bg-blue-500 rounded-full p-2 text-white border-2 border-white hover:bg-blue-600 transition-colors shadow-sm"
                      disabled={uploading}
                    >
                      <FaEdit size={12} />
                    </button>
                  </div>
                  
                  {/* Name and Email */}
                  <div className="mt-5 text-center">
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profileData.name}</h2>
                    <div className="flex items-center justify-center mt-2">
                      <span className={`${darkMode ? 'bg-blue-900 bg-opacity-40 text-blue-300' : 'bg-blue-50 text-blue-700'} px-4 py-1.5 rounded-full text-sm`}>
                        {profileData.email}
                      </span>
                    </div>
                    
                    {/* Verified Badge */}
                    {profileData.isVerified && (
                      <div className="flex items-center justify-center mt-3">
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm">
                          <FaCheck size={10} className="mr-1" />
                          Mentneo Verified Creator
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Settings List */}
                <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} px-4 py-6 sm:px-6`}>
                  <ul className="space-y-2">
                    {menuItems.map((item) => (
                      <li key={item.id}>
                        {item.link ? (
                          <Link 
                            to={item.link} 
                            className={`flex items-center p-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-all duration-200 group`}
                          >
                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-opacity-20"
                                style={{ backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : item.icon.props.className.includes('text-') ? `${item.icon.props.className.split(' ')[0].replace('text', 'bg')}-50` : 'bg-blue-50' }}>
                              {item.icon}
                            </div>
                            <div className="ml-4 flex-1">
                              <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.text}</p>
                              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</p>
                            </div>
                            
                            {item.toggle ? (
                              <div className="relative inline-block w-12 align-middle select-none">
                                <input 
                                  type="checkbox" 
                                  className="sr-only" 
                                  id={`toggle-${item.id}`}
                                  checked={item.toggle.checked}
                                  onChange={item.toggle.onChange}
                                />
                                <label 
                                  htmlFor={`toggle-${item.id}`}
                                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${item.toggle.checked ? 'bg-blue-500' : 'bg-gray-300'}`}
                                >
                                  <span 
                                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-300 ease-in-out ${item.toggle.checked ? 'translate-x-6' : 'translate-x-0'}`}
                                  ></span>
                                </label>
                              </div>
                            ) : (
                              <div className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                                <FaArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                              </div>
                            )}
                          </Link>
                        ) : (
                          <button
                            onClick={item.action}
                            className={`w-full flex items-center p-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg transition-all duration-200 group ${item.color === 'text-red-500' ? 'hover:bg-red-50 hover:bg-opacity-20' : ''}`}
                          >
                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-opacity-20"
                                style={{ backgroundColor: item.color === 'text-red-500' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}>
                              {item.icon}
                            </div>
                            <div className="ml-4 flex-1 text-left">
                              <p className={`text-sm font-semibold ${item.color}`}>{item.text}</p>
                              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</p>
                            </div>
                            <div className="ml-2 text-gray-400">
                              <FaArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              )}
              
              {/* Recent Courses Section */}
              {!loading && (
                <>
                  {profileData.createdCourses && profileData.createdCourses.length > 0 ? (
                    <div className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} mt-6`}>
                      <div className={`px-4 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sm:px-6`}>
                        <h3 className={`text-lg font-medium leading-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Courses</h3>
                        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {profileData.createdCourses.length} {profileData.createdCourses.length === 1 ? 'course' : 'courses'} created
                        </p>
                      </div>
                      <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {profileData.createdCourses.slice(0, 3).map((course) => (
                          <li key={course.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {course.thumbnailUrl ? (
                                  <img 
                                    src={course.thumbnailUrl} 
                                    alt={course.title}
                                    className="h-12 w-12 object-cover rounded"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23dbeafe' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%232563eb'%3ECourse%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                ) : (
                                  <div className={`flex-shrink-0 h-12 w-12 rounded ${darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100'} flex items-center justify-center`}>
                                    <FaBook className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.title}</div>
                                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {course.enrolledStudents?.length || 0} students enrolled
                                    {course.price && <span className="ml-2">• ₹{parseFloat(course.price).toLocaleString()}</span>}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Link
                                  to={`/creator/courses/${course.id}`}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {profileData.createdCourses.length > 3 && (
                        <div className={`px-4 py-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-right sm:px-6`}>
                          <Link to="/creator/courses" className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}>
                            View all courses <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} mt-6 p-6 text-center`}>
                      <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
                        <FaBook className="h-6 w-6 text-blue-500" />
                      </div>
                      <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No courses yet</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Start creating your first course and sharing your knowledge</p>
                      <Link to="/creator/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Create a course
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation Bar - Visible only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden">
        <div className={`flex items-center justify-around p-3 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-t-xl shadow-lg`}>
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
          <Link to="/creator/profile" className="flex flex-col items-center">
            <div className="relative">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <FaUser className="h-3 w-3 text-white" />
              </div>
            </div>
            <span className="text-xs mt-1 text-blue-500 font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;