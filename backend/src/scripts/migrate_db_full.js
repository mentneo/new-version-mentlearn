#!/usr/bin/env node
/**
 * migrate_db_full.js
 * Copy all collections from a source DB to a target DB within the same cluster.
 * Usage examples:
 *  node migrate_db_full.js --dry-run
 *  node migrate_db_full.js --confirm --source=mentneo_db --target=mentneo
 * Options:
 *  --dry-run        : don't write, just report counts and samples
 *  --confirm        : perform the actual migration (required for writes)
 *  --source=name    : source database name (default: mentneo_db)
 *  --target=name    : target database name (default: mentneo)
 *  --exclude=col1,col2 : comma separated list of collections to skip
 *  --batch=N        : number of operations per bulkWrite (default 500)
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env') });

const { MongoClient } = require('mongodb');

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

async function main() {
  const args = parseArgs();
  const source = args.source || 'mentneo_db';
  const target = args.target || 'mentneo';
  const dryRun = !!args['dry-run'] || !!args.dryRun;
  const confirm = !!args.confirm;
  const exclude = (args.exclude || '').split(',').map(s => s.trim()).filter(Boolean);
  const batchSize = parseInt(args.batch || '500', 10);

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI must be set in .env');
    process.exit(1);
  }

  console.log(`Connecting to ${process.env.MONGODB_URI.split('@')[1].split('/')[0]}...`);
  const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 10 });
  await client.connect();
  const srcDb = client.db(source);
  const tgtDb = client.db(target);

  const cols = await srcDb.listCollections().toArray();
  const colNames = cols.map(c => c.name).filter(n => !n.startsWith('system.') && !exclude.includes(n));

  console.log('Collections to migrate:', colNames.join(', '));

  // summary
  const summary = {};

  for (const colName of colNames) {
    console.log('\n--- Collection:', colName);
    const count = await srcDb.collection(colName).countDocuments();
    summary[colName] = { count, inserted: 0, updated: 0, skipped: 0 };
    console.log(' source count =', count);

    if (dryRun) {
      const sample = await srcDb.collection(colName).find({}).limit(3).toArray();
      console.log(' sample documents:', sample.map(d => ({ _id: d._id })) );
      continue;
    }

    if (!confirm) {
      console.log('Skipping write for', colName, '(no --confirm)');
      continue;
    }

    // migrate using bulkWrite in batches
    const cursor = srcDb.collection(colName).find({}).batchSize(batchSize);
    let ops = [];
    let processed = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      // if migrating courses and slug is missing or null, set a unique placeholder to avoid unique-index collisions
      if (colName === 'courses') {
        if (doc.slug === undefined || doc.slug === null || doc.slug === '') {
          // ensure slug is string
          doc.slug = `migrated-${String(doc._id)}`;
        }
      }

      // build replaceOne upsert operation to preserve _id
      ops.push({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } });

      if (ops.length >= batchSize) {
        const res = await tgtDb.collection(colName).bulkWrite(ops, { ordered: false });
        summary[colName].inserted += res.upsertedCount || 0;
        summary[colName].updated += (res.modifiedCount || 0);
        processed += ops.length;
        console.log(` processed ${processed}/${count}`);
        ops = [];
      }
    }

    if (ops.length) {
      const res = await tgtDb.collection(colName).bulkWrite(ops, { ordered: false });
      summary[colName].inserted += res.upsertedCount || 0;
      summary[colName].updated += (res.modifiedCount || 0);
      processed += ops.length;
      console.log(` processed ${processed}/${count}`);
    }

    console.log(' done', colName, summary[colName]);
  }

  console.log('\nMigration summary:');
  for (const k of Object.keys(summary)) {
    console.log(k, summary[k]);
  }

  await client.close();
}

main().catch(err => {
  console.error('Migration failed:', err && err.message ? err.message : err);
  process.exit(1);
});
