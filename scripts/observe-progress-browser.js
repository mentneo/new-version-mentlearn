/**
 * Browser-Based User Progress Observer
 * 
 * HOW TO USE:
 * 1. Open your app in the browser: http://localhost:5002
 * 2. Login as a student
 * 3. Open browser console (F12 or Cmd+Option+I)
 * 4. Copy and paste this entire script into the console
 * 5. Press Enter
 * 
 * This will show you all your progress data!
 */

(async function observeUserProgress() {
  console.log('\n' + '='.repeat(100));
  console.log('📊 OBSERVING USER PROGRESS IN DATABASE');
  console.log('='.repeat(100) + '\n');

  try {
    // Get Firebase from the window object
    const { getFirestore, collection, getDocs, query, where } = window.firebase.firestore;
    const db = getFirestore();

    // Get current user
    const auth = window.firebase.auth.getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error('❌ No user logged in! Please login first.');
      return;
    }

    console.log(`👤 Logged in as: ${currentUser.email}`);
    console.log(`   User ID: ${currentUser.uid}\n`);

    // 1. Get user data
    console.log('📋 STEP 1: Fetching User Data...\n');
    const { getDoc, doc } = window.firebase.firestore;
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User Data:', {
        name: userData.displayName || userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        createdAt: userData.createdAt
      });
    }
    console.log('');

    // 2. Get enrollments
    console.log('📚 STEP 2: Fetching Your Enrollments...\n');
    
    // Try studentId field
    const enrollmentsQuery1 = query(
      collection(db, 'enrollments'),
      where('studentId', '==', currentUser.uid)
    );
    let enrollmentsSnapshot = await getDocs(enrollmentsQuery1);
    let enrollments = enrollmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Also try userId field
    const enrollmentsQuery2 = query(
      collection(db, 'enrollments'),
      where('userId', '==', currentUser.uid)
    );
    const enrollmentsSnapshot2 = await getDocs(enrollmentsQuery2);
    const enrollments2 = enrollmentsSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Combine and deduplicate
    const allEnrollments = [...enrollments, ...enrollments2];
    const uniqueEnrollments = Array.from(new Map(allEnrollments.map(e => [e.id, e])).values());
    
    console.log(`✅ Found ${uniqueEnrollments.length} enrollments\n`);

    if (uniqueEnrollments.length > 0) {
      for (let i = 0; i < uniqueEnrollments.length; i++) {
        const enrollment = uniqueEnrollments[i];
        console.log(`   ${i + 1}. Enrollment ID: ${enrollment.id}`);
        console.log(`      Course ID: ${enrollment.courseId}`);
        console.log(`      Progress: ${enrollment.progress || 0}%`);
        console.log(`      Status: ${enrollment.status || 'active'}`);
        
        const enrolledDate = enrollment.enrolledAt || enrollment.createdAt;
        if (enrolledDate) {
          const date = enrolledDate.toDate ? enrolledDate.toDate() : new Date(enrolledDate);
          console.log(`      Enrolled: ${date.toLocaleDateString()}`);
        }
        console.log('');
      }
    } else {
      console.log('   ⚠️  No enrollments found\n');
    }

    // 3. Get progress records
    console.log('📈 STEP 3: Fetching Progress Records...\n');
    
    const progressQuery1 = query(
      collection(db, 'progress'),
      where('studentId', '==', currentUser.uid)
    );
    let progressSnapshot = await getDocs(progressQuery1);
    let progressRecords = progressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Also try userId
    const progressQuery2 = query(
      collection(db, 'progress'),
      where('userId', '==', currentUser.uid)
    );
    const progressSnapshot2 = await getDocs(progressQuery2);
    const progressRecords2 = progressSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const allProgress = [...progressRecords, ...progressRecords2];
    const uniqueProgress = Array.from(new Map(allProgress.map(p => [p.id, p])).values());
    
    console.log(`✅ Found ${uniqueProgress.length} progress records\n`);

    if (uniqueProgress.length > 0) {
      for (let i = 0; i < uniqueProgress.length; i++) {
        const prog = uniqueProgress[i];
        console.log(`   ${i + 1}. Progress ID: ${prog.id}`);
        console.log(`      Course ID: ${prog.courseId}`);
        console.log(`      Percent Complete: ${prog.percentComplete || prog.progress || 0}%`);
        console.log(`      Completed Lessons: ${prog.completedLessons || 0}`);
        console.log(`      Total Lessons: ${prog.totalLessons || 0}`);
        
        const updatedDate = prog.updatedAt || prog.createdAt;
        if (updatedDate) {
          const date = updatedDate.toDate ? updatedDate.toDate() : new Date(updatedDate);
          console.log(`      Last Updated: ${date.toLocaleDateString()}`);
        }
        console.log('');
      }
    } else {
      console.log('   ℹ️  No progress records found (may be stored in enrollments)\n');
    }

    // 4. Get completed lessons
    console.log('✅ STEP 4: Fetching Completed Lessons...\n');
    
    const completedQuery1 = query(
      collection(db, 'completedLessons'),
      where('studentId', '==', currentUser.uid)
    );
    let completedSnapshot = await getDocs(completedQuery1);
    let completedLessons = completedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Also try userId
    const completedQuery2 = query(
      collection(db, 'completedLessons'),
      where('userId', '==', currentUser.uid)
    );
    const completedSnapshot2 = await getDocs(completedQuery2);
    const completedLessons2 = completedSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const allCompleted = [...completedLessons, ...completedLessons2];
    const uniqueCompleted = Array.from(new Map(allCompleted.map(c => [c.id, c])).values());
    
    console.log(`✅ Found ${uniqueCompleted.length} completed lessons\n`);

    if (uniqueCompleted.length > 0) {
      // Group by course
      const lessonsByCourse = {};
      uniqueCompleted.forEach(lesson => {
        const courseId = lesson.courseId;
        if (!lessonsByCourse[courseId]) {
          lessonsByCourse[courseId] = [];
        }
        lessonsByCourse[courseId].push(lesson);
      });

      const courseIds = Object.keys(lessonsByCourse);
      console.log(`   📚 Completed lessons in ${courseIds.length} courses:\n`);

      for (const courseId of courseIds) {
        const lessons = lessonsByCourse[courseId];
        console.log(`   Course ID: ${courseId} (${lessons.length} lessons completed)`);
        
        lessons.forEach((lesson, idx) => {
          console.log(`      ${idx + 1}. Lesson ID: ${lesson.lessonId || lesson.id}`);
          const completedDate = lesson.completedAt || lesson.createdAt;
          if (completedDate) {
            const date = completedDate.toDate ? completedDate.toDate() : new Date(completedDate);
            console.log(`         Completed: ${date.toLocaleDateString()}`);
          }
        });
        console.log('');
      }
    } else {
      console.log('   ⚠️  No completed lessons found\n');
    }

    // 5. Summary
    console.log('\n' + '='.repeat(100));
    console.log('📊 SUMMARY');
    console.log('='.repeat(100) + '\n');

    console.log(`   ✅ Total Enrollments: ${uniqueEnrollments.length}`);
    console.log(`   ✅ Progress Records: ${uniqueProgress.length}`);
    console.log(`   ✅ Completed Lessons: ${uniqueCompleted.length}`);

    // Calculate average progress
    if (uniqueEnrollments.length > 0) {
      const totalProgress = uniqueEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
      const avgProgress = (totalProgress / uniqueEnrollments.length).toFixed(2);
      console.log(`   ✅ Average Course Progress: ${avgProgress}%`);
    }

    console.log('\n' + '='.repeat(100));
    console.log('✅ OBSERVATION COMPLETE!');
    console.log('='.repeat(100) + '\n');

    // Return data for further inspection
    return {
      enrollments: uniqueEnrollments,
      progress: uniqueProgress,
      completedLessons: uniqueCompleted
    };

  } catch (error) {
    console.error('❌ Error observing user progress:', error);
    console.error('Make sure you are logged in and have imported Firebase correctly');
  }
})();
