# 🔄 MongoDB to Firestore Migration Guide

## Overview

This guide explains how to migrate your data from MongoDB to Firestore (Firebase) using the automated migration script.

## 📋 Prerequisites

Before running the migration:

1. **MongoDB Connection**
   - Ensure `MONGODB_URI` or `MONGO_URI` is set in your `.env` file
   - Verify MongoDB is accessible and contains data

2. **Firebase Admin SDK**
   - Firebase service account JSON file must be present
   - Location: `/mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json`

3. **Backup Your Data**
   - ⚠️ **IMPORTANT**: Backup both MongoDB and Firestore before migrating
   - MongoDB: `mongodump --uri="your-connection-string"`
   - Firestore: Use Firebase Console export feature

## 🗂️ Collections to Migrate

The script migrates these MongoDB collections to Firestore:

| MongoDB Collection | Firestore Collection | Description |
|-------------------|---------------------|-------------|
| `users` | `users` | User accounts (admin, mentor, student) |
| `students` | `users` | Students (merged with role: 'student') |
| `courses` | `courses` | Course catalog and details |
| `activities` | `activity` | User activity tracking |
| `userprogresses` | `progress` | Course progress and completion |
| `transactions` | `transactions` | Payment and enrollment transactions |

## 🚀 How to Use

### Step 1: Dry Run (Preview Changes)

First, run a dry run to see what will be migrated WITHOUT making changes:

```bash
cd "/Users/yeduruabhiram/Desktop/mentneo /new-version-mentlearn"
node scripts/migrate-mongodb-to-firestore.js --dry-run
```

**What this does:**
- ✅ Connects to MongoDB
- ✅ Reads all collections
- ✅ Shows what would be migrated
- ✅ Displays summary statistics
- ❌ Does NOT write to Firestore

### Step 2: Test with Limited Data

Test migration with a small dataset:

```bash
# Migrate only 10 users
node scripts/migrate-mongodb-to-firestore.js --dry-run --collection=users --limit=10

# Migrate only courses, limited to 5
node scripts/migrate-mongodb-to-firestore.js --dry-run --collection=courses --limit=5
```

### Step 3: Migrate Specific Collection

Migrate one collection at a time:

```bash
# Migrate users only (LIVE - writes to Firestore)
node scripts/migrate-mongodb-to-firestore.js --collection=users

# Migrate courses only
node scripts/migrate-mongodb-to-firestore.js --collection=courses

# Migrate progress only
node scripts/migrate-mongodb-to-firestore.js --collection=progress
```

### Step 4: Full Migration

Migrate all collections:

```bash
# Full migration (LIVE - writes to Firestore)
node scripts/migrate-mongodb-to-firestore.js
```

**⚠️ WARNING**: This will write to Firestore. Make sure you've tested with dry-run first!

## 📊 Command Options

### Available Flags:

| Flag | Description | Example |
|------|-------------|---------|
| `--dry-run` | Preview only, no writes | `--dry-run` |
| `--collection=NAME` | Migrate specific collection | `--collection=users` |
| `--limit=N` | Limit documents to migrate | `--limit=100` |
| `--batch=N` | Batch size (default: 100) | `--batch=50` |

### Collection Names:

- `users` - User accounts
- `students` - Student profiles
- `courses` - Course data
- `activities` - Activity logs
- `progress` - User progress
- `transactions` - Payment transactions

## 📝 Examples

### Example 1: Preview All Data

```bash
node scripts/migrate-mongodb-to-firestore.js --dry-run
```

**Output:**
```
🔄 MONGODB TO FIRESTORE MIGRATION
================================================================================
⚙️  Configuration:
   Mode: 🔍 DRY RUN (no changes will be made)
   Collection: ALL
   Limit: None
   Batch Size: 100

✅ Connected to MongoDB
   Database: mentneo

================================================================================
📚 MIGRATING USERS COLLECTION
================================================================================
✅ Found 150 users in MongoDB
   [DRY RUN] Would migrate user: john@example.com
   [DRY RUN] Would migrate user: jane@example.com
   ...

📊 Users Migration Summary:
   ✅ Successfully migrated: 150
   ❌ Errors: 0
```

### Example 2: Migrate Users Only

```bash
node scripts/migrate-mongodb-to-firestore.js --collection=users
```

### Example 3: Test with Small Dataset

```bash
node scripts/migrate-mongodb-to-firestore.js --dry-run --limit=5
```

## 🔍 What Gets Migrated

### Data Transformations

The script automatically:

1. **Converts ObjectIds to Strings**
   - MongoDB `_id` → Firestore document ID
   - All ObjectId references → strings

2. **Converts Dates to Timestamps**
   - MongoDB Date objects → Firestore Timestamps
   - Preserves timezone information

3. **Removes Mongoose Fields**
   - Removes `__v` version field
   - Cleans up internal Mongoose data

4. **Adds Migration Metadata**
   - `migratedFrom`: 'mongodb'
   - `migratedAt`: Server timestamp

### Field Mapping

