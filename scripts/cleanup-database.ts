/**
 * Database Cleanup Script
 * 
 * Tüm Firestore collections'ını siler
 * UYARI: Bu işlem geri alınamaz!
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://marineflux-41bdc.firebaseio.com',
});

const db = admin.firestore();

const COLLECTIONS = [
  'users',
  'shipowners',
  'suppliers',
  'rfqs',
  'quotations',
  'orders',
  'chats',
  'messages',
  'reviews',
  'notifications',
];

async function deleteCollection(collectionPath: string, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(
  query: FirebaseFirestore.Query,
  resolve: any,
  reject: any
) {
  try {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    process.nextTick(() => deleteQueryBatch(query, resolve, reject));
  } catch (error) {
    reject(error);
  }
}

async function cleanupDatabase() {
  console.log('============================================================');
  console.log('🗑️  DATABASE CLEANUP');
  console.log('============================================================\n');

  try {
    for (const collection of COLLECTIONS) {
      console.log(`🗑️  Deleting collection: ${collection}...`);
      await deleteCollection(collection);
      console.log(`   ✅ Deleted: ${collection}`);
    }

    console.log('\n============================================================');
    console.log('✅ DATABASE CLEANUP COMPLETED!');
    console.log('============================================================');
    console.log('\n⚠️  All data has been deleted from Firestore.');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDatabase();
