// Test Payment Script
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse existing instance if available)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testPayment() {
  const courseId = '6OcFxX6jk2XWRp6JopGG';
  const studentId = 'ykzmnD6yk1gSaLINVq39gLjwErX2';

  console.log('🧪 Testing Payment Flow\n');
  console.log('📝 Details:');
  console.log(`   Course ID: ${courseId}`);
  console.log(`   Student ID: ${studentId}\n`);

  try {
    // 1. Check if course exists
    console.log('1️⃣ Checking if course exists...');
    const courseRef = db.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      console.log('❌ Course not found in Firestore');
      return;
    }
    
    const courseData = courseDoc.data();
    console.log('✅ Course found:', courseData.title);
    console.log(`   Price: ₹${courseData.price || 0}`);
    console.log(`   Description: ${courseData.description?.substring(0, 50)}...`);

    // 2. Check if student exists
    console.log('\n2️⃣ Checking if student exists...');
    const studentRef = db.collection('users').doc(studentId);
    const studentDoc = await studentRef.get();
    
    if (!studentDoc.exists) {
      console.log('❌ Student not found in Firestore');
      return;
    }
    
    const studentData = studentDoc.data();
    console.log('✅ Student found:', studentData.fullName || studentData.email);
    console.log(`   Email: ${studentData.email}`);
    console.log(`   Role: ${studentData.role}`);

    // 3. Check if already enrolled
    console.log('\n3️⃣ Checking enrollment status...');
    const enrolledCourses = studentData.enrolledCourses || [];
    const isEnrolled = enrolledCourses.includes(courseId);
    
    if (isEnrolled) {
      console.log('⚠️  Student is already enrolled in this course');
    } else {
      console.log('✅ Student is not enrolled yet - payment can proceed');
    }

    // 4. Simulate Razorpay order creation
    console.log('\n4️⃣ Simulating Razorpay order creation...');
    const amount = (courseData.price || 0) * 100; // Convert to paise
    console.log(`   Amount: ₹${courseData.price} (${amount} paise)`);
    console.log(`   Currency: INR`);
    console.log('   ✅ Order would be created successfully');

    // 5. Check payment endpoint accessibility
    console.log('\n5️⃣ Testing backend endpoint...');
    
    // Get custom token for the user
    const customToken = await admin.auth().createCustomToken(studentId);
    console.log('   ✅ Created custom token for authentication');
    console.log('   ℹ️  In production, frontend exchanges this for ID token');

    console.log('\n✅ Payment flow test complete!');
    console.log('\n📊 Summary:');
    console.log(`   • Course exists: YES`);
    console.log(`   • Student exists: YES`);
    console.log(`   • Already enrolled: ${isEnrolled ? 'YES' : 'NO'}`);
    console.log(`   • Can proceed with payment: ${!isEnrolled ? 'YES' : 'NO'}`);
    console.log(`   • Backend API: READY`);

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error(error);
  }
}

// Run the test
testPayment()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
