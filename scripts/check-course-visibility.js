// Script to check course visibility in Firestore
const admin = require('firebase-admin');
const serviceAccount = require('../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCourseVisibility() {
  try {
    console.log('=== Checking Course Visibility ===\n');
    
    // Fetch all courses
    const coursesSnapshot = await db.collection('courses').get();
    
    console.log(`Total courses in database: ${coursesSnapshot.size}\n`);
    
    if (coursesSnapshot.empty) {
      console.log('❌ NO COURSES FOUND in Firestore!');
      console.log('Please create a course from Creator Dashboard or Admin Panel first.\n');
      return;
    }
    
    console.log('Course Details:\n');
    console.log('─'.repeat(100));
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    coursesSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const isVisible = data.published !== false;
      
      if (isVisible) visibleCount++;
      else hiddenCount++;
      
      const status = isVisible ? '✅ VISIBLE' : '❌ HIDDEN';
      
      console.log(`${index + 1}. ${status}`);
      console.log(`   Title: ${data.title || 'Untitled'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Published: ${data.published} (${typeof data.published})`);
      console.log(`   Status: ${data.status || 'not set'}`);
      console.log(`   Creator ID: ${data.creatorId || 'not set'}`);
      console.log(`   Created: ${data.createdAt || 'not set'}`);
      console.log(`   Thumbnail: ${data.thumbnailUrl ? 'Yes' : 'No'}`);
      console.log(`   Modules: ${data.modules?.length || 0}`);
      console.log('─'.repeat(100));
    });
    
    console.log('\n=== Summary ===');
    console.log(`Total Courses: ${coursesSnapshot.size}`);
    console.log(`Visible to Students: ${visibleCount} ✅`);
    console.log(`Hidden from Students: ${hiddenCount} ❌`);
    
    console.log('\n=== Visibility Rules ===');
    console.log('Courses are VISIBLE if:');
    console.log('  - published = true');
    console.log('  - published = undefined');
    console.log('  - published = null');
    console.log('\nCourses are HIDDEN if:');
    console.log('  - published = false (draft mode)');
    
    console.log('\n=== Next Steps ===');
    if (visibleCount === 0) {
      console.log('⚠️  No visible courses found!');
      console.log('   1. Check if courses have published=false');
      console.log('   2. Create a new course from Creator/Admin dashboard');
      console.log('   3. Verify the course creation includes published=true');
    } else {
      console.log('✅ Courses should be visible to students');
      console.log('   If students still cannot see them:');
      console.log('   1. Check browser console for errors');
      console.log('   2. Verify student is logged in');
      console.log('   3. Clear browser cache and reload');
      console.log('   4. Check Firestore security rules');
    }
    
  } catch (error) {
    console.error('Error checking courses:', error);
  } finally {
    process.exit(0);
  }
}

checkCourseVisibility();
