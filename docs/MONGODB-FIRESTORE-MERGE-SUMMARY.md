# 📊 MongoDB to Firestore Data Merge - Complete Guide

## ✅ What Has Been Created

### 1. Migration Script
**File:** `/scripts/migrate-mongodb-to-firestore.js`

**Features:**
- ✅ Migrates all MongoDB collections to Firestore
- ✅ Converts ObjectIds to strings automatically
- ✅ Converts dates to Firestore timestamps
- ✅ Handles batch processing (default: 100 docs/batch)
- ✅ Supports dry-run mode for preview
- ✅ Allows selective migration by collection
- ✅ Includes error handling and progress tracking
- ✅ Safe to re-run (uses merge strategy)

### 2. Documentation Files

**Main Guide:** `/docs/MONGODB-TO-FIRESTORE-MIGRATION.md`
- Complete migration instructions
- Command examples
- Troubleshooting guide
- Best practices
- Verification steps

**Connection Setup:** `/docs/MONGODB-CONNECTION-SETUP.md`
- MongoDB Atlas IP whitelisting guide
- Local MongoDB setup
- Connection troubleshooting
- URI format examples

## 🔄 Collections Migrated

| MongoDB Collection | → | Firestore Collection | Purpose |
|-------------------|---|---------------------|---------|
| `users` | → | `users` | User accounts (all roles) |
| `students` | → | `users` | Students (merged with role) |
| `courses` | → | `courses` | Course catalog |
| `activities` | → | `activity` | User activity logs |
| `userprogresses` | → | `progress` | Course progress tracking |
| `transactions` | → | `transactions` | Payment records |

## 🚀 Quick Start

### Step 1: Fix MongoDB Connection

**Current Issue:** MongoDB Atlas requires IP whitelisting

**Solution:**
1. Get your IP: `curl ifconfig.me`
2. Go to https://cloud.mongodb.com/
3. Click "Network Access" → "Add IP Address"
4. Add your current IP or use `0.0.0.0/0` for any IP
5. Wait 2-3 minutes

### Step 2: Preview Migration (Dry Run)

```bash
cd "/Users/yeduruabhiram/Desktop/mentneo /new-version-mentlearn"

# Preview with limit of 5 documents per collection
node scripts/migrate-mongodb-to-firestore.js --dry-run --limit=5

# Preview all data
node scripts/migrate-mongodb-to-firestore.js --dry-run
```

### Step 3: Run Actual Migration

```bash
# Migrate specific collection
node scripts/migrate-mongodb-to-firestore.js --collection=users

# Migrate all collections
node scripts/migrate-mongodb-to-firestore.js
```

## 📋 Pre-Migration Checklist

Before running the migration:

- [ ] MongoDB connection working
- [ ] Firebase service account JSON exists
- [ ] Firestore security rules allow writes (temporarily)
- [ ] Backup both MongoDB and Firestore
- [ ] Run dry-run to preview
- [ ] Test with small dataset first

## 🎯 Migration Workflow

### Recommended Approach:

```bash
# 1. Test connection
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"

# 2. Dry run with small dataset
node scripts/migrate-mongodb-to-firestore.js --dry-run --limit=5

# 3. Dry run full dataset
node scripts/migrate-mongodb-to-firestore.js --dry-run

# 4. Migrate users first
node scripts/migrate-mongodb-to-firestore.js --collection=users

# 5. Migrate courses
node scripts/migrate-mongodb-to-firestore.js --collection=courses

# 6. Migrate progress
node scripts/migrate-mongodb-to-firestore.js --collection=progress

# 7. Migrate remaining collections
node scripts/migrate-mongodb-to-firestore.js --collection=activities
node scripts/migrate-mongodb-to-firestore.js --collection=transactions
```

## 🔍 Verification

### After Migration:

1. **Check Firestore Console:**
   - Go to https://console.firebase.google.com/
   - Select your project
   - Navigate to Firestore Database
   - Verify collections exist

2. **Count Documents:**
   ```bash
   # Use browser console on your app
   const db = window.firebase.firestore.getFirestore();
   const { collection, getDocs } = window.firebase.firestore;
   
   // Count users
   const usersSnapshot = await getDocs(collection(db, 'users'));
   console.log('Users:', usersSnapshot.size);
   
   // Count courses
   const coursesSnapshot = await getDocs(collection(db, 'courses'));
   console.log('Courses:', coursesSnapshot.size);
   ```

3. **Test in Application:**
   - Login as different users
   - Check course data displays
   - Verify progress tracking works
   - Test enrollments

