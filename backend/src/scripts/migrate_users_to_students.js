#!/usr/bin/env node
/*
  migrate_users_to_students.js
  Usage:
    node migrate_users_to_students.js --dry-run
    node migrate_users_to_students.js --source=mentneo_db --target=mentneo --collection=users --batch=200 --limit=1000

  The script reads from a source DB/collection and upserts mapped documents into the target DB students collection.
*/

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env') });

const mongoose = require('mongoose');

function parseArgs() {
  const out = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [k, v] = arg.slice(2).split('=');
      out[k] = v === undefined ? true : v;
    }
  });
  return out;
}

function mapUserToStudent(userDoc) {
  return {
    name: userDoc.name || userDoc.fullName || userDoc.displayName || userDoc.username || null,
    email: userDoc.email || userDoc.emailAddress || null,
    avatar: userDoc.avatar || userDoc.photoURL || null,
    bio: userDoc.bio || userDoc.profile || null,
    enrolledCourses: userDoc.enrollments || userDoc.enrolledCourses || [],
    metadata: Object.assign({}, userDoc.metadata || {}, { legacySource: userDoc.legacySource || 'mentneo_db.users' }),
    migratedAt: new Date(),
    legacyId: userDoc._id,
  };
}

async function main() {
  const args = parseArgs();
  const sourceDb = args.source || 'mentneo_db';
  const targetDb = args.target || 'mentneo';
  const sourceCol = args.collection || 'users';
  const targetCol = 'students';
  const batchSize = parseInt(args.batch || '200', 10);
  const limit = parseInt(args.limit || '0', 10);
  const dryRun = !!args['dry-run'] || !!args.dryRun;

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  console.log(`Connecting to ${process.env.MONGODB_URI.split('@')[1].split('/')[0]} ...`);
  await mongoose.connect(process.env.MONGODB_URI);
  const client = mongoose.connection.client;
  const srcDb = client.db(sourceDb);
  const tgtDb = client.db(targetDb);

  const query = {};
  const cursor = srcDb.collection(sourceCol).find(query).batchSize(batchSize);
  if (limit > 0) cursor.limit(limit);

  let processed = 0, inserted = 0, updated = 0, skipped = 0;

  console.log(`Starting migration from ${sourceDb}.${sourceCol} -> ${targetDb}.${targetCol}` + (dryRun ? ' (DRY RUN)' : ''));

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    processed++;
    const mapped = mapUserToStudent(doc);

    // remove undefined or null email handling
    const email = mapped.email;
    if (!email) {
      console.log(`[skip] #${processed} missing email, legacyId=${String(doc._id)}`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log('[dry] would upsert:', { email: mapped.email, name: mapped.name });
      continue;
    }

    // Remove legacy _id to avoid insert conflicts
    delete mapped._id;

    // Upsert by email (preserve createdAt if exists)
    try {
      const res = await tgtDb.collection(targetCol).updateOne(
        { email: mapped.email },
        { $set: mapped, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
      if (res.upsertedCount) inserted++;
      else if (res.modifiedCount) updated++;
      else skipped++;
    } catch (err) {
      console.error('[error] upsert failed for', mapped.email, err.message);
    }

    if (processed % 100 === 0) {
      console.log(`Processed ${processed} rows (inserted ${inserted}, updated ${updated}, skipped ${skipped})`);
    }
  }

  console.log('Migration finished. Summary:');
  console.log(' processed:', processed);
  console.log(' inserted:', inserted);
  console.log(' updated :', updated);
  console.log(' skipped :', skipped);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Migration failed:', err && err.message ? err.message : err);
  process.exit(1);
});
