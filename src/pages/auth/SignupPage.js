import { cloudinaryConfig } from '../../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    console.log("Cloudinary Config:", cloudinaryConfig);
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

    // Make HTTP request to Cloudinary
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Add CORS headers
      mode: 'cors',
      credentials: 'omit'
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload failed:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        url: url
      });
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Cloudinary upload successful:", data);

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
 * Signup page component
 */
const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [setSubmitting] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles the signup form submission
   * @param {Event} e - The submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ...existing validation code...

    try {
      setSubmitting(true);
      
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        role: 'student',
        createdAt: new Date(),
        onboardingComplete: false // Add this flag to track onboarding status
      });

      // Redirect to course selection page instead of dashboard
      navigate('/course-selection');
    } catch (error) {
      // ...existing error handling...
    }
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center">
        <img className="h-16 w-auto" src="/mentneo-logo.png" alt="Mentneo" />
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      {/* ...existing signup form... */}
    </div>
  );
};

export default SignupPage;