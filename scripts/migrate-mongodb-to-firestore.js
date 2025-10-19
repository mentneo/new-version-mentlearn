/**
 * MongoDB to Firestore Migration Script
 * 
 * This script migrates data from MongoDB to Firestore (Firebase)
 * 
 * Collections to migrate:
 * - users → users
 * - students → users (merged with role: 'student')
 * - courses → courses
 * - activities → activity
 * - userprogresses → progress
 * - transactions → transactions
 * 
 * Usage:
 * node scripts/migrate-mongodb-to-firestore.js [--dry-run] [--collection=users] [--limit=100]
 * 
 * Options:
 * --dry-run: Preview changes without writing to Firestore
 * --collection: Migrate specific collection only (users, students, courses, activities, progress, transactions)
 * --limit: Limit number of documents to migrate (for testing)
 * --batch: Batch size for migrations (default: 100)
 */

const path = require('path');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Parse command line arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value || true;
  });
  return args;
}

// Connect to MongoDB
async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI or MONGO_URI not found in environment variables');
    console.error('Please set one of these in your .env file');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Convert MongoDB ObjectId to string
function sanitizeDocument(doc) {
  const sanitized = JSON.parse(JSON.stringify(doc));
  
  // Convert _id to id
  if (sanitized._id) {
    sanitized.id = sanitized._id.toString();
    delete sanitized._id;
  }
  
  // Convert all ObjectId fields to strings
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] && typeof sanitized[key] === 'object') {
      if (sanitized[key].$oid || sanitized[key]._bsontype === 'ObjectID') {
        sanitized[key] = sanitized[key].toString();
      } else if (Array.isArray(sanitized[key])) {
        sanitized[key] = sanitized[key].map(item => 
          item && typeof item === 'object' && (item.$oid || item._bsontype === 'ObjectID')
            ? item.toString()
            : item
        );
      }
    }
  });
  
  // Convert Date objects to Firestore timestamps
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] instanceof Date) {
      sanitized[key] = admin.firestore.Timestamp.fromDate(sanitized[key]);
    } else if (sanitized[key] && typeof sanitized[key] === 'object' && sanitized[key].$date) {
      sanitized[key] = admin.firestore.Timestamp.fromDate(new Date(sanitized[key].$date));
    }
  });
  
  // Remove __v field from Mongoose
  delete sanitized.__v;
  
  return sanitized;
}

