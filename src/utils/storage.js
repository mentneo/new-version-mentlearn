import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebase';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The storage path
 * @returns {Promise<string>} - The download URL
 */
export const uploadToFirebaseStorage = async (file, path) => {
  try {
    console.log(`Uploading file to Firebase Storage at path: ${path || 'generated path'}`);
    
    // If path is not provided, generate one
    const uploadPath = path || `images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    const storageRef = ref(storage, uploadPath);
    const snapshot = await uploadBytes(storageRef, file);
    console.log('File uploaded successfully');
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Upload an image to Firebase Storage
 * @param {File} imageFile - The image to upload
 * @returns {Promise<string>} - The download URL
 */
export const uploadImage = async (imageFile) => {
  if (!imageFile || !(imageFile instanceof File)) {
    console.error('Invalid image file provided:', imageFile);
    return null;
  }
  
  const path = `images/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  return await uploadToFirebaseStorage(imageFile, path);
};

/**
 * Upload a video to Firebase Storage
 * @param {File} videoFile - The video to upload
 * @returns {Promise<string>} - The download URL
 */
export const uploadVideo = (videoFile) => {
  const path = `videos/${Date.now()}_${videoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  return uploadToFirebaseStorage(videoFile, path);
};
