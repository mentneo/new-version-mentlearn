// Check Enrollment Fields
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

async function checkEnrollments() {
  const snapshot = await admin.firestore().collection('enrollments').limit(5).get();
  
  console.log('📋 Checking enrollment field names...\n');
  
  if (snapshot.empty) {
    console.log('No enrollments found');
    return;
  }
  
  snapshot.forEach((doc, index) => {
    const data = doc.data();
    console.log(`Enrollment ${index + 1}:`);
    console.log('  ID:', doc.id);
    console.log('  Field names:', Object.keys(data).join(', '));
    console.log('  User ID field:', data.userId ? `userId: ${data.userId}` : data.studentId ? `studentId: ${data.studentId}` : 'NOT FOUND');
    console.log('  Course:', data.courseName);
    console.log('');
  });
}

checkEnrollments().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
