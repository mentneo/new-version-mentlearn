# 📊 User Progress Observation & Management Guide

## Overview

This guide explains how to observe existing user progress in your database and ensure the application properly tracks and displays user progress across courses, modules, and lessons.

## 🗂️ Database Structure

Your application uses several Firestore collections to track user progress:

### 1. **`enrollments` Collection**
Tracks which students are enrolled in which courses.

**Document Structure:**
```javascript
{
  studentId: "user123",        // or userId in some cases
  courseId: "course456",
  enrolledAt: Timestamp,       // or createdAt
  progress: 0-100,             // Overall course progress percentage
  status: "active"             // active, completed, paused
}
```

### 2. **`progress` Collection**
Stores detailed progress information for each user-course combination.

**Document Structure:**
```javascript
{
  studentId: "user123",        // or userId
  courseId: "course456",
  percentComplete: 0-100,      // or progress
  completedLessons: 5,
  totalLessons: 20,
  updatedAt: Timestamp,
  createdAt: Timestamp
}
```

### 3. **`completedLessons` Collection**
Tracks individual lesson completions.

**Document Structure:**
```javascript
{
  studentId: "user123",        // or userId
  courseId: "course456",
  lessonId: "lesson789",
  moduleId: "module012",       // optional
  completedAt: Timestamp,      // or createdAt
  timeSpent: 1200              // seconds (optional)
}
```

### 4. **`courses` Collection**
Contains course information with embedded modules/lessons.

**Document Structure:**
```javascript
{
  title: "Course Title",
  description: "...",
  instructorId: "instructor123",
  creatorId: "creator456",
  modules: [                   // or embedded in document
    {
      id: "module1",
      title: "Module 1",
      order: 0,
      lessons: [               // or topics
        {
          id: "lesson1",
          title: "Lesson 1",
          order: 0,
          type: "video",
          duration: 600,
          videoUrl: "https://..."
        }
      ]
    }
  ]
}
```

## 🔍 Observing User Progress

### Method 1: Using the Observation Script

Run the observation script to see a complete report:

```bash
cd /Users/yeduruabhiram/Desktop/mentneo\ /new-version-mentlearn
node scripts/observe-user-progress.js
```

**This script will show you:**
- ✅ All users in the system
- ✅ Each user's enrollments
- ✅ Progress records for each course
- ✅ Completed lessons grouped by course
- ✅ Summary statistics

**Sample Output:**
```
👤 USER #1: John Doe (john@example.com)
   User ID: abc123
   Role: student
   
   📚 Enrollments: 2
   
   1. 📖 Introduction to React
      Course ID: course123
      Enrolled: 10/15/2024
      Progress: 45%
      Status: active
   
   📈 Progress Records: 2
   
   1. 📊 Introduction to React
      Progress ID: prog123
      Percent Complete: 45%
      Completed Lessons: 9
      Total Lessons: 20
   
   ✅ Completed Lessons: 9
   
      📚 Introduction to React: 9 lessons completed
         1. Lesson ID: lesson1 | Completed: 10/15/2024
         2. Lesson ID: lesson2 | Completed: 10/16/2024
```

### Method 2: Browser Console Check

Open the course view page and check the browser console for detailed logs:

1. Navigate to: `http://localhost:5002/student/course/[courseId]`
2. Open Developer Tools (F12)
3. Check Console tab for:

```
✅ Progress data from 'progress' collection: {percentComplete: 45, ...}
✅ Found 9 completed lessons: ['lesson1', 'lesson2', ...]
```

## 🔄 How Progress Tracking Works

### Progress Loading (LearnIQCourseView.js)

When a user opens a course:

1. **Fetch Course Data** → Get course, modules, and lessons
2. **Fetch Progress** → Check both `progress` and `enrollments` collections
3. **Fetch Completed Lessons** → Check both `studentId` and `userId` fields
4. **Calculate Module Locks** → Determine which modules are unlocked based on completion
5. **Display** → Show progress, completed lessons, and module status

### Module Lock Logic

```javascript
// First module always unlocked
if (index === 0) {
  isLocked = false;
}

// Lock subsequent modules if previous module not 100% complete
if (index > 0) {
  const previousModule = modules[index - 1];
  const completedCount = previousModule.completedLessons;
  const totalCount = previousModule.totalLessons;
  
  isLocked = (completedCount < totalCount);
}
```

## 📝 Maintaining Backward Compatibility

The updated `LearnIQCourseView.js` now checks **multiple field names** for backward compatibility:

### Field Name Variations

| Collection | Field 1 | Field 2 | Fallback |
|------------|---------|---------|----------|
| Enrollments | `studentId` | `userId` | - |
| Progress | `percentComplete` | `progress` | 0 |
| CompletedLessons | `studentId` | `userId` | - |
| Timestamps | `createdAt` | `enrolledAt` | - |

### Example: Progress Fetching

```javascript
// Check 'progress' collection first
const progressQuery = query(
  collection(db, "progress"),
  where("studentId", "==", currentUser.uid),
  where("courseId", "==", courseId)
);

// If not found, check 'enrollments' collection
if (progressSnapshot.empty) {
  const enrollmentQuery = query(
    collection(db, "enrollments"),
    where("studentId", "==", currentUser.uid),
    where("courseId", "==", courseId)
  );
  // Get progress from enrollment.progress
}
```

