# How to Create Assignments for Students

## Quick Start Guide

This guide will help instructors/mentors create assignments that will automatically appear in students' assignment pages.

## Method 1: Using Firebase Console (Easiest)

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Firestore Database" in the left menu
4. Click on the "Data" tab

### Step 2: Create Assignment Collection
If the `assignments` collection doesn't exist:
1. Click "Start collection"
2. Enter collection ID: `assignments`
3. Click "Next"

If it already exists:
1. Click on the `assignments` collection
2. Click "Add document"

### Step 3: Fill in Assignment Details

**Document ID:** (Auto-generated or custom)

**Required Fields:**

```javascript
{
  // Basic Information
  "title": "Module 1 Assignment",
  "description": "Complete the exercises from Chapter 1 and submit your answers.",
  
  // Student Assignment
  "studentIds": ["uid1", "uid2", "uid3"],  // Array of student UIDs
  "courseId": "courseId123",                // Course this assignment belongs to
  "instructorId": "instructorId456",        // Your instructor/mentor UID
  
  // Due Date
  "dueDate": Timestamp,                     // Click "timestamp" and select date/time
  
  // Optional but Recommended
  "instructions": "1. Read Chapter 1\n2. Answer questions 1-10\n3. Submit as PDF",
  "requirements": ["Minimum 500 words", "Include citations", "PDF format only"],
  "type": "homework",                       // homework, project, quiz, essay, etc.
  "points": 100,                            // Total points possible
  "status": "active",                       // active or archived
  
  // Timestamps
  "createdAt": serverTimestamp(),          // Auto-generated creation time
  "updatedAt": serverTimestamp()           // Auto-generated update time
}
```

### Step 4: Set Field Types

**Important:** Make sure to use the correct field types:

| Field | Type | Example |
|-------|------|---------|
| title | string | "Module 1 Assignment" |
| description | string | "Complete exercises..." |
| instructions | string | "1. Read...\n2. Answer..." |
| requirements | array | ["500 words", "PDF format"] |
| studentIds | array | ["uid123", "uid456"] |
| courseId | string | "courseId123" |
| instructorId | string | "instructorId456" |
| dueDate | timestamp | (use timestamp picker) |
| type | string | "homework" |
| points | number | 100 |
| status | string | "active" |
| createdAt | timestamp | serverTimestamp() |

### Step 5: Getting Student UIDs

To find student UIDs:
1. Go to Firestore Database
2. Navigate to `users` collection
3. Find the student document
4. Copy their document ID (this is their UID)
5. Add to the `studentIds` array

**Example:**
```javascript
"studentIds": ["abc123def456", "xyz789uvw012", "mno345pqr678"]
```

## Method 2: Using Firestore Admin SDK (Advanced)

