/**
 * Comprehensive Mock Data Seeding Script
 * Populates Firestore with realistic maritime business data
 * 
 * Run with: npx ts-node scripts/seed-mock-data.ts
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

// Constants
const ADMIN_UID = 'admin-uid-001';
const SHIPOWNERS = 20;
const SUPPLIERS = 20;

// ==================== DATA GENERATORS ====================

// Turkish Maritime Company Names
const shipownerNames = [
  'Akdeniz Denizcilik A.Ş.',
  'Ege Gemi İşletmeleri',
  'Karadeniz Shipping Co.',
  'Marmara Deniz Taşımacılığı',
  'Bosphorus Maritime Ltd.',
  'Anadolu Denizcilik',
  'İstanbul Shipping Group',
  'Yıldız Denizcilik',
  'Doğu Akdeniz Nakliyat',
  'Atlas Deniz Taşımacılık',
  'Kıyı Emniyeti Shipping',
  'Deniz Yıldızı A.Ş.',
  'İzmir Port Services',
  'Mersin Maritime Co.',
  'Trabzon Shipping Ltd.',
];

const supplierPrefixes = [
  'Deniz', 'Gemi', 'Marin', 'Navtec', 'Shiptech', 'Aqua', 'Maritime',
  'Ocean', 'Port', 'Anchor', 'Wave', 'Blue', 'Sea', 'Nautic', 'Marine',
  'Vessel', 'Ship', 'Cargo', 'Fleet', 'Harbor', 'Bay', 'Coast', 'Sail',
];

const supplierSuffixes = [
  'Tedarik', 'Makina', 'Ekipman', 'Malzeme', 'Teknoloji', 'Servis',
  'Yedek Parça', 'Sistemleri', 'Donanım', 'Ticaret', 'Sanayi',
  'Mühendislik', 'Ltd. Şti.', 'A.Ş.', 'Pazarlama', 'İthalat',
];

const vesselNames = [
  'MV Baltic Star', 'MT Ocean One', 'MV Mediterranean', 'MT Aegean Sea',
  'MV Marmara Queen', 'MT Bosphorus', 'MV Golden Horn', 'MT Izmir Express',
  'MV Anatolia', 'MT Turkish Breeze', 'MV Caprice', 'MT Destiny',
];

const vesselTypes = [
  'Container Ship', 'Bulk Carrier', 'Tanker', 'General Cargo', 'Multipurpose',
  'Breakbulk', 'RoRo Vessel', 'LPG Carrier', 'Refrigerated Vessel', 'Offshore Vessel',
];

const supplierMainCategories = [
  'chandler', 'spares', 'fire-safety', 'electrical', 'paints',
  'lubricants-oil', 'chemicals', 'ropes-anchors', 'nautical-charts', 'medical',
  'it-stationery',
];

const serviceProviderCategories = [
  'lsa', 'maintenance', 'hydraulic-cranes', 'radio-navigation',
  'underwater-diving', 'surveys-analyses', 'utm', 'salvage', 'consultant',
];

const rfqTitles = {
  tr: [
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
  ],
  en: [
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
  ],
};

const rfqDescriptions = {
  tr: [
    'Acil olarak ISO VG 220 motor yağına ihtiyaç vardır. Ürün belgeli ve uluslararası standardlara uygun olmalıdır.',
    'Geminiz için dış cephe ve iç koruma amaçlı teknik boya gereklidir. Deniz koşullarına dayanıklı olmalı.',
    'Tüm güvenlik ekipmanları periyodik muayene ve tamirat gereksiz. Sertifikalı teknisyenler tarafından yapılmalı.',
    'Navigasyon sistemi yazılım güncellemesi ve donanım bakımı gereklidir.',
    'Balast su tankı temizliği ve kargo tankı yıkama hizmetine ihtiyaç vardır.',
  ],
  en: [
    'Urgent need for ISO VG 220 engine oil supply. Product must be certified and compliant with international standards.',
    'Technical paint required for external hull and internal corrosion protection. Must be resistant to marine conditions.',
    'All safety equipment requires periodic inspection and maintenance. Must be performed by certified technicians.',
    'Navigation system software update and hardware maintenance required.',
    'Ballast water tank cleaning and cargo tank washing service required.',
  ],
};

const deliveryTimes = ['3 days', '5 days', '1 week', '10 days', '2 weeks'];

// ==================== SEED FUNCTIONS ====================

async function seedUsers() {
  console.log('\n🚢 Creating Shipowner Users...');
  const shipownerUids: string[] = [];

  for (let i = 0; i < SHIPOWNERS; i++) {
    const uid = `shipowner-${i + 1}`;
    shipownerUids.push(uid);

    const shipownerData = {
      uid,
      email: `shipowner${i + 1}@marineflux.com`,
      role: 'shipowner',
      companyName: shipownerNames[i % shipownerNames.length],
      phone: `+90 212 ${Math.random().toString().slice(2, 7)} ${Math.random().toString().slice(2, 6)}`,
      country: 'Turkey',
      city: ['Istanbul', 'Izmir', 'Mersin', 'Trabzon'][i % 4],
      address: `Port District ${i}, Istanbul`,
      vessels: [
        {
          id: `vessel-${i}-1`,
          name: vesselNames[i % vesselNames.length],
          type: vesselTypes[i % vesselTypes.length],
          imo: `${9000000 + i}`,
          flag: 'TR',
          portOfRegistry: 'Istanbul',
        },
        {
          id: `vessel-${i}-2`,
          name: vesselNames[(i + 1) % vesselNames.length],
          type: vesselTypes[(i + 1) % vesselTypes.length],
          imo: `${9100000 + i}`,
          flag: 'TR',
          portOfRegistry: 'Izmir',
        },
      ],
      activeOrders: Math.floor(Math.random() * 10),
      totalSpent: Math.floor(Math.random() * 500000) + 100000,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)),
    };

    await db.collection('users').doc(uid).set(shipownerData);
    await db.collection('shipowners').doc(uid).set(shipownerData);
    console.log(`  ✅ Created shipowner: ${shipownerData.companyName}`);
  }

  console.log('\n📦 Creating Supplier Users...');
  const supplierUids: string[] = [];

  for (let i = 0; i < SUPPLIERS; i++) {
    const uid = `supplier-${i + 1}`;
    supplierUids.push(uid);

    const isServiceProvider = Math.random() > 0.6;
    const categories = isServiceProvider
      ? [serviceProviderCategories[i % serviceProviderCategories.length]]
      : [supplierMainCategories[i % supplierMainCategories.length]];

    const companyName = `${supplierPrefixes[i % supplierPrefixes.length]} ${supplierSuffixes[Math.floor(i / supplierPrefixes.length) % supplierSuffixes.length]}`;

    const supplierData = {
      uid,
      email: `supplier${i + 1}@marineflux.com`,
      role: 'supplier',
      companyName,
      supplierType: isServiceProvider ? 'service-provider' : 'supplier',
      mainCategories: categories,
      isVerified: Math.random() > 0.3,
      rating: Math.floor(Math.random() * 20) / 4 + 3.5, // 3.5-5 stars
      reviewCount: Math.floor(Math.random() * 150) + 10,
      totalOrders: Math.floor(Math.random() * 200) + 5,
      description: isServiceProvider
        ? `Professional ${categories[0]} service provider with 10+ years experience`
        : `Specialized supplier of ${categories[0]} with global distribution network`,
      location: 'Istanbul, Turkey',
      phone: `+90 212 ${Math.random().toString().slice(2, 7)} ${Math.random().toString().slice(2, 6)}`,
      country: 'Turkey',
      city: 'Istanbul',
      address: `Maritime District ${i}, Istanbul`,
      website: `https://supplier${i}.example.com`,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)),
    };

    await db.collection('users').doc(uid).set(supplierData);
    await db.collection('suppliers').doc(uid).set(supplierData);
    console.log(`  ✅ Created supplier: ${supplierData.companyName} (${categories[0]})`);
  }

  return { shipownerUids, supplierUids };
}

async function seedRFQs(shipownerUids: string[], supplierUids: string[]) {
  console.log('\n📝 Creating RFQs...');
  const rfqUids: string[] = [];

  // Create 30-40 RFQs (will generate ~200 quotations with 5-7 per RFQ)
  const rfqCount = 30 + Math.floor(Math.random() * 10);

  for (let i = 0; i < rfqCount; i++) {
    const shipownerUid = shipownerUids[i % shipownerUids.length];
    const shipownerSnap = await db.collection('shipowners').doc(shipownerUid).get();
    const shipowner = shipownerSnap.data();

    const isServiceRFQ = Math.random() > 0.5;
    const titleIndex = i % rfqTitles.tr.length;

    const rfqData = {
      shipownerUid,
      title: rfqTitles.en[titleIndex],
      description: rfqDescriptions.en[Math.floor(Math.random() * rfqDescriptions.en.length)],
      supplierType: isServiceRFQ ? 'service-provider' : 'supplier',
      mainCategory: isServiceRFQ
        ? serviceProviderCategories[i % serviceProviderCategories.length]
        : supplierMainCategories[i % supplierMainCategories.length],
      vessel: {
        name: shipowner?.vessels[0]?.name || vesselNames[i % vesselNames.length],
        type: shipowner?.vessels[0]?.type || vesselTypes[i % vesselTypes.length],
        imo: shipowner?.vessels[0]?.imo || `${9000000 + i}`,
      },
      deadline: admin.firestore.Timestamp.fromDate(new Date(Date.now() + (7 + Math.random() * 14) * 24 * 60 * 60 * 1000)),
      status: ['open', 'open', 'open', 'closed', 'awarded'][Math.floor(Math.random() * 5)],
      shipownerCompany: shipowner?.companyName || 'Unknown',
      quotationCount: Math.floor(Math.random() * 15),
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)),
    };

    const rfqRef = await db.collection('rfqs').add(rfqData);
    rfqUids.push(rfqRef.id);
    console.log(`  ✅ Created RFQ: ${rfqData.title}`);
  }

  return rfqUids;
}

async function seedQuotations(rfqUids: string[], supplierUids: string[]) {
  console.log('\n💰 Creating Quotations...');
  const quotationUids: string[] = [];

  for (const rfqId of rfqUids) {
    const rfqSnap = await db.collection('rfqs').doc(rfqId).get();
    const rfq = rfqSnap.data();

    if (!rfq) continue;

    // Create 5-7 quotations per RFQ (30-40 RFQs = ~200 quotations)
    const quotationCount = 5 + Math.floor(Math.random() * 3);

    for (let i = 0; i < quotationCount; i++) {
      const supplierUid = supplierUids[Math.floor(Math.random() * supplierUids.length)];
      const supplierSnap = await db.collection('suppliers').doc(supplierUid).get();
      const supplier = supplierSnap.data();

      const quotationData = {
        rfqId,
        supplierUid,
        price: Math.floor(Math.random() * 50000) + 5000,
        currency: 'USD',
        deliveryTime: deliveryTimes[Math.floor(Math.random() * deliveryTimes.length)],
        notes: `Professional quotation from ${supplier?.companyName}. All items are genuine and certified. Delivery FOB Istanbul port.`,
        status: ['pending', 'pending', 'accepted', 'rejected'][Math.floor(Math.random() * 4)],
        supplierCompany: supplier?.companyName || 'Unknown',
        supplierRating: supplier?.rating || 4.5,
        rfqCategory: rfq?.mainCategory || rfq?.category || '', // Add category for calendar
        vesselName: rfq?.vessel?.name || '', // Add vessel name for calendar
        vesselType: rfq?.vessel?.type || '', // Add vessel type for calendar
        estimatedReadyDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + (3 + Math.random() * 15) * 24 * 60 * 60 * 1000)), // 3-18 days for supplier to prepare
        validUntil: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)),
      };

      const quotRef = await db.collection('quotations').add(quotationData);
      quotationUids.push(quotRef.id);
      console.log(`  ✅ Created quotation: ${supplier?.companyName || 'Unknown'} - $${quotationData.price}`);
    }
  }

  return quotationUids;
}

async function seedOrders(shipownerUids: string[], supplierUids: string[], rfqUids: string[]) {
  console.log('\n📦 Creating Orders...');
  const orderCount = 100;

  for (let i = 0; i < orderCount; i++) {
    const shipownerUid = shipownerUids[i % shipownerUids.length];
    const supplierUid = supplierUids[i % supplierUids.length];
    const rfqId = rfqUids[i % rfqUids.length];

    const shipownerSnap = await db.collection('shipowners').doc(shipownerUid).get();
    const supplierSnap = await db.collection('suppliers').doc(supplierUid).get();
    const rfqSnap = await db.collection('rfqs').doc(rfqId).get();

    const shipowner = shipownerSnap.data();
    const supplier = supplierSnap.data();
    const rfq = rfqSnap.data();

    const statuses: any[] = ['pending_supplier_approval', 'pending_payment', 'in_progress', 'shipped', 'delivered', 'completed', 'completed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const timeline: any[] = [
      {
        status: 'pending_supplier_approval',
        description: 'Order created - Awaiting supplier approval',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
        updatedBy: shipownerUid,
      },
    ];

    // Supplier approval
    if (status !== 'pending_supplier_approval') {
      timeline.push({
        status: 'pending_payment',
        description: 'Supplier approved - Awaiting payment',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)),
        updatedBy: supplierUid,
      });
    }

    // Payment made
    if (!['pending_supplier_approval', 'pending_payment'].includes(status)) {
      timeline.push({
        status: 'payment_awaiting_confirmation',
        description: 'Payment made - Awaiting confirmation',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
        updatedBy: shipownerUid,
      });

      timeline.push({
        status: 'paid',
        description: 'Payment confirmed',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)),
        updatedBy: supplierUid,
      });

      timeline.push({
        status: 'pending_shipowner_confirmation',
        description: 'Payment confirmed - Awaiting shipowner confirmation',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)),
        updatedBy: supplierUid,
      });
    }

    // Confirmed and in progress
    if (['in_progress', 'shipped', 'delivered', 'completed'].includes(status)) {
      timeline.push({
        status: 'confirmed',
        description: 'Order confirmed by shipowner',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
        updatedBy: shipownerUid,
      });

      timeline.push({
        status: 'in_progress',
        description: 'Order is being prepared',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
        updatedBy: supplierUid,
      });
    }

    // Shipped
    if (['shipped', 'delivered', 'completed'].includes(status)) {
      timeline.push({
        status: 'shipped',
        description: 'Order has been shipped',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
        updatedBy: supplierUid,
      });
    }

    // Delivered
    if (['delivered', 'completed'].includes(status)) {
      timeline.push({
        status: 'delivered',
        description: 'Order has been delivered',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        updatedBy: shipownerUid,
      });
    }

    // Completed
    if (status === 'completed') {
      timeline.push({
        status: 'completed',
        description: 'Order completed successfully',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        updatedBy: shipownerUid,
      });
    }

    const orderData = {
      rfqId,
      quotationId: `quot-${i}`,
      shipownerUid,
      supplierUid,
      amount: Math.floor(Math.random() * 50000) + 5000,
      currency: 'USD',
      status,
      paymentStatus: 
        status === 'pending_supplier_approval' || status === 'pending_payment' ? 'pending' :
        status === 'pending_shipowner_confirmation' ? 'payment_awaiting_confirmation' : 'paid',
      timeline,
      shipownerCompany: shipowner?.companyName || 'Unknown',
      supplierCompany: supplier?.companyName || 'Unknown',
      title: rfq?.title || 'Maritime Supply Order',
      description: rfq?.description || 'Standard maritime supply order',
      category: rfq?.mainCategory || rfq?.category || '', // Add category for calendar
      shipName: rfq?.vessel?.name || '', // Add ship name for calendar display
      expectedDeliveryDate: ['shipped', 'delivered', 'completed'].includes(status) 
        ? admin.firestore.Timestamp.fromDate(new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000))
        : null, // Expected delivery date for in-progress orders
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    };

    await db.collection('orders').add(orderData);
    console.log(`  ✅ Created order: ${orderData.title} - Status: ${status}`);
  }
}

async function seedChatsAndMessages(shipownerUids: string[], supplierUids: string[]) {
  console.log('\n💬 Creating Chats and Messages...');
  const chatCount = 50;

  for (let i = 0; i < chatCount; i++) {
    const shipownerUid = shipownerUids[i % shipownerUids.length];
    const supplierUid = supplierUids[i % supplierUids.length];

    const chatData = {
      participants: [shipownerUid, supplierUid],
      lastMessage: 'Thank you for the quotation. We will review and get back to you.',
      lastMessageTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)),
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    };

    const chatRef = await db.collection('chats').add(chatData);
    const chatId = chatRef.id;

    // Add 5-15 messages per chat
    const messageCount = 5 + Math.floor(Math.random() * 10);
    const messages = [
      'Hi, I would like to request a quotation for engine oil.',
      'Sure! We can provide ISO VG 220 engine oil. What quantity do you need?',
      'We need about 5 tons. Can you provide a price quote?',
      'Yes, I will send you the quotation within 24 hours.',
      'Thank you! Looking forward to your quotation.',
      'Here is our quotation. Please review and let us know.',
      'The price looks good. Can we arrange delivery?',
      'Yes, we can arrange delivery FOB Istanbul port within 3 days.',
      'Perfect! We will place the order.',
      'Thank you for your business. Order is confirmed.',
      'Great! Looking forward to the delivery.',
      'Items are ready for shipment. Tracking number will be sent soon.',
      'Thank you for the update.',
      'You are welcome. Have a great day!',
      'Same to you. Thanks again!',
    ];

    for (let j = 0; j < messageCount; j++) {
      const sender = j % 2 === 0 ? shipownerUid : supplierUid;
      const messageData = {
        chatId,
        sender,
        content: messages[j % messages.length],
        read: Math.random() > 0.3,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - (messageCount - j) * 2 * 60 * 60 * 1000)),
      };

      await db.collection('messages').add(messageData);
    }

    console.log(`  ✅ Created chat ${i + 1} with ${messageCount} messages`);
  }
}

async function seedReviews(supplierUids: string[], shipownerUids: string[]) {
  console.log('\n⭐ Creating Reviews...');
  const reviewCount = 50;

  const reviewComments = [
    'Excellent service and fast delivery. Highly recommended!',
    'Great quality products. Very professional team.',
    'Good prices and reliable delivery. Will order again.',
    'Outstanding customer service. Thank you!',
    'Perfect! Everything as expected.',
    'Very satisfied with the quality and service.',
    'Prompt response and professional handling.',
    'Highly professional and reliable partner.',
    'Best supplier in the region!',
    'Excellent experience. Will definitely work with them again.',
  ];

  for (let i = 0; i < reviewCount; i++) {
    const supplierUid = supplierUids[i % supplierUids.length];
    const shipownerUid = shipownerUids[i % shipownerUids.length];

    const supplierSnap = await db.collection('suppliers').doc(supplierUid).get();
    const shipownerSnap = await db.collection('shipowners').doc(shipownerUid).get();

    const supplier = supplierSnap.data();
    const shipowner = shipownerSnap.data();

    const reviewData = {
      orderId: `order-${i}`,
      shipownerUid,
      supplierUid,
      rating: [4, 4, 4, 4, 5, 5, 5, 5, 5, 5][Math.floor(Math.random() * 10)],
      comment: reviewComments[i % reviewComments.length],
      shipownerCompany: shipowner?.companyName || 'Unknown',
      orderTitle: 'Maritime Supply Order',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)),
    };

    await db.collection('reviews').add(reviewData);
    console.log(`  ✅ Created review: ${supplier?.companyName} - Rating: ${reviewData.rating}/5`);
  }
}

// ==================== MAIN SEEDING FUNCTION ====================

async function seedDatabase() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 MARINEFLUX MOCK DATA SEEDING');
    console.log('='.repeat(60));

    // Clear existing data (optional - uncomment to use)
    // console.log('\n🗑️  Clearing existing data...');
    // await clearDatabase();

    // Seed data in order
    const { shipownerUids, supplierUids } = await seedUsers();
    const rfqUids = await seedRFQs(shipownerUids, supplierUids);
    await seedQuotations(rfqUids, supplierUids);
    await seedOrders(shipownerUids, supplierUids, rfqUids);
    await seedChatsAndMessages(shipownerUids, supplierUids);
    await seedReviews(supplierUids, shipownerUids);

    console.log('\n' + '='.repeat(60));
    console.log('✨ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`  ✅ Shipowners: ${shipownerUids.length}`);
    console.log(`  ✅ Suppliers: ${supplierUids.length}`);
    console.log(`  ✅ RFQs: ${rfqUids.length}`);
    console.log(`  ✅ Chats/Messages: 25+`);
    console.log(`  ✅ Reviews: 30+`);
    console.log('\n🎉 Database is now populated with realistic maritime data!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
