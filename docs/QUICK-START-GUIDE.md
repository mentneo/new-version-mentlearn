# Quick Start Guide - Assignment Submissions

## 🎯 Overview
The assignment submission system is now fully implemented! Students can submit assignments via Google Drive links, and creators/mentors can review and grade them.

## 📋 What You Need to Do

### 1. **Update Firestore Security Rules**

Add these rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check user role
    function hasRole(role) {
      return request.auth != null && 
             request.auth.token.role == role;
    }
    
    // Assignments collection
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow write: if hasRole('creator') || 
                      hasRole('mentor') || 
                      hasRole('admin');
    }
    
    // Submissions collection (NEW)
    match /submissions/{submissionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.studentId;
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.studentId || 
                        hasRole('creator') || 
                        hasRole('mentor') || 
                        hasRole('admin'));
      allow delete: if hasRole('admin');
    }
  }
}
```

Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

### 2. **Deploy Firestore Indexes**

The system needs composite indexes. Deploy them:

```bash
firebase deploy --only firestore:indexes
```

Or create manually in Firebase Console when you see index errors in the browser console.

### 3. **Test the System**

#### As a Student:
1. **Login** as a student
2. **Navigate** to Assignments page
3. **Click** "View Details" on an assignment
4. **Upload** your work to Google Drive: [Click Here](https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4)
5. **Copy** the shareable link
6. **Click** "Submit Assignment" button
7. **Paste** the Google Drive link
8. **Add** optional notes
9. **Submit** and see success message!

#### As a Creator/Mentor:
1. **Login** as creator/mentor
2. **Navigate** to "Assignment Submissions" in sidebar
3. **View** all submissions dashboard
4. **Filter** by status, course, or assignment
5. **Click** the grade icon (edit) on a submission
6. **Review** the work by clicking "Open in Google Drive"
7. **Enter** grade (0-100) and feedback
8. **Submit** grade
9. **Verify** student sees the grade

## 🔧 Configuration

### Google Drive Folder
The system uses a shared Google Drive folder for submissions:
- **Folder ID**: `1HSJata1zk7DVCefLGJYKaWei-CEriZd4`
- **Access**: Anyone with the link can upload

**To use your own folder:**
1. Create a Google Drive folder
2. Set sharing to "Anyone with the link can upload"
3. Copy the folder ID from the URL
4. Replace the folder ID in:
   - `src/pages/student/AssignmentDetail.js` (line ~515 and ~533)
   - `src/pages/student/LearnIQAssignments.js` (line ~490)

Example URL: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE`

## 📱 Features Implemented

### ✅ Student Features:
- View all assigned assignments
- Filter by status, course, search
- See due dates with countdown
- Submit assignments via Google Drive link
- Add notes for instructor
- Update submissions before grading
- View grades and feedback

### ✅ Creator/Mentor Features:
- Centralized submissions dashboard
- Filter by status, course, assignment
- Search by student name
- View submissions in Google Drive
- Grade assignments (0-100)
- Provide detailed feedback
- Update grades anytime
- See statistics (total, pending, graded)

## 🎨 UI Components

### New Components:
1. **AssignmentSubmissions.js** - Creator dashboard for reviewing submissions
2. **Submission Modal** (in AssignmentDetail.js) - Student submission form
3. **Grading Modal** (in AssignmentSubmissions.js) - Instructor grading interface

### Updated Components:
1. **AssignmentDetail.js** - Added submission functionality
2. **LearnIQAssignments.js** - Fixed route to assignment details
3. **SideNav.js** - Added "Assignment Submissions" menu item

## 📊 Database Structure

### Firestore Collections:

**assignments** (existing):
```
- title
- description
- instructions
- requirements
- courseId
- creatorId
- studentIds (array)
- dueDate
- createdAt
```

**submissions** (new):
```
- assignmentId
- studentId
- studentName
- studentEmail
- googleDriveUrl
- notes
- submittedAt
- status
- grade (added by instructor)
- feedback (added by instructor)
- gradedAt (added by instructor)
- gradedBy (added by instructor)
```

## 🚀 How to Create a Test Assignment

Use Firebase Console to create a test assignment:

```javascript
// In Firestore, go to 'assignments' collection, click 'Add Document'
{
  "title": "Test Assignment - React Components",
  "description": "Build a simple React component",
  "instructions": "Create a functional component with props",
  "requirements": [
    "Use functional components",
    "Implement proper prop types",
    "Include basic styling"
  ],
  "courseId": "YOUR_COURSE_ID",
  "creatorId": "YOUR_CREATOR_UID",
  "studentIds": ["STUDENT_UID_1", "STUDENT_UID_2"],
  "dueDate": Timestamp(2025, 10, 30),
  "createdAt": Timestamp.now(),
  "type": "assignment",
  "points": 100
}
```

## ✨ Status Flow

```
Created → Pending → Submitted → Graded
           ↑           ↓
           └──────────┘
         (can update before grading)
```

## 🎯 Testing Checklist

- [ ] Student can view assignments
- [ ] Student can filter/search assignments
- [ ] Student can click "View Details"
- [ ] Assignment detail page loads correctly
- [ ] Student can click "Open Google Drive"
- [ ] Student can click "Submit Assignment"
- [ ] Submission modal opens
- [ ] Student can enter Google Drive link
- [ ] Form validation works
- [ ] Submission creates record in Firestore
- [ ] Success message displays
- [ ] Status changes to "Submitted"
- [ ] Creator can access "Assignment Submissions"
- [ ] Dashboard shows correct statistics
- [ ] Filters work correctly
- [ ] Search works
- [ ] Creator can click grade icon
- [ ] Grading modal opens
- [ ] Creator can open Google Drive link
- [ ] Creator can enter grade and feedback
- [ ] Grade saves to Firestore
- [ ] Student sees grade in assignment detail
- [ ] Update submission works
- [ ] Update grade works

## 🐛 Troubleshooting

### Students can't see assignments:
**Check**: Student UID is in assignment's `studentIds` array

### View Details shows blank page:
**Fixed**: Routes now use `/student/student-dashboard/assignments/:id`

### Submissions not showing for creator:
**Check**: 
- Creator's UID matches assignment's `creatorId`
- Firestore indexes are deployed
- Console for any errors

### Can't submit assignment:
**Check**:
- Google Drive link includes "drive.google.com"
- Student is authenticated
- Firestore rules allow create operation

### Grade not showing:
**Check**:
- Grade is a number between 0-100
- `gradedAt` timestamp exists
- Refresh the assignment detail page

## 📖 Documentation Files

Complete documentation available in:
1. **ASSIGNMENT-SUBMISSION-WORKFLOW.md** - Complete workflow guide
2. **ASSIGNMENT-SUBMISSION-SUMMARY.md** - Implementation summary
3. **QUICK-START-GUIDE.md** - This file

## 🎊 You're Ready!

Everything is implemented and ready to use. Just:
1. Deploy Firestore rules
2. Deploy Firestore indexes
3. Create test assignments
4. Test the complete flow

**Happy grading!** 🎓

---

**Need Help?** 
- Check browser console for errors
- Review Firestore data structure
- Verify authentication is working
- Check the detailed workflow documentation

**Version**: 1.0.0  
**Date**: October 19, 2025
