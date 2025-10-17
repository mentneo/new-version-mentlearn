# Mentor-Student Visibility System

## Overview
This document explains how mentor-created content (assignments, quizzes, calendar events) becomes visible to assigned students.

## Key Changes Made

### 1. Navigation Updates ✅
**Removed**: Interview Preparation links
**Added**: 
- Assignments
- Quizzes  
- Calendar
- Reports

**Files Modified**:
- `src/components/mentor/Navbar.js` - Updated both desktop and mobile navigation

## Data Visibility Architecture

### How Content Becomes Visible to Students

#### 1. Assignments (Already Implemented)
**Firestore Structure**:
```javascript
// Collection: assignments
{
  id: "assignment-id",
  title: "Assignment Title",
  description: "Description",
  mentorId: "mentor-user-id",      // Creator
  studentIds: ["student1", "student2"],  // WHO CAN SEE IT
  courseId: "course-id",
  dueDate: Timestamp,
  points: 100,
  createdAt: Timestamp
}
```

**Visibility Logic**:
- Mentor creates assignment with `mentorId`
- Mentor selects students → `studentIds` array
- Students query: `where("studentIds", "array-contains", currentUser.uid)`
- Students see ONLY assignments where their ID is in `studentIds` array

**Student View Query**:
```javascript
// In student LearnIQAssignments.js
const assignmentsQuery = query(
  collection(db, "assignments"),
  where("studentIds", "array-contains", currentUser.uid),
  orderBy("dueDate", "asc")
);
```

#### 2. Quizzes
**Firestore Structure**:
```javascript
// Collection: quizzes
{
  id: "quiz-id",
  title: "Quiz Title",
  description: "Description",
  createdBy: "mentor-user-id",     // Creator
  assignedTo: ["student1", "student2"],  // WHO CAN SEE IT
  courseId: "course-id",
  questions: [...],
  timeLimit: 30,  // minutes
  dueDate: Timestamp,
  status: "active" | "closed",
  createdAt: Timestamp
}
```

**Visibility Logic**:
- Mentor creates quiz with `createdBy`
- Mentor assigns to students → `assignedTo` array
- Students query: `where("assignedTo", "array-contains", currentUser.uid)`
- Students see ONLY quizzes assigned to them

**Student View Query**:
```javascript
// In student quiz component
const quizzesQuery = query(
  collection(db, "quizzes"),
  where("assignedTo", "array-contains", currentUser.uid),
  where("status", "==", "active"),
  orderBy("dueDate", "asc")
);
```

#### 3. Calendar Events
**Firestore Structure**:
```javascript
// Collection: mentorEvents
{
  id: "event-id",
  title: "Event Title",
  description: "Description",
  mentorId: "mentor-user-id",      // Creator
  sharedWith: ["student1", "student2"],  // WHO CAN SEE IT (optional)
  isPublic: false,  // If true, all students can see
  date: Timestamp,
  startTime: "09:00",
  endTime: "10:00",
  type: "meeting" | "session" | "reminder",
  color: "#4F46E5",
  createdAt: Timestamp
}
```

**Visibility Logic**:
- **Private Events**: Only mentor can see (`sharedWith` is empty)
- **Shared Events**: Mentor + selected students (`sharedWith` array)
- **Public Events**: All students can see (`isPublic: true`)

**Student View Query**:
```javascript
// In student LearnIQCalendar.js
// Get events shared with this student
const sharedEventsQuery = query(
  collection(db, "mentorEvents"),
  where("sharedWith", "array-contains", currentUser.uid)
);

// Get public events
const publicEventsQuery = query(
  collection(db, "mentorEvents"),
  where("isPublic", "==", true)
);
```

## Implementation Steps

### Step 1: Update Assignment Creation
**File**: `src/pages/mentor/MentorAssignments.jsx`

