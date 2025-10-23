'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Ship, Package, TrendingUp, DollarSign, FileText, Activity } from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface DashboardStats {
  totalUsers: number;
  shipowners: number;
  suppliers: number;
  admins: number;
}

export default function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    shipowners: 0,
    suppliers: 0,
    admins: 0,
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
      
      setStats({
        totalUsers: users.length,
        shipowners: users.filter(u => u.role === 'shipowner').length,
        suppliers: users.filter(u => u.role === 'supplier').length,
        admins: users.filter(u => u.role === 'admin').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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

