import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5TM1O1F1T49UKMbUG0nI7k19FHk6Cvr0",
  authDomain: "mentor-app-238c6.firebaseapp.com",
  projectId: "mentor-app-238c6",
  storageBucket: "mentor-app-238c6.appspot.com",
  messagingSenderId: "943754909900",
  appId: "1:943754909900:web:cef25346ffae73d2e20a69",
  measurementId: "G-8T3CMHE740"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dp8bfdbab',
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'mentneo_uploads'
};

console.log("Firebase initialized with project:", firebaseConfig.projectId);

// Export everything in a single export statement
export { auth, db, storage, cloudinaryConfig };
