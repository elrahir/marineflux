/**
 * Cleanup and Seed RFQ/Order Data Script
 * 
 * Bu script:
 * 1. RFQ, Quotation, Order, Notifications collection'larını temizler
 * 2. Users ve Suppliers collection'larını korur
 * 3. Yeni mantıklı mock RFQ, Quotation ve Order verileri oluşturur
 * 
 * Önemli: Her RFQ için maksimum 1 accepted quotation olacak şekilde kontrollü veriler oluşturulur
 * 
 * Run with: npx ts-node scripts/cleanup-and-seed-rfqs.ts
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

// ==================== DATA GENERATORS ====================

const rfqTitles = [
  'Pilot Rehberleri',
  'Acil Motor Yağı Tedariki',
  'Gemi Boyası Gerekli',
  'Güvenlik Ekipmanları Tamir',
  'Navigasyon Sistemi Bakımı',
  'Tank Temizliği Hizmeti',
  'Yedek Motor Parçaları',
  'Hayat Kurtarma Cihazları Kontrol',
  'Su Arıtma Sistemi Bakımı',
  'Elektrik Donanım Onarımı',
  'Yapı Çelik Hasarı Tamirat',
  'Propeller Tamiri',
  'Dalgıç Hizmeti',
  'Kargo Vinç Bakımı',
  'Deniz Haritası Güncelleme',
  'İtfaiye Sistemi Kontrol',
  'Hidrolik Sistem Tamiri',
  'Klima Sistemi Bakımı',
  'Radyo Navigasyon Cihazı',
  'LSA Ekipman Kontrolü',
];

const rfqDescriptions = [
  'Pilot rehberleri için MT Poseidon gemisine ait talep. En güncel versiyonlar gereklidir.',
  'Acil olarak ISO VG 220 motor yağına ihtiyaç vardır. Ürün belgeli ve uluslararası standardlara uygun olmalıdır.',
  'Geminiz için dış cephe ve iç koruma amaçlı teknik boya gereklidir. Deniz koşullarına dayanıklı olmalı.',
  'Tüm güvenlik ekipmanları periyodik muayene ve tamirat gereksiz. Sertifikalı teknisyenler tarafından yapılmalı.',
  'Navigasyon sistemi yazılım güncellemesi ve donanım bakımı gereklidir.',
  'Balast su tankı temizliği ve kargo tankı yıkama hizmetine ihtiyaç vardır.',
  'Caterpillar 3516 motor için yedek parça gereklidir. Orijinal ürün tercih edilir.',
  'SOLAS standartlarına uygun hayat kurtarma cihazlarının periyodik kontrolü gereklidir.',
  'RO sistemi bakımı ve filtre değişimi gereklidir.',
  'Ana elektrik panosu ve jeneratör kontrolü gereklidir.',
];

const vesselNames = [
  'MT Poseidon', 'MV Baltic Star', 'MT Ocean One', 'MV Mediterranean', 
  'MT Aegean Sea', 'MV Marmara Queen', 'MT Bosphorus', 'MV Golden Horn',
  'MT Izmir Express', 'MV Anatolia', 'MT Turkish Breeze', 'MV Caprice',
];

const vesselTypes = [
  'Tanker', 'Container Ship', 'Bulk Carrier', 'General Cargo', 
  'Multipurpose', 'Breakbulk', 'RoRo Vessel', 'LPG Carrier',
];

const categories = [
  'nautical-charts',
  'lubricants-oil',
  'paints',
  'fire-safety',
  'spares',
  'electrical',
  'chemicals',
  'maintenance',
  'lsa',
  'hydraulic-cranes',
  'underwater-diving',
  'surveys-analyses',
];

const serviceCategories = [
  'maintenance',
  'lsa',
  'hydraulic-cranes',
  'underwater-diving',
  'surveys-analyses',
  'salvage',
];

// ==================== CLEANUP FUNCTION ====================

async function deleteCollection(collectionPath: string, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(
  query: admin.firestore.Query,
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

async function cleanupCollections() {
  console.log('\n============================================================');
  console.log('🗑️  CLEANING UP COLLECTIONS');
  console.log('============================================================\n');

  const collectionsToClean = [
    'rfqs',
    'quotations',
    'orders',
    'notifications',
    'chats',
    'messages',
  ];

  for (const collection of collectionsToClean) {
    console.log(`🗑️  Deleting collection: ${collection}...`);
    try {
      await deleteCollection(collection);
      console.log(`   ✅ Deleted: ${collection}`);
    } catch (error: any) {
      console.error(`   ❌ Error deleting ${collection}:`, error.message);
    }
  }

  console.log('\n✅ Cleanup completed!\n');
}

// ==================== SEED FUNCTIONS ====================

async function getExistingUsers() {
  console.log('\n📋 Getting existing users...');
  
  const shipowners: any[] = [];
  const suppliers: any[] = [];

  const usersSnapshot = await db.collection('users').get();
  
  usersSnapshot.forEach((doc) => {
    const user = doc.data();
    if (user.role === 'shipowner') {
      shipowners.push({ uid: doc.id, ...user });
    } else if (user.role === 'supplier') {
      suppliers.push({ uid: doc.id, ...user });
    }
  });

  console.log(`   ✅ Found ${shipowners.length} shipowners`);
  console.log(`   ✅ Found ${suppliers.length} suppliers`);

  if (shipowners.length === 0 || suppliers.length === 0) {
    throw new Error('No shipowners or suppliers found. Please seed users first.');
  }

  return { shipowners, suppliers };
}

async function createRFQs(shipowners: any[], suppliers: any[]) {
  console.log('\n📝 Creating RFQs...');
  const rfqIds: string[] = [];

  // Create 25-30 RFQs with various statuses
  const rfqCount = 25 + Math.floor(Math.random() * 6);

  for (let i = 0; i < rfqCount; i++) {
    const shipowner = shipowners[i % shipowners.length];
    const isServiceRFQ = Math.random() > 0.5;
    const category = isServiceRFQ
      ? serviceCategories[i % serviceCategories.length]
      : categories[i % categories.length];

    const titleIndex = i % rfqTitles.length;
    const daysAgo = Math.floor(Math.random() * 45); // Created 0-45 days ago
    const deadlineDays = 7 + Math.floor(Math.random() * 21); // Deadline 7-28 days from now

    const rfqData = {
      shipownerUid: shipowner.uid,
      shipownerCompany: shipowner.companyName || 'Unknown Company',
      title: rfqTitles[titleIndex],
      description: rfqDescriptions[titleIndex % rfqDescriptions.length],
      supplierType: isServiceRFQ ? 'service-provider' : 'supplier',
      mainCategory: category,
      category: category, // Backward compatibility
      vessel: {
        name: vesselNames[i % vesselNames.length],
        type: vesselTypes[i % vesselTypes.length],
        imo: `${9000000 + i}`,
      },
      deadline: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000)
      ),
      // Status distribution: 60% open, 25% closed, 15% awarded
      status: (() => {
        const rand = Math.random();
        if (rand < 0.6) return 'open';
        if (rand < 0.85) return 'closed';
        return 'awarded';
      })(),
      quotationCount: 0, // Will be updated when quotations are created
      createdAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      ),
      updatedAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      ),
    };

    const rfqRef = await db.collection('rfqs').add(rfqData);
    rfqIds.push(rfqRef.id);
    
    // Store RFQ data with ID for quotation creation
    await db.collection('rfqs').doc(rfqRef.id).update({ id: rfqRef.id });
    
    console.log(`   ✅ Created RFQ: ${rfqData.title} (${rfqData.status})`);
  }

  return rfqIds;
}

async function createQuotations(rfqIds: string[], suppliers: any[]) {
  console.log('\n💰 Creating Quotations...');
  const quotationMap = new Map<string, string>(); // rfqId -> acceptedQuotationId

  for (const rfqId of rfqIds) {
    const rfqDoc = await db.collection('rfqs').doc(rfqId).get();
    if (!rfqDoc.exists) continue;

    const rfq = rfqDoc.data();
    if (!rfq) continue;

    // Determine how many quotations to create
    let quotationCount = 0;
    let hasAccepted = false;

    if (rfq.status === 'awarded') {
      // Awarded RFQs must have exactly 1 accepted quotation
      quotationCount = 1 + Math.floor(Math.random() * 4); // 1-5 quotations total
      hasAccepted = true;
    } else if (rfq.status === 'closed') {
      // Closed RFQs can have multiple quotations but none accepted (or all rejected)
      quotationCount = 2 + Math.floor(Math.random() * 5); // 2-6 quotations
    } else {
      // Open RFQs can have pending quotations
      quotationCount = Math.floor(Math.random() * 5); // 0-4 quotations
    }

    const quotationIds: string[] = [];
    let acceptedQuotationId: string | null = null;

    // For awarded RFQs, randomly select which quotation will be accepted (but only one)
    const acceptedIndex = rfq.status === 'awarded' && quotationCount > 0
      ? Math.floor(Math.random() * quotationCount)
      : -1;

    for (let i = 0; i < quotationCount; i++) {
      // Filter suppliers by category match (simplified - in real app use supplier.categories)
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];

      const basePrice = 5000 + Math.floor(Math.random() * 45000);
      const priceVariation = basePrice * (0.1 - Math.random() * 0.2); // ±10% variation
      const price = Math.floor(basePrice + priceVariation);

      // Determine status: for awarded RFQs, exactly one quotation should be accepted
      let status: string;
      if (rfq.status === 'awarded' && i === acceptedIndex && acceptedIndex >= 0) {
        status = 'accepted';
      } else if (rfq.status === 'awarded') {
        status = ['pending', 'rejected'][Math.floor(Math.random() * 2)];
      } else if (rfq.status === 'closed') {
        status = ['pending', 'rejected'][Math.floor(Math.random() * 2)];
      } else {
        status = 'pending';
      }

      const estimatedReadyDays = 3 + Math.floor(Math.random() * 15);
      const createdAtDaysAgo = Math.floor(Math.random() * 14);

      const quotationData: any = {
        rfqId,
        supplierUid: supplier.uid,
        supplierCompany: supplier.companyName || 'Unknown Company',
        shipownerUid: rfq.shipownerUid,
        rfqTitle: rfq.title,
        rfqCategory: rfq.mainCategory || rfq.category || '',
        vesselName: rfq.vessel?.name || '',
        vesselType: rfq.vessel?.type || '',
        price,
        currency: 'USD',
        deliveryTime: `${3 + Math.floor(Math.random() * 12)} days`,
        deliveryLocation: ['Istanbul', 'Izmir', 'Mersin', 'Antalya'][Math.floor(Math.random() * 4)],
        notes: `Professional quotation from ${supplier.companyName}. All items are genuine and certified.`,
        specifications: 'All items meet international maritime standards.',
        status,
        estimatedReadyDate: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + estimatedReadyDays * 24 * 60 * 60 * 1000)
        ),
        createdAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() - createdAtDaysAgo * 24 * 60 * 60 * 1000)
        ),
        updatedAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() - createdAtDaysAgo * 24 * 60 * 60 * 1000)
        ),
      };

      if (status === 'accepted') {
        quotationData.acceptedAt = admin.firestore.Timestamp.now();
      }

      const quotRef = await db.collection('quotations').add(quotationData);
      quotationIds.push(quotRef.id);

      if (status === 'accepted') {
        acceptedQuotationId = quotRef.id;
        quotationMap.set(rfqId, quotRef.id);
        console.log(`   ✅ Created ACCEPTED quotation for RFQ: ${rfq.title}`);
      }
    }

    // Update RFQ quotation count
    await db.collection('rfqs').doc(rfqId).update({
      quotationCount: quotationCount,
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }

  return quotationMap;
}

async function createOrders(rfqIds: string[], quotationMap: Map<string, string>, shipowners: any[], suppliers: any[]) {
  console.log('\n📦 Creating Orders...');

  let orderCount = 0;

  for (const rfqId of rfqIds) {
    const acceptedQuotationId = quotationMap.get(rfqId);
    if (!acceptedQuotationId) continue;

    const quotationDoc = await db.collection('quotations').doc(acceptedQuotationId).get();
    if (!quotationDoc.exists) continue;

    const quotation = quotationDoc.data();
    if (!quotation || quotation.status !== 'accepted') continue;

    const rfqDoc = await db.collection('rfqs').doc(rfqId).get();
    if (!rfqDoc.exists) continue;

    const rfq = rfqDoc.data();
    if (!rfq) continue;

    // Find shipowner and supplier
    const shipowner = shipowners.find(s => s.uid === rfq.shipownerUid);
    const supplier = suppliers.find(s => s.uid === quotation.supplierUid);

    if (!shipowner || !supplier) continue;

    // Determine order status based on timeline
    const statusOptions: Array<{ status: string; paymentStatus: string; probability: number }> = [
      { status: 'pending_supplier_approval', paymentStatus: 'pending', probability: 0.15 },
      { status: 'pending_payment', paymentStatus: 'pending', probability: 0.20 },
      { status: 'pending_shipowner_confirmation', paymentStatus: 'payment_awaiting_confirmation', probability: 0.15 },
      { status: 'confirmed', paymentStatus: 'paid', probability: 0.15 },
      { status: 'in_progress', paymentStatus: 'paid', probability: 0.20 },
      { status: 'shipped', paymentStatus: 'paid', probability: 0.10 },
      { status: 'delivered', paymentStatus: 'paid', probability: 0.05 },
    ];

    // Select status based on weighted probability
    const rand = Math.random();
    let cumulativeProbability = 0;
    let selectedStatus = statusOptions[0];
    
    for (const option of statusOptions) {
      cumulativeProbability += option.probability;
      if (rand <= cumulativeProbability) {
        selectedStatus = option;
        break;
      }
    }

    const orderStatus = selectedStatus.status;
    const paymentStatus = selectedStatus.paymentStatus;

    // Create timeline based on status
    const timeline: any[] = [];
    const createdAt = quotation.createdAt || admin.firestore.Timestamp.now();

    timeline.push({
      status: 'pending_supplier_approval',
      description: 'Order created - Awaiting supplier approval',
      timestamp: createdAt,
      updatedBy: rfq.shipownerUid,
    });

    if (orderStatus !== 'pending_supplier_approval') {
      timeline.push({
        status: 'pending_payment',
        description: 'Supplier approved - Awaiting payment',
        timestamp: admin.firestore.Timestamp.fromDate(
          new Date(createdAt.toDate().getTime() + 1 * 24 * 60 * 60 * 1000)
        ),
        updatedBy: quotation.supplierUid,
      });

      if (['pending_shipowner_confirmation', 'confirmed', 'in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        timeline.push({
          status: 'pending_shipowner_confirmation',
          description: 'Payment made - Awaiting shipowner confirmation',
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(createdAt.toDate().getTime() + 2 * 24 * 60 * 60 * 1000)
          ),
          updatedBy: rfq.shipownerUid,
        });
      }

      if (['confirmed', 'in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        timeline.push({
          status: 'confirmed',
          description: 'Order confirmed - Payment verified',
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(createdAt.toDate().getTime() + 3 * 24 * 60 * 60 * 1000)
          ),
          updatedBy: rfq.shipownerUid,
        });
      }

      if (['in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        timeline.push({
          status: 'in_progress',
          description: 'Order in progress - Items being prepared',
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(createdAt.toDate().getTime() + 5 * 24 * 60 * 60 * 1000)
          ),
          updatedBy: quotation.supplierUid,
        });
      }

      if (['shipped', 'delivered'].includes(orderStatus)) {
        const shippedDate = admin.firestore.Timestamp.fromDate(
          new Date(createdAt.toDate().getTime() + (7 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000)
        );
        timeline.push({
          status: 'shipped',
          description: 'Order shipped',
          timestamp: shippedDate,
          updatedBy: quotation.supplierUid,
        });
      }

      if (orderStatus === 'delivered') {
        timeline.push({
          status: 'delivered',
          description: 'Order delivered',
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(createdAt.toDate().getTime() + (10 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000)
          ),
          updatedBy: quotation.supplierUid,
        });
      }
    }

    const expectedDeliveryDate = orderStatus === 'in_progress' || orderStatus === 'shipped' || orderStatus === 'delivered'
      ? admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + (7 + Math.floor(Math.random() * 14)) * 24 * 60 * 60 * 1000)
        )
      : null;

    const orderData = {
      rfqId,
      quotationId: acceptedQuotationId,
      shipownerUid: rfq.shipownerUid,
      supplierUid: quotation.supplierUid,
      shipownerCompany: shipowner.companyName || rfq.shipownerCompany,
      supplierCompany: supplier.companyName || quotation.supplierCompany,
      title: rfq.title,
      description: rfq.description,
      amount: quotation.price,
      currency: quotation.currency || 'USD',
      status: orderStatus,
      paymentStatus: paymentStatus,
      timeline,
      expectedDeliveryDate,
      createdAt,
      updatedAt: timeline[timeline.length - 1]?.timestamp || createdAt,
    };

    await db.collection('orders').add(orderData);
    orderCount++;
    console.log(`   ✅ Created Order: ${rfq.title} (${orderStatus})`);
  }

  console.log(`\n   ✅ Created ${orderCount} orders total`);
}

// ==================== MAIN FUNCTION ====================

async function main() {
  try {
    console.log('============================================================');
    console.log('🔄 CLEANUP AND SEED RFQ/ORDER DATA');
    console.log('============================================================\n');

    // Step 1: Cleanup
    await cleanupCollections();

    // Step 2: Get existing users
    const { shipowners, suppliers } = await getExistingUsers();

    // Step 3: Create RFQs
    const rfqIds = await createRFQs(shipowners, suppliers);

    // Step 4: Create Quotations
    const quotationMap = await createQuotations(rfqIds, suppliers);

    // Step 5: Create Orders (only for accepted quotations)
    await createOrders(rfqIds, quotationMap, shipowners, suppliers);

    console.log('\n============================================================');
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('============================================================');
    console.log(`\n📊 Summary:`);
    console.log(`   - RFQs: ${rfqIds.length}`);
    console.log(`   - Accepted Quotations: ${quotationMap.size}`);
    console.log(`   - Orders: ${quotationMap.size}`);
    console.log('\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

