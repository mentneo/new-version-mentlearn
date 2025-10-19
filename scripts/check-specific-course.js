// Quick script to check exact course document structure
const admin = require('firebase-admin');
const serviceAccount = require('../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCourse() {
  try {
    // Check the specific course you showed
    const courseId = '0T7wCGUXqCJDZxBtaGR6';
    const courseDoc = await db.collection('courses').doc(courseId).get();
    
    if (!courseDoc.exists) {
      console.log('❌ Course not found');
      process.exit(1);
    }
    
    const data = courseDoc.data();
    
    console.log('=== COURSE DOCUMENT ANALYSIS ===');
    console.log('Course ID:', courseId);
    console.log('Title:', data.title);
    console.log('\n--- VISIBILITY FIELDS ---');
    console.log('published:', data.published, `(${typeof data.published})`);
    console.log('status:', data.status, `(${typeof data.status})`);
    console.log('\n--- ALL FIELDS ---');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n--- VISIBILITY CHECK ---');
    if (data.published === true) {
      console.log('✅ published is TRUE');
    } else if (data.published === false) {
      console.log('❌ published is FALSE');
    } else {
      console.log('⚠️  published is', data.published);
    }
    
    if (data.status) {
      console.log(`Status field exists: "${data.status}"`);
    } else {
      console.log('⚠️  WARNING: status field is MISSING or undefined!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkCourse();
