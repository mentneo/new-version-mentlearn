const admin = require('firebase-admin');
const serviceAccount = require('../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mentor-app-238c6'
});

const db = admin.firestore();

async function checkCourses() {
  try {
    console.log('Checking courses in Firestore...\n');
    
    // Get all courses
    const coursesSnapshot = await db.collection('courses').get();
    console.log(`Total courses in database: ${coursesSnapshot.size}`);
    
    if (coursesSnapshot.size === 0) {
      console.log('\n❌ No courses found in database!');
      console.log('\nTo fix this:');
      console.log('1. Make sure creators have created courses');
      console.log('2. Check if courses have "published: true" field');
      return;
    }
    
    // Get published courses
    const publishedSnapshot = await db.collection('courses')
      .where('published', '==', true)
      .get();
    console.log(`Published courses: ${publishedSnapshot.size}\n`);
    
    // Show course details
    console.log('Course Details:');
    console.log('='.repeat(80));
    
    coursesSnapshot.forEach((doc, index) => {
      const course = doc.data();
      console.log(`\n${index + 1}. ${course.title || 'Untitled Course'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Published: ${course.published ? '✅ Yes' : '❌ No'}`);
      console.log(`   Creator ID: ${course.creatorId || 'Not set'}`);
      console.log(`   Category: ${course.category || 'Not set'}`);
      console.log(`   Price: ${course.price || 'Free'}`);
      console.log(`   Modules: ${course.modules?.length || 0}`);
    });
    
    // Check enrollments
    console.log('\n' + '='.repeat(80));
    console.log('\nChecking enrollments...');
    const enrollmentsSnapshot = await db.collection('enrollments').get();
    console.log(`Total enrollments: ${enrollmentsSnapshot.size}\n`);
    
    if (enrollmentsSnapshot.size > 0) {
      console.log('Enrollment Details:');
      console.log('='.repeat(80));
      
      const enrollmentsByCourse = {};
      enrollmentsSnapshot.forEach(doc => {
        const enrollment = doc.data();
        const courseId = enrollment.courseId;
        if (!enrollmentsByCourse[courseId]) {
          enrollmentsByCourse[courseId] = [];
        }
        enrollmentsByCourse[courseId].push(enrollment);
      });
      
      Object.keys(enrollmentsByCourse).forEach(courseId => {
        const enrollments = enrollmentsByCourse[courseId];
        console.log(`\nCourse ID: ${courseId}`);
        console.log(`  Students enrolled: ${enrollments.length}`);
        enrollments.forEach((e, idx) => {
          console.log(`  ${idx + 1}. Student: ${e.studentId || e.userId} - Status: ${e.status}`);
        });
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('Error checking courses:', error);
  } finally {
    process.exit(0);
  }
}

checkCourses();
