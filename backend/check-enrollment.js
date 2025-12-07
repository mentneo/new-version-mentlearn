// Check Enrollment Script
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

async function checkEnrollment() {
  const userId = 'NHpTpIue0DfXKg9fZ2Pa2sd91Zo1'; // From the logs
  const courseId = '6OcFxX6jk2XWRp6JopGG';

  console.log('🔍 Checking enrollment status...\n');

  try {
    // 1. Check user document
    console.log('1️⃣ Checking user document...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ User found:', userData.email);
      console.log('   Enrolled Courses:', userData.enrolledCourses || []);
      console.log('   Has course in array:', (userData.enrolledCourses || []).includes(courseId));
    } else {
      console.log('❌ User not found');
    }

    // 2. Check enrollments collection
    console.log('\n2️⃣ Checking enrollments collection...');
    const enrollmentsQuery = await db.collection('enrollments')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .get();
    
    if (!enrollmentsQuery.empty) {
      console.log(`✅ Found ${enrollmentsQuery.docs.length} enrollment(s):`);
      enrollmentsQuery.forEach(doc => {
        const data = doc.data();
        console.log(`   - ID: ${doc.id}`);
        console.log(`     Status: ${data.status}`);
        console.log(`     Course: ${data.courseName}`);
        console.log(`     Enrolled At: ${data.enrolledAt?.toDate()}`);
      });
    } else {
      console.log('❌ No enrollments found');
    }

    // 3. Check all enrollments for this user
    console.log('\n3️⃣ Checking all enrollments for user...');
    const allEnrollments = await db.collection('enrollments')
      .where('userId', '==', userId)
      .get();
    
    if (!allEnrollments.empty) {
      console.log(`✅ Total enrollments: ${allEnrollments.docs.length}`);
      allEnrollments.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.courseName} (${data.courseId})`);
        console.log(`     Status: ${data.status}, Progress: ${data.progress || 0}%`);
      });
    } else {
      console.log('❌ No enrollments found for this user');
    }

    // 4. Check payments
    console.log('\n4️⃣ Checking payments...');
    const paymentsQuery = await db.collection('payments')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .get();
    
    if (!paymentsQuery.empty) {
      console.log(`✅ Found ${paymentsQuery.docs.length} payment(s):`);
      paymentsQuery.forEach(doc => {
        const data = doc.data();
        console.log(`   - Amount: ₹${data.amount}`);
        console.log(`     Status: ${data.status}`);
        console.log(`     Payment ID: ${data.paymentId}`);
      });
    } else {
      console.log('❌ No payments found');
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkEnrollment()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
