import React, { useState } from 'react';
import { uploadImage, uploadImageWithFallback } from '../../utils/cloudinary.js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useTheme } from '../../contexts/ThemeContext.js';
import { FaUser, FaCamera, FaSpinner } from 'react-icons/fa/index.esm.js';

const ProfileImageUpload = ({ currentImageUrl, onImageUpdate }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(currentImageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();

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

  const handleUpload = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      
      console.log("Starting image upload process:", {
        name: image.name,
        size: image.size,
        type: image.type
      });
      
      // Use the new utility that tries both Cloudinary and Firebase
      const imageUrl = await uploadImageWithFallback(image);
      
      if (!imageUrl) {
        throw new Error('Failed to get image URL from upload services');
      }
      
      console.log("Updating Firestore user document with new image URL:", imageUrl);
      
      // Update user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        profileImageUrl: imageUrl,
        updatedAt: new Date()
      });
      
      console.log("Firestore update successful");
      
      // Update parent component
      if (onImageUpdate) {
        onImageUpdate(imageUrl);
        console.log("Parent component updated with new image URL:", imageUrl);
      }
      
      setSuccess('Profile image updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading image:', err);
      // More descriptive error message
      const errorMessage = err.message || 'Failed to upload image';
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-4 sm:p-6 rounded-lg shadow`}>
      <div className="text-center">
        <div className="flex flex-col items-center">
          {/* Image Preview */}
          <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className={`h-12 w-12 sm:h-16 sm:w-16 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} />
              </div>
            )}
            
            {/* Camera Icon Overlay */}
            <label 
              htmlFor="profile-image" 
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 sm:p-3 rounded-full cursor-pointer hover:bg-blue-600 transition-colors touch-manipulation"
            >
              <FaCamera className="h-3 w-3 sm:h-4 sm:w-4" />
            </label>
            
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 text-red-500 text-sm px-2">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 text-green-500 text-sm px-2">
              {success}
            </div>
          )}
          
          {/* Upload Button */}
          {image && !uploading && (
            <button
              onClick={handleUpload}
              className="mt-2 px-6 py-3 sm:px-8 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-sm sm:text-base font-medium touch-manipulation"
            >
              Upload Image
            </button>
          )}
          
          {/* Loading State */}
          {uploading && (
            <div className="mt-2 flex items-center justify-center">
              <FaSpinner className="animate-spin h-5 w-5 mr-2 text-blue-500" />
              <span className="text-sm sm:text-base">Uploading...</span>
            </div>
          )}
        </div>
        
        <p className={`mt-4 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} px-2`}>
          Click the camera icon to upload a new profile picture.<br className="hidden sm:block"/>
          Maximum file size: 5MB
        </p>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
