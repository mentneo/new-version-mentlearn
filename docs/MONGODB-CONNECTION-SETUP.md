# 🔧 MongoDB Connection Setup Guide

## Current Issue

Your MongoDB Atlas cluster requires IP whitelisting. Here are your options:

## Option 1: Whitelist Your IP Address (Recommended)

### Steps:

1. **Get Your Current IP Address:**
   ```bash
   curl ifconfig.me
   ```
   Or visit: https://www.whatismyip.com/

2. **Login to MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com/
   - Login with your credentials

3. **Add IP to Whitelist:**
   - Click on "Network Access" in left sidebar
   - Click "Add IP Address"
   - Enter your current IP or use "Add Current IP Address"
   - Or use `0.0.0.0/0` for any IP (⚠️ less secure, only for development)

4. **Save Changes**

5. **Wait 2-3 minutes** for changes to propagate

6. **Re-run Migration:**
   ```bash
   node scripts/migrate-mongodb-to-firestore.js --dry-run --limit=5
   ```

## Option 2: Use Local MongoDB

If you have MongoDB installed locally:

### Steps:

1. **Start Local MongoDB:**
   ```bash
   mongod --dbpath /path/to/your/data
   ```

2. **Update .env File:**
   ```
   MONGODB_URI=mongodb://localhost:27017/mentneo
   ```

3. **Re-run Migration:**
   ```bash
   node scripts/migrate-mongodb-to-firestore.js --dry-run
   ```

## Option 3: Check Your Current MongoDB Data

If you're not sure what's in your MongoDB, let's check:

### Check MongoDB Collections:

1. **Using MongoDB Compass:**
   - Download: https://www.mongodb.com/products/compass
   - Connect using your MONGODB_URI
   - Browse collections visually

2. **Using Mongo Shell:**
   ```bash
   mongo "your-connection-string"
   
   # List databases
   show dbs
   
   # Use your database
   use mentneo
   
   # List collections
   show collections
   
   # Count documents in each collection
   db.users.count()
   db.courses.count()
   db.students.count()
   db.activities.count()
   db.userprogresses.count()
   db.transactions.count()
   ```

## Option 4: Export MongoDB Data First

If you can't connect directly, export the data first:

### Export All Collections:

```bash
# Export all data from MongoDB
mongodump --uri="your-mongodb-connection-string" --out=./mongodb-backup

# Then import to local MongoDB
mongorestore --uri="mongodb://localhost:27017/mentneo" ./mongodb-backup/mentneo
```

## Current MongoDB URI

Check your `.env` file for the current MongoDB connection string:

```bash
cat .env | grep MONGO
```

## Testing Connection

### Test MongoDB Connection:

```bash
# Create a simple test script
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

## Common MongoDB URI Formats

### MongoDB Atlas (Cloud):
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

### Local MongoDB:
```
mongodb://localhost:27017/mentneo
```

### MongoDB with Auth:
```
mongodb://username:password@localhost:27017/mentneo?authSource=admin
```

## Firestore Security Rules

Before migrating, ensure your Firestore rules allow writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary rule for migration - REMOVE after migration!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **IMPORTANT**: After migration, set proper security rules!

## Next Steps

1. ✅ Fix MongoDB connection (use Option 1 or 2 above)
2. ✅ Verify connection works
3. ✅ Run dry-run: `node scripts/migrate-mongodb-to-firestore.js --dry-run --limit=5`
4. ✅ Review what will be migrated
5. ✅ Run actual migration if everything looks good

## Need Help?

### Check Your Current Setup:

```bash
# Check if .env file exists
ls -la .env

# Check MongoDB URI (without showing password)
cat .env | grep MONGO | sed 's/:.*@/:****@/'

# Check if mongoose is installed
npm list mongoose

# Check if Firebase credentials exist
ls -la mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json
```

### Common Errors:

| Error | Solution |
|-------|----------|
| "Could not connect to any servers" | Whitelist your IP in MongoDB Atlas |
| "Authentication failed" | Check username/password in MONGODB_URI |
| "Cannot find module mongoose" | Run `npm install mongoose` |
| "Firebase service account not found" | Check service account JSON file exists |

---

**After fixing connection**, you can proceed with:

```bash
# Test with small dataset
node scripts/migrate-mongodb-to-firestore.js --dry-run --limit=5

# Full dry run
node scripts/migrate-mongodb-to-firestore.js --dry-run

# Actual migration (when ready)
node scripts/migrate-mongodb-to-firestore.js
```
