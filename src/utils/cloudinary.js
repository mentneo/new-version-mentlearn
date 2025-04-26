import { cloudinaryConfig } from '../firebase/firebase';

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

    console.log("Uploading to Cloudinary:", {
      fileName: file.name,
      fileSize: file.size,
      resourceType: resourceType,
      cloudName: cloudinaryConfig.cloudName
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('resource_type', resourceType);

    const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
    console.log("Upload URL:", url);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary API error:", errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Cloudinary response:", data);
    
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploads an image to Cloudinary
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadImage = async (imageFile) => {
  return await uploadToCloudinary(imageFile, 'image');
};

/**
 * Uploads a video to Cloudinary
 * @param {File} videoFile - The video file to upload
 * @returns {Promise<string>} - URL of the uploaded video
 */
export const uploadVideo = async (videoFile) => {
  return await uploadToCloudinary(videoFile, 'video');
};
