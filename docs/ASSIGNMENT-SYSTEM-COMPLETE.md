# Assignment System with Google Drive Integration

## Overview
A complete assignment management system where instructors/mentors can create assignments, and students can view assignment details and submit their work via Google Drive.

## System Flow

### For Instructors/Mentors
1. Create assignments in Firebase `assignments` collection
2. Assign to specific students using `studentIds` array
3. Set due dates, descriptions, instructions, and requirements
4. Assignments automatically appear in students' assignment pages

### For Students
1. View all assignments on the Assignments page
2. Click on any assignment to see full details
3. Read description, instructions, and requirements
4. Submit work by uploading to Google Drive
5. Track submission status (Pending, Submitted, Graded)

## Files Modified/Created

### 1. AssignmentDetail.js (NEW)
**Location:** `/src/pages/student/AssignmentDetail.js`

**Purpose:** Detailed view of a single assignment with submission interface

**Features:**
- ✅ Full assignment details display
- ✅ Due date and time remaining calculation
- ✅ Status tracking (Pending, Submitted, Graded, Overdue)
- ✅ Instructor information display
- ✅ Google Drive submission button
- ✅ File naming convention guidance
- ✅ Grade and feedback display (if graded)
- ✅ Resubmission option
- ✅ Overdue warnings
- ✅ Responsive design

**Key Components:**
```javascript
- Assignment Header (title, course, status badge)
- Due Date Section (calendar, countdown)
- Instructor Info (photo, name, email)
- Description & Instructions
- Requirements List
- Submission Interface (Google Drive link)
- Grade Display (if submitted and graded)
```

### 2. LearnIQAssignments.js (UPDATED)
**Location:** `/src/pages/student/LearnIQAssignments.js`

**Updates Made:**
- ✅ Added prominent Google Drive submission banner
- ✅ Added individual submit buttons per assignment
- ✅ Updated assignment cards with better layout
- ✅ Added "View Details" link for each assignment
- ✅ Improved mobile responsiveness

### 3. LearnIQRoutes.js (UPDATED)
**Location:** `/src/LearnIQRoutes.js`

**Added Route:**
```javascript
<Route path="assignments/:assignmentId" element={<AssignmentDetail />} />
```

## Firebase Collections

### assignments Collection
```javascript
{
  title: string,                    // Assignment title
  description: string,              // Main description
  instructions: string,             // Detailed instructions
  requirements: array<string>,      // List of requirements
  courseId: string,                 // Reference to course
  instructorId: string,             // Instructor/creator ID
  studentIds: array<string>,        // Array of student UIDs
  dueDate: Timestamp,              // Due date
  createdAt: Timestamp,            // Creation date
  type: string,                     // "homework", "project", "quiz", etc.
  points: number,                   // Total points possible
  status: string                    // "active", "archived"
}
```

### submissions Collection (for tracking)
```javascript
{
  assignmentId: string,             // Reference to assignment
  studentId: string,                // Student UID
  courseId: string,                 // Course reference
  submittedAt: Timestamp,          // Submission time
  fileUrl: string,                  // Google Drive link (optional)
  fileName: string,                 // Submitted file name
  grade: number,                    // Grade (0-100)
  feedback: string,                 // Instructor feedback
  status: string                    // "submitted", "graded"
}
```

## Google Drive Integration

### Submission Folder
**URL:** https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4?usp=share_link

### File Naming Convention
```
YourName_AssignmentTitle_Date
```

**Examples:**
- `JohnDoe_Module1Assignment_2025-10-19.pdf`
- `JaneSmith_FinalProject_2025-10-25.docx`
- `AlexJohnson_MidtermEssay_2025-11-01.pdf`

### Submission Process
1. Student clicks "Upload to Google Drive" button
2. Opens Google Drive folder in new tab
3. Student uploads file with correct naming
4. Instructor reviews submission in Google Drive
5. Instructor manually updates Firestore with grade/feedback
6. Student sees grade on assignment detail page

## Features Breakdown

### Assignment List Page
**Route:** `/student/student-dashboard/assignments`

