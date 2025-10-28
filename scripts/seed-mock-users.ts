/**
 * Mock Users Seeding Script
 * This script creates mock shipowners and suppliers for testing
 * 
 * Run with: npx ts-node scripts/seed-mock-users.ts
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

const categories = [
  'spare-parts', 'provisions', 'deck-equipment', 'engine-parts',
  'safety-equipment', 'chemicals', 'navigation', 'electrical', 'services'
];

function generateShipownerData(index: number): MockUser {
  const companyName = turkishShipownerNames[index] || `${turkishShipownerNames[index % turkishShipownerNames.length]} ${Math.floor(index / turkishShipownerNames.length) + 1}`;
  
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

    const data = await response.json();
    
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

async function seedMockUsers() {
  console.log('\n🌱 Starting mock users seeding...\n');
  console.log(`📊 Creating ${SHIPOWNER_COUNT} shipowners and ${SUPPLIER_COUNT} suppliers\n`);

  let successCount = 0;
  let failCount = 0;

  // Create shipowners
  console.log('🚢 Creating Shipowners...\n');
  for (let i = 0; i < SHIPOWNER_COUNT; i++) {
    const userData = generateShipownerData(i);
    const success = await createUser(userData);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📦 Creating Suppliers...\n');
  // Create suppliers
  for (let i = 0; i < SUPPLIER_COUNT; i++) {
    const userData = generateSupplierData(i);
    const success = await createUser(userData);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Seeding Complete!');
  console.log('='.repeat(60));
  console.log(`✅ Successfully created: ${successCount} users`);
  console.log(`❌ Failed: ${failCount} users`);
  console.log(`📊 Total: ${successCount + failCount} users`);
  console.log('='.repeat(60) + '\n');
}

// Run the script
seedMockUsers().catch(console.error);




