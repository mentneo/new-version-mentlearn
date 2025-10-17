import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js'.js';
import StudentLayout from '../../components/layouts/StudentLayout.js'.js';
import ProfileImageUpload from '../../components/student/ProfileImageUpload';
import { useTheme } from '../../contexts/ThemeContext.js';

const ProfileSettings = () => {
  const { currentUser, updateProfile } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    skills: [],
    profileImageUrl: '',
    interests: []
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Profile image upload state
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: null });
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: currentUser.email || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            skills: userData.skills || [],
            profileImageUrl: userData.profileImageUrl || '',
            interests: userData.interests || []
          });
          
          if (userData.profileImageUrl) {
            setImagePreview(userData.profileImageUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load your profile data. Please try again.");
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
    setProfileData(prevData => ({
      ...prevData,
      skills
    }));
  };
  
  const handleInterestsChange = (e) => {
    const interests = e.target.value.split(',').map(interest => interest.trim()).filter(Boolean);
    setProfileData(prevData => ({
      ...prevData,
      interests
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleProfileImageUpdate = (imageUrl) => {
    console.log("ProfileSettings received new image URL:", imageUrl);
    setProfileData(prevData => ({
      ...prevData,
      profileImageUrl: imageUrl
    }));
    
    // Show success message
    setSuccess("Profile image updated successfully!");
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        displayName: `${profileData.firstName} ${profileData.lastName}`,
        phone: profileData.phone,
        bio: profileData.bio,
        skills: profileData.skills,
        interests: profileData.interests,
        profileImageUrl: profileData.profileImageUrl,
        updatedAt: new Date()
      });
      
      // Update email if changed
      if (profileData.email !== currentUser.email) {
        await updateEmail(auth.currentUser, profileData.email);
      }
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please ensure all information is valid.");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordData.newPassword);
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Password updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error updating password:", err);
      if (err.code === 'auth/wrong-password') {
        setError("Current password is incorrect");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Tabs */}
            <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`${
                    activeTab === 'general'
                      ? `border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:border-gray-700' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                >
                  General Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`${
                    activeTab === 'security'
                      ? `border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:border-gray-700' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Security
                </button>
              </nav>
            </div>
            
            {/* Success/Error Messages */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* General Information Tab */}
            {activeTab === 'general' && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg`}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Information</h3>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Update your personal information and preferences.</p>
                  
                  <form className="mt-6 space-y-6" onSubmit={handleProfileUpdate}>
                    {/* Profile Image */}
                    <ProfileImageUpload 
                      currentImageUrl={profileData.profileImageUrl} 
                      onImageUpdate={handleProfileImageUpdate} 
                    />
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="firstName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          First name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            required
                            value={profileData.firstName}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="lastName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Last name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            required
                            value={profileData.lastName}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email address
                        </label>
                        <div className="mt-1">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={profileData.email}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="phone" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone number (optional)
                        </label>
                        <div className="mt-1">
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="bio" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Bio (optional)
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            value={profileData.bio}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Brief description for your profile.</p>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="skills" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Skills (comma separated, optional)
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="skills"
                            id="skills"
                            value={profileData.skills.join(', ')}
                            onChange={handleSkillsChange}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="interests" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Interests (comma separated, optional)
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="interests"
                            id="interests"
                            value={profileData.interests.join(', ')}
                            onChange={handleInterestsChange}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg`}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Change Password</h3>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Update your password to keep your account secure.</p>
                  
                  <form className="mt-6 space-y-6" onSubmit={handlePasswordUpdate}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-4">
                        <label htmlFor="currentPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Current Password
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            required
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-4">
                        <label htmlFor="newPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          New Password
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            required
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            minLength={6}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-4">
                        <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Confirm New Password
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            required
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            minLength={6}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} rounded-md`}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className={`px-4 py-5 sm:p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} mt-4`}>
                  <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Delete Account</h3>
                  <div className={`mt-2 max-w-xl text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>
                      Once you delete your account, you will lose all data associated with it. This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-5">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm dark:text-red-100 dark:bg-red-900 dark:hover:bg-red-800"
                      onClick={() => window.confirm('Are you sure you want to delete your account? This action cannot be undone.') && console.log('Account deletion requested')}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default ProfileSettings;
