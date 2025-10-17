require('dotenv').config({ path: '../.env' });
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');

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
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestCreator() {
  try {
    console.log('Creating test creator user...');

    const email = 'test.creator@mentneo.com';
    const password = 'TestPass123!';

    let userCredential;
    let userUid;
    
    try {
      // First try to sign in with existing credentials
      console.log('🔍 Checking if test creator already exists...');
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      userUid = userCredential.user.uid;
      console.log('✅ Test creator already exists, updating user document...');
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/wrong-password') {
        console.log('📝 Test creator does not exist, creating new user...');
        // User doesn't exist, create new one
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userUid = userCredential.user.uid;
        console.log('✅ New test creator user created in Firebase Auth');
      } else {
        throw signInError;
      }
    }

    // Create or update user document in users collection
    const userData = {
      uid: userUid,
      email: email,
      role: 'creator',
      name: 'Test Creator',
      isTestUser: true,
      createdAt: new Date().toISOString(),
      onboardingComplete: true
    };

    await setDoc(doc(db, "users", userUid), userData);
    
    // Create or update creator document in creators collection
    const creatorData = {
      uid: userUid,
      email: email,
      name: 'Test Creator',
      displayName: 'Test Creator',
      bio: 'This is a test creator account for development and testing purposes.',
      expertise: ['Web Development', 'JavaScript', 'React'],
      isTestUser: true,
      createdAt: new Date().toISOString(),
      profileComplete: true,
      status: 'active',
      courses: [], // No courses initially
      totalStudents: 0,
      totalRevenue: 0,
      rating: 5.0
    };
    
    await setDoc(doc(db, "creators", userUid), creatorData);

    console.log('✅ Test creator user documents created/updated successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 User ID: ${userUid}`);
    console.log('💡 Test creator is ready to create courses!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test creator:', error.message);
    process.exit(1);
  }
}

createTestCreator();