// Migrate Users collection
async function migrateUsers(options = {}) {
  const { dryRun, limit, batch = 100 } = options;
  
  console.log('\n' + '='.repeat(80));
  console.log('📚 MIGRATING USERS COLLECTION');
  console.log('='.repeat(80));
  
  try {
    // Get all users from MongoDB
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const query = User.find();
    
    if (limit) {
      query.limit(parseInt(limit));
    }
    
    const users = await query.lean();
    console.log(`\n✅ Found ${users.length} users in MongoDB`);
    
    if (users.length === 0) {
      console.log('⚠️  No users to migrate');
      return { success: 0, errors: 0 };
    }
    
    let success = 0;
    let errors = 0;
    
    // Process in batches
    for (let i = 0; i < users.length; i += batch) {
      const batchUsers = users.slice(i, i + batch);
      const batchPromises = [];
      
      for (const user of batchUsers) {
        const sanitized = sanitizeDocument(user);
        
        // Use email hash or MongoDB ID as Firestore document ID
        const docId = sanitized.id;
        
        // Add metadata
        sanitized.migratedFrom = 'mongodb';
        sanitized.migratedAt = admin.firestore.FieldValue.serverTimestamp();
        
        if (!dryRun) {
          batchPromises.push(
            db.collection('users').doc(docId).set(sanitized, { merge: true })
              .then(() => {
                success++;
                console.log(`   ✅ Migrated user: ${sanitized.email || sanitized.name || docId}`);
              })
              .catch(error => {
                errors++;
                console.error(`   ❌ Error migrating user ${docId}:`, error.message);
              })
          );
        } else {
          console.log(`   [DRY RUN] Would migrate user: ${sanitized.email || sanitized.name || docId}`);
          success++;
        }
      }
      
      if (!dryRun) {
        await Promise.all(batchPromises);
      }
    }
    
    console.log(`\n📊 Users Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${success}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    return { success, errors };
  } catch (error) {
    console.error('❌ Error migrating users:', error.message);
    return { success: 0, errors: 1 };
  }
}

// Migrate Students collection (merge into users with role: 'student')
async function migrateStudents(options = {}) {
  const { dryRun, limit, batch = 100 } = options;
  
  console.log('\n' + '='.repeat(80));
  console.log('📚 MIGRATING STUDENTS COLLECTION');
  console.log('='.repeat(80));
  
  try {
    const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
    const query = Student.find();
    
    if (limit) {
      query.limit(parseInt(limit));
    }
    
    const students = await query.lean();
    console.log(`\n✅ Found ${students.length} students in MongoDB`);
    
    if (students.length === 0) {
      console.log('⚠️  No students to migrate');
      return { success: 0, errors: 0 };
    }
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < students.length; i += batch) {
      const batchStudents = students.slice(i, i + batch);
      const batchPromises = [];
      
      for (const student of batchStudents) {
        const sanitized = sanitizeDocument(student);
        const docId = sanitized.id;
        
        // Ensure role is set to student
        sanitized.role = 'student';
        sanitized.migratedFrom = 'mongodb-students';
        sanitized.migratedAt = admin.firestore.FieldValue.serverTimestamp();
        
        if (!dryRun) {
          batchPromises.push(
            db.collection('users').doc(docId).set(sanitized, { merge: true })
              .then(() => {
                success++;
                console.log(`   ✅ Migrated student: ${sanitized.email || sanitized.name || docId}`);
              })
              .catch(error => {
                errors++;
                console.error(`   ❌ Error migrating student ${docId}:`, error.message);
              })
          );
        } else {
          console.log(`   [DRY RUN] Would migrate student: ${sanitized.email || sanitized.name || docId}`);
          success++;
        }
      }
      
      if (!dryRun) {
        await Promise.all(batchPromises);
      }
    }
    
    console.log(`\n📊 Students Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${success}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    return { success, errors };
  } catch (error) {
    console.error('❌ Error migrating students:', error.message);
    return { success: 0, errors: 1 };
  }
}

// Migrate Courses collection
async function migrateCourses(options = {}) {
  const { dryRun, limit, batch = 100 } = options;
  
  console.log('\n' + '='.repeat(80));
  console.log('📚 MIGRATING COURSES COLLECTION');
  console.log('='.repeat(80));
  
  try {
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
    const query = Course.find();
    
    if (limit) {
      query.limit(parseInt(limit));
    }
    
    const courses = await query.lean();
    console.log(`\n✅ Found ${courses.length} courses in MongoDB`);
    
    if (courses.length === 0) {
      console.log('⚠️  No courses to migrate');
      return { success: 0, errors: 0 };
    }
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < courses.length; i += batch) {
      const batchCourses = courses.slice(i, i + batch);
      const batchPromises = [];
      
      for (const course of batchCourses) {
        const sanitized = sanitizeDocument(course);
        const docId = sanitized.id;
        
        sanitized.migratedFrom = 'mongodb';
        sanitized.migratedAt = admin.firestore.FieldValue.serverTimestamp();
        
        if (!dryRun) {
          batchPromises.push(
            db.collection('courses').doc(docId).set(sanitized, { merge: true })
              .then(() => {
                success++;
                console.log(`   ✅ Migrated course: ${sanitized.title || docId}`);
              })
              .catch(error => {
                errors++;
                console.error(`   ❌ Error migrating course ${docId}:`, error.message);
              })
          );
        } else {
          console.log(`   [DRY RUN] Would migrate course: ${sanitized.title || docId}`);
          success++;
        }
      }
      
      if (!dryRun) {
        await Promise.all(batchPromises);
      }
    }
    
    console.log(`\n📊 Courses Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${success}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    return { success, errors };
  } catch (error) {
    console.error('❌ Error migrating courses:', error.message);
    return { success: 0, errors: 1 };
  }
}

// Migrate Activities collection
async function migrateActivities(options = {}) {
  const { dryRun, limit, batch = 100 } = options;
  
  console.log('\n' + '='.repeat(80));
  console.log('📚 MIGRATING ACTIVITIES COLLECTION');
  console.log('='.repeat(80));
  
  try {
    const Activity = mongoose.model('Activity', new mongoose.Schema({}, { strict: false }));
    const query = Activity.find();
    
    if (limit) {
      query.limit(parseInt(limit));
    }
    
    const activities = await query.lean();
    console.log(`\n✅ Found ${activities.length} activities in MongoDB`);
    
    if (activities.length === 0) {
      console.log('⚠️  No activities to migrate');
      return { success: 0, errors: 0 };
    }
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < activities.length; i += batch) {
      const batchActivities = activities.slice(i, i + batch);
      const batchPromises = [];
      
      for (const activity of batchActivities) {
        const sanitized = sanitizeDocument(activity);
        const docId = sanitized.id;
        
        sanitized.migratedFrom = 'mongodb';
        sanitized.migratedAt = admin.firestore.FieldValue.serverTimestamp();
        
        if (!dryRun) {
          batchPromises.push(
            db.collection('activity').doc(docId).set(sanitized, { merge: true })
              .then(() => {
                success++;
                console.log(`   ✅ Migrated activity: ${sanitized.activityType || docId}`);
              })
              .catch(error => {
                errors++;
                console.error(`   ❌ Error migrating activity ${docId}:`, error.message);
              })
          );
        } else {
          console.log(`   [DRY RUN] Would migrate activity: ${sanitized.activityType || docId}`);
          success++;
        }
      }
      
      if (!dryRun) {
        await Promise.all(batchPromises);
      }
    }
    
    console.log(`\n📊 Activities Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${success}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    return { success, errors };
  } catch (error) {
    console.error('❌ Error migrating activities:', error.message);
    return { success: 0, errors: 1 };
  }
}

// Migrate UserProgress collection
async function migrateProgress(options = {}) {
  const { dryRun, limit, batch = 100 } = options;
  
  console.log('\n' + '='.repeat(80));
  console.log('📚 MIGRATING USER PROGRESS COLLECTION');
  console.log('='.repeat(80));
  
  try {
    const UserProgress = mongoose.model('UserProgress', new mongoose.Schema({}, { strict: false }));
    const query = UserProgress.find();
    
    if (limit) {
      query.limit(parseInt(limit));
    }
    
    const progressRecords = await query.lean();
    console.log(`\n✅ Found ${progressRecords.length} progress records in MongoDB`);
    
    if (progressRecords.length === 0) {
      console.log('⚠️  No progress records to migrate');
      return { success: 0, errors: 0 };
    }
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < progressRecords.length; i += batch) {
      const batchProgress = progressRecords.slice(i, i + batch);
      const batchPromises = [];
      
      for (const progress of batchProgress) {
        const sanitized = sanitizeDocument(progress);
        const docId = sanitized.id;
        
        // Map fields to Firestore schema
        const firestoreProgress = {
          studentId: sanitized.userId?.toString() || sanitized.studentId,
          courseId: sanitized.courseId?.toString(),
          percentComplete: sanitized.overallProgress || 0,
          completedLessons: sanitized.modules?.reduce((sum, m) => sum + (m.completedLessons || 0), 0) || 0,
          totalLessons: sanitized.modules?.reduce((sum, m) => sum + (m.totalLessons || 0), 0) || 0,
          enrollmentDate: sanitized.enrollmentDate,
          lastAccessDate: sanitized.lastAccessDate,
          completionDate: sanitized.completionDate,
          modules: sanitized.modules || [],
          migratedFrom: 'mongodb',
          migratedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        if (!dryRun) {
          batchPromises.push(
            db.collection('progress').doc(docId).set(firestoreProgress, { merge: true })
              .then(() => {
                success++;
                console.log(`   ✅ Migrated progress: ${firestoreProgress.studentId}`);
              })
              .catch(error => {
                errors++;
                console.error(`   ❌ Error migrating progress ${docId}:`, error.message);
              })
          );
        } else {
          console.log(`   [DRY RUN] Would migrate progress: ${firestoreProgress.studentId}`);
          success++;
        }
      }
      
      if (!dryRun) {
        await Promise.all(batchPromises);
      }
    }
    
    console.log(`\n📊 Progress Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${success}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    return { success, errors };
  } catch (error) {
    console.error('❌ Error migrating progress:', error.message);
    return { success: 0, errors: 1 };
  }
}

// Migrate Transactions collection
async function migrateTransactions(options = {}) {
  const { dryRun, limit, batch = 100 } = options;
  
  console.log('\n' + '='.repeat(80));
  console.log('📚 MIGRATING TRANSACTIONS COLLECTION');
  console.log('='.repeat(80));
  
  try {
    const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
    const query = Transaction.find();
    
    if (limit) {
      query.limit(parseInt(limit));
    }
    
    const transactions = await query.lean();
    console.log(`\n✅ Found ${transactions.length} transactions in MongoDB`);
    
    if (transactions.length === 0) {
      console.log('⚠️  No transactions to migrate');
      return { success: 0, errors: 0 };
    }
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < transactions.length; i += batch) {
      const batchTransactions = transactions.slice(i, i + batch);
      const batchPromises = [];
      
      for (const transaction of batchTransactions) {
        const sanitized = sanitizeDocument(transaction);
        const docId = sanitized.id;
        
        sanitized.migratedFrom = 'mongodb';
        sanitized.migratedAt = admin.firestore.FieldValue.serverTimestamp();
        
        if (!dryRun) {
          batchPromises.push(
            db.collection('transactions').doc(docId).set(sanitized, { merge: true })
              .then(() => {
                success++;
                console.log(`   ✅ Migrated transaction: ${sanitized.transactionType || docId}`);
              })
              .catch(error => {
                errors++;
                console.error(`   ❌ Error migrating transaction ${docId}:`, error.message);
              })
          );
        } else {
          console.log(`   [DRY RUN] Would migrate transaction: ${sanitized.transactionType || docId}`);
          success++;
        }
      }
      
      if (!dryRun) {
        await Promise.all(batchPromises);
      }
    }
    
    console.log(`\n📊 Transactions Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${success}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    return { success, errors };
  } catch (error) {
    console.error('❌ Error migrating transactions:', error.message);
    return { success, errors: 1 };
  }
}

// Main migration function
async function main() {
  const args = parseArgs();
  const dryRun = args['dry-run'] || false;
  const collection = args.collection;
  const limit = args.limit;
  const batch = args.batch || 100;
  
  console.log('\n' + '='.repeat(80));
  console.log('🔄 MONGODB TO FIRESTORE MIGRATION');
  console.log('='.repeat(80));
  console.log(`\n⚙️  Configuration:`);
  console.log(`   Mode: ${dryRun ? '🔍 DRY RUN (no changes will be made)' : '✍️  LIVE MIGRATION'}`);
  console.log(`   Collection: ${collection || 'ALL'}`);
  console.log(`   Limit: ${limit || 'None'}`);
  console.log(`   Batch Size: ${batch}`);
  
  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made to Firestore');
  } else {
    console.log('\n⚠️  LIVE MIGRATION - Changes will be written to Firestore');
    console.log('   Press Ctrl+C within 5 seconds to cancel...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    const options = { dryRun, limit, batch };
    const results = {};
    
    // Migrate based on collection parameter
    if (!collection || collection === 'users') {
      results.users = await migrateUsers(options);
    }
    
    if (!collection || collection === 'students') {
      results.students = await migrateStudents(options);
    }
    
    if (!collection || collection === 'courses') {
      results.courses = await migrateCourses(options);
    }
    
    if (!collection || collection === 'activities') {
      results.activities = await migrateActivities(options);
    }
    
    if (!collection || collection === 'progress') {
      results.progress = await migrateProgress(options);
    }
    
    if (!collection || collection === 'transactions') {
      results.transactions = await migrateTransactions(options);
    }
    
    // Print final summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL MIGRATION SUMMARY');
    console.log('='.repeat(80));
    
    let totalSuccess = 0;
    let totalErrors = 0;
    
    Object.entries(results).forEach(([name, result]) => {
      console.log(`\n${name.toUpperCase()}:`);
      console.log(`   ✅ Success: ${result.success}`);
      console.log(`   ❌ Errors: ${result.errors}`);
      totalSuccess += result.success;
      totalErrors += result.errors;
    });
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`TOTAL: ✅ ${totalSuccess} successful | ❌ ${totalErrors} errors`);
    console.log('='.repeat(80));
    
    if (dryRun) {
      console.log('\n✅ DRY RUN COMPLETE - No changes were made');
      console.log('   Run without --dry-run to perform actual migration');
    } else {
      console.log('\n✅ MIGRATION COMPLETE!');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
main();
