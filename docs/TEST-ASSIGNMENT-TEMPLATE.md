# Test Assignment - Copy to Firebase Console

## How to Use This Template

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Go to `assignments` collection (create if it doesn't exist)
4. Click "Add Document"
5. Copy and paste the fields below

---

## COPY THESE FIELDS TO FIREBASE:

### Document ID
Leave blank for auto-generated OR use: `test-assignment-001`

### Fields (Add each field with the correct type):

**title** (string)
```
Module 1 Test Assignment
```

**description** (string)
```
This is a test assignment to verify the assignment system is working correctly. Please submit a sample document to the Google Drive folder.
```

**instructions** (string)
```
1. Create a simple text document or PDF
2. Name it using the format: YourName_TestAssignment_TodaysDate
3. Upload it to the Google Drive submission folder
4. Verify you can see this assignment in your dashboard
```

**requirements** (array - click "array" then add strings)
```
Click "array" type, then add these items:
- Any document format (PDF, DOC, TXT)
- Proper file naming
- Submitted before deadline
```

**studentIds** (array - click "array" then add strings)
```
Click "array" type, then add your student UIDs:
- [REPLACE WITH YOUR STUDENT UID]
- [ADD MORE STUDENT UIDS AS NEEDED]
```

**courseId** (string)
```
test-course-001
```

**instructorId** (string)
```
[REPLACE WITH YOUR INSTRUCTOR UID]
```

**dueDate** (timestamp - click "timestamp" and select date)
```
Click "timestamp" type, then select a date/time:
- Set to 7 days from today
- Time: 23:59:00
```

**type** (string)
```
homework
```

**points** (number)
```
100
```

**status** (string)
```
active
```

**createdAt** (timestamp - click "timestamp")
```
Click "timestamp" type, leave as current time or use serverTimestamp()
```

**updatedAt** (timestamp - click "timestamp")
```
Click "timestamp" type, leave as current time or use serverTimestamp()
```

---

## How to Find Your UID

### For Students:
1. Go to Firebase Console → Authentication
2. Find the student's email
3. Copy their UID (long string like: `abc123def456ghi789`)
4. Add to `studentIds` array

### For Instructor:
1. Go to Firebase Console → Authentication  
2. Find your email
3. Copy your UID
4. Use as `instructorId`

---

## Verification Steps

After creating the assignment:

1. **Check Firestore:**
   - ✅ Assignment appears in `assignments` collection
   - ✅ All fields are present
   - ✅ studentIds is an array with UIDs
   - ✅ dueDate is a timestamp

2. **Check Student View:**
   - ✅ Log in as student
   - ✅ Go to Assignments page
   - ✅ Assignment should appear in list
   - ✅ Click to view details
   - ✅ Verify all info displays correctly

3. **Test Submission:**
   - ✅ Click "Upload to Google Drive"
   - ✅ Upload a test file
   - ✅ Verify file appears in Google Drive folder

---

## Common Issues & Fixes

### Issue: Assignment doesn't appear
**Fix:**
- Verify student UID is correct in `studentIds` array
- Check `status` is "active"
- Ensure student is logged in
- Check browser console for errors

### Issue: "Index required" error
**Fix:**
- Click the link in error message to create index
- Or wait 2-3 minutes after creating first assignment
- Firebase will auto-create the index

### Issue: Due date shows wrong time
**Fix:**
- Make sure you used "timestamp" type (not string)
- Check timezone settings

---

## Quick Copy-Paste for Testing

**For Firebase Admin SDK / Node.js:**

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function createTestAssignment() {
  const assignment = {
    title: 'Module 1 Test Assignment',
    description: 'This is a test assignment to verify the system is working.',
    instructions: '1. Create a document\n2. Name it properly\n3. Upload to Google Drive',
    requirements: ['Any format', 'Proper naming', 'Before deadline'],
    studentIds: ['REPLACE_WITH_STUDENT_UID'], // Replace with actual UIDs
    courseId: 'test-course-001',
    instructorId: 'REPLACE_WITH_INSTRUCTOR_UID', // Replace with actual UID
    dueDate: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    ),
    type: 'homework',
    points: 100,
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    const docRef = await db.collection('assignments').add(assignment);
    console.log('Test assignment created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating assignment:', error);
  }
}

createTestAssignment();
```

---

## Expected Result

After creating this test assignment:

1. Students with UIDs in `studentIds` will see it in their assignments list
2. Assignment will show as "Pending" (blue badge)
3. Time remaining will be calculated automatically
4. Students can click to view full details
5. Students can click "Upload to Google Drive" to submit

---

## Google Drive Submission Folder

https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4?usp=share_link

Make sure this folder has proper permissions:
- Anyone with the link can upload
- Students can add files (but not delete)

---

## Next Steps

1. Create this test assignment
2. Verify it appears for students
3. Test the submission process
4. Create real assignments for your courses
5. Set up grading workflow

---

## Support

If you have issues:
1. Check the console logs (F12 → Console)
2. Verify all field types are correct
3. Ensure UIDs are correct
4. Check Firestore security rules
5. Review the documentation: `/docs/HOW-TO-CREATE-ASSIGNMENTS.md`
