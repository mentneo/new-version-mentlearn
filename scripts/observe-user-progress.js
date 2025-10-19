/**
 * Script to Observe User Progress in Database
 * This script checks and displays:
 * - User enrollments
 * - Completed lessons
 * - Progress records
 * - Module completion status
 * 
 * Run: node scripts/observe-user-progress.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function observeUserProgress() {
  console.log('\n' + '='.repeat(100));
  console.log('📊 OBSERVING USER PROGRESS IN DATABASE');
  console.log('='.repeat(100) + '\n');

  try {
    // 1. Get all users
    console.log('👥 STEP 1: Fetching All Users...\n');
    const usersSnapshot = await db.collection('users').get();
    console.log(`✅ Found ${usersSnapshot.size} users\n`);

    // 2. Get all enrollments
    console.log('📚 STEP 2: Fetching All Enrollments...\n');
    const enrollmentsSnapshot = await db.collection('enrollments').get();
    console.log(`✅ Found ${enrollmentsSnapshot.size} enrollments\n`);

    const enrollmentsByUser = {};
    enrollmentsSnapshot.forEach(doc => {
      const enrollment = { id: doc.id, ...doc.data() };
      const userId = enrollment.studentId || enrollment.userId;
      if (!enrollmentsByUser[userId]) {
        enrollmentsByUser[userId] = [];
      }
      enrollmentsByUser[userId].push(enrollment);
    });

    // 3. Get all progress records
    console.log('📈 STEP 3: Fetching All Progress Records...\n');
    const progressSnapshot = await db.collection('progress').get();
    console.log(`✅ Found ${progressSnapshot.size} progress records\n`);

    const progressByUser = {};
    progressSnapshot.forEach(doc => {
      const progress = { id: doc.id, ...doc.data() };
      const userId = progress.studentId || progress.userId;
      if (!progressByUser[userId]) {
        progressByUser[userId] = [];
      }
      progressByUser[userId].push(progress);
    });

    // 4. Get all completed lessons
    console.log('✅ STEP 4: Fetching All Completed Lessons...\n');
    const completedLessonsSnapshot = await db.collection('completedLessons').get();
    console.log(`✅ Found ${completedLessonsSnapshot.size} completed lessons\n`);

    const completedLessonsByUser = {};
    completedLessonsSnapshot.forEach(doc => {
      const completion = { id: doc.id, ...doc.data() };
      const userId = completion.studentId || completion.userId;
      if (!completedLessonsByUser[userId]) {
        completedLessonsByUser[userId] = [];
      }
      completedLessonsByUser[userId].push(completion);
    });

    // 5. Get all courses for reference
    console.log('📖 STEP 5: Fetching All Courses...\n');
    const coursesSnapshot = await db.collection('courses').get();
    const coursesMap = {};
    coursesSnapshot.forEach(doc => {
      coursesMap[doc.id] = { id: doc.id, ...doc.data() };
    });
    console.log(`✅ Found ${coursesSnapshot.size} courses\n`);

    // 6. Display detailed progress for each user
    console.log('\n' + '='.repeat(100));
    console.log('📊 DETAILED USER PROGRESS REPORT');
    console.log('='.repeat(100) + '\n');

    let userIndex = 1;
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userEmail = userData.email || 'No email';
      const userName = userData.displayName || userData.name || 'Unnamed User';

      console.log(`\n${'─'.repeat(100)}`);
      console.log(`👤 USER #${userIndex}: ${userName} (${userEmail})`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Role: ${userData.role || 'student'}`);
      console.log(`${'─'.repeat(100)}\n`);

      // Get user's enrollments
      const userEnrollments = enrollmentsByUser[userId] || [];
      console.log(`   📚 Enrollments: ${userEnrollments.length}`);
      
      if (userEnrollments.length > 0) {
        userEnrollments.forEach((enrollment, idx) => {
          const course = coursesMap[enrollment.courseId];
          const courseTitle = course ? course.title : 'Unknown Course';
          const enrolledDate = enrollment.enrolledAt || enrollment.createdAt;
          const progress = enrollment.progress || 0;
          
          console.log(`\n   ${idx + 1}. 📖 ${courseTitle}`);
          console.log(`      Course ID: ${enrollment.courseId}`);
          console.log(`      Enrolled: ${enrolledDate ? new Date(enrolledDate.toDate ? enrolledDate.toDate() : enrolledDate).toLocaleDateString() : 'Unknown'}`);
          console.log(`      Progress: ${progress}%`);
          console.log(`      Status: ${enrollment.status || 'active'}`);
        });
      } else {
        console.log(`      ⚠️  No enrollments found`);
      }

      // Get user's progress records
      const userProgress = progressByUser[userId] || [];
      console.log(`\n   📈 Progress Records: ${userProgress.length}`);
      
      if (userProgress.length > 0) {
        userProgress.forEach((prog, idx) => {
          const course = coursesMap[prog.courseId];
          const courseTitle = course ? course.title : 'Unknown Course';
          
          console.log(`\n   ${idx + 1}. 📊 ${courseTitle}`);
          console.log(`      Progress ID: ${prog.id}`);
          console.log(`      Percent Complete: ${prog.percentComplete || prog.progress || 0}%`);
          console.log(`      Completed Lessons: ${prog.completedLessons || 0}`);
          console.log(`      Total Lessons: ${prog.totalLessons || 0}`);
          console.log(`      Last Updated: ${prog.updatedAt ? new Date(prog.updatedAt.toDate ? prog.updatedAt.toDate() : prog.updatedAt).toLocaleDateString() : 'Unknown'}`);
        });
      }

      // Get user's completed lessons
      const userCompletedLessons = completedLessonsByUser[userId] || [];
      console.log(`\n   ✅ Completed Lessons: ${userCompletedLessons.length}`);
      
      if (userCompletedLessons.length > 0) {
        // Group by course
        const lessonsByCourse = {};
        userCompletedLessons.forEach(lesson => {
          const courseId = lesson.courseId;
          if (!lessonsByCourse[courseId]) {
            lessonsByCourse[courseId] = [];
          }
          lessonsByCourse[courseId].push(lesson);
        });

        Object.keys(lessonsByCourse).forEach(courseId => {
          const course = coursesMap[courseId];
          const courseTitle = course ? course.title : 'Unknown Course';
          const lessons = lessonsByCourse[courseId];
          
          console.log(`\n      📚 ${courseTitle}: ${lessons.length} lessons completed`);
          lessons.forEach((lesson, idx) => {
            const completedDate = lesson.completedAt || lesson.createdAt;
            console.log(`         ${idx + 1}. Lesson ID: ${lesson.lessonId} | Completed: ${completedDate ? new Date(completedDate.toDate ? completedDate.toDate() : completedDate).toLocaleDateString() : 'Unknown'}`);
          });
        });
      }

      console.log('\n');
      userIndex++;
    }

    // 7. Summary Statistics
    console.log('\n' + '='.repeat(100));
    console.log('📈 SUMMARY STATISTICS');
    console.log('='.repeat(100) + '\n');

    console.log(`   Total Users: ${usersSnapshot.size}`);
    console.log(`   Total Enrollments: ${enrollmentsSnapshot.size}`);
    console.log(`   Total Progress Records: ${progressSnapshot.size}`);
    console.log(`   Total Completed Lessons: ${completedLessonsSnapshot.size}`);
    console.log(`   Total Courses: ${coursesSnapshot.size}`);

    // Users with enrollments
    const usersWithEnrollments = Object.keys(enrollmentsByUser).length;
    const usersWithProgress = Object.keys(progressByUser).length;
    const usersWithCompletedLessons = Object.keys(completedLessonsByUser).length;

    console.log(`\n   Users with Enrollments: ${usersWithEnrollments}`);
    console.log(`   Users with Progress Records: ${usersWithProgress}`);
    console.log(`   Users with Completed Lessons: ${usersWithCompletedLessons}`);

    // Average progress
    let totalProgress = 0;
    let progressCount = 0;
    Object.values(progressByUser).forEach(userProgs => {
      userProgs.forEach(prog => {
        const percent = prog.percentComplete || prog.progress || 0;
        totalProgress += percent;
        progressCount++;
      });
    });
    const avgProgress = progressCount > 0 ? (totalProgress / progressCount).toFixed(2) : 0;
    console.log(`   Average Course Progress: ${avgProgress}%`);

    console.log('\n' + '='.repeat(100));
    console.log('✅ OBSERVATION COMPLETE!');
    console.log('='.repeat(100) + '\n');

  } catch (error) {
    console.error('❌ Error observing user progress:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
observeUserProgress();
