// Fix Missing User Document
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixMissingUser() {
  const userId = 'NHpTpIue0DfXKg9fZ2Pa2sd91Zo1';
  const courseId = '6OcFxX6jk2XWRp6JopGG';

  console.log('🔧 Fixing missing user document...\n');

  try {
    // Get user's auth info
    const authUser = await admin.auth().getUser(userId);
    console.log('✅ Found auth user:', authUser.email);

    // Check if user document exists
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('📝 Creating user document...');
      
      await userRef.set({
        email: authUser.email,
        fullName: authUser.displayName || authUser.email.split('@')[0],
        role: 'student',
        enrolledCourses: [courseId],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdVia: 'razorpay_purchase_fix'
      });

      console.log('✅ User document created successfully!');
    } else {
      console.log('ℹ️  User document already exists, updating enrolledCourses...');
      
      const userData = userDoc.data();
      const enrolledCourses = userData.enrolledCourses || [];
      
      if (!enrolledCourses.includes(courseId)) {
        await userRef.update({
          enrolledCourses: admin.firestore.FieldValue.arrayUnion(courseId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Added course to enrolledCourses array');
      } else {
        console.log('✅ Course already in enrolledCourses array');
      }
    }

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const updatedUserDoc = await userRef.get();
    if (updatedUserDoc.exists) {
      const data = updatedUserDoc.data();
      console.log('✅ User document exists');
      console.log('   Email:', data.email);
      console.log('   Role:', data.role);
      console.log('   Enrolled Courses:', data.enrolledCourses);
    }

    console.log('\n✅ Fix complete! User should now see their course in the dashboard.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixMissingUser()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
