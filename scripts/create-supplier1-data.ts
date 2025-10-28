/**
 * Create Test Data for supplier1 Account
 * 
 * Bu script:
 * 1. Firebase Auth'da supplier1 kullanıcısını oluşturur (yoksa)
 * 2. supplier1 hesabı için RFQları bulur
 * 3. supplier1 için teklifler oluşturur
 * 4. supplier1 için siparişler oluşturur
 * 
 * Kullanım:
 * npm run create-supplier1-data
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://marineflux-default-rtdb.firebaseio.com',
});

const db = admin.firestore();
const auth = admin.auth();

const SUPPLIER1_EMAIL = 'supplier1@marineflux.com';
const SUPPLIER1_PASSWORD = 'test123';
const QUOTATION_COUNT = 15;
const ORDER_COUNT = 8;

const categories = [
  'chandler', 'spares', 'fire-safety', 'electrical', 'paints',
  'lubricants-oil', 'chemicals', 'ropes-anchors', 'nautical-charts', 'medical',
];

async function ensureSupplier1AuthUser(): Promise<string> {
  console.log('\n🔐 Firebase Auth Kontrol Ediliyor...\n');
  
  try {
    // Try to get existing user
    const userRecord = await auth.getUserByEmail(SUPPLIER1_EMAIL);
    console.log(`✅ supplier1 Firebase Auth'da zaten var. UID: ${userRecord.uid}\n`);
    return userRecord.uid;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      // User doesn't exist, create it
      console.log(`⏳ supplier1 oluşturuluyor...\n`);
      try {
        const userRecord = await auth.createUser({
          email: SUPPLIER1_EMAIL,
          password: SUPPLIER1_PASSWORD,
          displayName: 'Deniz Tedarik',
        });
        console.log(`✅ supplier1 Firebase Auth'da başarıyla oluşturuldu. UID: ${userRecord.uid}\n`);
        return userRecord.uid;
      } catch (createError) {
        console.error(`❌ Firebase Auth'da kullanıcı oluşturma hatası:`, createError);
        throw createError;
      }
    } else {
      throw error;
    }
  }
}

async function ensureSupplier1FirestoreData(uid: string): Promise<void> {
  console.log('📱 Firestore Kontrol Ediliyor...\n');
  
  const supplierSnap = await db.collection('suppliers').doc(uid).get();
  
  if (!supplierSnap.exists) {
    console.log('⏳ supplier1 Firestore\'da olusturuluyor...\n');
    
    const supplierData = {
      uid,
      email: SUPPLIER1_EMAIL,
      role: 'supplier',
      companyName: 'Deniz Tedarik',
      phone: '+90 212 555 1234',
      country: 'Turkey',
      city: 'Istanbul',
      address: 'Port District, Istanbul',
      website: 'www.deniztedarik.com',
      yearsOfExperience: 15,
      employees: 50,
      certifications: ['ISO 9001', 'ISO 14001', 'SOLAS'],
      categories: [
        'chandler', 'spares', 'fire-safety', 'electrical', 'paints',
        'lubricants-oil', 'chemicals', 'ropes-anchors', 'nautical-charts', 'medical',
      ],
      averageRating: 4.8,
      totalReviews: 145,
      activeQuotations: 0,
      completedOrders: 0,
      totalRevenue: 1250000,
      responseTime: '< 2 hours',
      description: 'Professional maritime supplies and equipment provider with 15 years of industry experience.',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };
    
    // Create in both suppliers and users collections
    await db.collection('suppliers').doc(uid).set(supplierData);
    await db.collection('users').doc(uid).set(supplierData);
    
    console.log(`✅ supplier1 Firestore'da basariyla olusturuldu.\n`);
  } else {
    console.log(`✅ supplier1 Firestore'da zaten var.\n`);
  }
}

async function deleteExistingSupplier1Data(uid: string): Promise<void> {
  console.log('\n🗑️  Onceki supplier1 verisi temizleniyor...\n');
  
  try {
    // Delete quotations
    const quotationsSnap = await db.collection('quotations').where('supplierUid', '==', uid).get();
    let deleteCount = 0;
    for (const doc of quotationsSnap.docs) {
      await doc.ref.delete();
      deleteCount++;
    }
    console.log(`  ✅ Silindi: ${deleteCount} teklif`);
    
    // Delete orders
    const ordersSnap = await db.collection('orders').where('supplierUid', '==', uid).get();
    deleteCount = 0;
    for (const doc of ordersSnap.docs) {
      await doc.ref.delete();
      deleteCount++;
    }
    console.log(`  ✅ Silindi: ${deleteCount} siparis\n`);
  } catch (error) {
    console.error('Silme islemi sirasinda hata:', error);
  }
}

async function createSupplier1Data() {
  console.log('============================================================');
  console.log('🚀 supplier1 HESABI İÇİN VERİ OLUŞTUR');
  console.log('============================================================\n');

  try {
    // Ensure supplier1 user exists
    const SUPPLIER1_UID = await ensureSupplier1AuthUser();

    // Ensure supplier1 document exists in Firestore
    await ensureSupplier1FirestoreData(SUPPLIER1_UID);

    // Get supplier1 data
    const supplierSnap = await db.collection('suppliers').doc(SUPPLIER1_UID).get();
    if (!supplierSnap.exists) {
      console.error('❌ supplier1 hesabı bulunamadı!');
      process.exit(1);
    }

    const supplierData = supplierSnap.data();
    console.log(`✅ supplier1 bulundu: ${supplierData?.companyName}\n`);

    // Delete existing data
    await deleteExistingSupplier1Data(SUPPLIER1_UID);

    // Get all RFQs
    const rfqsSnap = await db.collection('rfqs').limit(20).get();
    const rfqs = rfqsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    console.log(`✅ ${rfqs.length} RFQ bulundu\n`);

    // Get all shipowners
    const shipownersSnap = await db.collection('shipowners').limit(10).get();
    const shipowners = shipownersSnap.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        companyName: data.companyName,
        ...data 
      } as any;
    });
    console.log(`✅ ${shipowners.length} Armatör bulundu\n`);

    // Create quotations
    console.log('💰 Teklifler oluşturuluyor...\n');
    let quotationCount = 0;
    const createdQuotations: any[] = [];

    for (let i = 0; i < Math.min(QUOTATION_COUNT, rfqs.length); i++) {
      const rfq = rfqs[i];
      
      const quotationData = {
        rfqId: rfq.id,
        supplierUid: SUPPLIER1_UID,
        supplierCompany: supplierData?.companyName,
        price: Math.floor(Math.random() * 45000) + 5000,
        currency: 'USD',
        deliveryTime: `${Math.floor(Math.random() * 20) + 5} days`,
        notes: `Professional quotation from ${supplierData?.companyName}. All items are certified and insured.`,
        status: i < 5 ? 'pending' : (i < 10 ? 'accepted' : 'rejected'),
        rfqCategory: (rfq as any).mainCategory || (rfq as any).category,
        vesselName: (rfq as any).vessel?.name || 'Test Vessel',
        vesselType: (rfq as any).vessel?.type || 'Container Ship',
        estimatedReadyDate: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + (Math.floor(Math.random() * 20) + 3) * 24 * 60 * 60 * 1000)
        ),
        createdAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        ),
      };

      const quotRef = await db.collection('quotations').add(quotationData);
      createdQuotations.push({ id: quotRef.id, ...quotationData });
      quotationCount++;
      console.log(`  ✅ Teklif ${quotationCount}: $${quotationData.price} (${quotationData.status})`);
    }

    console.log(`\n✨ Toplam ${quotationCount} teklif oluşturuldu\n`);

    // Create orders from accepted quotations
    console.log('📦 Siparişler oluşturuluyor...\n');
    let orderCount = 0;
    const acceptedQuotations = createdQuotations.filter(q => q.status === 'accepted');

    for (let i = 0; i < Math.min(ORDER_COUNT, acceptedQuotations.length); i++) {
      const quotation = acceptedQuotations[i];
      const rfq = rfqs.find(r => r.id === quotation.rfqId);
      const shipowner = shipowners[i % shipowners.length];

      const orderData = {
        rfqId: quotation.rfqId,
        quotationId: quotation.id,
        shipownerUid: shipowner.id,
        shipownerCompany: shipowner.companyName,
        supplierUid: SUPPLIER1_UID,
        supplierCompany: supplierData?.companyName,
        title: (rfq as any).title || 'Maritime Supply Order',
        description: (rfq as any).description || 'Standard maritime supply order',
        category: (rfq as any).mainCategory || (rfq as any).category,
        shipName: (rfq as any).vessel?.name,
        amount: quotation.price,
        currency: quotation.currency,
        deliveryTime: quotation.deliveryTime,
        status: ['pending', 'confirmed', 'in_progress', 'shipped', 'delivered'][Math.floor(Math.random() * 5)],
        paymentStatus: ['pending', 'pending', 'paid', 'paid'][Math.floor(Math.random() * 4)],
        expectedDeliveryDate: quotation.estimatedReadyDate,
        timeline: [
          {
            status: 'pending',
            description: 'Order created',
            timestamp: admin.firestore.Timestamp.now(),
            updatedBy: shipowner.id,
          },
        ],
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      const orderRef = await db.collection('orders').add(orderData);
      orderCount++;
      console.log(`  ✅ Sipariş ${orderCount}: $${orderData.amount} (${orderData.status})`);
    }

    console.log(`\n✨ Toplam ${orderCount} sipariş oluşturuldu\n`);

    // Summary
    console.log('============================================================');
    console.log('✅ supplier1 VERİLERİ BAŞARIYLA OLUŞTURULDU!');
    console.log('============================================================');
    console.log('\n📊 Özet:');
    console.log(`   ✅ Teklifler: ${quotationCount}`);
    console.log(`   ✅ Siparişler: ${orderCount}`);
    console.log(`   ✅ Toplam İşlem Değeri: $${createdQuotations.reduce((sum, q) => sum + q.price, 0).toLocaleString()}`);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    process.exit(1);
  }
}

createSupplier1Data();