**Current Implementation** (Lines 20-100):
```javascript
const handleCreateAssignment = async (formData) => {
  await addDoc(collection(db, "assignments"), {
    title: formData.title,
    description: formData.description,
    mentorId: currentUser.uid,           // ✅ Creator
    studentIds: formData.selectedStudents, // ✅ Visibility array
    courseId: formData.courseId,
    dueDate: new Date(formData.dueDate),
    points: formData.points || 100,
    createdAt: serverTimestamp(),
    status: "active"
  });
  
  // Create notifications for each student
  for (const studentId of formData.selectedStudents) {
    await addDoc(collection(db, "notifications"), {
      userId: studentId,              // ✅ Send to each student
      type: "assignment",
      title: "New Assignment",
      message: `You have a new assignment: ${formData.title}`,
      read: false,
      timestamp: serverTimestamp(),
      link: "/student/assignments",     // ✅ Link to student view
      fromUserId: currentUser.uid       // ✅ From mentor
    });
  }
};
```

### Step 2: Update Quiz Creation
**File**: `src/pages/mentor/CreateQuiz.jsx`

**Add Student Selection**:
```javascript
const handleCreateQuiz = async (formData) => {
  await addDoc(collection(db, "quizzes"), {
    title: formData.title,
    description: formData.description,
    createdBy: currentUser.uid,          // ✅ Creator
    assignedTo: formData.selectedStudents, // ✅ ADD THIS - Visibility array
    courseId: formData.courseId,
    questions: formData.questions,
    timeLimit: formData.timeLimit,
    dueDate: new Date(formData.dueDate),
    status: "active",
    createdAt: serverTimestamp()
  });
  
  // Create notifications for each student
  for (const studentId of formData.selectedStudents) {
    await addDoc(collection(db, "notifications"), {
      userId: studentId,
      type: "quiz",
      title: "New Quiz Available",
      message: `A new quiz is available: ${formData.title}`,
      read: false,
      timestamp: serverTimestamp(),
      link: "/student/quizzes",
      fromUserId: currentUser.uid
    });
  }
};
```

### Step 3: Update Calendar Event Creation
**File**: `src/pages/mentor/MentorCalendar.jsx`

**Add Student Selection**:
```javascript
const handleCreateEvent = async (formData) => {
  await addDoc(collection(db, "mentorEvents"), {
    title: formData.title,
    description: formData.description,
    mentorId: currentUser.uid,           // ✅ Creator
    sharedWith: formData.selectedStudents || [], // ✅ ADD THIS - Visibility array
    isPublic: formData.isPublic || false, // ✅ ADD THIS - Public flag
    date: new Date(formData.date),
    startTime: formData.startTime,
    endTime: formData.endTime,
    type: formData.type,
    color: formData.color,
    createdAt: serverTimestamp()
  });
  
  // Only notify if shared with specific students
  if (formData.selectedStudents && formData.selectedStudents.length > 0) {
    for (const studentId of formData.selectedStudents) {
      await addDoc(collection(db, "notifications"), {
        userId: studentId,
        type: "event",
        title: "New Calendar Event",
        message: `New event: ${formData.title} on ${formData.date}`,
        read: false,
        timestamp: serverTimestamp(),
        link: "/student/calendar",
        fromUserId: currentUser.uid
      });
    }
  }
};
```

### Step 4: Student Views (Already Implemented)

#### Student Assignments View
**File**: `src/pages/student/LearnIQAssignments.js`
```javascript
// Fetch assignments where student is in studentIds array
const assignmentsQuery = query(
  collection(db, "assignments"),
  where("studentIds", "array-contains", currentUser.uid),
  orderBy("dueDate")
);
```

#### Student Quiz View (Need to Add)
**File**: `src/pages/student/StudentQuizzes.jsx`
```javascript
// Fetch quizzes assigned to this student
const quizzesQuery = query(
  collection(db, "quizzes"),
  where("assignedTo", "array-contains", currentUser.uid),
  where("status", "==", "active")
);
```

#### Student Calendar View
**File**: `src/pages/student/LearnIQCalendar.js`
```javascript
// Fetch events shared with this student
const sharedEventsQuery = query(
  collection(db, "mentorEvents"),
  where("sharedWith", "array-contains", currentUser.uid)
);

// Fetch public events (all students can see)
const publicEventsQuery = query(
  collection(db, "mentorEvents"),
  where("isPublic", "==", true)
);

// Combine both
const [sharedSnapshot, publicSnapshot] = await Promise.all([
  getDocs(sharedEventsQuery),
  getDocs(publicEventsQuery)
]);

const events = [
  ...sharedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
  ...publicSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
];
```

