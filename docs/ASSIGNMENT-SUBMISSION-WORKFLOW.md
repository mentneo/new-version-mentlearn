# Assignment Submission Workflow

Complete guide for the assignment submission system in MentNeo platform.

## Overview

The assignment submission system allows:
- **Creators/Mentors**: Create assignments and review/grade student submissions
- **Students**: Submit assignments via Google Drive links and receive grades/feedback

## System Architecture

### Firestore Collections

#### 1. `assignments` Collection
```javascript
{
  id: "auto-generated",
  title: "Assignment Title",
  description: "Assignment description",
  instructions: "Detailed instructions",
  requirements: ["Requirement 1", "Requirement 2"],
  courseId: "course-id",
  creatorId: "creator-uid",
  studentIds: ["student-uid-1", "student-uid-2"], // Array of assigned students
  dueDate: Timestamp,
  createdAt: Timestamp,
  type: "assignment" | "quiz" | "project",
  points: 100
}
```

#### 2. `submissions` Collection
```javascript
{
  id: "auto-generated",
  assignmentId: "assignment-id",
  studentId: "student-uid",
  studentName: "Student Name",
  studentEmail: "student@email.com",
  googleDriveUrl: "https://drive.google.com/file/d/...",
  notes: "Optional student notes",
  submittedAt: Timestamp,
  status: "submitted" | "graded",
  
  // Added by instructor when grading
  grade: 85, // 0-100
  feedback: "Great work! Consider...",
  gradedAt: Timestamp,
  gradedBy: "instructor-uid"
}
```

## Student Workflow

### 1. View Assignments
**Page**: `/student/student-dashboard/assignments`
**Component**: `LearnIQAssignments.js`

- Students see all assignments assigned to them
- Filter by: Status (All, Pending, Submitted, Graded), Course, Search
- Sort by due date
- View status badges: Pending, Submitted, Graded, Overdue

### 2. View Assignment Details
**Page**: `/student/student-dashboard/assignments/:assignmentId`
**Component**: `AssignmentDetail.js`

Students can see:
- Assignment title, description, instructions, requirements
- Course information
- Instructor details
- Due date with countdown/overdue warning
- Current status badge
- Submission status
- Grade and feedback (if graded)

### 3. Submit Assignment

#### Step-by-Step Process:

**Step 1: Upload to Google Drive**
1. Click "Open Google Drive" button
2. Opens: `https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4`
3. Upload file following naming convention:
   ```
   StudentName_AssignmentTitle_Date
   Example: JohnDoe_ReactProject_2025-10-19.pdf
   ```
4. Set file sharing to "Anyone with the link can view"
5. Copy the file's shareable link

**Step 2: Submit via Platform**
1. Click "Submit Assignment" button
2. Modal opens with form:
   - **Google Drive Link** (Required): Paste the shareable link
   - **Notes** (Optional): Add any notes for the instructor
3. Click "Submit"
4. System creates/updates record in `submissions` collection
5. Success message displayed
6. Assignment status changes to "Submitted"

**Step 3: Update Submission (if needed)**
1. Click "Update Submission" button
2. Edit Google Drive link or notes
3. Submit changes
4. Timestamp updated to new submission time

### 4. View Grade & Feedback
Once instructor grades:
- Grade displayed (0-100)
- Feedback shown in assignment detail page
- Status changes to "Graded"

## Creator/Mentor Workflow

### 1. View All Submissions
**Page**: `/creator/assignment-submissions`
**Component**: `AssignmentSubmissions.js`

Dashboard shows:
- **Stats Cards**:
  - Total Submissions
  - Pending Review (submitted but not graded)
  - Graded
  - Total Students

- **Filters**:
  - Search by student name or assignment title
  - Filter by status: All, Pending, Submitted, Graded
  - Filter by course
  - Filter by specific assignment

- **Submissions Table**:
  - Student name & photo
  - Assignment title & due date
  - Course name & thumbnail
  - Submission date
  - Status badge
  - Current grade (if graded)
  - Action buttons

### 2. Review Submission

**Actions Available**:
1. **View Submission**: Click external link icon to open Google Drive file
2. **Grade Submission**: Click edit/grade icon

### 3. Grade Assignment

**Grading Modal**:
1. Student information displayed
2. "Open in Google Drive" button to review work
3. **Grade Input** (Required): Enter grade 0-100
4. **Feedback Input** (Optional): Provide detailed feedback
5. Click "Submit Grade"

**What Happens**:
- Grade and feedback saved to `submissions` collection
- `gradedAt` timestamp added
- `gradedBy` set to current instructor UID
- Student can immediately see grade in their assignment detail page
- Status changes to "Graded"

### 4. Update Grade
Instructors can re-open grading modal to update grades/feedback anytime.

## Navigation Structure

### Student Navigation
```
Student Dashboard
  └─ Assignments
      └─ Assignment Detail
          ├─ Submit Assignment (Modal)
          └─ View Submission
```

### Creator Navigation
```
Creator Dashboard
  └─ Assignment Submissions
      └─ Grade Submission (Modal)
```

## Routes Configuration