## 📊 Data Transformations

### What Gets Changed:

| MongoDB Field | → | Firestore Field | Transformation |
|--------------|---|-----------------|----------------|
| `_id` | → | `id` | ObjectId → string |
| `userId` (ObjectId) | → | `studentId` (string) | For progress |
| `overallProgress` | → | `percentComplete` | For progress |
| `createdAt` (Date) | → | `createdAt` (Timestamp) | All dates |
| `__v` | → | _(removed)_ | Mongoose version |

### What Gets Added:

- `migratedFrom`: 'mongodb'
- `migratedAt`: Firestore server timestamp

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Error

**Error:**
```
Could not connect to any servers in your MongoDB Atlas cluster
```

**Solution:**
- Whitelist your IP in MongoDB Atlas (see `/docs/MONGODB-CONNECTION-SETUP.md`)

### Issue 2: Module Not Found

**Error:**
```
Cannot find module 'mongoose'
```

**Solution:**
```bash
npm install mongoose
```

### Issue 3: Firebase Permission Denied

**Error:**
```
Error migrating: Permission denied
```

**Solution:**
- Update Firestore security rules to allow writes
- Ensure service account has correct permissions

### Issue 4: Empty Collections

**Error:**
```
⚠️  No users to migrate
```

**Solution:**
- Check if MongoDB collections actually have data
- Verify database name in connection string
- Use MongoDB Compass to inspect collections

## 📈 Expected Results

### Successful Migration Output:

```
================================================================================
📊 FINAL MIGRATION SUMMARY
================================================================================

USERS:
   ✅ Success: 150
   ❌ Errors: 0

STUDENTS:
   ✅ Success: 200
   ❌ Errors: 0

COURSES:
   ✅ Success: 45
   ❌ Errors: 0

ACTIVITIES:
   ✅ Success: 5420
   ❌ Errors: 0

PROGRESS:
   ✅ Success: 180
   ❌ Errors: 0

TRANSACTIONS:
   ✅ Success: 75
   ❌ Errors: 0

================================================================================
TOTAL: ✅ 6070 successful | ❌ 0 errors
================================================================================

✅ MIGRATION COMPLETE!
```

## 🔐 Security Considerations

### Before Migration:

1. **Temporarily Open Firestore Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

### After Migration:

2. **Restore Proper Security Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth.uid == userId || isAdmin();
       }
       // ... other collection rules
     }
   }
   ```

## 📂 Files Created

### Scripts:
- ✅ `/scripts/migrate-mongodb-to-firestore.js` - Main migration script

### Documentation:
- ✅ `/docs/MONGODB-TO-FIRESTORE-MIGRATION.md` - Complete guide
- ✅ `/docs/MONGODB-CONNECTION-SETUP.md` - Connection troubleshooting
- ✅ `/docs/MONGODB-FIRESTORE-MERGE-SUMMARY.md` - This file

## 🎓 What's Next

After successful migration:

1. **Keep MongoDB Running** (as backup for now)
2. **Test Application Thoroughly**
   - User login/authentication
   - Course browsing and enrollment
   - Progress tracking
   - All student features

3. **Monitor Firestore Usage**
   - Check Firebase Console for reads/writes
   - Ensure within free tier limits

4. **Update Application Code** (if needed)
   - Most code should work as-is
   - Verify all Firestore queries work

5. **Set Up Backups**
   - Enable Firestore automated backups
   - Export data regularly

6. **Optimize Firestore Rules**
   - Set proper security rules
   - Create indexes for common queries

## 📞 Need Help?

### Current Status:

- ✅ Migration script created
- ✅ Documentation complete
- ⚠️ MongoDB connection needs IP whitelisting
- ⏳ Ready to migrate after connection fix

### Next Steps:

1. Fix MongoDB Atlas IP whitelisting (see `/docs/MONGODB-CONNECTION-SETUP.md`)
2. Run dry-run to preview data
3. Proceed with migration

### Quick Commands:

```bash
# Check current MongoDB URI (hide password)
cat .env | grep MONGO | sed 's/:.*@/:****@/'

# Test MongoDB connection
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"

# Preview migration
node scripts/migrate-mongodb-to-firestore.js --dry-run --limit=5

# Run migration
node scripts/migrate-mongodb-to-firestore.js
```

---

**Last Updated:** October 19, 2024  
**Status:** Ready to migrate (after IP whitelisting)  
**Next Step:** Whitelist IP in MongoDB Atlas
