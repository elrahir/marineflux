/**
 * Create Rich Test Data for shipowner1 and supplier1
 * 
 * Bu script shipowner1 ve supplier1 hesapları için:
 * - Çok sayıda çeşitli RFQ'lar oluşturur
 * - Her RFQ için mantıklı sayıda quotation oluşturur
 * - Accepted quotation'lar için orders oluşturur
 * - Çeşitli durumlarda veriler (open, closed, awarded RFQs; pending, accepted, rejected quotations; farklı aşamalarda orders)
 * 
 * Önemli: Her RFQ için maksimum 1 accepted quotation garantisi
 * 
 * Run with: npx ts-node scripts/create-rich-shipowner1-supplier1-data.ts
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

const SHIPOWNER1_EMAIL = 'shipowner1@marineflux.com';
const SUPPLIER1_EMAIL = 'supplier1@marineflux.com';

// ==================== DATA GENERATORS ====================

const categories = [
  'nautical-charts',
  'lubricants-oil',
  'paints',
  'fire-safety',
  'spares',
  'electrical',
  'chemicals',
  'chandler',
  'ropes-anchors',
  'medical',
];

const serviceCategories = [
  'maintenance',
  'lsa',
  'hydraulic-cranes',
  'underwater-diving',
  'surveys-analyses',
];

const rfqTitles = [
  'Pilot Rehberleri ve Deniz Haritaları',
  'Acil Motor Yağı Tedariki (ISO VG 220)',
  'Gemi Dış Cephe Boyası',
  'İtfaiye Sistemi Kontrol ve Bakım',
  'Caterpillar Motor Yedek Parçaları',
  'Ana Elektrik Panosu Bakımı',
  'Balast Su Tankı Temizlik Kimyasalları',
  'Güvenlik Halat ve Çıpa Sistemleri',
  'Tıbbi Ekipman ve İlaç Tedariki',
  'Navigasyon Sistemi Yazılım Güncelleme',
  'RO Sistemi Filtre Değişimi',
  'Propeller Tamir ve Bakım',
  'Hidrolik Vinç Servis Bakımı',
  'Dalgıç Hizmeti (Hull İnceleme)',
  'LSA Ekipman Periyodik Kontrol',
  'Klima Sistemi Kompresör Değişimi',
  'Radyo Navigasyon Cihazı Kalibrasyon',
  'Jeneratör Yağ Filtresi',
  'Hidrolik Yağ Temizliği',
  'Kargo Ambarı Ventilasyon Sistemi',
  'Pompa Yedek Parçaları',
  'Tank Seviye Sensörleri',
  'Yangın Alarm Sistemi',
  'Güvenlik Kamerası Sistemi',
  'Mutfak Ekipmanları',
];

const rfqDescriptions = [
  'Pilot rehberleri ve güncel deniz haritaları için talep. En son versiyonlar gereklidir. MT Poseidon gemisi için.',
  'ISO VG 220 motor yağı acil tedarik gereklidir. Ürün belgeli ve uluslararası standardlara uygun olmalıdır. Teslimat İstanbul limanında.',
  'Gemi dış cephe ve iç koruma amaçlı teknik boya gereklidir. Deniz koşullarına dayanıklı, anti-fouling özellikli olmalıdır.',
  'Tüm itfaiye ekipmanları periyodik muayene ve bakım gereksiz. Sertifikalı teknisyenler tarafından yapılmalı.',
  'Caterpillar 3516 motor için kritik yedek parça gereklidir. Orijinal ürün tercih edilir.',
  'Ana elektrik panosu ve jeneratör kontrolü gereklidir. Bakım sertifikalı elektrikçi tarafından yapılmalıdır.',
  'Balast su tankı temizliği için özel kimyasallar gereklidir. IMO standartlarına uygun olmalıdır.',
  'Güvenlik halat ve çıpa sistemleri için yedek parça gereklidir. SOLAS standartlarına uygun.',
  'Tıbbi ekipman ve acil ilaç tedariki gereklidir. Son kullanma tarihleri kontrol edilmelidir.',
  'Navigasyon sistemi yazılım güncellemesi ve donanım bakımı gereklidir.',
  'RO sistemi filtre değişimi ve sistem bakımı gereklidir.',
  'Propeller tamir ve bakım hizmeti gereklidir. Uzman dalgıç ve teknisyen gereklidir.',
  'Hidrolik vinç servis bakımı ve yedek parça değişimi gereklidir.',
  'Hull incelemesi için dalgıç hizmeti gereklidir. Sertifikalı dalgıç ve rapor gerekir.',
  'LSA ekipman periyodik kontrol ve sertifikasyon gereklidir. SOLAS standartlarına uygun.',
  'Klima sistemi kompresör değişimi ve bakım gereklidir.',
  'Radyo navigasyon cihazı kalibrasyon ve sertifikasyon gereklidir.',
  'Jeneratör yağ filtresi ve bakım gereklidir.',
  'Hidrolik yağ temizliği ve sistem bakımı gereklidir.',
  'Kargo ambarı ventilasyon sistemi bakım ve yedek parça gereklidir.',
  'Pompa yedek parçaları ve bakım gereklidir.',
  'Tank seviye sensörleri kalibrasyon ve değişim gereklidir.',
  'Yangın alarm sistemi kontrol ve bakım gereklidir.',
  'Güvenlik kamerası sistemi kurulum ve bakım gereklidir.',
  'Mutfak ekipmanları ve erzak tedariki gereklidir.',
];

const vesselNames = [
  'MT Poseidon',
  'MV Atlantik',
  'MV Mediterranean',
  'MV Ocean Express',
  'MT Triton',
  'MV Harmony',
  'MT Neptune',
  'MV Destiny',
];

const vesselTypes = [
  'Tanker',
  'Container Ship',
  'Bulk Carrier',
  'General Cargo',
  'Multipurpose',
];

const deliveryLocations = [
  'Istanbul',
  'Izmir',
  'Mersin',
  'Antalya',
  'Iskenderun',
];

// ==================== HELPER FUNCTIONS ====================

async function getUserByEmail(email: string): Promise<{ uid: string; data: any } | null> {
  try {
    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (userDoc.exists) {
      return { uid: userRecord.uid, data: userDoc.data() };
    }
    
    // Check shipowners/suppliers collections
    const shipownerDoc = await db.collection('shipowners').doc(userRecord.uid).get();
    if (shipownerDoc.exists) {
      return { uid: userRecord.uid, data: shipownerDoc.data() };
    }
    
    const supplierDoc = await db.collection('suppliers').doc(userRecord.uid).get();
    if (supplierDoc.exists) {
      return { uid: userRecord.uid, data: supplierDoc.data() };
    }
    
    return { uid: userRecord.uid, data: null };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

// ==================== SEED FUNCTIONS ====================

async function deleteExistingUserData(uid: string, role: string) {
  console.log(`🗑️  Cleaning existing ${role} data...`);
  
  const collections = ['rfqs', 'quotations', 'orders'];
  
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName)
      .where(role === 'shipowner' ? 'shipownerUid' : 'supplierUid', '==', uid)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    if (snapshot.docs.length > 0) {
      await batch.commit();
      console.log(`   ✅ Deleted ${snapshot.docs.length} ${collectionName}`);
    }
  }
}

async function createRFQs(shipowner: { uid: string; data: any }) {
  console.log('\n📝 Creating RFQs for shipowner1...');
  const rfqIds: string[] = [];

  // Create 60-70 RFQs with various statuses
  const rfqCount = 60 + Math.floor(Math.random() * 11);

  for (let i = 0; i < rfqCount; i++) {
    const isServiceRFQ = Math.random() > 0.55;
    const category = isServiceRFQ
      ? serviceCategories[i % serviceCategories.length]
      : categories[i % categories.length];

    const titleIndex = i % rfqTitles.length;
    const daysAgo = Math.floor(Math.random() * 90); // Created 0-90 days ago
    const deadlineDays = 5 + Math.floor(Math.random() * 25); // Deadline 5-30 days from now

    // Status distribution: 40% open, 30% closed, 30% awarded (more awarded for more orders)
    const statusRand = Math.random();
    let status: string;
    if (statusRand < 0.4) {
      status = 'open';
    } else if (statusRand < 0.7) {
      status = 'closed';
    } else {
      status = 'awarded';
    }

    // Get vessel from shipowner data
    const vessels = shipowner.data?.fleet || shipowner.data?.vessels || [];
    const vessel = vessels.length > 0 
      ? vessels[i % vessels.length]
      : {
          name: vesselNames[i % vesselNames.length],
          type: vesselTypes[i % vesselTypes.length],
          imo: `${9000000 + i}`,
        };

    const rfqData = {
      shipownerUid: shipowner.uid,
      shipownerCompany: shipowner.data?.companyName || 'Akdeniz Denizcilik A.Ş.',
      title: rfqTitles[titleIndex],
      description: rfqDescriptions[titleIndex % rfqDescriptions.length],
      supplierType: isServiceRFQ ? 'service-provider' : 'supplier',
      mainCategory: category,
      category: category, // Backward compatibility
      vessel: {
        name: vessel.name || vesselNames[i % vesselNames.length],
        type: vessel.type || vesselTypes[i % vesselTypes.length],
        imo: vessel.imo || `${9000000 + i}`,
      },
      deadline: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000)
      ),
      status,
      quotationCount: 0, // Will be updated
      createdAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      ),
      updatedAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      ),
    };

    const rfqRef = await db.collection('rfqs').add(rfqData);
    rfqIds.push(rfqRef.id);
    
    await db.collection('rfqs').doc(rfqRef.id).update({ id: rfqRef.id });
    
    if ((i + 1) % 15 === 0 || i === rfqCount - 1) {
      console.log(`   ✅ Created ${i + 1}/${rfqCount} RFQs...`);
    }
  }

  console.log(`   ✅ Created ${rfqCount} RFQs total`);
  return rfqIds;
}

async function getOtherSuppliers(): Promise<any[]> {
  const suppliersSnap = await db.collection('suppliers').limit(10).get();
  return suppliersSnap.docs.map(doc => ({
    uid: doc.id,
    data: doc.data(),
  }));
}

async function createQuotations(rfqIds: string[], supplier: { uid: string; data: any }) {
  console.log('\n💰 Creating Quotations for supplier1...');
  const quotationMap = new Map<string, string>(); // rfqId -> acceptedQuotationId
  let totalQuotations = 0;
  let acceptedCount = 0;
  let supplier1AcceptedCount = 0;

  // Get other suppliers for variety
  const otherSuppliers = await getOtherSuppliers();
  const allSuppliers = [supplier, ...otherSuppliers.filter(s => s.uid !== supplier.uid)];

  for (const rfqId of rfqIds) {
    const rfqDoc = await db.collection('rfqs').doc(rfqId).get();
    if (!rfqDoc.exists) continue;

    const rfq = rfqDoc.data();
    if (!rfq) continue;

    // Supplier1 creates quotations for 75% of RFQs
    const shouldCreateQuotation = Math.random() > 0.25;
    
    if (!shouldCreateQuotation) continue;

    // For awarded RFQs, supplier1 has 50% chance to have the accepted quotation
    let quotationStatus: string;
    let isSupplier1Accepted = false;

    if (rfq.status === 'awarded') {
      isSupplier1Accepted = Math.random() < 0.5;
      quotationStatus = isSupplier1Accepted ? 'accepted' : ['pending', 'rejected'][Math.floor(Math.random() * 2)];
    } else if (rfq.status === 'closed') {
      quotationStatus = ['pending', 'rejected'][Math.floor(Math.random() * 2)];
    } else {
      quotationStatus = 'pending';
    }

    // Determine total quotation count for this RFQ
    let quotationCount = 1; // supplier1's quotation always
    if (rfq.status === 'awarded' && !isSupplier1Accepted && allSuppliers.length > 1) {
      // Add 1-3 other quotations, one of which will be accepted
      quotationCount = 2 + Math.floor(Math.random() * 3);
    } else if (rfq.status === 'awarded' && isSupplier1Accepted && allSuppliers.length > 1) {
      // Add 1-2 other quotations (all pending/rejected)
      quotationCount = 1 + Math.floor(Math.random() * 2);
    } else if (rfq.status === 'open' && allSuppliers.length > 1) {
      // Open RFQs can have 2-4 quotations total
      quotationCount = 2 + Math.floor(Math.random() * 3);
    }

    // Determine which quotation index will be accepted (for awarded RFQs where supplier1's is not accepted)
    const acceptedIndex = rfq.status === 'awarded' && !isSupplier1Accepted && quotationCount > 1
      ? 1 + Math.floor(Math.random() * (quotationCount - 1))
      : isSupplier1Accepted ? 0 : -1;

    let acceptedQuotationId: string | null = null;
    let actualQuotationCount = 0;

    for (let i = 0; i < quotationCount; i++) {
      const isSupplier1Quotation = i === 0;
      
      // Select supplier
      let currentSupplier;
      if (isSupplier1Quotation) {
        currentSupplier = supplier;
      } else {
        // Use random other supplier
        const randomSupplier = allSuppliers[1 + Math.floor(Math.random() * (allSuppliers.length - 1))];
        if (!randomSupplier) continue; // Skip if no other suppliers
        currentSupplier = randomSupplier;
      }

      // Determine status
      const shouldBeAccepted = rfq.status === 'awarded' && i === acceptedIndex;
      const status = isSupplier1Quotation 
        ? quotationStatus 
        : (shouldBeAccepted ? 'accepted' : ['pending', 'rejected'][Math.floor(Math.random() * 2)]);

      // Price calculation
      const basePrice = 3000 + Math.floor(Math.random() * 47000);
      const priceVariation = basePrice * (0.05 - Math.random() * 0.1);
      const price = Math.floor(basePrice + priceVariation);

      const estimatedReadyDays = 3 + Math.floor(Math.random() * 18);
      const createdAtDaysAgo = Math.floor(Math.random() * 20);

      const quotationData: any = {
        rfqId,
        supplierUid: currentSupplier.uid,
        supplierCompany: currentSupplier.data?.companyName || 'Unknown Supplier',
        shipownerUid: rfq.shipownerUid,
        rfqTitle: rfq.title,
        rfqCategory: rfq.mainCategory || rfq.category || '',
        vesselName: rfq.vessel?.name || '',
        vesselType: rfq.vessel?.type || '',
        price,
        currency: 'USD',
        deliveryTime: `${3 + Math.floor(Math.random() * 15)} days`,
        deliveryLocation: deliveryLocations[Math.floor(Math.random() * deliveryLocations.length)],
        notes: isSupplier1Quotation
          ? `Professional quotation from ${supplier.data?.companyName || 'Supplier1'}. All items are genuine and certified. Quick delivery available.`
          : `Quotation from ${currentSupplier.data?.companyName || 'Supplier'}. Quality guaranteed.`,
        specifications: 'All items meet international maritime standards and certifications.',
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
      totalQuotations++;
      actualQuotationCount++;

      if (status === 'accepted') {
        acceptedQuotationId = quotRef.id;
        quotationMap.set(rfqId, quotRef.id);
        acceptedCount++;
        if (isSupplier1Quotation) {
          supplier1AcceptedCount++;
          console.log(`   ✅ Supplier1 ACCEPTED quotation: ${rfq.title}`);
        }
      }
    }

    // Update RFQ quotation count
    if (actualQuotationCount > 0) {
      await db.collection('rfqs').doc(rfqId).update({
        quotationCount: actualQuotationCount,
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }
  }

  console.log(`   ✅ Created ${totalQuotations} quotations total`);
  console.log(`   ✅ ${acceptedCount} accepted quotations (${supplier1AcceptedCount} from supplier1)`);
  return quotationMap;
}

async function createOrders(rfqIds: string[], quotationMap: Map<string, string>, shipowner: { uid: string; data: any }, supplier: { uid: string; data: any }) {
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

    // Determine order status - more variety
    const statusOptions: Array<{ status: string; paymentStatus: string; probability: number }> = [
      { status: 'pending_supplier_approval', paymentStatus: 'pending', probability: 0.10 },
      { status: 'pending_payment', paymentStatus: 'pending', probability: 0.15 },
      { status: 'pending_shipowner_confirmation', paymentStatus: 'payment_awaiting_confirmation', probability: 0.10 },
      { status: 'confirmed', paymentStatus: 'paid', probability: 0.15 },
      { status: 'in_progress', paymentStatus: 'paid', probability: 0.25 },
      { status: 'shipped', paymentStatus: 'paid', probability: 0.15 },
      { status: 'delivered', paymentStatus: 'paid', probability: 0.10 },
    ];

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
    let currentTime = createdAt.toDate();

    timeline.push({
      status: 'pending_supplier_approval',
      description: 'Order created - Awaiting supplier approval',
      timestamp: createdAt,
      updatedBy: rfq.shipownerUid,
    });

    if (orderStatus !== 'pending_supplier_approval') {
      currentTime = new Date(currentTime.getTime() + 1 * 24 * 60 * 60 * 1000);
      timeline.push({
        status: 'pending_payment',
        description: 'Supplier approved - Awaiting payment',
        timestamp: admin.firestore.Timestamp.fromDate(currentTime),
        updatedBy: quotation.supplierUid,
      });

      if (['pending_shipowner_confirmation', 'confirmed', 'in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        currentTime = new Date(currentTime.getTime() + 1 * 24 * 60 * 60 * 1000);
        timeline.push({
          status: 'pending_shipowner_confirmation',
          description: 'Payment made - Awaiting shipowner confirmation',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: rfq.shipownerUid,
        });
      }

      if (['confirmed', 'in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        currentTime = new Date(currentTime.getTime() + 1 * 24 * 60 * 60 * 1000);
        timeline.push({
          status: 'confirmed',
          description: 'Order confirmed - Payment verified',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: rfq.shipownerUid,
        });
      }

      if (['in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        currentTime = new Date(currentTime.getTime() + 2 * 24 * 60 * 60 * 1000);
        timeline.push({
          status: 'in_progress',
          description: 'Order in progress - Items being prepared',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: quotation.supplierUid,
        });
      }

      if (['shipped', 'delivered'].includes(orderStatus)) {
        currentTime = new Date(currentTime.getTime() + (3 + Math.floor(Math.random() * 4)) * 24 * 60 * 60 * 1000);
        timeline.push({
          status: 'shipped',
          description: 'Order shipped',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: quotation.supplierUid,
        });
      }

      if (orderStatus === 'delivered') {
        currentTime = new Date(currentTime.getTime() + (3 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000);
        timeline.push({
          status: 'delivered',
          description: 'Order delivered',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: quotation.supplierUid,
        });
      }
    }

    const expectedDeliveryDate = ['in_progress', 'shipped', 'delivered'].includes(orderStatus)
      ? admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + (7 + Math.floor(Math.random() * 14)) * 24 * 60 * 60 * 1000)
        )
      : null;

    const orderData = {
      rfqId,
      quotationId: acceptedQuotationId,
      shipownerUid: rfq.shipownerUid,
      supplierUid: quotation.supplierUid,
      shipownerCompany: shipowner.data?.companyName || rfq.shipownerCompany,
      supplierCompany: quotation.supplierCompany,
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

    if (orderCount % 5 === 0) {
      console.log(`   ✅ Created ${orderCount} orders...`);
    }
  }

  console.log(`   ✅ Created ${orderCount} orders total`);
}

// ==================== MAIN FUNCTION ====================

async function main() {
  try {
    console.log('============================================================');
    console.log('🚀 CREATE RICH DATA FOR SHIPOWNER1 & SUPPLIER1');
    console.log('============================================================\n');

    // Get users
    console.log('🔍 Finding users...');
    const shipowner = await getUserByEmail(SHIPOWNER1_EMAIL);
    const supplier = await getUserByEmail(SUPPLIER1_EMAIL);

    if (!shipowner) {
      console.error(`❌ Shipowner1 not found: ${SHIPOWNER1_EMAIL}`);
      console.error('Please create this account first.');
      process.exit(1);
    }

    if (!supplier) {
      console.error(`❌ Supplier1 not found: ${SUPPLIER1_EMAIL}`);
      console.error('Please create this account first.');
      process.exit(1);
    }

    console.log(`✅ Found shipowner1: ${shipowner.data?.companyName || shipowner.uid}`);
    console.log(`✅ Found supplier1: ${supplier.data?.companyName || supplier.uid}\n`);

    // Clean existing data
    await deleteExistingUserData(shipowner.uid, 'shipowner');
    await deleteExistingUserData(supplier.uid, 'supplier');

    // Create RFQs
    const rfqIds = await createRFQs(shipowner);

    // Create Quotations
    const quotationMap = await createQuotations(rfqIds, supplier);

    // Create Orders
    await createOrders(rfqIds, quotationMap, shipowner, supplier);

    console.log('\n============================================================');
    console.log('✅ DATA CREATION COMPLETED SUCCESSFULLY!');
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