### Student Routes (`LearnIQRoutes.js`)
```javascript
<Route path="assignments" element={<LearnIQAssignments />} />
<Route path="assignments/:assignmentId" element={<AssignmentDetail />} />
```

### Creator Routes (`App.js`)
```javascript
<Route path="/creator" element={<CreatorRoute><CreatorLayout /></CreatorRoute>}>
  <Route path="assignment-submissions" element={<AssignmentSubmissions />} />
</Route>
```

## Key Features

### For Students:
✅ View all assigned assignments in one place
✅ Filter and search assignments
✅ See due dates with countdown
✅ Status indicators (Pending, Submitted, Graded, Overdue)
✅ Easy submission via Google Drive link
✅ Add notes for instructor
✅ Update submissions before grading
✅ View grades and feedback immediately

### For Creators/Mentors:
✅ Centralized submission dashboard
✅ Filter by status, course, assignment
✅ Search by student or assignment
✅ Direct access to Google Drive submissions
✅ Simple grading interface with feedback
✅ Grade tracking and statistics
✅ Update grades/feedback anytime

## Status Flow

```
Assignment Created
    ↓
Assigned to Students → Pending
    ↓
Student Uploads & Submits → Submitted
    ↓
Instructor Reviews & Grades → Graded
```

## Google Drive Integration

### Shared Folder
**URL**: `https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4`

**Best Practices**:
1. Students should follow naming conventions
2. Set files to "Anyone with the link can view"
3. Don't delete or move files after submission
4. Use the exact shareable link in submission form

### File Naming Convention
```
Format: StudentName_AssignmentTitle_Date
Examples:
  - JohnDoe_ReactAssignment_2025-10-19.pdf
  - MarySmith_DatabaseProject_2025-10-20.zip
  - RajeshKumar_CSSHomework_2025-10-21.docx
```

## Firestore Security Rules

```javascript
// assignments collection
match /assignments/{assignmentId} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.role == 'creator' || 
                  request.auth.token.role == 'mentor' ||
                  request.auth.token.role == 'admin';
}

// submissions collection
match /submissions/{submissionId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.studentId;
  allow update: if request.auth.uid == resource.data.studentId || 
                   request.auth.token.role == 'creator' ||
                   request.auth.token.role == 'mentor' ||
                   request.auth.token.role == 'admin';
}
```

## Error Handling

### Student Side:
- ❌ Empty Google Drive link → "Please provide a Google Drive link"
- ❌ Invalid link (not drive.google.com) → "Please provide a valid Google Drive link"
- ❌ Firestore error → "Failed to submit assignment. Please try again."

### Creator Side:
- ❌ Invalid grade (< 0 or > 100) → "Please enter a valid grade (0-100)"
- ❌ Firestore error → "Failed to submit grade. Please try again."
- ❌ No assignments found → Helpful empty state with message

## Testing Checklist

### Student Flow:
- [ ] View assignments list
- [ ] Filter by status
- [ ] Search assignments
- [ ] Open assignment detail
- [ ] Click "Open Google Drive"
- [ ] Submit assignment with valid link
- [ ] See success message
- [ ] Status changes to "Submitted"
- [ ] Update submission
- [ ] View grade after instructor grades

### Creator Flow:
- [ ] View submissions dashboard
- [ ] See correct stats (total, pending, graded)
- [ ] Filter by course
- [ ] Filter by assignment
- [ ] Filter by status
- [ ] Search by student name
- [ ] Click external link to view submission
- [ ] Open grading modal
- [ ] Enter grade and feedback
- [ ] Submit grade successfully
- [ ] Update existing grade

## Future Enhancements

### Planned Features:
1. **Email Notifications**:
   - Notify students when assignment is graded
   - Remind students of upcoming due dates
   
2. **File Upload Integration**:
   - Direct file upload to Firebase Storage
   - Automatic Google Drive sync
   
3. **Analytics**:
   - Average grades per assignment
   - Submission rate statistics
   - Late submission tracking
   
4. **Bulk Operations**:
   - Grade multiple submissions at once
   - Export grades to CSV
   
5. **Comments & Discussion**:
   - Allow back-and-forth communication on submissions
   - Revision requests
   
6. **Rubric Support**:
   - Create grading rubrics
   - Category-based scoring

## Troubleshooting

### "Assignment not showing in student list"
- Check if student UID is in assignment's `studentIds` array
- Verify Firestore query includes `where("studentIds", "array-contains", studentId)`

### "Submission not appearing for instructor"
- Check if `assignmentId` matches
- Verify instructor's `creatorId` matches assignment's `creatorId`
- Check Firestore indexes are deployed

### "Can't submit assignment"
- Verify student is logged in
- Check Google Drive link format
- Check browser console for errors
- Verify Firestore permissions

### "Grade not showing for student"
- Refresh the page
- Check if `gradedAt` field exists in submission
- Verify `grade` field is a number 0-100

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Firestore data structure matches documentation
3. Check security rules are correctly configured
4. Review component console.log statements for debugging

---

**Last Updated**: October 19, 2025
**Version**: 1.0.0
**Components**: AssignmentDetail.js, LearnIQAssignments.js, AssignmentSubmissions.js
