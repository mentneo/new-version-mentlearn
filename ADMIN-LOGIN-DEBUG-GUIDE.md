# Admin Login Debug Guide

## Issue Fixed
Admin users were being redirected to the student dashboard instead of the admin dashboard after login.

## Root Cause
The `GradientLogin.js` component (default login page at `/login`) was using `getUserRole()` function which might have been returning `null` or incorrect values, causing all users to default to the student dashboard.

## Solution Applied

### 1. Updated GradientLogin.js
✅ **Changed from**: Using `getUserRole()` helper function  
✅ **Changed to**: Directly querying Firestore `users` and `creators` collections (same as NewLoginPage.js)

**Key Changes:**
- Added direct Firestore queries to check user role
- Added comprehensive console logging for debugging
- Added support for `mentor` role (was missing)
- Fixed student dashboard redirect path from `/student-dashboard` to `/student/student-dashboard`

### 2. Added Console Logging
Added detailed logging in both login pages to help debug:

#### In GradientLogin.js:
```
🔐 GradientLogin: Login successful for user: {uid}
👤 GradientLogin: User found in users collection. Role: {role}
📄 GradientLogin: Full user data: {...}
🚀 GradientLogin: Redirecting user with role: {role}
➡️ GradientLogin: Redirecting to {path}
```

#### In NewLoginPage.js:
```
🔐 Login successful for user: {uid}
👤 User found in users collection. Role: {role}
📄 Full user data: {...}
🚀 Redirecting user with role: {role}
➡️ Redirecting to {path}
```

#### In App.js AdminRoute:
```
🛡️ AdminRoute check: { userRole, loading, currentUserExists }
⏳ AdminRoute: Still loading authentication...
❌ AdminRoute: Access denied. User role is: {role} (expected: admin)
✅ AdminRoute: Access granted for admin
```

## Testing Instructions

### Step 1: Check User Role in Firestore
Before testing login, verify the admin user has the correct role in Firestore:

1. Open Firebase Console → Firestore Database
2. Go to `users` collection
3. Find your admin user document (by UID or email)
4. Verify it has: `role: "admin"`

**Example Document:**
```json
{
  "uid": "abc123...",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",  // ⬅️ THIS MUST BE "admin"
  "createdAt": "...",
  // ... other fields
}
```

### Step 2: Test Admin Login
1. Open the app in your browser
2. Go to `/login` (GradientLogin page)
3. Open browser DevTools → Console tab
4. Enter admin credentials and click login
5. Watch the console for log messages

**Expected Console Output:**
```
🔐 GradientLogin: Login successful for user: abc123...
👤 GradientLogin: User found in users collection. Role: admin
📄 GradientLogin: Full user data: { uid: "abc123...", email: "admin@...", role: "admin", ... }
🚀 GradientLogin: Redirecting user with role: admin
➡️ GradientLogin: Redirecting to /admin/dashboard
🛡️ AdminRoute check: { userRole: "admin", loading: false, currentUserExists: true }
✅ AdminRoute: Access granted for admin
```

**If you see this instead:**
```
👤 GradientLogin: User found in users collection. Role: student
```
**Action**: The user's role in Firestore is incorrect. Update it to `"admin"` in Firebase Console.

**If you see this:**
```
⚠️ GradientLogin: User NOT found in users collection, checking creators...
❌ GradientLogin: User NOT found in creators collection either
```
**Action**: The user document doesn't exist. Create one in Firestore with `role: "admin"`.

### Step 3: Test Role-Based Redirects
Test with different user roles:

#### Admin User
- **Login** → Should redirect to `/admin/dashboard`
- **Try to access** `/mentor/dashboard` → Should redirect to `/unauthorized`

#### Mentor User  
- **Login** → Should redirect to `/mentor/dashboard`
- **Try to access** `/admin/dashboard` → Should redirect to `/unauthorized`

#### Creator User
- **Login** → Should redirect to `/creator/dashboard`
- **Try to access** `/admin/dashboard` → Should redirect to `/unauthorized`

