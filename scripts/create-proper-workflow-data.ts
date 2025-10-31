/**
 * Create Proper Workflow Data for shipowner1 and supplier1
 * 
 * Bu script gerçek iş akışına uygun veriler oluşturur:
 * 1. RFQ'lar oluşturulur (status: open)
 * 2. Supplier'lar bu RFQ'lara quotation verir (status: pending)
 * 3. Shipowner bazı quotation'ları kabul eder -> quotation accepted, RFQ awarded
 * 4. Accepted quotation'lar için order oluşturulur
 * 
 * Tüm ilişkiler tutarlı ve gerçek akışa uygun olacak şekilde tasarlanmıştır.
 * 
 * Run with: npx ts-node scripts/create-proper-workflow-data.ts
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

async function deleteExistingUserData(uid: string, role: string) {
  console.log(`🗑️  Cleaning existing ${role} data...`);
  
  const collections = ['rfqs', 'quotations', 'orders'];
  
  for (const collectionName of collections) {
    const field = role === 'shipowner' ? 'shipownerUid' : 'supplierUid';
    const snapshot = await db.collection(collectionName)
      .where(field, '==', uid)
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

async function getOtherSuppliers(): Promise<any[]> {
  const suppliersSnap = await db.collection('suppliers').limit(10).get();
  return suppliersSnap.docs.map(doc => ({
    uid: doc.id,
    data: doc.data(),
  }));
}

// ==================== SEED FUNCTIONS ====================

async function createRFQs(shipowner: { uid: string; data: any }) {
  console.log('\n📝 Step 1: Creating RFQs (all with status: open)...');
  const rfqIds: string[] = [];

  // Create exactly 15 RFQs for shipsupplier1, ALL with status 'open' initially
  const rfqCount = 15;

  for (let i = 0; i < rfqCount; i++) {
    const isServiceRFQ = Math.random() > 0.55;
    const category = isServiceRFQ
      ? serviceCategories[i % serviceCategories.length]
      : categories[i % categories.length];

    const titleIndex = i % rfqTitles.length;
    const daysAgo = Math.floor(Math.random() * 90); // Created 0-90 days ago
    const deadlineDays = 5 + Math.floor(Math.random() * 25); // Deadline 5-30 days from now

    // Get vessel from shipowner data
    const vessels = shipowner.data?.fleet || shipowner.data?.vessels || [];
    const vessel = vessels.length > 0 
      ? vessels[i % vessels.length]
      : {
          name: vesselNames[i % vesselNames.length],
          type: vesselTypes[i % vesselTypes.length],
          imo: `${9000000 + i}`,
        };

    // ALL RFQs start as 'open' - they will be updated to 'awarded' or 'closed' later
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
      status: 'open', // ALL start as open
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
    
    await db.collection('rfqs').doc(rfqRef.id).update({ id: rfqRef.id });
    
    if ((i + 1) % 15 === 0 || i === rfqCount - 1) {
      console.log(`   ✅ Created ${i + 1}/${rfqCount} RFQs...`);
    }
  }

  console.log(`   ✅ Created ${rfqCount} RFQs (all open)`);
  return rfqIds;
}

async function createQuotations(rfqIds: string[], supplier1: { uid: string; data: any }) {
  console.log('\n💰 Step 2: Creating Quotations (all with status: pending)...');
  
  // Get other suppliers for variety
  const otherSuppliers = await getOtherSuppliers();
  const allSuppliers = [supplier1, ...otherSuppliers.filter(s => s.uid !== supplier1.uid)];
  
  const quotations: Array<{ id: string; rfqId: string; supplierUid: string; price: number; createdAt: any }> = [];
  let totalQuotations = 0;

  for (const rfqId of rfqIds) {
    const rfqDoc = await db.collection('rfqs').doc(rfqId).get();
    if (!rfqDoc.exists) continue;

    const rfq = rfqDoc.data();
    if (!rfq || rfq.status !== 'open') continue;

    // Supplier1 creates quotations for 75% of RFQs
    const supplier1ShouldQuote = Math.random() > 0.25;
    
    // Determine how many quotations this RFQ will have
    let quotationCount = 0;
    if (supplier1ShouldQuote) {
      quotationCount = 1; // Supplier1 always creates one if participating
    }
    
    // Add 1-3 other supplier quotations
    if (allSuppliers.length > 1) {
      quotationCount += Math.floor(Math.random() * 3) + 1; // 1-3 more quotations
    }

    const actualQuotations: string[] = [];

    for (let i = 0; i < quotationCount; i++) {
      const isSupplier1Quotation = supplier1ShouldQuote && i === 0;
      
      // Select supplier
      let currentSupplier;
      if (isSupplier1Quotation) {
        currentSupplier = supplier1;
      } else {
        const randomSupplier = allSuppliers[1 + Math.floor(Math.random() * (allSuppliers.length - 1))];
        if (!randomSupplier) continue;
        currentSupplier = randomSupplier;
      }

      // ALL quotations start as 'pending' - they will be accepted/rejected later
      const basePrice = 3000 + Math.floor(Math.random() * 47000);
      const priceVariation = basePrice * (0.05 - Math.random() * 0.1);
      const price = Math.floor(basePrice + priceVariation);

      const estimatedReadyDays = 3 + Math.floor(Math.random() * 18);
      const createdAtDaysAgo = Math.floor(Math.random() * 20);
      const createdAt = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - createdAtDaysAgo * 24 * 60 * 60 * 1000)
      );

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
          ? `Professional quotation from ${supplier1.data?.companyName || 'Supplier1'}. All items are genuine and certified. Quick delivery available.`
          : `Quotation from ${currentSupplier.data?.companyName || 'Supplier'}. Quality guaranteed.`,
        specifications: 'All items meet international maritime standards and certifications.',
        status: 'pending', // ALL start as pending
        estimatedReadyDate: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + estimatedReadyDays * 24 * 60 * 60 * 1000)
        ),
        createdAt,
        updatedAt: createdAt,
      };

      const quotRef = await db.collection('quotations').add(quotationData);
      actualQuotations.push(quotRef.id);
      totalQuotations++;

      // Store quotation info for later acceptance
      quotations.push({
        id: quotRef.id,
        rfqId,
        supplierUid: currentSupplier.uid,
        price,
        createdAt,
      });
    }

    // Update RFQ quotation count
    if (actualQuotations.length > 0) {
      await db.collection('rfqs').doc(rfqId).update({
        quotationCount: actualQuotations.length,
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }
  }

  console.log(`   ✅ Created ${totalQuotations} quotations (all pending)`);
  return quotations;
}

async function acceptQuotationsAndCreateOrders(
  quotations: Array<{ id: string; rfqId: string; supplierUid: string; price: number; createdAt: any }>,
  shipowner: { uid: string; data: any },
  supplier1: { uid: string; data: any }
) {
  console.log('\n✅ Step 3: Accepting quotations and creating orders...');
  
  // Group quotations by RFQ
  const quotationsByRfq = new Map<string, typeof quotations>();
  for (const quot of quotations) {
    if (!quotationsByRfq.has(quot.rfqId)) {
      quotationsByRfq.set(quot.rfqId, []);
    }
    quotationsByRfq.get(quot.rfqId)!.push(quot);
  }

  let acceptedCount = 0;
  let orderCount = 0;
  let supplier1AcceptedCount = 0;

  // For shipsupplier1: accept quotations for exactly 7 RFQs (create 7 orders)
  const rfqIdsArray = Array.from(quotationsByRfq.keys());
  const rfqsToAward = rfqIdsArray.slice(0, 7); // First 7 RFQs will be awarded
  let rfqIndex = 0;

  for (const [rfqId, rfqQuotations] of quotationsByRfq) {
    // First 7 RFQs get awarded, rest are closed
    const shouldAccept = rfqsToAward.includes(rfqId) && rfqQuotations.length > 0;
    
    if (!shouldAccept || rfqQuotations.length === 0) {
      // Mark RFQ as closed if no quotation accepted
      await db.collection('rfqs').doc(rfqId).update({
        status: 'closed',
        updatedAt: admin.firestore.Timestamp.now(),
      });
      rfqIndex++;
      continue;
    }

    // Select one quotation to accept (prefer supplier1's quotations 50% of the time)
    let selectedQuotation;
    const supplier1Quotations = rfqQuotations.filter(q => q.supplierUid === supplier1.uid);
    
    if (supplier1Quotations.length > 0 && Math.random() < 0.5) {
      // Accept supplier1's quotation
      selectedQuotation = supplier1Quotations[0];
      supplier1AcceptedCount++;
    } else {
      // Accept random quotation
      selectedQuotation = rfqQuotations[Math.floor(Math.random() * rfqQuotations.length)];
    }

    // Get quotation full data first
    const quotationDoc = await db.collection('quotations').doc(selectedQuotation.id).get();
    const quotation = quotationDoc.data();
    if (!quotation) continue;

    // Get RFQ data
    const rfqDoc = await db.collection('rfqs').doc(rfqId).get();
    const rfq = rfqDoc.data();
    if (!rfq) continue;

    // Calculate accepted date (should be in the past, after quotation creation)
    const quotationCreatedAt = quotation.createdAt?.toDate() || new Date();
    const daysAfterQuotation = 1 + Math.floor(Math.random() * 7); // 1-7 days after quotation
    const acceptedAt = admin.firestore.Timestamp.fromDate(
      new Date(quotationCreatedAt.getTime() + daysAfterQuotation * 24 * 60 * 60 * 1000)
    );

    // Update quotation to accepted
    await db.collection('quotations').doc(selectedQuotation.id).update({
      status: 'accepted',
      acceptedAt: acceptedAt,
      updatedAt: acceptedAt,
    });

    // Update RFQ to awarded
    await db.collection('rfqs').doc(rfqId).update({
      status: 'awarded',
      awardedQuotationId: selectedQuotation.id,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    // Get supplier data
    const supplierDoc = await db.collection('suppliers').doc(quotation.supplierUid).get();
    const supplierData = supplierDoc.exists ? supplierDoc.data() : null;

    // Create order for accepted quotation
    const orderStatusOptions: Array<{ status: string; paymentStatus: string; probability: number }> = [
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
    let selectedStatus = orderStatusOptions[0];
    
    for (const option of orderStatusOptions) {
      cumulativeProbability += option.probability;
      if (rand <= cumulativeProbability) {
        selectedStatus = option;
        break;
      }
    }

    const orderStatus = selectedStatus.status;
    const paymentStatus = selectedStatus.paymentStatus;

    // Create timeline based on status - ALL DATES IN THE PAST
    const timeline: any[] = [];
    
    // Order created when quotation was accepted - use acceptedAt as base
    // But ensure it's in the past (at least a few days ago)
    const acceptedAtDate = acceptedAt.toDate();
    const now = new Date();
    
    // If acceptedAt is in the future or too recent, adjust it to be in the past
    let orderCreatedDate = acceptedAtDate;
    if (orderCreatedDate >= now || (now.getTime() - orderCreatedDate.getTime()) < 2 * 24 * 60 * 60 * 1000) {
      // Make it at least 2 days ago, max 60 days ago
      const daysAgo = 2 + Math.floor(Math.random() * 58);
      orderCreatedDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    }
    
    const createdAt = admin.firestore.Timestamp.fromDate(orderCreatedDate);
    let currentTime = new Date(orderCreatedDate);

    timeline.push({
      status: 'pending_supplier_approval',
      description: 'Order created - Awaiting supplier approval',
      timestamp: admin.firestore.Timestamp.fromDate(currentTime),
      updatedBy: rfq.shipownerUid,
    });

    if (orderStatus !== 'pending_supplier_approval') {
      currentTime = new Date(currentTime.getTime() + (1 + Math.random() * 2) * 24 * 60 * 60 * 1000);
      timeline.push({
        status: 'pending_payment',
        description: 'Supplier approved - Awaiting payment',
        timestamp: admin.firestore.Timestamp.fromDate(currentTime),
        updatedBy: quotation.supplierUid,
      });

      if (['pending_shipowner_confirmation', 'confirmed', 'in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        currentTime = new Date(currentTime.getTime() + (1 + Math.random() * 2) * 24 * 60 * 60 * 1000);
        // Ensure this date is still in the past
        if (currentTime >= new Date()) {
          const daysAgo = 1 + Math.random() * 3;
          currentTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        }
        timeline.push({
          status: 'pending_shipowner_confirmation',
          description: 'Payment made - Awaiting shipowner confirmation',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: rfq.shipownerUid,
        });
      }

      // Add 'paid' event if paymentStatus is 'paid'
      if (paymentStatus === 'paid' && ['pending_shipowner_confirmation', 'confirmed', 'in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        currentTime = new Date(currentTime.getTime() + (1 + Math.random() * 2) * 24 * 60 * 60 * 1000);
        // Ensure this date is still in the past
        if (currentTime >= new Date()) {
          const daysAgo = 1 + Math.random() * 3;
          currentTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        }
        timeline.push({
          status: 'paid',
          description: 'Payment confirmed',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: rfq.shipownerUid,
        });
      }

      if (['confirmed', 'in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        currentTime = new Date(currentTime.getTime() + (1 + Math.random() * 2) * 24 * 60 * 60 * 1000);
        // Ensure this date is still in the past
        if (currentTime >= new Date()) {
          const daysAgo = 1 + Math.random() * 3;
          currentTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        }
        timeline.push({
          status: 'confirmed',
          description: 'Order confirmed - Payment verified',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: rfq.shipownerUid,
        });
      }

      if (['in_progress', 'shipped', 'delivered'].includes(orderStatus)) {
        currentTime = new Date(currentTime.getTime() + (2 + Math.random() * 3) * 24 * 60 * 60 * 1000);
        // Ensure this date is still in the past
        if (currentTime >= new Date()) {
          const daysAgo = 1 + Math.random() * 5;
          currentTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        }
        timeline.push({
          status: 'in_progress',
          description: 'Order in progress - Items being prepared',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: quotation.supplierUid,
        });
      }

      if (['shipped', 'delivered'].includes(orderStatus)) {
        currentTime = new Date(currentTime.getTime() + (3 + Math.random() * 5) * 24 * 60 * 60 * 1000);
        // Ensure shipped date is in the past (at least 1 day ago)
        const now = new Date();
        if (currentTime >= now) {
          // Make it 1-7 days ago
          const daysAgo = 1 + Math.random() * 6;
          currentTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        }
        timeline.push({
          status: 'shipped',
          description: 'Order shipped',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: quotation.supplierUid,
        });
      }

      if (orderStatus === 'delivered') {
        currentTime = new Date(currentTime.getTime() + (3 + Math.random() * 7) * 24 * 60 * 60 * 1000);
        // Ensure delivered date is in the past (at least 1 day ago)
        const now = new Date();
        if (currentTime >= now) {
          // Make it 1-3 days ago
          const daysAgo = 1 + Math.random() * 2;
          currentTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        }
        timeline.push({
          status: 'delivered',
          description: 'Order delivered',
          timestamp: admin.firestore.Timestamp.fromDate(currentTime),
          updatedBy: quotation.supplierUid,
        });
      }
    }

    // Expected delivery date should be in the future only if order is not delivered yet
    const expectedDeliveryDate = (orderStatus === 'in_progress' || orderStatus === 'shipped')
      ? admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + (3 + Math.floor(Math.random() * 10)) * 24 * 60 * 60 * 1000)
        )
      : null;

    // Update quotation with orderId
    const orderRef = db.collection('orders').doc();
    await db.collection('quotations').doc(selectedQuotation.id).update({
      orderId: orderRef.id,
    });

    // Create order with vessel and category information
    const orderData = {
      rfqId,
      quotationId: selectedQuotation.id,
      shipownerUid: rfq.shipownerUid,
      supplierUid: quotation.supplierUid,
      shipownerCompany: shipowner.data?.companyName || rfq.shipownerCompany,
      supplierCompany: supplierData?.companyName || quotation.supplierCompany,
      title: rfq.title,
      description: rfq.description,
      category: rfq.mainCategory || rfq.category || '', // Add category for display
      shipName: rfq.vessel?.name || '', // Add vessel name for display
      vessel: rfq.vessel || null, // Keep full vessel info
      amount: quotation.price,
      currency: quotation.currency || 'USD',
      status: orderStatus,
      paymentStatus: paymentStatus,
      timeline,
      expectedDeliveryDate,
      createdAt,
      updatedAt: timeline[timeline.length - 1]?.timestamp || createdAt,
    };

    await orderRef.set(orderData);
    
    acceptedCount++;
    orderCount++;

    if (quotation.supplierUid === supplier1.uid) {
      console.log(`   ✅ Supplier1 quotation accepted: ${rfq.title}`);
    }
  }

  console.log(`   ✅ Accepted ${acceptedCount} quotations`);
  console.log(`   ✅ Created ${orderCount} orders`);
  console.log(`   ✅ ${supplier1AcceptedCount} accepted quotations from supplier1`);
}

// ==================== MAIN FUNCTION ====================

async function main() {
  try {
    console.log('============================================================');
    console.log('🔄 CREATE PROPER WORKFLOW DATA');
    console.log('============================================================\n');

    // Get users
    console.log('🔍 Finding users...');
    const shipowner = await getUserByEmail(SHIPOWNER1_EMAIL);
    const supplier1 = await getUserByEmail(SUPPLIER1_EMAIL);

    if (!shipowner) {
      console.error(`❌ Shipowner1 not found: ${SHIPOWNER1_EMAIL}`);
      process.exit(1);
    }

    if (!supplier1) {
      console.error(`❌ Supplier1 not found: ${SUPPLIER1_EMAIL}`);
      process.exit(1);
    }

    console.log(`✅ Found shipowner1: ${shipowner.data?.companyName || shipowner.uid}`);
    console.log(`✅ Found supplier1: ${supplier1.data?.companyName || supplier1.uid}\n`);

    // Clean existing data
    await deleteExistingUserData(shipowner.uid, 'shipowner');
    await deleteExistingUserData(supplier1.uid, 'supplier');

    // Step 1: Create RFQs (all open)
    const rfqIds = await createRFQs(shipowner);

    // Step 2: Create Quotations (all pending, linked to RFQs)
    const quotations = await createQuotations(rfqIds, supplier1);

    // Step 3: Accept some quotations, update RFQs, and create orders
    await acceptQuotationsAndCreateOrders(quotations, shipowner, supplier1);

    console.log('\n============================================================');
    console.log('✅ DATA CREATION COMPLETED SUCCESSFULLY!');
    console.log('============================================================');
    console.log(`\n📊 Final Summary:`);
    console.log(`   - RFQs: ${rfqIds.length}`);
    console.log(`   - Quotations: ${quotations.length}`);
    console.log(`   - Orders: Created during acceptance process`);
    console.log('\n✅ All relationships are consistent:');
    console.log('   - Quotations are properly linked to RFQs');
    console.log('   - Orders are properly linked to accepted Quotations');
    console.log('   - RFQ status updated correctly (open -> awarded/closed)');
    console.log('\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

