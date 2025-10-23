/**
 * Complete Test Data Setup Script
 * 
 * Bu script:
 * 1. Test kullanıcılarını oluşturur (shipowners + suppliers)
 * 2. Supplier profillerini zengin verilerle doldurur
 * 
 * Kullanım:
 * npm run setup-test-data
 */

const SHIPOWNER_COUNT = 20;
const SUPPLIER_COUNT = 100;
const API_BASE_URL = 'http://localhost:3000';

interface MockUser {
  email: string;
  password: string;
  role: 'shipowner' | 'supplier';
  companyName: string;
}

// Turkish company names for shipowners
const turkishShipownerNames = [
  'Akdeniz Denizcilik A.Ş.',
  'Ege Gemi İşletmeleri',
  'Karadeniz Shipping Co.',
  'Marmara Deniz Taşımacılığı',
  'Bosphorus Maritime Ltd.',
  'Anadolu Denizcilik',
  'Türk Deniz Kuvvetleri Vakfı',
  'İstanbul Shipping Group',
  'Yıldız Denizcilik',
  'Doğu Akdeniz Nakliyat',
  'Atlas Deniz Taşımacılık',
  'Kıyı Emniyeti Shipping',
  'Deniz Yıldızı A.Ş.',
  'Gemi Armatörleri Birliği',
  'Ankara Denizcilik',
  'İzmir Port Services',
  'Mersin Maritime Co.',
  'Trabzon Shipping Ltd.',
  'Antalya Deniz İşletmeleri',
  'Çanakkale Denizcilik A.Ş.',
];

// Turkish company names for suppliers
const turkishSupplierPrefixes = [
  'Deniz', 'Gemi', 'Marin', 'Navtec', 'Shiptech', 'Aqua', 'Maritime', 
  'Ocean', 'Port', 'Anchor', 'Wave', 'Blue', 'Sea', 'Nautic', 'Marine',
  'Vessel', 'Ship', 'Cargo', 'Fleet', 'Harbor', 'Bay', 'Coast', 'Sail',
];

const turkishSupplierSuffixes = [
  'Tedarik', 'Makina', 'Ekipman', 'Malzeme', 'Teknoloji', 'Servis',
  'Yedek Parça', 'Sistemleri', 'Donanım', 'Ticaret', 'Sanayi',
  'Mühendislik', 'Ltd. Şti.', 'A.Ş.', 'Pazarlama', 'İthalat',
];

function generateShipownerData(index: number): MockUser {
  const companyName = turkishShipownerNames[index] || 
    `${turkishShipownerNames[index % turkishShipownerNames.length]} ${Math.floor(index / turkishShipownerNames.length) + 1}`;
  
  return {
    email: `shipowner${index + 1}@marineflux.com`,
    password: 'test123',
    role: 'shipowner',
    companyName,
  };
}

function generateSupplierData(index: number): MockUser {
  const prefix = turkishSupplierPrefixes[index % turkishSupplierPrefixes.length];
  const suffix = turkishSupplierSuffixes[Math.floor(index / turkishSupplierPrefixes.length) % turkishSupplierSuffixes.length];
  const companyName = `${prefix} ${suffix}`;
  
  return {
    email: `supplier${index + 1}@marineflux.com`,
    password: 'test123',
    role: 'supplier',
    companyName,
  };
}

async function createUser(userData: MockUser): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data: any = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Failed to create ${userData.email}:`, data.error);
      return false;
    }
    
    console.log(`✅ Created ${userData.role}: ${userData.companyName} (${userData.email})`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating ${userData.email}:`, error);
    return false;
  }
}

async function autoPopulateSuppliers(): Promise<boolean> {
  try {
    console.log('\n🔧 Supplier profillerini zenginleştiriyorum...\n');
    
    const response = await fetch(`${API_BASE_URL}/api/supplier/auto-populate`, {
      method: 'POST',
    });

    const data: any = await response.json();
    
    if (!response.ok) {
      console.error('❌ Auto-populate failed:', data.error);
      return false;
    }
    
    console.log('✅ Supplier profilleri başarıyla dolduruldu!');
    console.log(`   • Oluşturulan: ${data.stats.created}`);
    console.log(`   • Güncellenen: ${data.stats.updated}`);
    console.log(`   • Atlanan: ${data.stats.skipped}`);
    console.log(`   • Toplam: ${data.stats.total}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Error auto-populating suppliers:', error);
    return false;
  }
}

async function setupTestData() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 TEST VERİLERİNİ HAZIRLA');
  console.log('='.repeat(70) + '\n');
  console.log(`📊 ${SHIPOWNER_COUNT} armatör ve ${SUPPLIER_COUNT} tedarikçi oluşturulacak\n`);

  let shipownerSuccess = 0;
  let supplierSuccess = 0;
  let failed = 0;

  // Create shipowners
  console.log('🚢 Armatörleri oluşturuyorum...\n');
  for (let i = 0; i < SHIPOWNER_COUNT; i++) {
    const userData = generateShipownerData(i);
    const success = await createUser(userData);
    
    if (success) {
      shipownerSuccess++;
    } else {
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n📦 Tedarikçileri oluşturuyorum...\n');
  // Create suppliers
  for (let i = 0; i < SUPPLIER_COUNT; i++) {
    const userData = generateSupplierData(i);
    const success = await createUser(userData);
    
    if (success) {
      supplierSuccess++;
    } else {
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Auto-populate supplier profiles
  const autoPopulateSuccess = await autoPopulateSuppliers();

  // Final summary
  console.log('='.repeat(70));
  console.log('✨ KURULUM TAMAMLANDI!');
  console.log('='.repeat(70));
  console.log(`\n📊 Özet:`);
  console.log(`   🚢 Armatör: ${shipownerSuccess}/${SHIPOWNER_COUNT} başarılı`);
  console.log(`   📦 Tedarikçi: ${supplierSuccess}/${SUPPLIER_COUNT} başarılı`);
  console.log(`   ❌ Başarısız: ${failed}`);
  console.log(`   ${autoPopulateSuccess ? '✅' : '❌'} Supplier profilleri ${autoPopulateSuccess ? 'dolduruldu' : 'doldurulamadı'}`);
  console.log('\n' + '='.repeat(70));
  
  console.log('\n🎉 Test verileriniz hazır!');
  console.log('\n📝 Test Hesapları:');
  console.log('   Armatör: shipowner1@marineflux.com - shipowner20@marineflux.com');
  console.log('   Tedarikçi: supplier1@marineflux.com - supplier100@marineflux.com');
  console.log('   Şifre: test123\n');
  console.log('🔗 Giriş yapın: http://localhost:3000/tr/login\n');
}

// Run the script
setupTestData().catch(console.error);

