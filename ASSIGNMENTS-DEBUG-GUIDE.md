# Assignments Display - Debugging Guide

## Issue: "No assignments found" or assignments not showing

This guide will help you debug why assignments aren't displaying.

---

## Quick Diagnostic Steps

### 1. Open Browser Console (F12)

After opening the Assignments page, check the console for these messages:

```
✅ Good Signs:
👤 Current User: abc123xyz
📧 Email: mentor@example.com
📝 Fetched assignments: 5
📊 Total assignments: 5
🔍 Filtered assignments: 5

❌ Problem Signs:
⚠️  No current user logged in
📝 Fetched assignments: 0
Error fetching assignments: [error message]
```

### 2. Check Firestore Database

**Go to**: Firebase Console → Firestore Database

**Check these collections:**

#### A. Check `assignments` collection

Look for documents with:
```javascript
{
  title: "Assignment Title",
  description: "...",
  mentorId: "your-mentor-uid",  // Must match YOUR user ID
  studentIds: ["student1", "student2"],
  dueDate: Timestamp,
  points: 100,
  status: "active",
  createdAt: Timestamp
}
```

**Important**: The `mentorId` field MUST match your current user's UID!

#### B. Check `users` collection

Find your user document and verify:
```javascript
{
  email: "your-email@example.com",
  role: "mentor",  // Must be "mentor"!
  displayName: "Your Name"
}
```

---

## Common Issues & Solutions

### Issue 1: No assignments in Firestore

**Symptom**: Console shows `📝 Fetched assignments: 0`

**Solution**: Create an assignment!

1. Click "Create Assignment" button
2. Fill in all fields
3. Select at least one student
4. Submit

**Check console for**:
```
📝 Creating assignment with data: {...}
✅ Assignment created with ID: xyz123
✅ Notifications sent to 2 students
```

---

### Issue 2: Assignments exist but not showing

**Symptom**: Firestore has assignments, but page shows none

**Possible Causes:**

#### A. Wrong mentorId
- **Check**: Is the `mentorId` in assignments matching your user UID?
- **Fix**: Update assignments in Firestore with correct mentorId

```javascript
// In Firestore, edit the assignment document:
mentorId: "correct-mentor-uid"  // Get this from console log
```

#### B. Filter is hiding assignments
- **Check**: Console shows `🔍 Filtered assignments: 0` but `📊 Total assignments: 5`
- **Fix**: Change filter to "All" or adjust search

#### C. Date issue causing filter problems
- **Check**: Are due dates in the past or future?
- **Fix**: Try "All" filter instead of "Active" or "Overdue"

---

### Issue 3: Assignment created but not appearing

**Symptom**: Created assignment successfully, but not showing

**Solutions:**

#### A. Hard Refresh
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

#### B. Check Console
Look for errors after creation:
```
❌ Error creating assignment: [error details]
```

#### C. Verify in Firestore
- Go to Firebase Console
- Check `assignments` collection
- Find the most recent document
- Verify `mentorId` matches your UID

---

## Step-by-Step Test

### Test 1: Check Authentication

**Open Console and Run:**
```javascript
// Check if logged in
firebase.auth().currentUser

// Should show:
// email: "your@email.com"
// uid: "abc123xyz"
```

### Test 2: Check Assignments in Firestore

**Open Console and Run:**
```javascript
firebase.firestore()
  .collection('assignments')
  .where('mentorId', '==', firebase.auth().currentUser.uid)
  .get()
  .then(snapshot => {
    console.log('Total assignments:', snapshot.size);
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  });
```

**Expected Result**: Should show your assignments

### Test 3: Create Test Assignment Manually

**In Firestore Console:**

1. Go to `assignments` collection
2. Click "Add Document"
3. Use this structure:

```javascript
{
  title: "Test Assignment",
  description: "This is a test",
  mentorId: "YOUR-MENTOR-UID-HERE",  // IMPORTANT!
  studentIds: ["test-student-1"],
  dueDate: [Select date in future],
  points: 100,
  status: "active",
  createdAt: [Current timestamp]
}
```

4. Save and refresh the page

---

## Console Debug Commands

### Check Current User
```javascript
console.log('Current User:', firebase.auth().currentUser);
```

### Check Assignments
```javascript
firebase.firestore()
  .collection('assignments')
  .get()
  .then(snapshot => {
    console.log('All assignments:', snapshot.size);
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log({
        id: doc.id,
        title: data.title,
        mentorId: data.mentorId,
        studentIds: data.studentIds
      });
    });
  });
```

### Check Your Mentor ID
```javascript
firebase.auth().currentUser.uid
// Copy this and verify it matches mentorId in assignments
```

---

## Enhanced Debug Output

With the latest changes, the console will now show:

### On Page Load:
```
👤 Current User: abc123xyz
📧 Email: mentor@example.com
```

