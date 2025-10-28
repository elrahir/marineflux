/**
 * Create Test Data for ShipSupplier1
 * Generates 10 quotations and 20 orders at different stages
 * 
 * Run with: npx ts-node scripts/create-test-supplier-data.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://marineflux-default-rtdb.firebaseio.com',
});

const db = admin.firestore();
const auth = admin.auth();

// Test data - Email'dan UID'yi otomatik bulacağız
const SUPPLIER_EMAIL = 'supplier1@marineflux.com';
const SHIPOWNER_EMAIL = 'shipowner1@marineflux.com';

let SUPPLIER_UID: string;
let SHIPOWNER_UID: string;

interface QuotationStage {
  status: 'pending' | 'accepted' | 'rejected';
  count: number;
}

interface OrderStage {
  status: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  count: number;
}

const quotationStages: QuotationStage[] = [
  { status: 'pending', count: 5 },    // 5 pending
  { status: 'accepted', count: 3 },   // 3 accepted
  { status: 'rejected', count: 2 },   // 2 rejected
];

const orderStages: OrderStage[] = [
  { status: 'pending', paymentStatus: 'pending', count: 3 },         // 3 pending orders
  { status: 'confirmed', paymentStatus: 'pending', count: 3 },       // 3 confirmed, waiting payment
  { status: 'confirmed', paymentStatus: 'paid', count: 2 },          // 2 confirmed, paid
  { status: 'in_progress', paymentStatus: 'paid', count: 4 },        // 4 in preparation
  { status: 'in_progress', paymentStatus: 'paid', count: 2 },        // 2 in progress
  { status: 'completed', paymentStatus: 'paid', count: 4 },          // 4 completed
  { status: 'cancelled', paymentStatus: 'pending', count: 2 },       // 2 cancelled
];

const rfqTitles = [
  'Urgent Engine Oil Supply',
  'Ship Painting Required',
  'Safety Equipment Repair',
  'Navigation System Maintenance',
  'Tank Cleaning Service',
  'Spare Engine Parts',
  'Life-Saving Equipment Inspection',
  'Water Treatment System Maintenance',
  'Electrical Equipment Repair',
  'Hull Steel Damage Repair',
];

const rfqDescriptions = [
  'Urgent need for ISO VG 220 engine oil supply. Product must be certified and compliant with international standards.',
  'Technical paint required for external hull and internal corrosion protection. Must be resistant to marine conditions.',
  'All safety equipment requires periodic inspection and maintenance. Must be performed by certified technicians.',
  'Navigation system software update and hardware maintenance required.',
  'Ballast water tank cleaning and cargo tank washing service required.',
];

async function getUserUidByEmail(email: string): Promise<string | null> {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord.uid;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`⚠️  User not found: ${email}`);
      return null;
    }
    throw error;
  }
}

async function getOrCreateShipowner() {
  const shipownerRef = db.collection('shipowners').doc(SHIPOWNER_UID);
  const shipownerSnap = await shipownerRef.get();

  if (shipownerSnap.exists) {
    return shipownerSnap.data();
  }

  // Create if doesn't exist
  const shipownerData = {
    uid: SHIPOWNER_UID,
    email: 'shipowner1@marineflux.com',
    role: 'shipowner',
    companyName: 'Test Shipping Company',
    phone: '+90 212 555 0001',
    country: 'Turkey',
    city: 'Istanbul',
    address: 'Port District 1, Istanbul',
    vessels: [
      {
        id: 'vessel-1',
        name: 'MV Test Star',
        type: 'Container Ship',
        imo: '9000001',
        flag: 'TR',
        portOfRegistry: 'Istanbul',
      },
    ],
    activeOrders: 0,
    totalSpent: 0,
    createdAt: admin.firestore.Timestamp.now(),
  };

  await shipownerRef.set(shipownerData);
  await db.collection('users').doc(SHIPOWNER_UID).set(shipownerData);
  console.log('✅ Created shipowner: Test Shipping Company');
  return shipownerData;
}

async function getOrCreateSupplier() {
  const supplierRef = db.collection('suppliers').doc(SUPPLIER_UID);
  const supplierSnap = await supplierRef.get();

  if (supplierSnap.exists) {
    return supplierSnap.data();
  }

  // Create if doesn't exist
  const supplierData = {
    uid: SUPPLIER_UID,
    email: 'supplier1@marineflux.com',
    role: 'supplier',
    companyName: 'Ship Supplier 1',
    supplierType: 'supplier',
    mainCategories: ['spares', 'chemicals', 'fire-safety'],
    isVerified: true,
    rating: 4.7,
    reviewCount: 45,
    totalOrders: 0,
    description: 'Professional maritime supplier with 15+ years experience',
    location: 'Istanbul, Turkey',
    phone: '+90 212 555 0100',
    country: 'Turkey',
    city: 'Istanbul',
    address: 'Maritime District 1, Istanbul',
    website: 'https://shipsupplier1.example.com',
    createdAt: admin.firestore.Timestamp.now(),
  };

  await supplierRef.set(supplierData);
  await db.collection('users').doc(SUPPLIER_UID).set(supplierData);
  console.log('✅ Created supplier: Ship Supplier 1');
  return supplierData;
}

async function createRFQs() {
  console.log('\n📝 Creating RFQs for quotations...');
  const rfqUids: string[] = [];

  for (let i = 0; i < rfqTitles.length; i++) {
    const rfqData = {
      shipownerUid: SHIPOWNER_UID,
      title: rfqTitles[i],
      description: rfqDescriptions[i % rfqDescriptions.length],
      supplierType: 'supplier',
      mainCategory: 'spares',
      vessel: {
        name: 'MV Test Star',
        type: 'Container Ship',
        imo: '9000001',
      },
      deadline: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + (10 + Math.random() * 20) * 24 * 60 * 60 * 1000)
      ),
      status: 'open',
      shipownerCompany: 'Test Shipping Company',
      quotationCount: 0,
      createdAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      ),
    };

    const rfqRef = await db.collection('rfqs').add(rfqData);
    rfqUids.push(rfqRef.id);
    console.log(`  ✅ Created RFQ: ${rfqData.title}`);
  }

  return rfqUids;
}

async function createQuotations(rfqUids: string[]) {
  console.log('\n💰 Creating 10 Quotations with different statuses...');
  let quotationCount = 0;

  for (const stage of quotationStages) {
    for (let i = 0; i < stage.count; i++) {
      const rfqId = rfqUids[quotationCount % rfqUids.length];
      const rfqSnap = await db.collection('rfqs').doc(rfqId).get();
      const rfq = rfqSnap.data();

      const quotationData = {
        rfqId,
        supplierUid: SUPPLIER_UID,
        price: Math.floor(Math.random() * 45000) + 5000,
        currency: 'USD',
        deliveryTime: ['3 days', '5 days', '1 week', '10 days'][Math.floor(Math.random() * 4)],
        notes: 'Professional quotation. All items are genuine and certified. Delivery FOB Istanbul port.',
        status: stage.status,
        rfqTitle: rfq?.title || 'Maritime Supply Request',
        shipownerCompany: 'Test Shipping Company',
        supplierCompany: 'Ship Supplier 1',
        supplierRating: 4.7,
        validUntil: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        createdAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
        ),
      };

      await db.collection('quotations').add(quotationData);
      console.log(`  ✅ Quotation ${quotationCount + 1}/10: Status=${stage.status}`);
      quotationCount++;
    }
  }
}

async function createOrders(rfqUids: string[]) {
  console.log('\n📦 Creating 20 Orders at different stages...');
  let orderCount = 0;

  for (const stage of orderStages) {
    for (let i = 0; i < stage.count; i++) {
      const rfqId = rfqUids[orderCount % rfqUids.length];
      const rfqSnap = await db.collection('rfqs').doc(rfqId).get();
      const rfq = rfqSnap.data();

      // Build timeline based on status
      const timeline: any[] = [];
      const createdDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);

      timeline.push({
        status: 'pending',
        timestamp: admin.firestore.Timestamp.fromDate(createdDate),
        updatedBy: SHIPOWNER_UID,
      });

      if (stage.status !== 'pending') {
        timeline.push({
          status: 'confirmed',
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000)
          ),
          updatedBy: SUPPLIER_UID,
          note: 'Order confirmed and ready for processing',
        });
      }

      if (['in_progress', 'completed'].includes(stage.status)) {
        timeline.push({
          status: 'in_progress',
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000)
          ),
          updatedBy: SUPPLIER_UID,
          note: 'Order is being processed and will ship soon',
        });
      }

      if (stage.status === 'completed') {
        timeline.push({
          status: 'completed',
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(createdDate.getTime() + 10 * 24 * 60 * 60 * 1000)
          ),
          updatedBy: SUPPLIER_UID,
          note: 'Order delivered successfully',
        });
      }

      const orderData = {
        rfqId,
        quotationId: `quot-${orderCount}`,
        shipownerUid: SHIPOWNER_UID,
        supplierUid: SUPPLIER_UID,
        amount: Math.floor(Math.random() * 45000) + 5000,
        currency: 'USD',
        status: stage.status,
        paymentStatus: stage.paymentStatus,
        timeline,
        shipownerCompany: 'Test Shipping Company',
        supplierCompany: 'Ship Supplier 1',
        title: rfq?.title || 'Maritime Supply Order',
        description: rfq?.description || 'Standard maritime supply order',
        createdAt: admin.firestore.Timestamp.fromDate(createdDate),
        updatedAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
        ),
      };

      await db.collection('orders').add(orderData);
      console.log(
        `  ✅ Order ${orderCount + 1}/20: Status=${stage.status}, Payment=${stage.paymentStatus}`
      );
      orderCount++;
    }
  }
}

async function createTestData() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🌱 CREATING TEST DATA FOR SUPPLIER1');
    console.log('='.repeat(70));

    // Find UIDs from Firebase Auth
    console.log('\n🔍 Finding user UIDs from Firebase Auth...');
    
    const supplierUid = await getUserUidByEmail(SUPPLIER_EMAIL);
    const shipownerUid = await getUserUidByEmail(SHIPOWNER_EMAIL);

    if (!supplierUid) {
      console.error(`\n❌ ERROR: Supplier account not found: ${SUPPLIER_EMAIL}`);
      console.error('Please create this account in Firebase Auth first.');
      process.exit(1);
    }

    if (!shipownerUid) {
      console.error(`\n❌ ERROR: Shipowner account not found: ${SHIPOWNER_EMAIL}`);
      console.error('Please create this account in Firebase Auth first.');
      process.exit(1);
    }

    SUPPLIER_UID = supplierUid;
    SHIPOWNER_UID = shipownerUid;

    console.log(`✅ Found Supplier UID: ${SUPPLIER_UID}`);
    console.log(`✅ Found Shipowner UID: ${SHIPOWNER_UID}`);

    // Get or create accounts
    console.log('\n👥 Setting up test accounts...');
    await getOrCreateShipowner();
    await getOrCreateSupplier();

    // Create RFQs
    const rfqUids = await createRFQs();

    // Create quotations
    await createQuotations(rfqUids);

    // Create orders
    await createOrders(rfqUids);

    console.log('\n' + '='.repeat(70));
    console.log('✨ TEST DATA CREATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('\n📊 Created:');
    console.log('  ✅ Shipowner: Test Shipping Company (shipowner-1)');
    console.log('  ✅ Supplier: Ship Supplier 1 (supplier-1)');
    console.log('  ✅ RFQs: 10');
    console.log('  ✅ Quotations: 10 (5 pending, 3 accepted, 2 rejected)');
    console.log('  ✅ Orders: 20 at different stages');
    console.log('\n📋 Order Distribution:');
    console.log('  - 3 Pending (awaiting confirmation)');
    console.log('  - 3 Confirmed (awaiting payment)');
    console.log('  - 2 Confirmed & Paid');
    console.log('  - 6 In Progress (preparation)');
    console.log('  - 4 Completed');
    console.log('  - 2 Cancelled');
    console.log('\n🔗 Test Account:');
    console.log('  Email: shipsupplier1@marineflux.com');
    console.log('  Password: test123 (set this in Firebase Auth)');
    console.log('  Role: Supplier');
    console.log('\n' + '='.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating test data:', error);
    process.exit(1);
  }
}

// Run the script
createTestData();
