/**
 * Create Test Data for shipowner1 Account
 * 
 * Bu script:
 * 1. Firebase Auth'da shipowner1 kullanıcısını oluşturur (yoksa)
 * 2. shipowner1 hesabı için gemi bilgileri oluşturur
 * 3. shipowner1 için RFQlar oluşturur
 * 4. Tedarikçilerden gelen teklifleri oluşturur
 * 5. Teklifleri kabul ederek siparişler oluşturur
 * 
 * Kullanım:
 * npm run create-shipowner1-data
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

const SHIPOWNER1_EMAIL = 'shipowner1@marineflux.com';
const SHIPOWNER1_PASSWORD = 'test123';
const RFQ_COUNT = 20;

const categories = [
  'chandler', 'spares', 'fire-safety', 'electrical', 'paints',
  'lubricants-oil', 'chemicals', 'ropes-anchors', 'nautical-charts', 'medical',
];

const rfqTitles: { [key: string]: string[] } = {
  'chandler': ['Kaptanlık Malzemeleri Tedariki', 'Gemi Erzacı Talepleri', 'Gövde Bakım Malzemeleri'],
  'spares': ['Motor Yedek Parçaları', 'Sistem Bileşenleri', 'Kritik Parçalar'],
  'fire-safety': ['İtfaiye Ekipmanı', 'Güvenlik Donanımı', 'Acil Durum Malzemeleri'],
  'electrical': ['Elektrik Paneli', 'Kablolama Malzemeleri', 'Aydınlatma Sistemleri'],
  'paints': ['Gemi Boyası', 'Ön İşlem Malzemeleri', 'Koruma Kaplaması'],
  'lubricants-oil': ['Motor Yağı', 'Hidrolik Sıvı', 'Yağlama Malzemeleri'],
  'chemicals': ['Temizlik Kimyasalları', 'Arıtma Kimyasalları', 'İşletim Kimyasalları'],
  'ropes-anchors': ['Halat ve Zincir', 'Çıpa Sistemleri', 'Bağlantı Malzemeleri'],
  'nautical-charts': ['Deniz Haritaları', 'Navigasyon Yayınları', 'Pilot Rehberleri'],
  'medical': ['Tıbbi Ekipman', 'İlaç Ürünleri', 'Sağlık Malzemeleri'],
};

const vesselNames = [
  'MV Atlantik', 'MV Mediterranean', 'MV Ocean Express',
  'MV Harmony', 'MV Destiny', 'MV Liberty',
  'MT Poseidon', 'MT Triton', 'MT Neptune',
];

const vesselTypes = ['Container Ship', 'Bulk Carrier', 'Tanker', 'General Cargo', 'Multipurpose'];

async function ensureShipowner1AuthUser(): Promise<string> {
  console.log('\n🔐 Firebase Auth Kontrol Ediliyor...\n');
  
  try {
    const userRecord = await auth.getUserByEmail(SHIPOWNER1_EMAIL);
    console.log(`✅ shipowner1 Firebase Auth'da zaten var. UID: ${userRecord.uid}\n`);
    return userRecord.uid;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`⏳ shipowner1 oluşturuluyor...\n`);
      try {
        const userRecord = await auth.createUser({
          email: SHIPOWNER1_EMAIL,
          password: SHIPOWNER1_PASSWORD,
          displayName: 'Akdeniz Denizcilik',
        });
        console.log(`✅ shipowner1 Firebase Auth'da başarıyla oluşturuldu. UID: ${userRecord.uid}\n`);
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

async function ensureShipowner1FirestoreData(uid: string): Promise<void> {
  console.log('📱 Firestore Kontrol Ediliyor...\n');
  
  const shipownerSnap = await db.collection('shipowners').doc(uid).get();
  
  if (!shipownerSnap.exists) {
    console.log('⏳ shipowner1 Firestore\'da olusturuluyor...\n');
    
    const shipownerData = {
      uid,
      email: SHIPOWNER1_EMAIL,
      role: 'shipowner',
      companyName: 'Akdeniz Denizcilik A.Ş.',
      phone: '+90 212 333 4444',
      country: 'Turkey',
      city: 'Istanbul',
      address: 'Port Authority Building, Istanbul',
      website: 'www.akdenizdenizcilik.com',
      fleet: [
        {
          id: `vessel-1`,
          name: 'MV Atlantik',
          type: 'Container Ship',
          imo: '9000001',
          flag: 'TR',
          portOfRegistry: 'Istanbul',
          yearBuilt: 2015,
          dwt: 98000,
        },
        {
          id: `vessel-2`,
          name: 'MV Mediterranean',
          type: 'Bulk Carrier',
          imo: '9000002',
          flag: 'TR',
          portOfRegistry: 'Izmir',
          yearBuilt: 2012,
          dwt: 75000,
        },
        {
          id: `vessel-3`,
          name: 'MT Poseidon',
          type: 'Tanker',
          imo: '9000003',
          flag: 'TR',
          portOfRegistry: 'Mersin',
          yearBuilt: 2018,
          dwt: 45000,
        },
      ],
      activeRFQs: 0,
      completedOrders: 0,
      totalSpent: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };
    
    await db.collection('shipowners').doc(uid).set(shipownerData);
    await db.collection('users').doc(uid).set(shipownerData);
    
    console.log(`✅ shipowner1 Firestore'da basariyla olusturuldu.\n`);
  } else {
    console.log(`✅ shipowner1 Firestore'da zaten var.\n`);
  }
}

async function deleteExistingShipowner1Data(uid: string): Promise<void> {
  console.log('\n🗑️  Onceki shipowner1 verisi temizleniyor...\n');
  
  try {
    // Delete RFQs
    const rfqsSnap = await db.collection('rfqs').where('shipownerUid', '==', uid).get();
    let deleteCount = 0;
    for (const doc of rfqsSnap.docs) {
      await doc.ref.delete();
      deleteCount++;
    }
    console.log(`  ✅ Silindi: ${deleteCount} RFQ`);
  } catch (error) {
    console.error('Silme islemi sirasinda hata:', error);
  }
}

async function createShipowner1Data() {
  console.log('============================================================');
  console.log('🚀 shipowner1 HESABI İÇİN VERİ OLUŞTUR');
  console.log('============================================================\n');

  try {
    // Ensure shipowner1 user exists
    const SHIPOWNER1_UID = await ensureShipowner1AuthUser();

    // Ensure shipowner1 document exists in Firestore
    await ensureShipowner1FirestoreData(SHIPOWNER1_UID);

    // Get shipowner1 data
    const shipownerSnap = await db.collection('shipowners').doc(SHIPOWNER1_UID).get();
    if (!shipownerSnap.exists) {
      console.error('❌ shipowner1 hesabı bulunamadı!');
      process.exit(1);
    }

    const shipownerData = shipownerSnap.data() as any;
    console.log(`✅ shipowner1 bulundu: ${shipownerData?.companyName}\n`);

    // Delete existing data
    await deleteExistingShipowner1Data(SHIPOWNER1_UID);

    // Get all suppliers
    const suppliersSnap = await db.collection('suppliers').limit(15).get();
    const suppliers = suppliersSnap.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        companyName: data.companyName,
        ...data 
      } as any;
    });
    console.log(`✅ ${suppliers.length} Tedarikçi bulundu\n`);

    // Create RFQs
    console.log('📋 RFQlar oluşturuluyor...\n');
    let rfqCount = 0;
    const createdRFQs: any[] = [];

    for (let i = 0; i < Math.min(RFQ_COUNT, suppliers.length); i++) {
      const categoryKey = categories[i % categories.length];
      const titles = rfqTitles[categoryKey];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const vessel = shipownerData.fleet[i % shipownerData.fleet.length];
      
      const rfqData = {
        shipownerUid: SHIPOWNER1_UID,
        shipownerCompany: shipownerData.companyName,
        title,
        description: `${title} için ${vessel.name} gemisine ait talep.`,
        mainCategory: categoryKey,
        category: categoryKey,
        vessel: {
          id: vessel.id,
          name: vessel.name,
          type: vessel.type,
        },
        status: 'open',
        quantity: Math.floor(Math.random() * 100) + 10,
        unit: 'units',
        deadline: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + (Math.floor(Math.random() * 20) + 3) * 24 * 60 * 60 * 1000)
        ),
        budget: Math.floor(Math.random() * 100000) + 10000,
        currency: 'USD',
        createdAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        ),
      };

      const rfqRef = await db.collection('rfqs').add(rfqData);
      createdRFQs.push({ id: rfqRef.id, ...rfqData });
      rfqCount++;
      console.log(`  ✅ RFQ ${rfqCount}: ${title}`);
    }

    console.log(`\n✨ Toplam ${rfqCount} RFQ oluşturuldu\n`);

    // Get supplier1 to create quotations
    const supplier1Snap = await db.collection('suppliers').where('email', '==', 'supplier1@marineflux.com').get();
    let supplier1Data: any = null;
    
    if (!supplier1Snap.empty) {
      supplier1Data = supplier1Snap.docs[0].data();
      supplier1Data.id = supplier1Snap.docs[0].id;
      console.log(`✅ supplier1 bulundu: ${supplier1Data.companyName}\n`);
    } else {
      console.log('⚠️  supplier1 bulunamadı, teklifler oluşturulamıyor\n');
      process.exit(1);
    }

    // Create quotations from supplier1 for some RFQs
    console.log('💰 Teklifler oluşturuluyor...\n');
    let quotationCount = 0;
    const createdQuotations: any[] = [];

    for (let i = 0; i < createdRFQs.length; i++) {
      const rfq = createdRFQs[i];
      
      const quotationData = {
        rfqId: rfq.id,
        supplierUid: supplier1Data.id,
        supplierCompany: supplier1Data.companyName,
        price: Math.floor(Math.random() * 45000) + 5000,
        currency: 'USD',
        deliveryTime: `${Math.floor(Math.random() * 20) + 5} days`,
        notes: `Professional quotation from ${supplier1Data.companyName}. All items are certified and insured.`,
        status: i < Math.ceil(createdRFQs.length * 0.7) ? 'accepted' : 'pending',
        rfqCategory: rfq.mainCategory,
        vesselName: rfq.vessel.name,
        vesselType: rfq.vessel.type,
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

    for (let i = 0; i < acceptedQuotations.length; i++) {
      const quotation = acceptedQuotations[i];
      const rfq = createdRFQs.find(r => r.id === quotation.rfqId);

      const orderStatus = ['pending', 'confirmed', 'in_progress', 'shipped', 'delivered'][Math.floor(Math.random() * 5)];
      
      // Generate timeline events based on order status
      const statusProgression = ['pending', 'confirmed', 'in_progress', 'shipped', 'delivered', 'completed'];
      const currentStatusIndex = statusProgression.indexOf(orderStatus);
      const timeline = [];
      
      // Create timeline events up to and including current status
      for (let j = 0; j <= Math.min(currentStatusIndex, 5); j++) {
        const status = statusProgression[j];
        const statusDescriptions: { [key: string]: string } = {
          'pending': 'Sipariş Oluşturuldu',
          'confirmed': 'Sipariş Onaylandı',
          'in_progress': 'Ürün Hazırlanıyor',
          'shipped': 'Kargoya Verildi',
          'delivered': 'Teslim Edildi',
          'completed': 'Sipariş Tamamlandı',
        };
        
        timeline.push({
          status,
          description: statusDescriptions[status],
          timestamp: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() - (5 - j) * 2 * 24 * 60 * 60 * 1000)
          ),
          updatedBy: SHIPOWNER1_UID,
        });
      }

      const orderData = {
        rfqId: quotation.rfqId,
        quotationId: quotation.id,
        shipownerUid: SHIPOWNER1_UID,
        shipownerCompany: shipownerData.companyName,
        supplierUid: supplier1Data.id,
        supplierCompany: supplier1Data.companyName,
        title: rfq?.title || 'Maritime Supply Order',
        description: rfq?.description || 'Standard maritime supply order',
        category: rfq?.mainCategory || rfq?.category,
        shipName: rfq?.vessel?.name,
        amount: quotation.price,
        currency: quotation.currency,
        deliveryTime: quotation.deliveryTime,
        status: orderStatus,
        paymentStatus: ['pending', 'pending', 'paid', 'paid'][Math.floor(Math.random() * 4)],
        expectedDeliveryDate: quotation.estimatedReadyDate,
        timeline,
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
    console.log('✅ shipowner1 VERİLERİ BAŞARIYLA OLUŞTURULDU!');
    console.log('============================================================');
    console.log('\n📊 Özet:');
    console.log(`   ✅ RFQlar: ${rfqCount}`);
    console.log(`   ✅ Teklifler: ${quotationCount}`);
    console.log(`   ✅ Siparişler: ${orderCount}`);
    console.log(`   ✅ Toplam Bütçe: $${createdRFQs.reduce((sum, r) => sum + (r.budget || 0), 0).toLocaleString()}`);
    console.log(`   ✅ Toplam Sipariş Değeri: $${acceptedQuotations.reduce((sum, q) => sum + (q.price || 0), 0).toLocaleString()}`);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    process.exit(1);
  }
}

createShipowner1Data();
