import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import StudentLayout from '../../components/layouts/StudentLayout';
import { FaUser, FaCamera, FaSpinner, FaSave, FaEdit, FaGraduationCap, 
         FaBriefcase, FaCode, FaHeart, FaLink, FaMapMarkerAlt, FaGlobe,
         FaEnvelope, FaPhone, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { uploadImageWithFallback } from '../../utils/cloudinary';

const StudentProfile = () => {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    education: '',
    occupation: '',
    skills: [],
    interests: [],
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      website: ''
    },
    profileImageUrl: ''
  });
  
  // Image upload state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || currentUser.displayName || '',
            email: currentUser.email || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            location: userData.location || '',
            education: userData.education || '',
            occupation: userData.occupation || '',
            skills: userData.skills || [],
            interests: userData.interests || [],
            socialLinks: userData.socialLinks || {
              github: '',
              linkedin: '',
              twitter: '',
              website: ''
            },
            profileImageUrl: userData.profileImageUrl || ''
          });
          
          if (userData.profileImageUrl) {
            setImagePreview(userData.profileImageUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load your profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };
  
  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
    setProfileData(prev => ({
      ...prev,
      skills
    }));
  };
  
  const handleInterestsChange = (e) => {
    const interests = e.target.value.split(',').map(interest => interest.trim()).filter(Boolean);
    setProfileData(prev => ({
      ...prev,
      interests
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (jpg, png, gif, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setError('');
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!image) {
      return;
    }
    
    try {
      setUploadingImage(true);
      setError('');
      
      // Upload the image to Cloudinary (with Firebase fallback)
      const imageUrl = await uploadImageWithFallback(image, currentUser.uid);
      
      if (!imageUrl) {
        throw new Error('Failed to get image URL from upload services');
      }
      
      // Update user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        profileImageUrl: imageUrl,
        updatedAt: new Date()
      });
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        profileImageUrl: imageUrl
      }));
      
      setSuccess('Profile image updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(`Upload failed: ${err.message || 'Failed to upload image'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      
      // Upload image first if there's a new image
      if (image) {
        await handleImageUpload();
      }
      
      // Update user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        displayName: profileData.displayName,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
        education: profileData.education,
        occupation: profileData.occupation,
        skills: profileData.skills,
        interests: profileData.interests,
        socialLinks: profileData.socialLinks,
        updatedAt: new Date()
      });
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(`Failed to update profile: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} py-12`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <FaSpinner className="animate-spin h-12 w-12 text-indigo-500" />
            </div>
            <p className={`mt-4 text-center ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Loading your profile...
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header with Toggle Edit Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              My Profile
            </h1>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-md ${darkMode 
                ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'} 
                transition-colors duration-200 flex items-center space-x-2`}
            >
              {editMode ? (
                <>
                  <FaSave className="h-4 w-4" />
                  <span>View Profile</span>
                </>
              ) : (
                <>
                  <FaEdit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>
          
          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {/* Profile Banner and Avatar */}
            <div className={`h-32 sm:h-48 ${darkMode ? 'bg-indigo-900' : 'bg-indigo-600'} relative`}>
              {/* Profile Image */}
              <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                <div className={`relative h-24 w-24 sm:h-32 sm:h-32 rounded-full border-4 ${darkMode ? 'border-gray-800' : 'border-white'} overflow-hidden bg-white`}>
                  {profileData.profileImageUrl || imagePreview ? (
                    <img 
                      src={imagePreview || profileData.profileImageUrl} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <FaUser className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {editMode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <label htmlFor="profile-image" className="cursor-pointer">
                        <FaCamera className="h-8 w-8 text-white" />
                        <input 
                          type="file" 
                          id="profile-image" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Content */}
            <div className="pt-16 px-6 pb-6">
              {editMode ? (
                // Edit Mode
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="firstName" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          First name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={profileData.firstName}
                            onChange={handleInputChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="lastName" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Last name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={profileData.lastName}
                            onChange={handleInputChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="displayName" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Display name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="displayName"
                            id="displayName"
                            value={profileData.displayName}
                            onChange={handleInputChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Email address
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={profileData.email}
                            disabled
                            className={`shadow-sm block w-full sm:text-sm rounded-md bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed`}
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Contact an administrator to change your email.
                          </p>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="phone" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Phone number
                        </label>
                        <div className="mt-1">
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="bio" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Bio
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            value={profileData.bio}
                            onChange={handleInputChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="Write a few sentences about yourself"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="location" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Location
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="location"
                            id="location"
                            value={profileData.location}
                            onChange={handleInputChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="City, Country"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="occupation" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Occupation
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="occupation"
                            id="occupation"
                            value={profileData.occupation}
                            onChange={handleInputChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="Software Developer, Student, etc."
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="education" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Education
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="education"
                            id="education"
                            value={profileData.education}
                            onChange={handleInputChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="Degree, University"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Interests */}
                  <div>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                      Skills & Interests
                    </h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="skills" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Skills (comma separated)
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="skills"
                            name="skills"
                            rows={3}
                            value={profileData.skills.join(', ')}
                            onChange={handleSkillsChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="JavaScript, React, Python, etc."
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="interests" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Interests (comma separated)
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="interests"
                            name="interests"
                            rows={3}
                            value={profileData.interests.join(', ')}
                            onChange={handleInterestsChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="Web Development, AI, Mobile Apps, etc."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                      Social Links
                    </h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="github" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          GitHub
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="github"
                            id="github"
                            value={profileData.socialLinks.github}
                            onChange={handleSocialLinkChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="linkedin" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          LinkedIn
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="linkedin"
                            id="linkedin"
                            value={profileData.socialLinks.linkedin}
                            onChange={handleSocialLinkChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="twitter" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Twitter
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="twitter"
                            id="twitter"
                            value={profileData.socialLinks.twitter}
                            onChange={handleSocialLinkChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="https://twitter.com/username"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="website" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Personal Website
                        </label>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="website"
                            id="website"
                            value={profileData.socialLinks.website}
                            onChange={handleSocialLinkChange}
                            className={`shadow-sm block w-full sm:text-sm rounded-md ${darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className={`px-4 py-2 rounded-md ${darkMode 
                        ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
                        transition-colors duration-200 flex items-center space-x-2 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaSave className="h-4 w-4" />
                          <span>Save Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-6">
                  {/* Display Name and Bio */}
                  <div className="space-y-2">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {profileData.displayName || `${profileData.firstName} ${profileData.lastName}`.trim()}
                    </h2>
                    {profileData.occupation && (
                      <p className={`text-lg ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                        {profileData.occupation}
                      </p>
                    )}
                    {profileData.bio && (
                      <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {profileData.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Info Cards */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Contact Information */}
                    <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Contact Information
                      </h3>
                      <ul className="space-y-3">
                        <li className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="flex-shrink-0 h-5 w-5 text-indigo-500 mr-2">
                            <FaEnvelope />
                          </span>
                          <span>{profileData.email}</span>
                        </li>
                        {profileData.phone && (
                          <li className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="flex-shrink-0 h-5 w-5 text-indigo-500 mr-2">
                              <FaPhone />
                            </span>
                            <span>{profileData.phone}</span>
                          </li>
                        )}
                        {profileData.location && (
                          <li className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="flex-shrink-0 h-5 w-5 text-indigo-500 mr-2">
                              <FaMapMarkerAlt />
                            </span>
                            <span>{profileData.location}</span>
                          </li>
                        )}
                        {profileData.education && (
                          <li className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="flex-shrink-0 h-5 w-5 text-indigo-500 mr-2">
                              <FaGraduationCap />
                            </span>
                            <span>{profileData.education}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    {/* Skills */}
                    {profileData.skills.length > 0 && (
                      <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                          <FaCode className="mr-2" /> Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                darkMode 
                                  ? 'bg-indigo-900 text-indigo-200' 
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Interests */}
                    {profileData.interests.length > 0 && (
                      <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                          <FaHeart className="mr-2" /> Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.interests.map((interest, index) => (
                            <span 
                              key={index} 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                darkMode 
                                  ? 'bg-purple-900 text-purple-200' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Social Links */}
                  {(profileData.socialLinks.github || 
                    profileData.socialLinks.linkedin || 
                    profileData.socialLinks.twitter || 
                    profileData.socialLinks.website) && (
                    <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                        <FaLink className="mr-2" /> Connect with me
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {profileData.socialLinks.github && (
                          <a 
                            href={profileData.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-4 py-2 rounded-md ${
                              darkMode 
                                ? 'bg-gray-800 text-white hover:bg-gray-600' 
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                            } transition-colors duration-200`}
                          >
                            <FaGithub className="mr-2" />
                            GitHub
                          </a>
                        )}
                        
                        {profileData.socialLinks.linkedin && (
                          <a 
                            href={profileData.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-4 py-2 rounded-md ${
                              darkMode 
                                ? 'bg-gray-800 text-white hover:bg-gray-600' 
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                            } transition-colors duration-200`}
                          >
                            <FaLinkedin className="mr-2" />
                            LinkedIn
                          </a>
                        )}
                        
                        {profileData.socialLinks.twitter && (
                          <a 
                            href={profileData.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-4 py-2 rounded-md ${
                              darkMode 
                                ? 'bg-gray-800 text-white hover:bg-gray-600' 
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                            } transition-colors duration-200`}
                          >
                            <FaTwitter className="mr-2" />
                            Twitter
                          </a>
                        )}
                        
                        {profileData.socialLinks.website && (
                          <a 
                            href={profileData.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-4 py-2 rounded-md ${
                              darkMode 
                                ? 'bg-gray-800 text-white hover:bg-gray-600' 
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                            } transition-colors duration-200`}
                          >
                            <FaGlobe className="mr-2" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;