**Features:**
- Search assignments by title/description
- Filter by status (Pending, Submitted, Graded, Overdue)
- Filter by course
- Status badges with icons
- Due date display with countdown
- Quick submit buttons
- View details links
- Google Drive banner at top

### Assignment Detail Page
**Route:** `/student/student-dashboard/assignments/:assignmentId`

**Sections:**

#### 1. Header
- Assignment title
- Course name
- Status badge (color-coded)

#### 2. Due Date Info
- Full due date and time
- Time remaining (days left/overdue)
- Color-coded urgency indicators

#### 3. Instructor Info
- Profile picture
- Name and email
- Role badge

#### 4. Assignment Content
- Description (full text)
- Instructions (highlighted box)
- Requirements (bullet list)

#### 5. Submission Section
**Before Submission:**
- Upload instructions
- File naming guide with example
- Large "Upload to Google Drive" button
- Overdue warning (if applicable)

**After Submission:**
- Submission confirmation
- Submission date/time
- Grade (if graded)
- Instructor feedback
- Resubmission option

#### 6. Assignment Details
- Assignment type
- Total points
- Assigned date
- Current status

## Status System

### Status Types

#### Pending (Blue)
- Not yet submitted
- Due date in the future
- Icon: Clock
- Action: Submit button active

#### Submitted (Yellow)
- File uploaded to Google Drive
- Awaiting instructor review
- Icon: Upload
- Action: Resubmit option

#### Graded (Green)
- Instructor has reviewed and graded
- Grade and feedback available
- Icon: Check Circle
- Action: View feedback

#### Overdue (Red)
- Past due date without submission
- Warning displayed
- Icon: Alert Circle
- Action: Late submission note

## UI/UX Design

### Color Coding
```javascript
Pending:   Blue (#3B82F6)
Submitted: Yellow (#EAB308)
Graded:    Green (#10B981)
Overdue:   Red (#EF4444)
```

### Responsive Design
- **Desktop:** Full layout with side-by-side sections
- **Tablet:** Adjusted grid, stacked info boxes
- **Mobile:** Single column, touch-friendly buttons

### Animations
- Fade-in for page load
- Smooth transitions between states
- Hover effects on buttons and cards

### Icons (Feather Icons)
- FiCalendar: Due dates
- FiClock: Time remaining
- FiUpload: Submission
- FiCheckCircle: Completed/Graded
- FiAlertCircle: Overdue/Warnings
- FiBook: Course reference
- FiUser: Instructor info
- FiArrowLeft: Back navigation

## Creating Assignments (For Instructors)

### Firebase Console Method
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Select `assignments` collection
4. Click "Add Document"
5. Fill in fields:

```javascript
{
  title: "Module 1 Assignment",
  description: "Complete the exercises from Chapter 1",
  instructions: "1. Read Chapter 1\n2. Answer questions 1-10\n3. Upload as PDF",
  requirements: [
    "Minimum 500 words",
    "Include citations",
    "Submit in PDF format"
  ],
  courseId: "course123",
  instructorId: "instructor456",
  studentIds: ["student1", "student2", "student3"],
  dueDate: Timestamp (select date),
  createdAt: serverTimestamp(),
  type: "homework",
  points: 100,
  status: "active"
}
```

### Future: Instructor Interface
Create a dedicated assignment creation page for instructors with:
- Form-based interface
- Student selection
- Rich text editor
- Date picker
- Preview before publishing

## Workflow Examples

### Example 1: New Assignment
1. Instructor creates assignment in Firebase
2. Assignment appears in student's list immediately
3. Student sees "Pending" status with blue badge
4. Student clicks to view details
5. Student uploads to Google Drive
6. Student manually marks as submitted (or instructor does)
7. Instructor grades and adds feedback
8. Student sees "Graded" status with grade

### Example 2: Late Submission
1. Due date passes without submission
2. Status changes to "Overdue" (red badge)
3. Student still sees submit button
4. Overdue warning displayed on detail page
5. Student can still submit (late penalty may apply)
6. Instructor can accept or reject late submission

## Benefits

### For Students
✅ Clear assignment expectations
✅ Easy-to-follow instructions
✅ Simple submission process (Google Drive)
✅ Track progress and status
✅ View grades and feedback
✅ Resubmission capability
✅ Mobile-friendly interface