### When Fetching Assignments:
```
📝 Fetched assignments: 3
Assignments data: [
  {id: "123", title: "Week 1", ...},
  {id: "456", title: "Week 2", ...},
  {id: "789", title: "Week 3", ...}
]
```

### When Filtering:
```
📊 Total assignments: 3
🔍 Filtered assignments: 2
Filter status: active
Search query: 
```

### When Creating Assignment:
```
📝 Creating assignment with data: {
  title: "New Assignment",
  studentIds: ["s1", "s2"],
  dueDate: "2025-10-25"
}
✅ Assignment created with ID: new123
✅ Notifications sent to 2 students
```

---

## Troubleshooting Flowchart

```
Is user logged in?
├─ NO → Log in as mentor
└─ YES
    │
    └─ Are assignments in Firestore?
        ├─ NO → Create an assignment
        └─ YES
            │
            └─ Does mentorId match current user UID?
                ├─ NO → Fix mentorId in Firestore
                └─ YES
                    │
                    └─ Check filter settings
                        ├─ Filter hiding assignments → Change to "All"
                        └─ Still not showing → Check console for errors
```

---

## Creating a Test Assignment

### Method 1: Use the UI (Recommended)

1. **Open Assignments Page**: `/mentor/assignments`

2. **Click**: "Create Assignment" button

3. **Fill Form**:
   - Title: "Test Assignment 1"
   - Description: "This is a test assignment"
   - Due Date: Select tomorrow's date
   - Points: 100
   - Course: (optional)

4. **Select Students**: Check at least one student

5. **Click**: "Create Assignment"

6. **Watch Console** for success messages

7. **Refresh Page**: Assignment should appear

### Method 2: Directly in Firestore

1. **Open**: Firebase Console → Firestore

2. **Navigate to**: `assignments` collection

3. **Click**: "Add Document"

4. **Enter**:
   ```
   Document ID: (Auto-ID)
   
   Fields:
   title (string): "Test Assignment"
   description (string): "Testing display"
   mentorId (string): [YOUR UID FROM CONSOLE]
   studentIds (array): ["test-student-1", "test-student-2"]
   dueDate (timestamp): [Tomorrow's date]
   points (number): 100
   status (string): "active"
   createdAt (timestamp): [Current time]
   ```

5. **Save**

6. **Refresh** assignments page

---

## Expected Page States

### When Loading:
```
┌─────────────────────────────────────┐
│                                     │
│      ⟳ Loading assignments...      │
│                                     │
└─────────────────────────────────────┘
```

### When No Assignments (First Time):
```
┌─────────────────────────────────────┐
│              📝                     │
│                                     │
│      No assignments found           │
│                                     │
│   Create your first assignment      │
│         to get started              │
│                                     │
│    [ ➕ Create Assignment ]         │
└─────────────────────────────────────┘
```

### When Assignments Exist:
```
┌─────────────────────────────────────────────┐
│  📝 Week 1 Project       [Active]          │
│  Description...                             │
│  Due: Oct 20, 2025  •  5 students          │
│  ▓▓▓▓▓▓░░░░ 60% submitted                 │
├─────────────────────────────────────────────┤
│  📝 Week 2 Quiz          [Active]          │
│  Description...                             │
│  Due: Oct 25, 2025  •  3 students          │
│  ▓▓▓░░░░░░░ 30% submitted                 │
└─────────────────────────────────────────────┘
```

---

## Quick Fix Commands

### Reset Filters
Click "Filter: All" and clear search box

### Force Refresh
```
Cmd/Ctrl + Shift + R
```

### Check Data
Open Console (F12) and look for the debug messages

### Verify Authentication
```javascript
firebase.auth().currentUser.uid
// Should return your user ID
```

---

## Success Checklist

After creating an assignment, verify:

- [ ] Console shows "✅ Assignment created with ID: ..."
- [ ] Console shows "✅ Notifications sent to X students"
- [ ] Alert appears: "Assignment created successfully!"
- [ ] Page refreshes
- [ ] New assignment appears in the list
- [ ] Assignment card shows correct title
- [ ] Assignment card shows student count
- [ ] Assignment card shows due date
- [ ] Progress bars appear
- [ ] Status badge shows (Active/Overdue)

---

## Still Not Working?

### Check These:

1. **Firestore Rules**: Ensure mentor can read/write assignments
2. **Network**: Check browser Network tab for failed requests  
3. **Errors**: Look for red errors in console
4. **Authentication**: Verify you're logged in as mentor (not student)
5. **Database**: Verify `assignments` collection exists in Firestore

### Get Help:

Include these details:
- Console error messages
- Screenshot of Firestore data
- Current user UID
- Assignment document structure

---

**Remember**: Check the browser console (F12) first - it has detailed debug information to help diagnose the issue!
