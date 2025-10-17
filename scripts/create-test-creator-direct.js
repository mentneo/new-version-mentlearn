// This is a special admin script that can create a test creator directly in Firestore
// bypassing Firebase Authentication rate limiting
// Run this script with Node.js: node create-test-creator-direct.js

require('dotenv').config({ path: '../.env' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
let admin;
try {
  // Try to find the service account file
  const serviceAccountPath = path.resolve(__dirname, '../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json');
  if (fs.existsSync(serviceAccountPath)) {
    console.log('Using service account file');
    if (getApps().length === 0) {
      admin = initializeApp({
        credential: cert(serviceAccountPath),
        databaseURL: "https://mentor-app-238c6.firebaseio.com"
      });
    }
  } else {
    console.error('Service account file not found:', serviceAccountPath);
    process.exit(1);
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();
const auth = getAuth();

async function createTestCreatorDirect() {
  try {
    console.log('Creating test creator user directly using admin credentials...');

    const email = 'test.creator@mentneo.com';
    const password = 'TestPass123!';
    const userUid = 'test-creator-uid-' + Date.now().toString().slice(-6); // Generate a semi-unique UID
    
    // Check if user with this email already exists
    console.log('Checking if user already exists...');
    let existingUser = null;
    try {
      existingUser = await auth.getUserByEmail(email);
      console.log('User already exists:', existingUser.uid);
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // If user exists, use that UID, otherwise create a new user
    let uid;
    if (existingUser) {
      uid = existingUser.uid;
    } else {
      // Create the user with admin SDK
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: 'Test Creator',
        emailVerified: true
      });
      uid = userRecord.uid;
      console.log('Created new user with UID:', uid);
    }
    
    // Create or update user document with creator role
    console.log('Creating/updating user document in users collection...');
    const userData = {
      uid: uid,
      email: email,
      role: 'creator',
      name: 'Test Creator',
      isTestUser: true,
      createdAt: new Date().toISOString(),
      onboardingComplete: true
    };
    
    await db.collection('users').doc(uid).set(userData, { merge: true });
    
    // Create or update creator document in creators collection
    console.log('Creating/updating creator document in creators collection...');
    const creatorData = {
      uid: uid,
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
    
    await db.collection('creators').doc(uid).set(creatorData, { merge: true });
    
    console.log('✅ Test creator user documents created/updated successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 User ID: ${uid}`);
    console.log('💡 Test creator is ready to create courses!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test creator:', error);
    process.exit(1);
  }
}

createTestCreatorDirect();