If you have backend access, use this Node.js code:

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function createAssignment(assignmentData) {
  try {
    const assignmentRef = await db.collection('assignments').add({
      title: assignmentData.title,
      description: assignmentData.description,
      instructions: assignmentData.instructions,
      requirements: assignmentData.requirements || [],
      studentIds: assignmentData.studentIds, // Array of student UIDs
      courseId: assignmentData.courseId,
      instructorId: assignmentData.instructorId,
      dueDate: admin.firestore.Timestamp.fromDate(new Date(assignmentData.dueDate)),
      type: assignmentData.type || 'homework',
      points: assignmentData.points || 100,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Assignment created with ID:', assignmentRef.id);
    return assignmentRef.id;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
}

// Usage
createAssignment({
  title: 'Module 1 Assignment',
  description: 'Complete the exercises from Chapter 1',
  instructions: '1. Read Chapter 1\n2. Answer questions 1-10\n3. Submit as PDF',
  requirements: ['Minimum 500 words', 'Include citations', 'PDF format'],
  studentIds: ['student1uid', 'student2uid', 'student3uid'],
  courseId: 'courseId123',
  instructorId: 'instructorId456',
  dueDate: '2025-11-15T23:59:00',
  type: 'homework',
  points: 100
});
```

## Example Assignments

### Example 1: Essay Assignment
```javascript
{
  "title": "Week 2 Essay: Climate Change",
  "description": "Write a 1000-word essay analyzing the impact of climate change on coastal cities.",
  "instructions": "1. Research at least 3 coastal cities\n2. Include data and statistics\n3. Cite your sources in APA format\n4. Submit as PDF",
  "requirements": [
    "Minimum 1000 words",
    "At least 5 credible sources",
    "APA citation format",
    "PDF format only"
  ],
  "studentIds": ["student1", "student2", "student3"],
  "courseId": "environmental-science-101",
  "instructorId": "prof-smith",
  "dueDate": Timestamp("2025-11-01 23:59:00"),
  "type": "essay",
  "points": 100,
  "status": "active",
  "createdAt": serverTimestamp(),
  "updatedAt": serverTimestamp()
}
```

### Example 2: Programming Project
```javascript
{
  "title": "JavaScript Calculator Project",
  "description": "Build a functional calculator using HTML, CSS, and JavaScript.",
  "instructions": "1. Create HTML structure\n2. Style with CSS\n3. Implement calculator logic in JavaScript\n4. Upload code to GitHub\n5. Submit GitHub repository link",
  "requirements": [
    "All basic operations (+, -, ×, ÷)",
    "Clear and responsive design",
    "Clean, commented code",
    "GitHub repository link"
  ],
  "studentIds": ["dev1", "dev2", "dev3"],
  "courseId": "web-development-101",
  "instructorId": "prof-johnson",
  "dueDate": Timestamp("2025-11-15 23:59:00"),
  "type": "project",
  "points": 150,
  "status": "active",
  "createdAt": serverTimestamp(),
  "updatedAt": serverTimestamp()
}
```

### Example 3: Quiz/Test
```javascript
{
  "title": "Chapter 5 Quiz",
  "description": "Answer 20 multiple-choice questions covering Chapter 5 material.",
  "instructions": "1. Read Chapter 5 thoroughly\n2. You have 60 minutes to complete\n3. No retakes allowed\n4. Submit before the deadline",
  "requirements": [
    "Complete all 20 questions",
    "No external resources",
    "Time limit: 60 minutes"
  ],
  "studentIds": ["student1", "student2"],
  "courseId": "mathematics-201",
  "instructorId": "prof-davis",
  "dueDate": Timestamp("2025-10-25 23:59:00"),
  "type": "quiz",
  "points": 50,
  "status": "active",
  "createdAt": serverTimestamp(),
  "updatedAt": serverTimestamp()
}
```

## How Students See Assignments

Once you create an assignment:

1. **Assignment appears automatically** in students' assignment pages
2. **Students can view** all assignment details:
   - Title and description
   - Due date with countdown
   - Instructions and requirements
   - Instructor information
   
3. **Students can submit** work via Google Drive:
   - Click "Upload to Google Drive"
   - Upload file with naming convention
   - File goes to: https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4

4. **Status tracking:**
   - Pending (blue) - Not yet submitted
   - Submitted (yellow) - Awaiting review
   - Graded (green) - With grade and feedback
   - Overdue (red) - Past due date

## Grading Submissions

### Step 1: Review Submissions in Google Drive
1. Go to: https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4
2. Find student submissions (named: StudentName_AssignmentTitle_Date)
3. Review and grade the work

### Step 2: Add Grade to Firestore

**Option A: Firebase Console**
1. Go to Firestore Database
2. Navigate to `submissions` collection
3. Click "Add document"
4. Fill in:

```javascript
{
  "assignmentId": "assignmentId123",
  "studentId": "studentId456",
  "courseId": "courseId789",
  "submittedAt": Timestamp("2025-10-20 14:30:00"),
  "fileName": "JohnDoe_Module1Assignment_2025-10-20.pdf",
  "fileUrl": "https://drive.google.com/...",  // Optional
  "grade": 85,                                  // Number 0-100
  "feedback": "Great work! Consider adding more examples in section 2.",
  "status": "graded",
  "gradedAt": serverTimestamp()
}
```

**Option B: Using Code**
```javascript
await db.collection('submissions').add({
  assignmentId: 'assignmentId123',
  studentId: 'studentId456',
  courseId: 'courseId789',
  submittedAt: admin.firestore.Timestamp.now(),
  fileName: 'JohnDoe_Module1Assignment_2025-10-20.pdf',
  grade: 85,
  feedback: 'Great work! Consider adding more examples.',
  status: 'graded',
  gradedAt: admin.firestore.FieldValue.serverTimestamp()
});
```

## Bulk Assignment Creation

To assign the same assignment to multiple courses or sections:

```javascript
const assignmentTemplate = {
  title: 'Final Project',
  description: 'Build a full-stack web application',
  instructions: '1. Choose a topic\n2. Design UI\n3. Implement backend\n4. Deploy',
  requirements: ['Frontend and backend', 'Database integration', 'Deployed live'],
  type: 'project',
  points: 200,
  status: 'active'
};

// Create for Section A
await db.collection('assignments').add({
  ...assignmentTemplate,
  studentIds: ['student1', 'student2', 'student3'],
  courseId: 'course-section-A',
  instructorId: 'prof-smith',
  dueDate: Timestamp('2025-12-15 23:59:00'),
  createdAt: serverTimestamp()
});

// Create for Section B
await db.collection('assignments').add({
  ...assignmentTemplate,
  studentIds: ['student4', 'student5', 'student6'],
  courseId: 'course-section-B',
  instructorId: 'prof-smith',
  dueDate: Timestamp('2025-12-15 23:59:00'),
  createdAt: serverTimestamp()
});
```

## Troubleshooting

### Students can't see assignments?

**Check:**
1. ✅ Student UID is in `studentIds` array
2. ✅ `status` is set to "active"
3. ✅ Firestore indexes are deployed (see below)
4. ✅ Student is logged in
5. ✅ No console errors

### Missing Firestore Index?

If you see an error about missing index:

1. Firebase will provide a link in the error message
2. Click the link to auto-create the index
3. Wait 2-5 minutes for index to build
4. Refresh the page

**Or manually create index:**
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Add Index"
3. Collection: `assignments`
4. Fields:
   - `studentIds` (Array-contains)
   - `dueDate` (Ascending)
5. Click "Create Index"

### Update Existing Assignment

```javascript
await db.collection('assignments').doc('assignmentId').update({
  title: 'Updated Assignment Title',
  dueDate: newTimestamp,
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
});
```

### Delete Assignment

```javascript
await db.collection('assignments').doc('assignmentId').delete();
```

### Archive Assignment (Better than delete)

```javascript
await db.collection('assignments').doc('assignmentId').update({
  status: 'archived',
  archivedAt: admin.firestore.FieldValue.serverTimestamp()
});
```

## Best Practices

1. **Clear Titles**: Use descriptive titles (e.g., "Week 3: Essay on Climate Change")
2. **Detailed Instructions**: Break down steps clearly
3. **Specific Requirements**: List exact requirements
4. **Reasonable Due Dates**: Give students enough time
5. **Points System**: Be consistent with point values
6. **File Naming**: Remind students of naming convention
7. **Early Creation**: Create assignments at least 1 week before due date
8. **Regular Grading**: Grade submissions within 1 week

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review Firestore security rules
3. Verify student UIDs are correct
4. Ensure indexes are created
5. Contact technical support

## Quick Reference

**Create Assignment:**
- Collection: `assignments`
- Required: title, studentIds, courseId, instructorId, dueDate
- Optional: instructions, requirements, type, points

**Record Submission:**
- Collection: `submissions`
- Required: assignmentId, studentId, submittedAt
- Optional: grade, feedback, fileName

**Student Actions:**
- View: `/student/student-dashboard/assignments`
- Detail: `/student/student-dashboard/assignments/:id`
- Submit: Google Drive link

**Google Drive:**
- Folder: https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4
- File naming: `StudentName_AssignmentTitle_Date.ext`
