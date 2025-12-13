# Cloudinary Upload Setup Guide

## Problem
Getting "Unknown API key" error when uploading files (assignments, resources, PDFs)

**Error Message:**
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
Cloudinary error: Unknown API key
```

## Root Cause
The Cloudinary upload preset `mentneo_uploads` either:
- Doesn't exist in your Cloudinary account
- Isn't configured as "unsigned" mode
- The cloud name `dp8bfdbab` is incorrect

## Solution: Create Unsigned Upload Preset

### Step 1: Login to Cloudinary
1. Go to: https://console.cloudinary.com/
2. Login with your credentials

### Step 2: Navigate to Upload Settings
1. Click **Settings** (gear icon) in the top-right
2. Click **Upload** tab
3. Scroll down to **Upload presets** section

### Step 3: Create New Upload Preset
1. Click **Add upload preset** button
2. Configure the preset:

   **Preset name:** `mentneo_uploads`
   
   **Signing mode:** **Unsigned** ⚠️ (Very Important!)
   
   **Folder:** `mentneo` (optional, for organization)
   
   **Access mode:** Public Read
   
   **Unique filename:** ✅ Enable
   
   **Overwrite:** ❌ Disable
   
   **Invalidate:** ❌ Disable

3. Click **Save**

### Step 4: Verify Cloud Name
1. In Cloudinary dashboard, check your **Cloud name**
2. It should be displayed in the top-left corner
3. Update `.env.production` if different:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=mentneo_uploads
```

### Step 5: Test Upload
1. Restart your development server (if running locally)
2. Redeploy frontend on Vercel (for production)
3. Try uploading a file in the creator page
4. Should work without "Unknown API key" error

---

## Alternative: Use Different Cloud Account

If you prefer to use a different Cloudinary account, update these environment variables:

### In `.env` (local development):
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### In `.env.production` (production):
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### In Vercel Environment Variables:
1. Go to: https://vercel.com/dashboard
2. Select your project: `new-version-mentlearn`
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - `REACT_APP_CLOUDINARY_CLOUD_NAME` = your_cloud_name
   - `REACT_APP_CLOUDINARY_UPLOAD_PRESET` = your_preset_name
5. Click **Save**
6. Redeploy the project

---

## What We Fixed

### Before (Hardcoded - WRONG):
```javascript
// In creator/Courses.js and admin/ManageCourses.js
const response = await fetch(
  'https://api.cloudinary.com/v1_1/djoayskme/image/upload',  // ❌ Wrong cloud
  {
    method: 'POST',
    body: formData
  }
);
```

### After (Environment Variable - CORRECT):
```javascript
import { cloudinaryConfig } from '../../firebase/firebase.js';

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,  // ✅ Uses env var
  {
    method: 'POST',
    body: formData
  }
);
```

---

## Current Configuration

**Cloud Name:** `dp8bfdbab` (from environment)
**Upload Preset:** `mentneo_uploads` (from environment)

**Files Using Cloudinary:**
- ✅ `/src/pages/creator/Courses.js` - Assignments & Resources upload
- ✅ `/src/pages/admin/ManageCourses.js` - Assignments & Resources upload
- ✅ `/src/utils/cloudinary.js` - Profile image upload
- ✅ `/src/components/student/ProfileImageUpload.js` - Profile photos

---

## Verification

### Check if Upload Preset Exists:
```bash
curl "https://api.cloudinary.com/v1_1/dp8bfdbab/image/upload" \
  -F "file=@test.jpg" \
  -F "upload_preset=mentneo_uploads"
```

**Expected Response:**
- ✅ Success: Returns JSON with `secure_url`
- ❌ Error: `{"error":{"message":"Unknown API key"}}` - Preset doesn't exist or is signed

---

## Next Steps

1. **Immediate:** Create the upload preset in Cloudinary dashboard
2. **Verify:** Test file upload in creator page
3. **Monitor:** Check Cloudinary usage dashboard
4. **Optional:** Set up upload quotas to prevent abuse

---

## Support Resources

- **Cloudinary Docs:** https://cloudinary.com/documentation/upload_presets
- **Dashboard:** https://console.cloudinary.com/
- **Upload API:** https://cloudinary.com/documentation/upload_images

---

**Last Updated:** December 13, 2025
**Status:** ⚠️ Waiting for upload preset creation
