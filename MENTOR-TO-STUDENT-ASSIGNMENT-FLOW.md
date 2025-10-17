# Mentor → Student Assignment Flow - Complete Guide

## Overview
When a mentor creates an assignment and assigns it to students, those students can immediately see and submit the assignment on their student assignments page.

---

## 🔄 Complete Flow

### Step 1: Mentor Creates Assignment
**Page**: `/mentor/assignments`

1. Mentor clicks "Create Assignment"
2. Fills in assignment details:
   - Title
   - Description
   - Due date
   - Points
   - Course (optional)
3. **Selects students** from checkbox list
4. Submits form

**What Happens:**
```javascript
// Assignment created in Firestore
{
  title: "Week 5 Project",
  description: "Build a React app...",
  mentorId: "mentor-123",
  studentIds: ["student-1", "student-2", "student-3"],  // Selected students
  dueDate: Timestamp,
  points: 100,
  status: "active",
  createdAt: Timestamp
}

// Notifications sent to each student
{
  userId: "student-1",  // For each selected student
  type: "assignment",
  title: "New Assignment",
  message: "You have a new assignment: Week 5 Project",
  link: "/student/assignments",
  fromUserId: "mentor-123",
  assignmentId: "assignment-xyz"
}
```

### Step 2: Student Receives Notification
**What Students See:**
- 🔔 Notification badge appears
- Notification: "You have a new assignment: Week 5 Project"
- Click notification → redirects to `/student/assignments`

### Step 3: Student Views Assignment
**Page**: `/student/assignments`

**Query Logic:**
```javascript
// Fetch assignments where this student is in the studentIds array
query(
  collection(db, "assignments"),
  where("studentIds", "array-contains", currentUser.uid)
)
```

**What Students See:**
- Assignment card with title, description, due date
- Status badge: Pending / Submitted / Graded / Overdue
- Points available
- Submit button (if not submitted)
- Submission details (if submitted)
- Grade (if graded)

### Step 4: Student Submits Assignment
1. Student clicks "Submit" on assignment
2. Uploads file or enters text
3. Submission saved to Firestore

```javascript
// Submission document created
{
  assignmentId: "assignment-xyz",
  studentId: "student-1",
  submittedAt: Timestamp,
  content: "...",
  fileUrl: "...",
  status: "submitted"
}
```

### Step 5: Mentor Grades Submission
**Page**: `/mentor/assignments/{assignmentId}`

1. Mentor views submissions
2. Reviews student work
3. Assigns grade and feedback
4. Saves

```javascript
// Submission updated
{
  ...previous fields,
  grade: 95,
  feedback: "Great work!",
  gradedAt: Timestamp,
  gradedBy: "mentor-123"
}
```

### Step 6: Student Sees Grade
**Page**: `/student/assignments`

- Status changes to "Graded"
- Grade displayed: "95/100"
- Feedback visible
- Assignment card updates automatically

---

## 📊 Data Structure

### Assignment Document
```javascript
// Collection: assignments
{
  id: "auto-generated",
  
  // Basic Info
  title: "Week 5 Project",
  description: "Build a React app using hooks",
  points: 100,
  status: "active",
  
  // Relationships
  mentorId: "mentor-uid",           // WHO created it
  studentIds: ["s1", "s2", "s3"],   // WHO can see it ← KEY!
  courseId: "course-id" || null,
  
  // Dates
  dueDate: Timestamp,
  createdAt: Timestamp
}
```

### Notification Document
```javascript
// Collection: notifications
{
  id: "auto-generated",
  
  userId: "student-uid",            // WHO receives it
  type: "assignment",
  title: "New Assignment",
  message: "You have a new assignment: Week 5 Project",
  
  read: false,
  timestamp: Timestamp,
  
  link: "/student/assignments",     // WHERE to navigate
  fromUserId: "mentor-uid",         // WHO sent it
  assignmentId: "assignment-id"     // REFERENCE
}
```

### Submission Document
```javascript
// Collection: submissions
{
  id: "auto-generated",
  
  assignmentId: "assignment-id",
  studentId: "student-uid",
  
  // Submission Data
  content: "My assignment text...",
  fileUrl: "storage/path/file.pdf",
  submittedAt: Timestamp,
  
  // Grading (added by mentor)
  grade: 95,
  feedback: "Excellent work!",
  gradedAt: Timestamp,
  gradedBy: "mentor-uid"
}
```

---

## 🔍 Query Patterns

### Mentor Queries

#### Get Mentor's Assignments
```javascript
query(
  collection(db, "assignments"),
  where("mentorId", "==", mentorUid)
)
```

#### Get Submissions for an Assignment
```javascript
query(
  collection(db, "submissions"),
  where("assignmentId", "==", assignmentId)
)
```