### For Instructors
✅ Centralized assignment management
✅ Easy to create and assign
✅ All submissions in one place (Google Drive)
✅ Can provide detailed feedback
✅ Track student completion
✅ Flexible grading system

### For System
✅ No file storage costs
✅ Leverages Google Drive reliability
✅ Simple data structure
✅ Scalable solution
✅ Easy to maintain

## Limitations & Workarounds

### Current Limitations
1. **Manual Submission Tracking**
   - No automatic sync with Google Drive
   - **Workaround:** Instructor manually updates Firestore after checking Drive

2. **No In-App Upload**
   - External link to Google Drive
   - **Workaround:** Future Google Drive API integration

3. **No Plagiarism Check**
   - Manual review required
   - **Workaround:** Use external plagiarism tools

4. **No Version Control**
   - Resubmissions overwrite
   - **Workaround:** Use date in filename

### Future Enhancements
- [ ] Google Drive API integration
- [ ] Automatic submission detection
- [ ] In-app file preview
- [ ] Drag-and-drop upload
- [ ] Version history
- [ ] Instructor assignment creation page
- [ ] Bulk assignment creation
- [ ] Assignment templates
- [ ] Email notifications
- [ ] Discussion/comments on assignments
- [ ] Peer review system
- [ ] Rubric grading
- [ ] Analytics dashboard

## Security Considerations

### Firebase Rules
Ensure Firestore rules allow:
- Students can read assignments where they're in `studentIds`
- Students can create submissions for their own `studentId`
- Instructors can read/write all assignments and submissions
- Admins have full access

### Google Drive
- Set folder permissions: Anyone with link can upload
- Students cannot delete others' files
- Regular backups
- Monitor for inappropriate content

## Testing Checklist

### Assignment List Page
- [ ] Assignments load correctly
- [ ] Search works
- [ ] Filters work (status, course)
- [ ] Submit buttons appear for pending assignments
- [ ] Status badges show correct colors
- [ ] Due dates display correctly
- [ ] Google Drive banner displays
- [ ] Mobile responsive

### Assignment Detail Page
- [ ] Assignment loads with correct data
- [ ] Back button works
- [ ] Status badge correct
- [ ] Due date formatted properly
- [ ] Time remaining calculated correctly
- [ ] Instructor info displays
- [ ] Description renders with line breaks
- [ ] Instructions highlighted
- [ ] Requirements list displays
- [ ] Google Drive button works
- [ ] File naming example shows
- [ ] Submission status updates
- [ ] Grade displays (if graded)
- [ ] Feedback shows (if available)
- [ ] Overdue warning appears when needed
- [ ] Mobile responsive

### Navigation
- [ ] Route works: `/student/student-dashboard/assignments/:id`
- [ ] Link from assignments list works
- [ ] Back button returns to list
- [ ] 404 handling for invalid IDs

## Support Documentation

### Student Help Guide
Create student documentation covering:
1. How to find assignments
2. Understanding assignment statuses
3. How to submit work
4. File naming best practices
5. Viewing grades and feedback
6. Resubmission process
7. What to do if overdue
8. Contacting instructor

### Instructor Guide
Create instructor documentation covering:
1. How to create assignments
2. Assigning to students
3. Setting due dates
4. Reviewing submissions in Google Drive
5. Adding grades and feedback
6. Managing late submissions
7. Updating assignment details

## Maintenance

### Regular Tasks
- Monitor Google Drive folder size
- Clean up old submissions
- Update file naming conventions if needed
- Review student feedback
- Update documentation
- Backup important submissions

### Recommended Schedule
- **Daily:** Check new submissions
- **Weekly:** Grade assignments, provide feedback
- **Monthly:** Clean up old files, review system
- **Quarterly:** Update documentation, gather feedback

## Conclusion

The assignment system provides a complete solution for managing course assignments with Google Drive integration. While there are opportunities for future enhancements (API integration, automated tracking), the current implementation effectively serves both student and instructor needs with a simple, reliable workflow.

The system is production-ready and can be used immediately for assignment management across all courses.
