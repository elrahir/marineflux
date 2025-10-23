import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

// Categories with realistic distribution
const categories = [
  'spare-parts',
  'provisions',
  'deck-equipment',
  'engine-parts',
  'safety-equipment',
  'chemicals',
  'navigation',
  'electrical',
  'services',
  'paint-coating',
  'oil-lubricant',
  'hardware-tools',
];

const locations = [
  'İstanbul, Türkiye',
  'İzmir, Türkiye',
  'Mersin, Türkiye',
  'Antalya, Türkiye',
  'Trabzon, Türkiye',
  'Kocaeli, Türkiye',
  'Bursa, Türkiye',
  'Tekirdağ, Türkiye',
  'Samsun, Türkiye',
  'Adana, Türkiye',
];

const certifications = [
  ['ISO 9001:2015', 'ISO 14001:2015'],
  ['ISO 9001:2015', 'CE Certified'],
  ['ISO 9001:2015', 'TSE Certified'],
  ['Lloyd\'s Register Approved', 'ABS Certified'],
  ['DNV GL Certified', 'Bureau Veritas'],
  ['IMO Certified', 'SOLAS Compliant'],
];

const deliveryAreas = [
  ['İstanbul', 'Kocaeli', 'Tekirdağ'],
  ['İzmir', 'Manisa', 'Aydın'],
  ['Mersin', 'Adana', 'Hatay'],
  ['Antalya', 'Muğla', 'Burdur'],
  ['Tüm Türkiye Limanları'],
  ['Akdeniz Bölgesi', 'Ege Bölgesi'],
  ['Marmara Bölgesi'],
  ['Karadeniz Bölgesi'],
];

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSupplierProfile(companyName: string, index: number) {
  // Each supplier gets 2-4 categories
  const categoryCount = 2 + Math.floor(Math.random() * 3);
  const serviceTypes = getRandomItems(categories, categoryCount);
  
  // Generate description based on categories
  const categoryNames: { [key: string]: string } = {
    'spare-parts': 'yedek parça',
    'provisions': 'iaşe',
    'deck-equipment': 'güverte ekipmanı',
    'engine-parts': 'makine parçaları',
    'safety-equipment': 'güvenlik ekipmanı',
    'chemicals': 'kimyasallar',
    'navigation': 'navigasyon ekipmanları',
    'electrical': 'elektrik malzemeleri',
    'services': 'teknik hizmetler',
    'paint-coating': 'boya ve kaplama',
    'oil-lubricant': 'yağ ve yağlayıcılar',
    'hardware-tools': 'donanım ve aletler',
  };
  
  const categoryList = serviceTypes.map(c => categoryNames[c] || c).join(', ');
  const description = `${companyName}, denizcilik sektöründe ${categoryList} alanlarında hizmet vermektedir. Yılların deneyimi ve profesyonel kadromuzla gemilerinizin tüm ihtiyaçlarını karşılamaya hazırız. Kaliteli ürünler, hızlı teslimat ve rekabetçi fiyatlarla hizmetinizdeyiz.`;
  
  // Random but realistic data
  const rating = 3.5 + Math.random() * 1.5; // 3.5 - 5.0
  const reviewCount = Math.floor(Math.random() * 50) + 5;
  const totalOrders = Math.floor(Math.random() * 100) + 10;
  const isVerified = Math.random() > 0.3; // 70% verified
  
  return {
    serviceTypes,
    description,
    location: locations[index % locations.length],
    contactEmail: `info@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    contactPhone: `+90 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
    website: `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    certifications: certifications[index % certifications.length],
    paymentTerms: Math.random() > 0.5 
      ? '%50 avans, %50 teslimat sırasında' 
      : '%30 avans, %70 fatura tarihinden itibaren 30 gün vade',
    deliveryAreas: deliveryAreas[index % deliveryAreas.length],
    rating: Math.round(rating * 10) / 10,
    reviewCount,
    totalOrders,
    isVerified,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get all supplier users
    const usersQuery = query(collection(db, 'users'), where('role', '==', 'supplier'));
    const usersSnapshot = await getDocs(usersQuery);
    
    let updated = 0;
    let created = 0;
    let skipped = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;
      const companyName = userData.companyName;

      // Check if supplier profile already exists
      const supplierDoc = await getDoc(doc(db, 'suppliers', uid));
      
      // Skip if already has serviceTypes (already populated)
      if (supplierDoc.exists() && supplierDoc.data().serviceTypes?.length > 0) {
        skipped++;
        continue;
      }

      // Generate profile data
      const profileData = generateSupplierProfile(companyName, updated + created);

      if (supplierDoc.exists()) {
        // Update existing
        await setDoc(doc(db, 'suppliers', uid), {
          uid,
          companyName,
          ...profileData,
          updatedAt: Timestamp.now(),
        }, { merge: true });
        updated++;
      } else {
        // Create new
        await setDoc(doc(db, 'suppliers', uid), {
          uid,
          companyName,
          ...profileData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier profiles auto-populated',
      stats: {
        total: usersSnapshot.docs.length,
        created,
        updated,
        skipped,
      },
    });
  } catch (error: any) {
    console.error('Error auto-populating supplier profiles:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-populate supplier profiles' },
      { status: 500 }
    );
  }
}