#### Users & Students
```javascript
// MongoDB → Firestore
{
  _id: ObjectId → id: string
  name: string → name: string
  email: string → email: string
  role: string → role: string
  createdAt: Date → createdAt: Timestamp
  // ... other fields preserved
  migratedFrom: 'mongodb' // Added
  migratedAt: Timestamp   // Added
}
```

#### Progress Records
```javascript
// MongoDB UserProgress → Firestore progress
{
  userId: ObjectId → studentId: string
  courseId: ObjectId → courseId: string
  overallProgress: number → percentComplete: number
  modules: [...] → modules: [...]
  enrollmentDate: Date → enrollmentDate: Timestamp
  // ... other fields mapped
}
```

## ✅ Verification Steps

### After Migration:

1. **Check Firestore Console**
   - Go to Firebase Console
   - Navigate to Firestore Database
   - Verify collections exist
   - Check document counts

2. **Run Verification Script**
   ```bash
   # Count documents in Firestore
   node scripts/observe-user-progress.js
   ```

3. **Test in Application**
   - Login as different users
   - Check if data displays correctly
   - Verify course enrollments
   - Test progress tracking

4. **Compare Counts**
   ```bash
   # MongoDB counts
   mongo your-connection-string --eval "db.users.count()"
   
   # Should match Firestore counts in console
   ```

## 🐛 Troubleshooting

### Issue 1: "MONGODB_URI not found"

**Error:**
```
❌ MONGODB_URI or MONGO_URI not found in environment variables
```

**Solution:**
1. Check your `.env` file exists in project root
2. Add one of these lines:
   ```
   MONGODB_URI=mongodb://localhost:27017/mentneo
   # OR
   MONGO_URI=mongodb://localhost:27017/mentneo
   ```
3. Make sure the connection string is correct

### Issue 2: "Firebase Admin initialization failed"

**Error:**
```
❌ Could not load Firebase service account
```

**Solution:**
1. Verify file exists: `/mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json`
2. Check file has valid JSON
3. Ensure file has correct permissions

### Issue 3: "Collection not found in MongoDB"

**Error:**
```
⚠️  No users to migrate
```

**Solution:**
1. Check MongoDB database name is correct
2. Verify collection exists: `db.getCollectionNames()`
3. Check connection string points to correct database

### Issue 4: Migration Errors

**Error:**
```
❌ Error migrating user xyz: Permission denied
```

**Solution:**
1. Check Firestore Security Rules allow writes
2. Verify Firebase service account has permissions
3. Check for invalid data in MongoDB documents

## 📈 Best Practices

### 1. Always Start with Dry Run

```bash
# First, preview
node scripts/migrate-mongodb-to-firestore.js --dry-run

# Then, migrate small batch
node scripts/migrate-mongodb-to-firestore.js --limit=10

# Finally, full migration
node scripts/migrate-mongodb-to-firestore.js
```

### 2. Migrate in Stages

```bash
# Stage 1: Users
node scripts/migrate-mongodb-to-firestore.js --collection=users

# Stage 2: Courses
node scripts/migrate-mongodb-to-firestore.js --collection=courses

# Stage 3: Progress
node scripts/migrate-mongodb-to-firestore.js --collection=progress

# ... continue for each collection
```

### 3. Monitor Progress

- Watch console output for errors
- Check Firestore usage metrics
- Verify data integrity after each stage

### 4. Handle Errors

- Note document IDs that fail
- Review error messages
- Fix source data if needed
- Re-run migration for failed docs

## 🔄 Re-running Migration

The script uses `set(..., { merge: true })`, which means:

- ✅ Safe to re-run multiple times
- ✅ Updates existing documents
- ✅ Adds new documents
- ✅ Preserves existing Firestore-only fields

**To re-migrate specific users:**
```bash
node scripts/migrate-mongodb-to-firestore.js --collection=users --limit=100
```

## 📊 Expected Output

### Successful Migration:

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
✅ Disconnected from MongoDB
```

## 🎯 Post-Migration Checklist

After successful migration:

- [ ] Verify Firestore collections exist
- [ ] Check document counts match MongoDB
- [ ] Test user login and authentication
- [ ] Verify course data displays correctly
- [ ] Check user progress tracking works
- [ ] Test enrollments and transactions
- [ ] Review Firestore security rules
- [ ] Update application to use Firestore
- [ ] Monitor for any errors in production
- [ ] Keep MongoDB as backup (don't delete yet)

## 📞 Support

If you encounter issues:

1. Check troubleshooting section above
2. Review console error messages
3. Check MongoDB and Firestore console
4. Verify connection strings and credentials
5. Run dry-run to identify issues

## 🔐 Security Notes

- ⚠️ Service account JSON contains sensitive credentials
- ✅ Never commit service account to git
- ✅ Add to `.gitignore`
- ✅ Rotate credentials if exposed
- ✅ Use environment variables in production

---

**Last Updated:** October 19, 2024  
**Version:** 1.0  
**Script:** `/scripts/migrate-mongodb-to-firestore.js`
