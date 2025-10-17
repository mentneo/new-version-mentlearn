// This script checks user role information to help diagnose authentication issues
// Usage: node check-user-role.js <email>

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

async function checkUserRole(email) {
  if (!email) {
    console.error('Please provide an email address. Usage: node check-user-role.js <email>');
    process.exit(1);
  }

  try {
    console.log(`Checking user information for email: ${email}`);
    
    // Check if user exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('✓ User exists in Firebase Authentication');
      console.log(`  UID: ${userRecord.uid}`);
      console.log(`  Email: ${userRecord.email}`);
      console.log(`  Email verified: ${userRecord.emailVerified}`);
      console.log(`  Display name: ${userRecord.displayName || 'Not set'}`);
      console.log(`  Creation time: ${userRecord.metadata.creationTime}`);
      console.log(`  Last sign in: ${userRecord.metadata.lastSignInTime}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('✗ User does not exist in Firebase Authentication');
      } else {
        console.error('Error fetching user from Firebase Auth:', error);
      }
      userRecord = null;
    }
    
    // Check if user exists in users collection
    if (userRecord) {
      const userDocRef = db.collection('users').doc(userRecord.uid);
      const userDoc = await userDocRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('\n✓ User document exists in "users" collection:');
        console.log('  Role:', userData.role);
        console.log('  Name:', userData.name);
        console.log('  Onboarding complete:', userData.onboardingComplete);
        console.log('  Created at:', userData.createdAt);
        console.log('  Other fields:', Object.keys(userData).filter(k => !['role', 'name', 'onboardingComplete', 'createdAt', 'uid', 'email'].includes(k)));
      } else {
        console.log('\n✗ User document does not exist in "users" collection');
      }
      
      // Check if user exists in creators collection
      const creatorDocRef = db.collection('creators').doc(userRecord.uid);
      const creatorDoc = await creatorDocRef.get();
      
      if (creatorDoc.exists) {
        const creatorData = creatorDoc.data();
        console.log('\n✓ User document exists in "creators" collection:');
        console.log('  Name:', creatorData.name);
        console.log('  Display name:', creatorData.displayName);
        console.log('  Status:', creatorData.status);
        console.log('  Profile complete:', creatorData.profileComplete);
        console.log('  Other fields:', Object.keys(creatorData).filter(k => 
          !['name', 'displayName', 'status', 'profileComplete', 'uid', 'email'].includes(k)));
      } else {
        console.log('\n✗ User document does not exist in "creators" collection');
      }
    }
    
    // Check for any documents with this email regardless of collection
    console.log('\nSearching for documents with this email across all collections...');
    
    // Search in users collection
    const usersQuerySnapshot = await db.collection('users').where('email', '==', email).get();
    if (!usersQuerySnapshot.empty) {
      console.log(`\n✓ Found ${usersQuerySnapshot.size} document(s) in "users" collection with this email:`);
      usersQuerySnapshot.forEach(doc => {
        console.log(`  Document ID: ${doc.id}`);
        console.log(`  Role: ${doc.data().role}`);
      });
    }
    
    // Search in creators collection
    const creatorsQuerySnapshot = await db.collection('creators').where('email', '==', email).get();
    if (!creatorsQuerySnapshot.empty) {
      console.log(`\n✓ Found ${creatorsQuerySnapshot.size} document(s) in "creators" collection with this email:`);
      creatorsQuerySnapshot.forEach(doc => {
        console.log(`  Document ID: ${doc.id}`);
        console.log(`  Status: ${doc.data().status}`);
      });
    }
    
    console.log('\nDiagnostic summary:');
    
    if (!userRecord) {
      console.log('✗ Problem: User does not exist in Firebase Authentication');
      console.log('  Solution: Create the user account first');
    } else {
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const creatorDoc = await db.collection('creators').doc(userRecord.uid).get();
      
      if (!userDoc.exists && !creatorDoc.exists) {
        console.log('✗ Problem: User exists in Authentication but has no documents in Firestore');
        console.log('  Solution: Create proper user documents in Firestore');
      } else if (userDoc.exists && userDoc.data().role !== 'creator') {
        console.log(`✗ Problem: User role is "${userDoc.data().role}" in users collection, not "creator"`);
        console.log('  Solution: Update the user document role field to "creator"');
      } else if (!creatorDoc.exists) {
        console.log('✗ Problem: User has "creator" role but no document in creators collection');
        console.log('  Solution: Create a document in the creators collection with the same UID');
      } else {
        console.log('✓ No issues found! User should be able to access creator features.');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking user role:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
checkUserRole(email);