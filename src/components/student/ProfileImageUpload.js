import React, { useState } from 'react';
import { uploadImage, uploadImageWithFallback } from '../../utils/cloudinary';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaUser, FaCamera, FaSpinner } from 'react-icons/fa';

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
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-4 rounded-lg shadow`}>
      <div className="text-center">
        <div className="flex flex-col items-center">
          {/* Image Preview */}
          <div className={`relative w-32 h-32 rounded-full overflow-hidden mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className={`h-16 w-16 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} />
              </div>
            )}
            
            {/* Camera Icon Overlay */}
            <label 
              htmlFor="profile-image" 
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
            >
              <FaCamera className="h-4 w-4" />
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
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 text-green-500 text-sm">
              {success}
            </div>
          )}
          
          {/* Upload Button */}
          {image && !uploading && (
            <button
              onClick={handleUpload}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Upload Image
            </button>
          )}
          
          {/* Loading State */}
          {uploading && (
            <div className="mt-2 flex items-center justify-center">
              <FaSpinner className="animate-spin h-5 w-5 mr-2 text-blue-500" />
              <span>Uploading...</span>
            </div>
          )}
        </div>
        
        <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Click the camera icon to upload a new profile picture.<br/>
          Maximum file size: 5MB
        </p>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
