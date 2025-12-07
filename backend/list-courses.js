// List All Courses
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

async function listCourses() {
  const snapshot = await admin.firestore().collection('courses').get();
  console.log('📚 Total courses in database:', snapshot.size);
  console.log('');
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`✓ ${data.title}`);
    console.log(`  ID: ${doc.id}`);
    console.log(`  Price: ₹${data.price || 0}`);
    console.log(`  Published: ${data.published !== false}`);
    console.log(`  Category: ${data.category || 'N/A'}`);
    console.log('');
  });
}

listCourses().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
