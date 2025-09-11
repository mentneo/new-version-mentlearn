require('dotenv').config({ path: '../.env' });
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5TM1O1F1T49UKMbUG0nI7k19FHk6Cvr0",
  authDomain: "mentor-app-238c6.firebaseapp.com",
  projectId: "mentor-app-238c6",
  storageBucket: "mentor-app-238c6.appspot.com", // Make sure this is the correct format
  messagingSenderId: "943754909900",
  appId: "1:943754909900:web:cef25346ffae73d2e20a69",
  measurementId: "G-8T3CMHE740"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestStudent() {
  try {
    console.log('Creating test student user...');

    const email = 'test.student@mentneo.com';
    const password = 'TestPass123!';

    let userCredential;
    let userUid;
    
    try {
      // First try to sign in with existing credentials
      console.log('🔍 Checking if test student already exists...');
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      userUid = userCredential.user.uid;
      console.log('✅ Test student already exists, updating user document...');
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/wrong-password') {
        console.log('📝 Test student does not exist, creating new user...');
        // User doesn't exist, create new one
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userUid = userCredential.user.uid;
        console.log('✅ New test student user created in Firebase Auth');
      } else {
        throw signInError;
      }
    }

    // Create or update user document with test student role
    const userData = {
      uid: userUid,
      email: email,
      role: 'student',
      name: 'Test Student',
      isTestUser: true, // Special flag for test users
      freeAccess: true, // Flag to indicate free access to all courses
      createdAt: new Date().toISOString(),
      onboardingComplete: true
    };

    await setDoc(doc(db, "users", userUid), userData);

    console.log('✅ Test student user document created/updated successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 User ID: ${userUid}`);
    console.log('💡 Test student has FREE ACCESS to all courses!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test student:', error.message);
    process.exit(1);
  }
}

createTestStudent();
