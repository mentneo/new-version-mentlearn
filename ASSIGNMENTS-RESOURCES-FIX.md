# Assignments & Resources Fix - Complete Guide

## Problem Fixed
Students couldn't open/download assignments and resources uploaded by creators/admins.

## Root Causes Identified

### 1. Cloudinary Configuration Issue ✅ FIXED
**Problem:** Hardcoded wrong Cloudinary account in upload functions
- Used `djoayskme` cloud name (wrong account)
- Used `ml_default` preset (doesn't exist)

**Solution:** Updated to use environment variables
- Now uses `dp8bfdbab` from `REACT_APP_CLOUDINARY_CLOUD_NAME`
- Now uses `mentneo_uploads` from `REACT_APP_CLOUDINARY_UPLOAD_PRESET`

**Files Fixed:**
- ✅ `src/pages/creator/Courses.js` - Upload functions updated
- ✅ `src/pages/admin/ManageCourses.js` - Upload functions updated
- ✅ `src/pages/student/LearnIQCourseView.js` - Resources tab now displays assignments & resources

### 2. Missing Upload Preset ⚠️ NEEDS ACTION
**Problem:** The upload preset `mentneo_uploads` must exist in Cloudinary

**Solution Required:** Create the upload preset in Cloudinary dashboard

**Steps:**
1. Go to: https://console.cloudinary.com/
2. Login with your credentials
3. Click **Settings** → **Upload** tab
4. Scroll to **Upload presets** section
5. Click **Add upload preset**
6. Configure:
   - **Preset name:** `mentneo_uploads`
   - **Signing mode:** **Unsigned** (CRITICAL!)
   - **Folder:** `mentneo` (optional)
   - **Access mode:** Public Read
   - **Unique filename:** ✅ Enable
7. Click **Save**

### 3. Student View Updated ✅ FIXED
**Problem:** Resources tab was just a placeholder

**Solution:** Added full display of assignments and resources
- Shows all assignments uploaded by creator/admin
- Shows all study materials/resources
- Download/Open buttons for each item
- Proper categorization and styling

---

## How It Works Now

### For Creators/Admins:
1. Open a course → Click "Assignments & Resources"
2. **Add Assignment:**
   - Fill title and description
   - Select PDF/document file
   - Click "Add Assignment"
   - File uploads to Cloudinary → URL saved to course document
3. **Add Resource:**
   - Fill title and description
   - Select file (any type)
   - Click "Add Resource"
   - File uploads to Cloudinary → URL saved to course document

### For Students:
1. Open enrolled course → Click "Resources" tab
2. See two sections:
   - **Assignments** - Download PDFs/documents
   - **Study Materials** - Open/view resources
3. Click "Download" or "Open" buttons to access files
4. Files open directly from Cloudinary CDN

---

## Data Structure

### Course Document in Firestore:
```javascript
{
  id: "course_123",
  title: "React Fundamentals",
  // ... other fields
  
  assignments: [
    {
      id: "assignment_1702123456789",
      title: "Week 1 Assignment",
      description: "Complete React basics",
      fileUrl: "https://res.cloudinary.com/dp8bfdbab/raw/upload/...",
      fileName: "week1-assignment.pdf",
      createdAt: "2025-12-13T10:30:00.000Z",
      createdBy: "creator_uid"
    }
  ],
  
  resources: [
    {
      id: "resource_1702123456790",
      title: "React Cheatsheet",
      description: "Quick reference guide",
      fileUrl: "https://res.cloudinary.com/dp8bfdbab/image/upload/...",
      fileName: "react-cheatsheet.pdf",
      fileType: "application/pdf",
      createdAt: "2025-12-13T10:35:00.000Z",
      createdBy: "creator_uid"
    }
  ]
}
```

---

## Upload Flow

### 1. File Selection
```javascript
<input type="file" onChange={(e) => setAssignmentFile(e.target.files[0])} />
```

### 2. Upload to Cloudinary
```javascript
const uploadFileToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset); // ✅ From env

  const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();
  return data.secure_url; // Returns: https://res.cloudinary.com/...
};
```

### 3. Save to Firestore
```javascript
const assignment = {
  id: `assignment_${Date.now()}`,
  title: assignmentTitle,
  fileUrl: assignmentUrl, // ✅ Cloudinary URL
  fileName: assignmentFile.name,
  createdAt: new Date().toISOString()
};

await updateDoc(courseRef, {
  assignments: [...currentAssignments, assignment]
});
```

### 4. Student Access
```javascript
<a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer">
  <FiDownload /> Download
</a>
```

---

## Testing Instructions

### Test as Creator/Admin:
1. Login as creator or admin
2. Go to courses page
3. Select a course
4. Click "Assignments & Resources" button
5. **Test Assignment Upload:**
   - Enter title: "Test Assignment"
   - Enter description: "Testing upload"
   - Select a PDF file
   - Click "Add Assignment"
   - ✅ Should show success message
   - ✅ Should appear in assignments list
6. **Test Resource Upload:**
   - Enter title: "Test Resource"
   - Select any file (PDF, image, doc, etc.)
   - Click "Add Resource"
   - ✅ Should show success message
   - ✅ Should appear in resources list

### Test as Student:
1. Login as student
2. Go to "My Courses"
3. Open any enrolled course
4. Click "Resources" tab
5. ✅ Should see assignments section
6. ✅ Should see resources section
7. Click "Download" on an assignment
   - ✅ Should download the PDF
8. Click "Open" on a resource
   - ✅ Should open in new tab

---

## Troubleshooting

### Error: "Unknown API key"
**Cause:** Upload preset doesn't exist or isn't unsigned
**Fix:** Create the upload preset in Cloudinary (see steps above)

### Error: "Upload preset not found"
**Cause:** Preset name mismatch
**Fix:** Ensure preset is named exactly `mentneo_uploads`

### Files don't open/download
**Cause:** URL is null or invalid
**Fix:** 
1. Check browser console for errors
2. Verify file uploaded successfully (check success message)
3. Inspect Firestore document - check `fileUrl` field
4. Try uploading again after creating preset

### Upload takes too long
**Cause:** Large file size or slow connection
**Fix:**
1. Keep files under 10MB for best performance
2. Compress PDFs before uploading
3. Add loading indicator (already implemented)

---

## Environment Variables Check

### Required in `.env` and `.env.production`:
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=dp8bfdbab
REACT_APP_CLOUDINARY_UPLOAD_PRESET=mentneo_uploads
```

### Required in Vercel:
1. Go to: https://vercel.com/dashboard
2. Select project: `new-version-mentlearn`
3. Go to: **Settings** → **Environment Variables**
4. Verify these exist:
   - `REACT_APP_CLOUDINARY_CLOUD_NAME` = `dp8bfdbab`
   - `REACT_APP_CLOUDINARY_UPLOAD_PRESET` = `mentneo_uploads`
5. If missing, add them and redeploy

---

## Files Modified in This Fix

### 1. `/src/pages/creator/Courses.js`
- ✅ Added `import { cloudinaryConfig }` 
- ✅ Updated `uploadCurriculumToCloudinary()` to use env config
- ✅ Updated `uploadFileToCloudinary()` to use env config
- ✅ Added resource type detection (image vs raw)

### 2. `/src/pages/admin/ManageCourses.js`
- ✅ Added `import { cloudinaryConfig }`
- ✅ Updated `uploadCurriculumToCloudinary()` to use env config
- ✅ Updated `uploadFileToCloudinary()` to use env config
- ✅ Added resource type detection (image vs raw)

### 3. `/src/pages/student/LearnIQCourseView.js`
- ✅ Completely rewrote Resources tab
- ✅ Added assignments section with download buttons
- ✅ Added resources section with open buttons
- ✅ Added empty states for both sections
- ✅ Added metadata display (filename, date, file type)
- ✅ Added proper styling and animations

### 4. `/CLOUDINARY-SETUP-GUIDE.md` (NEW)
- ✅ Complete setup instructions
- ✅ Troubleshooting guide
- ✅ Alternative solutions

### 5. `/src/pages/admin/Payments.js`
- ✅ Removed unused import `FaFilter`

---

## Current Status

### ✅ Completed:
- [x] Fixed Cloudinary configuration in creator page
- [x] Fixed Cloudinary configuration in admin page
- [x] Added full resources display for students
- [x] Added assignments display for students
- [x] Added download/open functionality
- [x] Created setup guides

### ⚠️ Pending Action (REQUIRED):
- [ ] Create upload preset in Cloudinary dashboard
- [ ] Test file upload as creator/admin
- [ ] Test file download/open as student
- [ ] Verify on production (Vercel deployment)

---

## Next Steps

1. **IMMEDIATE:** Create the upload preset in Cloudinary
   - Follow steps in "Missing Upload Preset" section above
   - This is REQUIRED for uploads to work

2. **Test Locally:**
   - Upload test assignment as creator
   - View as student
   - Verify download works

3. **Deploy to Production:**
   ```bash
   git add -A
   git commit -m "Fix assignments & resources upload and display"
   git push origin main
   ```
   - Vercel will auto-deploy
   - Test on www.mentlearn.in

4. **Verify Environment:**
   - Check Vercel has correct env vars
   - Test uploads on production

---

## Support

If issues persist after creating the upload preset:

1. Check browser console for errors
2. Check Cloudinary dashboard for failed uploads
3. Verify environment variables match exactly
4. Check Firestore to see if URLs are being saved
5. Test with different file types (PDF, image, etc.)

---

**Last Updated:** December 13, 2025  
**Status:** ⚠️ Code fixed, awaiting Cloudinary preset creation  
**Priority:** HIGH - Blocking creator/student functionality
