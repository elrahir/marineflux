'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, CheckCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ShipownerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.welcome')}</h1>
            <p className="text-gray-600 mt-2">{t('shipowner.dashboard')}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Aktif RFQ' : 'Active RFQs'}
                </CardTitle>
                <FileText className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? '+3 son 7 günde' : '+3 in last 7 days'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Bekleyen Teklifler' : 'Pending Quotes'}
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? '8 farklı RFQ' : 'From 8 different RFQs'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Aktif Siparişler' : 'Active Orders'}
                </CardTitle>
                <Package className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-green-600 mt-1">
                  {locale === 'tr' ? '5 teslimat bu hafta' : '5 deliveries this week'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Bu Ay Harcanan' : 'Spent This Month'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,230</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? '+12% geçen aya göre' : '+12% from last month'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'Hızlı İşlemler' : 'Quick Actions'}</CardTitle>
              <CardDescription>
                {locale === 'tr' ? 'Sık kullanılan işlemler' : 'Frequently used actions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={`/${locale}/shipowner/rfq/new`}>
                  <Button className="w-full" size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    {t('shipowner.createRfq')}
                  </Button>
                </Link>
                <Link href={`/${locale}/shipowner/search`}>
                  <Button variant="outline" className="w-full" size="lg">
                    {locale === 'tr' ? 'Tedarikçi Ara' : 'Find Suppliers'}
                  </Button>
                </Link>
                <Link href={`/${locale}/shipowner/orders`}>
                  <Button variant="outline" className="w-full" size="lg">
                    {locale === 'tr' ? 'Siparişleri Görüntüle' : 'View Orders'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent RFQs */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'Son RFQ\'lar' : 'Recent RFQs'}</CardTitle>
              <CardDescription>
                {locale === 'tr' ? 'Son oluşturulan teklif talepleri' : 'Recently created requests for quotations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <FileText className="h-10 w-10 text-primary" />
                      <div>
                        <h4 className="font-semibold">
                          {locale === 'tr' ? 'Makine Yedek Parça Talebi' : 'Engine Spare Parts Request'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {locale === 'tr' ? '5 teklif alındı' : '5 quotes received'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {locale === 'tr' ? '2 gün önce' : '2 days ago'}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {locale === 'tr' ? 'Aktif' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

