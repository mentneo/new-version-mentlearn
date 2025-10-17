import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { uploadImageWithFallback } from '../../utils/cloudinary.js';
import { FiMail, FiPhone, FiMapPin, FiGlobe, FiAward, FiEdit2, FiCheck, FiX, FiCamera, FiUpload, FiCalendar, FiClock, FiFileText, FiBook } from 'react-icons/fi/index.js';

export default function LearnIQProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    phone: '',
    address: '',
    website: '',
    occupation: '',
    education: '',
    skills: []
  });
  
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
            occupation: data.occupation || '',
            education: data.education || '',
            skills: data.skills || []
          });
        }
        
        // Fetch enrolled courses
        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("studentId", "==", currentUser.uid)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        
        // For each enrollment, fetch course details
        const coursesPromises = enrollmentsSnapshot.docs.map(async (enrollmentDoc) => {
          const enrollment = enrollmentDoc.data();
          const courseDoc = await getDoc(doc(db, "courses", enrollment.courseId));
          if (courseDoc.exists()) {
            return { 
              id: courseDoc.id, 
              ...courseDoc.data(),
              enrolledAt: enrollment.createdAt,
              progress: enrollment.progress || 0
            };
          }
          return null;
        });
        
        const courses = await Promise.all(coursesPromises);
        setEnrolledCourses(courses.filter(Boolean));
        
        // Fetch certificates
        const certificatesQuery = query(
          collection(db, "certificates"),
          where("studentId", "==", currentUser.uid)
        );
        const certificatesSnapshot = await getDocs(certificatesQuery);
        
        const certificatesData = certificatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCertificates(certificatesData);
        
        // Fetch recent activities
        const activitiesQuery = query(
          collection(db, "activity"),
          where("userId", "==", currentUser.uid),
          where("type", "in", ["lesson_completed", "quiz_completed", "course_enrolled"])
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        
        const activitiesData = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort activities by timestamp
        activitiesData.sort((a, b) => {
          return b.timestamp?.toDate?.() - a.timestamp?.toDate?.() || 0;
        });
        
        setActivities(activitiesData.slice(0, 5)); // Get the 5 most recent activities
        
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
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
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
  
  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile card */}
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    <FiEdit2 size={16} className="mr-1" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} className="mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex items-center text-sm font-medium text-green-600 hover:text-green-500"
                    >
                      <FiCheck size={16} className="mr-1" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row">
                <div className="flex-shrink-0 mb-4 sm:mb-0">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={photoURL || "https://via.placeholder.com/128?text=Profile"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    {editMode && (
                      <div className="absolute bottom-0 right-0">
                        <label 
                          htmlFor="photo-upload"
                          className="flex items-center justify-center h-8 w-8 bg-blue-600 text-white rounded-full cursor-pointer shadow-sm hover:bg-blue-700"
                        >
                          {uploadingPhoto ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                          ) : (
                            <FiCamera size={14} />
                          )}
                        </label>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="sm:ml-6 flex-1">
                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          id="displayName"
                          value={formData.displayName}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={3}
                          value={formData.bio}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Tell us about yourself"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                          </label>
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                            Website
                          </label>
                          <input
                            type="text"
                            name="website"
                            id="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">
                        {userData?.displayName || "Student Name"}
                      </h3>
                      <p className="text-sm text-gray-500">{userData?.email}</p>
                      
                      {userData?.bio && (
                        <p className="mt-3 text-sm text-gray-600">{userData.bio}</p>
                      )}
                      
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                        {userData?.phone && (
                          <div className="flex items-center">
                            <FiPhone size={16} className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">{userData.phone}</span>
                          </div>
                        )}
                        
                        {userData?.email && (
                          <div className="flex items-center">
                            <FiMail size={16} className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">{userData.email}</span>
                          </div>
                        )}
                        
                        {userData?.address && (
                          <div className="flex items-center">
                            <FiMapPin size={16} className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">{userData.address}</span>
                          </div>
                        )}
                        
                        {userData?.website && (
                          <div className="flex items-center">
                            <FiGlobe size={16} className="text-gray-500 mr-2" />
                            <a 
                              href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {userData.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional profile sections when in edit mode */}
              {editMode && (
                <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
                  <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                      Occupation / Job Title
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      id="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      id="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="University, Degree, etc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      id="skills"
                      value={formData.skills.join(', ')}
                      onChange={handleSkillsChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="JavaScript, React, CSS, etc."
                    />
                  </div>
                </div>
              )}
              
              {/* Skills section - visible in non-edit mode */}
              {!editMode && userData?.skills && userData.skills.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Education and Occupation - visible in non-edit mode */}
              {!editMode && (userData?.education || userData?.occupation) && (
                <div className="mt-6 border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userData?.education && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Education</h3>
                      <p className="text-sm text-gray-600">{userData.education}</p>
                    </div>
                  )}
                  
                  {userData?.occupation && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Occupation</h3>
                      <p className="text-sm text-gray-600">{userData.occupation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Certificates */}
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Certificates</h2>
              
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <FiAward size={24} className="text-yellow-600" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Complete courses to earn certificates and show off your skills!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {certificates.map((certificate) => (
                    <div 
                      key={certificate.id} 
                      className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <FiAward size={20} className="text-yellow-500" />
                          <h3 className="ml-2 text-sm font-medium text-gray-900">
                            {certificate.title || "Certificate of Completion"}
                          </h3>
                        </div>
                        
                        <a 
                          href={certificate.certificateUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                        >
                          <FiUpload size={14} className="mr-1" />
                          View
                        </a>
                      </div>
                      
                      <p className="mt-2 text-xs text-gray-500">
                        {certificate.courseName || certificate.description}
                      </p>
                      
                      <div className="mt-auto pt-4 text-right">
                        <span className="text-xs text-gray-500">
                          Issued on {formatDate(certificate.issuedDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Course history, recent activity */}
        <div className="space-y-6">
          {/* Enrolled courses summary */}
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Journey</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiBook size={20} className="text-blue-700" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Courses Enrolled</p>
                      <p className="text-2xl font-semibold text-gray-900">{enrolledCourses.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiAward size={20} className="text-green-700" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Certificates Earned</p>
                      <p className="text-2xl font-semibold text-gray-900">{certificates.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiClock size={20} className="text-purple-700" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Learning Hours</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {userData?.totalLearningHours || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent activity */}
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              
              {activities.length === 0 ? (
                <div className="text-center py-6">
                  <FiCalendar size={24} className="mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'lesson_completed' ? 'bg-green-100' :
                          activity.type === 'quiz_completed' ? 'bg-blue-100' :
                          activity.type === 'course_enrolled' ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          {activity.type === 'lesson_completed' ? <FiCheck size={16} className="text-green-600" /> :
                           activity.type === 'quiz_completed' ? <FiFileText size={16} className="text-blue-600" /> :
                           activity.type === 'course_enrolled' ? <FiBook size={16} className="text-purple-600" /> :
                           <FiCalendar size={16} className="text-gray-600" />}
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Account settings link */}
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
              
              <a 
                href="/student/settings" 
                className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Settings
              </a>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>Manage your account settings, notifications preferences, and privacy options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}