import { cloudinaryConfig } from '../firebase/firebase';
import { uploadToFirebaseStorage } from './storage';

/**
 * Uploads a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} resourceType - The type of resource ('image' or 'video')
 * @returns {Promise<string>} - URL of the uploaded resource
 */
export const uploadToCloudinary = async (file, resourceType = 'image') => {
  try {
    if (!file || !(file instanceof File)) {
      console.error('Invalid file provided to uploadToCloudinary:', file);
      throw new Error('Invalid file provided');
    }

    if (!cloudinaryConfig || !cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      console.error('Invalid Cloudinary configuration:', cloudinaryConfig);
      throw new Error('Cloudinary is not properly configured');
    }

    console.log("Cloudinary Config:", {
      cloudName: cloudinaryConfig.cloudName,
      uploadPreset: cloudinaryConfig.uploadPreset
    });
    
    console.log("Uploading file to Cloudinary:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Create FormData for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('resource_type', resourceType);

    // Debug the form data
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    // Construct Cloudinary upload URL
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
    console.log("Cloudinary upload URL:", url);

    console.log("Starting fetch request to Cloudinary...");
    // Make HTTP request to Cloudinary
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    console.log("Fetch request completed with status:", response.status);

    // Handle response
    if (!response.ok) {
      let errorInfo = '';
      try {
        const errorData = await response.json();
        errorInfo = JSON.stringify(errorData);
      } catch (e) {
        const errorText = await response.text();
        errorInfo = errorText;
      }
      
      console.error("Cloudinary upload failed:", errorInfo);
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}. Details: ${errorInfo}`);
    }

    const data = await response.json();
    console.log("Cloudinary upload successful:", {
      public_id: data.public_id,
      secure_url: data.secure_url,
      format: data.format,
      bytes: data.bytes
    });

    // Return the secure URL
    return data.secure_url;
  } catch (error) {
    console.error("Error in uploadToCloudinary:", error);
    throw error;
  }
};

/**
 * Uploads an image to Cloudinary
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadImage = async (imageFile) => {
  // Direct implementation, no unnecessary try-catch
  return uploadToCloudinary(imageFile, 'image');
};

/**
 * Uploads a video to Cloudinary
 * @param {File} videoFile - The video file to upload
 * @returns {Promise<string>} - URL of the uploaded video
 */
export const uploadVideo = async (videoFile) => {
  return uploadToCloudinary(videoFile, 'video');
};

/**
 * Attempts to upload an image to Cloudinary, with Firebase Storage as fallback
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadImageWithFallback = async (imageFile) => {
  try {
    // Try Cloudinary first
    return await uploadImage(imageFile);
  } catch (cloudinaryError) {
    console.warn("Cloudinary upload failed, trying Firebase Storage as fallback", cloudinaryError);
    // Use Firebase as fallback
    return await uploadToFirebaseStorage(imageFile, `profile-images/${Date.now()}_${imageFile.name}`);
  }
};
