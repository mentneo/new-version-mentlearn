// A script to make a user an admin
// Run with: node makeAdmin.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration (same as your app)
const firebaseConfig = {
  apiKey: "AIzaSyD5TM1O1F1T49UKMbUG0nI7k19FHk6Cvr0",
  authDomain: "mentor-app-238c6.firebaseapp.com",
  projectId: "mentor-app-238c6",
  storageBucket: "mentor-app-238c6.firebasestorage.app",
  messagingSenderId: "943754909900",
  appId: "1:943754909900:web:cef25346ffae73d2e20a69",
  measurementId: "G-8T3CMHE740"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// USER_ID should be the Firebase Authentication UID of the user you want to make admin
const USER_ID = "REPLACE_WITH_YOUR_USER_UID";

async function makeAdmin() {
  try {
    await setDoc(doc(db, "users", USER_ID), {
      uid: USER_ID,
      role: 'admin',
      name: 'Admin User',
      email: 'admin@example.com', // Replace with the user's actual email
      createdAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('User successfully made admin!');
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

makeAdmin();
