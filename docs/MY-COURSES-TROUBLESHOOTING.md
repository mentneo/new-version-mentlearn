# 🔍 My Courses Page Not Showing Data - Troubleshooting Guide

## Quick Fix - Check Database & Create Sample Data

### Step 1: Visit the Course Debugger Page

I've created a special debugger page to help you diagnose and fix the issue.

**Go to**: http://localhost:5002/student/debug-courses

This page will show you:
- ✅ Total courses in database
- ✅ Published courses count
- ✅ Your enrollments count
- ✅ All courses with details
- ✅ All enrollments
- ✅ One-click button to create sample courses
- ✅ One-click enrollment buttons

### Step 2: Check the Browser Console

With the updated StudentCourses.js file, you'll now see detailed logs:

1. Open browser console (F12 or Cmd+Option+I)
2. Go to `/student/courses` page
3. Look for these logs:

```
=== Fetching Courses ===
Current User UID: [your-uid]
Total published courses found: X
Courses: [{...}]
Enrollments with studentId: [...]
Enrollments with userId: [...]
Combined enrolled IDs: [...]
=== Results ===
Enrolled courses: X [...]
Available courses: X [...]
```

### Step 3: Common Issues & Solutions

#### Issue 1: No Courses Found (0 courses)

**Symptom**: Console shows `Total published courses found: 0`

**Solution**:
1. Go to http://localhost:5002/student/debug-courses
2. Click "Create Sample Courses" button
3. Refresh the My Courses page

**OR** - Have a creator create courses:
- Creator must set `published: true` on the course
- Check in Firestore that courses exist with published=true

#### Issue 2: Courses Exist But Not Showing

**Symptom**: Console shows courses but page is blank

**Possible causes**:
- Courses are not published (`published: false` or field missing)
- React component rendering issue
- Image loading errors

**Solution**:
1. Check console for errors
2. Verify courses in debugger page show "Published ✓"
3. Check browser Network tab for failed requests

#### Issue 3: Can't Enroll in Courses

**Symptom**: Courses show but clicking enroll doesn't work

**Solution**:
- Check browser console for errors
- Verify Firestore permissions allow writes to `enrollments` collection
- Use the debugger page to enroll (it shows detailed error messages)

#### Issue 4: Enrolled Courses Not Showing

**Symptom**: You know you're enrolled but courses don't show in "Enrolled" tab

**Possible causes**:
- Enrollment has `status: 'inactive'` instead of `'active'`
- Enrollment uses different field (`studentId` vs `userId`)
- Course ID in enrollment doesn't match actual course

**Solution**:
1. Go to debugger page
2. Check "All Enrollments" section
3. Verify your enrollments show "(You)" marker
4. Check if Course ID matches an actual course
5. Verify status is "active"

---

## How to Check Firestore Directly

### Option 1: Firebase Console
1. Go to https://console.firebase.google.com/project/mentor-app-238c6/firestore
2. Check `courses` collection:
   - Look for documents with `published: true`
   - Note the document IDs
3. Check `enrollments` collection:
   - Look for your user ID in `studentId` or `userId` fields
   - Verify `status: "active"`
   - Match `courseId` with actual course IDs

### Option 2: Browser Console
```javascript
// Check courses
const { db } = await import('/src/firebase/firebase.js');
const { collection, getDocs } = await import('firebase/firestore');

const snapshot = await getDocs(collection(db, 'courses'));
console.log('Courses:', snapshot.docs.map(d => ({id: d.id, ...d.data()})));

// Check enrollments
const enrollments = await getDocs(collection(db, 'enrollments'));
console.log('Enrollments:', enrollments.docs.map(d => ({id: d.id, ...d.data()})));
```

---

## Debug Logs Explanation

When you open the My Courses page now, you'll see these logs:

### 1. Initialization
```
=== Fetching Courses ===
Current User UID: R42QBOZigPPNkJ1j3svpYpmy8lJ2
```
Your user ID - needed for matching enrollments

