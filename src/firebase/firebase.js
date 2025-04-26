import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD5TM1O1F1T49UKMbUG0nI7k19FHk6Cvr0",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mentor-app-238c6.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mentor-app-238c6", 
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mentor-app-238c6.appspot.com", // Fixed storage bucket URL
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "943754909900",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:943754909900:web:cef25346ffae73d2e20a69",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-8T3CMHE740"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'davjxvz8w',
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'cryptchat'
};

console.log("Firebase initialized with project:", firebaseConfig.projectId);

export { auth, db, storage, cloudinaryConfig };
