const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD5TM1O1F1T49UKMbUG0nI7k19FHk6Cvr0",
  authDomain: "mentor-app-238c6.firebaseapp.com",
  projectId: "mentor-app-238c6",
  storageBucket: "mentor-app-238c6.appspot.com",
  messagingSenderId: "943754909900",
  appId: "1:943754909900:web:cef25346ffae73d2e20a69",
  measurementId: "G-8T3CMHE740"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestCreator() {
  try {
    console.log('Creating test creator account...');

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, 'creator@test.com', 'password123');
    const user = userCredential.user;

    // Add creator to Firestore
    await setDoc(doc(db, 'creators', user.uid), {
      uid: user.uid,
      name: 'Test Creator',
      email: 'creator@test.com',
      phone: '+1234567890',
      specialization: 'Web Development',
      experience: '5 years',
      createdAt: new Date().toISOString(),
      role: 'creator',
      coursesCount: 0
    });

    console.log('✅ Test creator created successfully!');
    console.log('📧 Email: creator@test.com');
    console.log('🔑 Password: password123');
    console.log('🎯 Role: creator');

  } catch (error) {
    console.error('❌ Error creating test creator:', error.message);
  }
}

createTestCreator();
