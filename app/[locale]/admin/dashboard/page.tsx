'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Ship, Package, TrendingUp, DollarSign, FileText, Activity, Tag } from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getCategoryLabel } from '@/types/categories';

interface DashboardStats {
  totalUsers: number;
  shipowners: number;
  suppliers: number;
  admins: number;
  productSuppliers: number;
  serviceProviders: number;
  topCategories: { categoryId: string; count: number }[];
}

export default function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    shipowners: 0,
    suppliers: 0,
    admins: 0,
    productSuppliers: 0,
    serviceProviders: 0,
    topCategories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());
      
      // Count by role
      const suppliers = users.filter(u => u.role === 'supplier');
      const productSuppliers = suppliers.filter(u => u.supplierType === 'supplier').length;
      const serviceProviders = suppliers.filter(u => u.supplierType === 'service-provider').length;
      
      // Count top categories
      const categoryCounts: { [key: string]: number } = {};
      suppliers.forEach(supplier => {
        supplier.mainCategories?.forEach((cat: string) => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      });
      
      const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([categoryId, count]) => ({ categoryId, count }));
      
      setStats({
        totalUsers: users.length,
        shipowners: users.filter(u => u.role === 'shipowner').length,
        suppliers: suppliers.length,
        admins: users.filter(u => u.role === 'admin').length,
        productSuppliers,
        serviceProviders,
        topCategories,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (categoryId: string) => {
    return getCategoryLabel(categoryId, locale === 'tr' ? 'tr' : 'en');
  };

  return (
    <ProtectedRoute allowedRoles={['admin']} locale={locale}>
      <DashboardLayout locale={locale} userType="admin">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' ? 'Platform yönetim paneli' : 'Platform management panel'}
            </p>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Toplam Kullanıcılar' : 'Total Users'}
                </CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats.totalUsers}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Sistemdeki toplam kullanıcı' : 'Total users in system'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Armatörler' : 'Shipowners'}
                </CardTitle>
                <Ship className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats.shipowners}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Kayıtlı armatör' : 'Registered shipowners'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Tedarikçiler' : 'Suppliers'}
                </CardTitle>
                <Package className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats.suppliers}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Kayıtlı tedarikçi' : 'Registered suppliers'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Admin Kullanıcılar' : 'Admin Users'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats.admins}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Sistem yöneticileri' : 'System administrators'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Supplier Types & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supplier Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {locale === 'tr' ? 'Tedarikçi Türleri' : 'Supplier Types'}
                </CardTitle>
                <CardDescription>
                  {locale === 'tr' ? 'Ürün vs Servis dağılımı' : 'Product vs Service distribution'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {locale === 'tr' ? 'Ürün Tedarikçileri' : 'Product Suppliers'}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {loading ? '...' : stats.productSuppliers}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: stats.suppliers > 0 
                            ? `${(stats.productSuppliers / stats.suppliers) * 100}%` 
                            : '0%'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {locale === 'tr' ? 'Servis Sağlayıcılar' : 'Service Providers'}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {loading ? '...' : stats.serviceProviders}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: stats.suppliers > 0 
                            ? `${(stats.serviceProviders / stats.suppliers) * 100}%` 
                            : '0%'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {locale === 'tr' ? 'En Popüler Kategoriler' : 'Top Categories'}
                </CardTitle>
                <CardDescription>
                  {locale === 'tr' ? 'Tedarikçiler tarafından seçilen kategoriler' : 'Categories selected by suppliers'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading || stats.topCategories.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {loading ? t('common.loading') : (locale === 'tr' ? 'Veri yok' : 'No data')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.topCategories.map((item, index) => (
                      <div key={item.categoryId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-sm font-semibold text-gray-500 w-6">#{index + 1}</div>
                          <div className="text-sm font-medium text-gray-700 truncate">
                            {getCategoryDisplayName(item.categoryId)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-maritime-500 to-maritime-600 h-1.5 rounded-full"
                              style={{
                                width: stats.topCategories.length > 0 
                                  ? `${(item.count / Math.max(...stats.topCategories.map(c => c.count))) * 100}%`
                                  : '0%'
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'Hızlı İşlemler' : 'Quick Actions'}</CardTitle>
              <CardDescription>
                {locale === 'tr' ? 'Sık kullanılan yönetim işlemleri' : 'Frequently used admin actions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={`/${locale}/admin/users/create`}>
                  <Button className="w-full" size="lg">
                    <Users className="mr-2 h-5 w-5" />
                    {t('admin.createUser')}
                  </Button>
                </Link>
                <Link href={`/${locale}/admin/users`}>
                  <Button variant="outline" className="w-full" size="lg">
                    <Users className="mr-2 h-5 w-5" />
                    {t('admin.users')}
                  </Button>
                </Link>
                <Link href={`/${locale}/admin/seed-data`}>
                  <Button variant="outline" className="w-full" size="lg">
                    <Activity className="mr-2 h-5 w-5" />
                    {locale === 'tr' ? 'Mock Veri Oluştur' : 'Seed Mock Data'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