### 2. Courses Query
```
Total published courses found: 4
Courses: [
  {id: "abc123", title: "Web Development"},
  {id: "def456", title: "Python Programming"},
  ...
]
```
All courses that have `published: true`

### 3. Enrollment Queries
```
Enrollments with studentId: ["abc123"]
Enrollments with userId: []
Combined enrolled IDs: ["abc123"]
```
Shows which courses you're enrolled in (checks both studentId and userId fields)

### 4. Final Results
```
=== Results ===
Enrolled courses: 1 ["Web Development"]
Available courses: 3 ["Python Programming", "Digital Marketing", ...]
```
Courses split into Enrolled (you're registered) and Available (you can enroll)

---

## Creating Sample Data

### Method 1: Use the Debugger Page ⭐ EASIEST
1. Go to http://localhost:5002/student/debug-courses
2. Click "Create Sample Courses"
3. Click "Enroll" on any course
4. Go back to My Courses page

### Method 2: Have Creator Create Courses
1. Login as creator
2. Go to Creator Dashboard
3. Create a course
4. **Important**: Set `published: true`
5. Students can now see and enroll

### Method 3: Manually Add to Firestore
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Add to `courses` collection:
```json
{
  "title": "Test Course",
  "description": "A test course",
  "published": true,
  "category": "Programming",
  "price": "0",
  "modules": [],
  "creatorId": "your-creator-id",
  "createdAt": "2025-01-18T00:00:00Z"
}
```

---

## Firestore Security Rules Check

Make sure your Firestore rules allow reading courses:

```javascript
// courses collection
match /courses/{courseId} {
  allow read: if true; // Anyone can read published courses
  allow write: if request.auth != null && 
               request.auth.uid == resource.data.creatorId;
}

// enrollments collection
match /enrollments/{enrollmentId} {
  allow read: if request.auth != null &&
              (request.auth.uid == resource.data.studentId ||
               request.auth.uid == resource.data.userId);
  allow write: if request.auth != null;
}
```

---

## Expected Console Output (Success)

When everything works, you should see:

```
=== Fetching Courses ===
Current User UID: R42QBOZigPPNkJ1j3svpYpmy8lJ2
Total published courses found: 4
Courses: (4) [{...}, {...}, {...}, {...}]
Enrollments with studentId: ["course-id-1", "course-id-2"]
Enrollments with userId: []
Combined enrolled IDs: (2) ["course-id-1", "course-id-2"]
=== Results ===
Enrolled courses: 2 (2) ["Introduction to Web Development", "Python Programming"]
Available courses: 2 (2) ["Digital Marketing", "Data Science"]
```

---

## Quick Checklist

- [ ] App is running at http://localhost:5002
- [ ] You are logged in as a student
- [ ] Visit http://localhost:5002/student/debug-courses
- [ ] Check if courses exist in database
- [ ] If no courses: Click "Create Sample Courses"
- [ ] Enroll in at least one course
- [ ] Go to http://localhost:5002/student/courses
- [ ] Open browser console (F12)
- [ ] Check the debug logs
- [ ] Verify courses appear in UI

---

## Still Not Working?

### Check These:

1. **Network Tab**: Look for failed API calls
2. **Console Errors**: Any red errors?
3. **Firestore Rules**: Are they too restrictive?
4. **Course Data Structure**: Missing required fields?
5. **User Authentication**: Are you actually logged in?

### Get More Help:

1. Copy the console logs
2. Take a screenshot of the debugger page
3. Check the Firestore data structure
4. Share the error messages

---

## Summary

**The Problem**: My Courses page shows no data

**The Solutions**:
1. ✅ Added detailed console logging to StudentCourses.js
2. ✅ Created CourseDebugger page at `/student/debug-courses`
3. ✅ Added ability to create sample courses
4. ✅ Added one-click enrollment buttons
5. ✅ Shows all database state in one place

**Next Steps**:
1. Visit http://localhost:5002/student/debug-courses
2. Check database state
3. Create courses if needed
4. Enroll in courses
5. Check My Courses page
6. Look at console logs

**If you see errors**, share them and I'll help fix them!