#### Student User
- **Login** → Should redirect to `/student/student-dashboard`
- **Try to access** `/admin/dashboard` → Should redirect to `/unauthorized`

## Common Issues & Solutions

### Issue 1: Still redirecting to student page
**Symptoms:** Admin user logs in but goes to student dashboard  
**Console shows:** `Role: student` instead of `Role: admin`

**Solution:**
1. Go to Firebase Console → Firestore
2. Find the user document in `users` collection
3. Edit the document and set `role` field to `"admin"` (exact string, lowercase)
4. Save changes
5. Log out and log in again

### Issue 2: "Unauthorized" page after login
**Symptoms:** Admin logs in, sees unauthorized page  
**Console shows:** `AdminRoute: Access denied. User role is: null`

**Solution:**
This means the role hasn't loaded yet. Two possible fixes:

**Option A:** Wait and refresh
- The role might still be loading
- Refresh the page after a few seconds
- Check console for any Firestore errors

**Option B:** Clear cache
```bash
# In browser DevTools → Application → Clear storage
# Or in browser settings → Clear browsing data
```

### Issue 3: User document doesn't exist
**Symptoms:** Login successful but gets error or defaults to student  
**Console shows:** `User NOT found in users collection` and `User NOT found in creators collection`

**Solution:**
Create a user document manually in Firestore:

1. Go to Firebase Console → Firestore
2. Go to `users` collection
3. Click "Add document"
4. Set Document ID to the user's UID (from Firebase Authentication)
5. Add fields:
```
email: "admin@example.com"
name: "Admin User"
role: "admin"
createdAt: {current timestamp}
onboardingComplete: true
```
6. Save
7. Log out and log in again

### Issue 4: Multiple login pages
**Current login pages:**
- `/login` → GradientLogin (default) ✅ **NOW FIXED**
- `/new-login` → NewLoginPage ✅ Already working
- `/modern-login` → ModernLogin
- `/login-old` → Old Login

**Recommendation:** Use `/login` (GradientLogin) as it's the most polished UI.

## Quick Diagnostic Script

Run this command to check all users and their roles:
```bash
node scripts/test-role-routing.js
```

This will show:
- All users in the `users` collection with their roles
- All users in the `creators` collection
- Any users without roles assigned
- Summary statistics

## Files Modified

### 1. `/src/pages/GradientLogin.js`
- ✅ Updated login logic to directly query Firestore
- ✅ Added comprehensive console logging
- ✅ Added support for all roles (admin, mentor, creator, student, data_analyst)
- ✅ Fixed student dashboard redirect path
- ✅ Added Firestore imports (`doc`, `getDoc`, `db`)

### 2. `/src/pages/NewLoginPage.js`
- ✅ Added comprehensive console logging
- ✅ Already had correct Firestore query logic

### 3. `/src/App.js`
- ✅ Added console logging to `AdminRoute` component
- ✅ Already had proper route protection

## Verification Checklist

Before marking this as complete, verify:

- [ ] Admin user has `role: "admin"` in Firestore `users` collection
- [ ] Admin can log in via `/login` page
- [ ] Console shows correct role detection logs
- [ ] Admin is redirected to `/admin/dashboard`
- [ ] Admin dashboard displays correctly
- [ ] Admin cannot access `/mentor/dashboard` (should redirect to `/unauthorized`)
- [ ] Other roles (mentor, creator, student) redirect correctly
- [ ] No console errors during login process

## Next Steps

1. **Test with real admin account** - Try logging in and check console
2. **Verify Firestore roles** - Run `node scripts/test-role-routing.js`
3. **Test all role types** - Verify each role redirects correctly
4. **Remove debug logs (optional)** - Once working, you can remove console.log statements

## Support

If the issue persists after following this guide:

1. Check browser console for exact error messages
2. Verify Firebase Firestore security rules allow reading user documents
3. Verify the admin user exists in Firebase Authentication
4. Run the diagnostic script: `node scripts/test-role-routing.js`
5. Check that no other code is intercepting the redirect

---

**Status:** ✅ FIXED - Ready for testing
**Last Updated:** October 19, 2025
