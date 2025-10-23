'use client';

import { use, useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Database, Users, Package, CheckCircle, XCircle } from 'lucide-react';

const SHIPOWNER_COUNT = 20;
const SUPPLIER_COUNT = 100;

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

export default function SeedDataPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ success: 0, failed: 0 });
  const [populatingProfiles, setPopulatingProfiles] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const generateShipownerData = (index: number) => {
    const companyName = turkishShipownerNames[index] || 
      `${turkishShipownerNames[index % turkishShipownerNames.length]} ${Math.floor(index / turkishShipownerNames.length) + 1}`;
    
    return {
      email: `shipowner${index + 1}@marineflux.com`,
      password: 'test123',
      role: 'shipowner',
      companyName,
    };
  };

  const generateSupplierData = (index: number) => {
    const prefix = turkishSupplierPrefixes[index % turkishSupplierPrefixes.length];
    const suffix = turkishSupplierSuffixes[Math.floor(index / turkishSupplierPrefixes.length) % turkishSupplierSuffixes.length];
    const companyName = `${prefix} ${suffix}`;
    
    return {
      email: `supplier${index + 1}@marineflux.com`,
      password: 'test123',
      role: 'supplier',
      companyName,
    };
  };

  const createUser = async (userData: any) => {
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        addLog(`❌ Failed: ${userData.companyName} - ${data.error}`);
        return false;
      }
      
      addLog(`✅ Created: ${userData.companyName} (${userData.email})`);
      return true;
    } catch (error: any) {
      addLog(`❌ Error: ${userData.companyName} - ${error.message}`);
      return false;
    }
  };

  const seedMockUsers = async () => {
    setLoading(true);
    setLogs([]);
    setStats({ success: 0, failed: 0 });
    setProgress({ current: 0, total: SHIPOWNER_COUNT + SUPPLIER_COUNT });

    addLog('🌱 Starting mock users seeding...');
    addLog(`📊 Creating ${SHIPOWNER_COUNT} shipowners and ${SUPPLIER_COUNT} suppliers`);
    addLog('');

    let successCount = 0;
    let failCount = 0;

    // Create shipowners
    addLog('🚢 Creating Shipowners...');
    for (let i = 0; i < SHIPOWNER_COUNT; i++) {
      const userData = generateShipownerData(i);
      const success = await createUser(userData);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
      setProgress({ current: i + 1, total: SHIPOWNER_COUNT + SUPPLIER_COUNT });
      setStats({ success: successCount, failed: failCount });
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    addLog('');
    addLog('📦 Creating Suppliers...');
    // Create suppliers
    for (let i = 0; i < SUPPLIER_COUNT; i++) {
      const userData = generateSupplierData(i);
      const success = await createUser(userData);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
      setProgress({ current: SHIPOWNER_COUNT + i + 1, total: SHIPOWNER_COUNT + SUPPLIER_COUNT });
      setStats({ success: successCount, failed: failCount });
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    addLog('');
    addLog('='.repeat(60));
    addLog('✨ Seeding Complete!');
    addLog('='.repeat(60));
    addLog(`✅ Successfully created: ${successCount} users`);
    addLog(`❌ Failed: ${failCount} users`);
    addLog(`📊 Total: ${successCount + failCount} users`);
    addLog('='.repeat(60));

    setLoading(false);

    // Auto-populate supplier profiles after creating users
    if (successCount > 0) {
      addLog('');
      addLog('🔄 Tedarikçi profillerini otomatik doldurma başlatılıyor...');
      await autoPopulateSupplierProfiles();
    }
  };

  const autoPopulateSupplierProfiles = async () => {
    setPopulatingProfiles(true);

    try {
      const response = await fetch('/api/supplier/auto-populate', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to populate profiles');
      }

      addLog('✅ Başarılı!');
      addLog(`📊 İstatistikler:`);
      addLog(`   - Toplam tedarikçi: ${data.stats.total}`);
      addLog(`   - Yeni oluşturuldu: ${data.stats.created}`);
      addLog(`   - Güncellendi: ${data.stats.updated}`);
      addLog(`   - Atlandı (zaten dolu): ${data.stats.skipped}`);
      addLog('');
      addLog('✨ Tüm tedarikçi profilleri kategorize edildi!');
    } catch (error: any) {
      addLog(`❌ Hata: ${error.message}`);
    } finally {
      setPopulatingProfiles(false);
    }
  };

  const progressPercentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <ProtectedRoute allowedRoles={['admin']} locale={locale}>
      <DashboardLayout locale={locale} userType="admin">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Mock Veri Oluştur' : 'Seed Mock Data'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' 
                ? 'Test için mock kullanıcılar oluşturun'
                : 'Create mock users for testing'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {locale === 'tr' ? 'Armatörler' : 'Shipowners'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{SHIPOWNER_COUNT}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {locale === 'tr' ? 'Tedarikçiler' : 'Suppliers'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{SUPPLIER_COUNT}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {locale === 'tr' ? 'Başarılı' : 'Success'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {locale === 'tr' ? 'Başarısız' : 'Failed'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {locale === 'tr' ? 'Veri Oluşturma' : 'Data Seeding'}
              </CardTitle>
              <CardDescription>
                {locale === 'tr'
                  ? `${SHIPOWNER_COUNT} armatör ve ${SUPPLIER_COUNT} tedarikçi oluşturulacak`
                  : `Will create ${SHIPOWNER_COUNT} shipowners and ${SUPPLIER_COUNT} suppliers`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!loading && logs.length === 0 && (
                <Button 
                  size="lg" 
                  onClick={seedMockUsers}
                  className="w-full"
                >
                  <Database className="mr-2 h-5 w-5" />
                  {locale === 'tr' ? 'Mock Verileri Oluştur' : 'Create Mock Data'}
                </Button>
              )}

              {loading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm font-medium">
                        {locale === 'tr' ? 'Oluşturuluyor...' : 'Creating...'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {progress.current} / {progress.total} ({progressPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {logs.length > 0 && !loading && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setLogs([]);
                        setStats({ success: 0, failed: 0 });
                        setProgress({ current: 0, total: 0 });
                      }}
                      className="flex-1"
                    >
                      {locale === 'tr' ? 'Temizle' : 'Clear'}
                    </Button>
                    <Button 
                      onClick={autoPopulateSupplierProfiles}
                      disabled={populatingProfiles}
                      className="flex-1"
                    >
                      {populatingProfiles && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {locale === 'tr' ? 'Profilleri Doldur' : 'Populate Profiles'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {locale === 'tr' ? 'Loglar' : 'Logs'}
                </CardTitle>
                <CardDescription>
                  {locale === 'tr' ? 'Gerçek zamanlı işlem günlüğü' : 'Real-time operation log'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                ℹ️ {locale === 'tr' ? 'Bilgi' : 'Information'}
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• {locale === 'tr' ? 'Tüm kullanıcılar için şifre: ' : 'Password for all users: '}<code className="bg-white px-2 py-1 rounded">test123</code></li>
                <li>• {locale === 'tr' ? 'Email formatı: ' : 'Email format: '}<code className="bg-white px-2 py-1 rounded">shipowner1@marineflux.com</code></li>
                <li>• {locale === 'tr' ? 'Her kullanıcı Firebase Authentication ve Firestore\'a eklenir' : 'Each user is added to Firebase Authentication and Firestore'}</li>
                <li>• {locale === 'tr' ? 'Tedarikçi profilleri otomatik kategorize edilir (12 kategori)' : 'Supplier profiles are auto-categorized (12 categories)'}</li>
                <li>• {locale === 'tr' ? 'Her tedarikçiye 2-4 kategori, sertifika ve iletişim bilgileri atanır' : 'Each supplier gets 2-4 categories, certifications and contact info'}</li>
                <li>• {locale === 'tr' ? 'İşlem yaklaşık ' : 'Process takes approximately '}{((SHIPOWNER_COUNT + SUPPLIER_COUNT) * 0.2 / 60).toFixed(1)} {locale === 'tr' ? 'dakika sürer' : 'minutes'}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