### Student Queries

#### Get Student's Assignments
```javascript
query(
  collection(db, "assignments"),
  where("studentIds", "array-contains", studentUid)
)
// Returns ONLY assignments where student is in studentIds array
```

#### Get Student's Submission for Assignment
```javascript
query(
  collection(db, "submissions"),
  where("assignmentId", "==", assignmentId),
  where("studentId", "==", studentUid)
)
```

---

## 🎯 Visibility Logic

### How Visibility Works

**Key Field:** `studentIds` array

```javascript
// Assignment created by mentor
{
  mentorId: "mentor-123",
  studentIds: ["student-A", "student-B", "student-C"]
}

// Who can see this assignment?
✅ student-A → YES (in array)
✅ student-B → YES (in array)
✅ student-C → YES (in array)
❌ student-D → NO (not in array)
❌ mentor-456 → NO (different mentor)
✅ mentor-123 → YES (is the creator)
```

### Array-Contains Query

```javascript
// Firestore query
where("studentIds", "array-contains", "student-A")

// Matches documents where:
studentIds: ["student-A", "student-B"]           ✅
studentIds: ["student-A"]                        ✅
studentIds: ["student-B", "student-A", "student-C"] ✅
studentIds: ["student-B", "student-C"]           ❌
studentIds: []                                   ❌
```

---

## 🧪 Testing the Flow

### Test 1: Create and View Assignment

**As Mentor:**
1. Go to `/mentor/assignments`
2. Click "Create Assignment"
3. Fill form:
   ```
   Title: Test Assignment
   Description: This is a test
   Due Date: Tomorrow
   Points: 100
   ```
4. Select one or more students
5. Submit

**Expected Console Output (Mentor):**
```
📝 Creating assignment with data: {...}
✅ Assignment created with ID: xyz123
✅ Notifications sent to 2 students
```

**As Student:**
1. Refresh page or navigate to `/student/assignments`
2. Check console (F12)

**Expected Console Output (Student):**
```
🎓 Student fetching assignments for: student-123
📚 Found 1 assignments for student
📝 Processing assignment: Test Assignment
✅ Loaded 1 assignments for student
```

3. Assignment should appear in the list!

### Test 2: Multiple Students

**As Mentor:**
1. Create assignment
2. Select 3 students: Alice, Bob, Charlie
3. Submit

**As Alice:**
- Go to `/student/assignments`
- Should see the assignment ✅

**As Bob:**
- Go to `/student/assignments`
- Should see the assignment ✅

**As Charlie:**
- Go to `/student/assignments`
- Should see the assignment ✅

**As Dave (not selected):**
- Go to `/student/assignments`
- Should NOT see the assignment ❌

### Test 3: Submit and Grade

**As Student:**
1. View assignment
2. Click "Submit"
3. Upload file or enter text
4. Submit
5. Status changes to "Submitted"

**As Mentor:**
1. Go to assignment details
2. View submission
3. Enter grade: 95
4. Enter feedback: "Great work!"
5. Save

**As Student:**
1. Refresh assignments page
2. Status changes to "Graded"
3. See grade: 95/100
4. See feedback: "Great work!"

---

## 🐛 Debugging

### Issue: Student Can't See Assignment

**Check 1: Is student in studentIds array?**

**Mentor Console (F12):**
```javascript
firebase.firestore()
  .collection('assignments')
  .doc('assignment-id')
  .get()
  .then(doc => {
    console.log('studentIds:', doc.data().studentIds);
    console.log('Is student included?', 
      doc.data().studentIds.includes('student-uid'));
  });
```

**Check 2: Is student logged in?**

**Student Console:**
```javascript
console.log('Current user:', firebase.auth().currentUser.uid);
```

**Check 3: Query working?**

**Student Console:**
```javascript
firebase.firestore()
  .collection('assignments')
  .where('studentIds', 'array-contains', firebase.auth().currentUser.uid)
  .get()
  .then(snapshot => {
    console.log('Found assignments:', snapshot.size);
    snapshot.forEach(doc => console.log(doc.data()));
  });
```

### Issue: Assignment Created But Student Doesn't See It

**Solutions:**

1. **Hard Refresh Student Page**
   ```
   Cmd + Shift + R (Mac)
   Ctrl + Shift + R (Windows)
   ```

2. **Check Console Logs**
   ```
   Look for:
   🎓 Student fetching assignments for: [uid]
   📚 Found X assignments for student
   ```

3. **Verify studentIds in Firestore**
   - Open Firebase Console
   - Go to assignments collection
   - Check studentIds array
   - Ensure student UID is present

4. **Check Firestore Rules**
   ```javascript
   match /assignments/{assignmentId} {
     allow read: if request.auth.uid in resource.data.studentIds ||
                    request.auth.uid == resource.data.mentorId;
   }
   ```