## UI Flow Examples

### Example 1: Mentor Creates Assignment
1. **Mentor** clicks "Create Assignment" button
2. **Modal opens** with form:
   - Title
   - Description
   - Course selection
   - Due date
   - Points
   - **Student selection** (multi-select checkboxes)
3. **Mentor selects** students from their mentee list
4. **Mentor submits** → Assignment created with `studentIds: [...]`
5. **Notifications sent** to each selected student
6. **Students see** assignment in their assignments page

### Example 2: Mentor Creates Quiz
1. **Mentor** creates quiz with questions
2. **Final step**: "Assign to Students" section
3. **Mentor selects** which students should take this quiz
4. **Quiz created** with `assignedTo: [...]`
5. **Students receive** notification
6. **Students see** quiz in their quiz list

### Example 3: Mentor Creates Calendar Event
1. **Mentor** clicks "Create Event" on calendar
2. **Modal opens** with options:
   - Event details (title, description, date, time)
   - Type (meeting, session, reminder)
   - **Visibility options**:
     - ☐ Keep private (only me)
     - ☐ Share with specific students (multi-select)
     - ☐ Make public (all students)
3. **Mentor selects** visibility option
4. **Event created** with appropriate visibility settings
5. **Selected students** see event on their calendar

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Assignments - Students can only see their assigned ones
    match /assignments/{assignmentId} {
      allow read: if request.auth != null && 
                     (request.auth.uid in resource.data.studentIds || 
                      request.auth.uid == resource.data.mentorId);
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.mentorId;
    }
    
    // Quizzes - Students can only see their assigned ones
    match /quizzes/{quizId} {
      allow read: if request.auth != null && 
                     (request.auth.uid in resource.data.assignedTo || 
                      request.auth.uid == resource.data.createdBy);
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.createdBy;
    }
    
    // Mentor Events - Visibility based on sharing
    match /mentorEvents/{eventId} {
      allow read: if request.auth != null && 
                     (resource.data.isPublic == true ||
                      request.auth.uid in resource.data.sharedWith ||
                      request.auth.uid == resource.data.mentorId);
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.mentorId;
    }
    
    // Submissions - Students create, mentors grade
    match /submissions/{submissionId} {
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.studentId;
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.studentId || 
                      request.auth.uid == resource.data.mentorId);
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.mentorId;
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow write: if request.auth != null;
    }
  }
}
```

## Testing Checklist

### Mentor Side
- [ ] Create assignment and select specific students
- [ ] Verify studentIds array is populated
- [ ] Check notifications are sent to selected students
- [ ] Create quiz and assign to students
- [ ] Create calendar event and share with students
- [ ] Verify public calendar events

### Student Side
- [ ] Log in as assigned student
- [ ] Verify assignment appears in assignments list
- [ ] Verify quiz appears in quiz list
- [ ] Verify shared calendar event appears on calendar
- [ ] Verify public events appear for all students
- [ ] Check notifications received

### Security
- [ ] Student cannot see unassigned assignments
- [ ] Student cannot see unassigned quizzes
- [ ] Student cannot see private mentor events
- [ ] Student can see public events
- [ ] Student can see shared events
- [ ] Mentor can see all their created content

## Summary

### Key Points
1. **studentIds/assignedTo/sharedWith arrays** control visibility
2. **Notifications** inform students of new content
3. **Security rules** enforce access control
4. **Public flag** for events visible to all students
5. **Mentor creates → Students see** (if assigned)

### Files to Update
1. ✅ `src/components/mentor/Navbar.js` - Navigation updated
2. 🔄 `src/pages/mentor/MentorAssignments.jsx` - Already has student selection
3. 🔄 `src/pages/mentor/CreateQuiz.jsx` - Add student selection
4. 🔄 `src/pages/mentor/MentorCalendar.jsx` - Add student selection
5. ✅ `src/pages/student/LearnIQAssignments.js` - Already queries correctly
6. 🔄 `src/pages/student/StudentQuizzes.jsx` - Update query
7. 🔄 `src/pages/student/LearnIQCalendar.js` - Add mentor events query

---

**Status**: Navigation updated, implementation guides provided
**Next**: Update CreateQuiz and MentorCalendar to add student selection functionality
