const admin = require('firebase-admin');
const serviceAccount = require('../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCourses() {
  try {
    const coursesSnapshot = await db.collection('courses').get();
    
    console.log('\n📊 All Courses Status Check:\n');
    console.log('=' .repeat(80));
    
    coursesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nCourse ID: ${doc.id}`);
      console.log(`Title: ${data.title || 'N/A'}`);
      console.log(`Published field: ${data.published} (type: ${typeof data.published})`);
      console.log(`Status field: ${data.status || 'N/A'}`);
      console.log(`Creator: ${data.creatorId || 'N/A'}`);
      console.log('-'.repeat(80));
    });
    
    const draftCourses = coursesSnapshot.docs.filter(doc => !doc.data().published);
    console.log(`\n⚠️  Courses showing as Draft: ${draftCourses.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCourses();