---

## 📱 UI States

### Student Assignment States

#### 1. Pending (Not Submitted)
```
┌─────────────────────────────────────────┐
│ 📝 Week 5 Project        [Pending]     │
│ Build a React app...                   │
│ Due: Oct 25, 2025 • 100 points        │
│                                        │
│ [ Submit Assignment ]                  │
└─────────────────────────────────────────┘
```

#### 2. Submitted (Waiting for Grade)
```
┌─────────────────────────────────────────┐
│ 📝 Week 5 Project        [Submitted]   │
│ Build a React app...                   │
│ Due: Oct 25, 2025 • 100 points        │
│ Submitted: Oct 20, 2025               │
│                                        │
│ [ View Submission ]                    │
└─────────────────────────────────────────┘
```

#### 3. Graded
```
┌─────────────────────────────────────────┐
│ 📝 Week 5 Project        [Graded]      │
│ Build a React app...                   │
│ Due: Oct 25, 2025 • 100 points        │
│                                        │
│ Grade: 95/100 ⭐                       │
│ Feedback: "Excellent work!"           │
│                                        │
│ [ View Details ]                       │
└─────────────────────────────────────────┘
```

#### 4. Overdue (Not Submitted)
```
┌─────────────────────────────────────────┐
│ 📝 Week 5 Project        [Overdue]     │
│ Build a React app...                   │
│ Due: Oct 15, 2025 • 100 points        │
│ ⚠️ 3 days overdue                      │
│                                        │
│ [ Submit Late ]                        │
└─────────────────────────────────────────┘
```

---

## 🔐 Security Rules

### Firestore Rules for Assignments

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Assignments
    match /assignments/{assignmentId} {
      // Read: Mentor who created OR students assigned
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.mentorId || 
                      request.auth.uid in resource.data.studentIds);
      
      // Create: Only mentors
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.mentorId;
      
      // Update: Only the mentor who created it
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.mentorId;
      
      // Delete: Only the mentor who created it
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.mentorId;
    }
    
    // Submissions
    match /submissions/{submissionId} {
      // Read: Student who submitted OR mentor of the assignment
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.studentId || 
                      request.auth.uid == resource.data.mentorId);
      
      // Create: Students only (for their own submissions)
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.studentId;
      
      // Update: Student can update their submission, mentor can grade
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.studentId || 
                        request.auth.uid == resource.data.mentorId);
    }
    
    // Notifications
    match /notifications/{notificationId} {
      // Read: Only the user who should receive it
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Create: Anyone authenticated (mentors send to students)
      allow create: if request.auth != null;
      
      // Update: Only the recipient (to mark as read)
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## ✅ Success Checklist

### Mentor Side
- [x] Can create assignment
- [x] Can select students
- [x] Assignment saved with studentIds array
- [x] Notifications sent to selected students
- [x] Assignment appears in mentor's list
- [x] Console shows success messages

### Student Side
- [x] Receives notification
- [x] Assignment appears in student's list
- [x] Can view assignment details
- [x] Can submit assignment
- [x] Console shows fetching messages
- [x] Only sees assigned assignments (not others)

### Bi-directional
- [x] Mentor creates → Student sees
- [x] Student submits → Mentor sees
- [x] Mentor grades → Student sees grade
- [x] Status updates in real-time

---

## 📊 Enhanced Debug Logs

### Mentor Console (when creating)
```
📝 Creating assignment with data: {
  title: "Week 5 Project",
  studentIds: ["s1", "s2"],
  dueDate: "2025-10-25"
}
✅ Assignment created with ID: xyz123
✅ Notifications sent to 2 students
```

### Student Console (when viewing)
```
🎓 Student fetching assignments for: student-123
📚 Found 3 assignments for student
📝 Processing assignment: Week 5 Project
📝 Processing assignment: Week 3 Quiz
📝 Processing assignment: Final Project
✅ Loaded 3 assignments for student
```

---

## 🚀 Summary

### How It Works
1. **Mentor** creates assignment with selected students
2. **Firestore** stores with `studentIds` array
3. **Notifications** sent to each student
4. **Student** queries with `array-contains` their UID
5. **Assignment** appears in student's list
6. **Student** can submit
7. **Mentor** can grade
8. **Cycle complete!** ✅

### Key Points
- ✅ `studentIds` array controls visibility
- ✅ `array-contains` query finds assignments
- ✅ Notifications inform students
- ✅ Both sides see real-time updates
- ✅ Secure with Firestore rules
- ✅ Debug logs show entire flow

---

**Status**: ✅ WORKING - Assignments flow from mentor to student automatically!

**To test**: Create an assignment as mentor, then log in as the selected student and check `/student/assignments` page!