## ✅ Best Practices

### 1. **Consistent Field Names**
Always use `studentId` for new records:
```javascript
await addDoc(collection(db, "completedLessons"), {
  studentId: currentUser.uid,  // ✅ Use studentId
  courseId: courseId,
  lessonId: lessonId,
  completedAt: serverTimestamp()
});
```

### 2. **Update Both Collections**
When updating progress, update both `progress` and `enrollments`:

```javascript
// Update progress collection
await setDoc(doc(db, "progress", progressId), {
  percentComplete: newProgress,
  completedLessons: completedCount,
  updatedAt: serverTimestamp()
});

// Also update enrollment
await updateDoc(doc(db, "enrollments", enrollmentId), {
  progress: newProgress
});
```

### 3. **Transaction for Lesson Completion**
Use transactions to ensure data consistency:

```javascript
await runTransaction(db, async (transaction) => {
  // Add to completedLessons
  const completedLessonRef = doc(collection(db, "completedLessons"));
  transaction.set(completedLessonRef, {
    studentId: currentUser.uid,
    courseId: courseId,
    lessonId: lessonId,
    completedAt: serverTimestamp()
  });
  
  // Update progress
  const progressRef = doc(db, "progress", progressId);
  transaction.update(progressRef, {
    completedLessons: increment(1),
    percentComplete: newPercentage
  });
});
```

## 🐛 Troubleshooting

### Issue 1: Progress Not Showing

**Symptoms:**
- Course shows 0% progress despite completed lessons
- Module locks not working correctly

**Solutions:**
1. Run the observation script to check if data exists
2. Check browser console for field name mismatches
3. Verify both `progress` and `enrollments` collections

### Issue 2: Completed Lessons Not Loading

**Symptoms:**
- All lessons show as incomplete
- Checkmarks not appearing

**Solutions:**
1. Check if using `studentId` vs `userId` in queries
2. Verify `lessonId` matches between `completedLessons` and actual lessons
3. Check browser console logs

### Issue 3: Module Still Locked

**Symptoms:**
- Module remains locked despite 100% completion of previous module

**Solutions:**
1. Check if all lessons in previous module are in `completedLessons`
2. Verify lesson IDs match between modules and completedLessons
3. Check if lesson count calculation is correct

## 🔧 Manual Database Fixes

### Fix Missing Progress Records

```javascript
// Run in Firebase Console or script
const createProgressRecord = async (studentId, courseId) => {
  // Get completed lessons
  const completedQuery = query(
    collection(db, "completedLessons"),
    where("studentId", "==", studentId),
    where("courseId", "==", courseId)
  );
  const snapshot = await getDocs(completedQuery);
  const completedCount = snapshot.size;
  
  // Get total lessons from course
  const courseDoc = await getDoc(doc(db, "courses", courseId));
  const totalLessons = /* calculate from modules */;
  
  const percentComplete = (completedCount / totalLessons) * 100;
  
  // Create progress record
  await addDoc(collection(db, "progress"), {
    studentId: studentId,
    courseId: courseId,
    percentComplete: percentComplete,
    completedLessons: completedCount,
    totalLessons: totalLessons,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};
```

### Migrate userId to studentId

```javascript
// Update all documents using userId to use studentId
const migrateUserIdToStudentId = async () => {
  const collections = ['enrollments', 'progress', 'completedLessons'];
  
  for (const collectionName of collections) {
    const snapshot = await getDocs(collection(db, collectionName));
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      if (data.userId && !data.studentId) {
        await updateDoc(doc(db, collectionName, docSnapshot.id), {
          studentId: data.userId
        });
        console.log(`Updated ${collectionName}/${docSnapshot.id}`);
      }
    }
  }
};
```

## 📊 Progress Calculation Formula

```javascript
// Calculate overall course progress
const calculateCourseProgress = (completedLessons, totalLessons) => {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
};

// Calculate module completion
const isModuleComplete = (module, completedLessonIds) => {
  const moduleLessons = module.lessons || [];
  const completedCount = moduleLessons.filter(lesson => 
    completedLessonIds.includes(lesson.id)
  ).length;
  
  return completedCount === moduleLessons.length;
};

// Determine if module should be locked
const isModuleLocked = (moduleIndex, modules, completedLessonIds) => {
  if (moduleIndex === 0) return false; // First module always unlocked
  
  const previousModule = modules[moduleIndex - 1];
  return !isModuleComplete(previousModule, completedLessonIds);
};
```

## 🎯 Next Steps

1. **Run Observation Script** → See current state of your data
2. **Review Console Logs** → Check for any data mismatches
3. **Fix Inconsistencies** → Use manual fixes if needed
4. **Test Progress Tracking** → Complete a lesson and verify updates
5. **Monitor Module Locks** → Ensure sequential unlocking works

## 📚 Related Files

- `/src/pages/student/LearnIQCourseView.js` - Main course view component
- `/scripts/observe-user-progress.js` - Database observation script
- `/src/components/student/LessonView.js` - Lesson completion tracking
- `/docs/MODULE-LOCK-FEATURE.md` - Module lock documentation

---

**Last Updated:** October 19, 2024  
**Version:** 1.0
