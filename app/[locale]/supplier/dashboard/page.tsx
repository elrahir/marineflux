'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, DollarSign, Star, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function SupplierDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.welcome')}</h1>
            <p className="text-gray-600 mt-2">{t('supplier.dashboard')}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Yeni RFQ\'lar' : 'New RFQs'}
                </CardTitle>
                <FileText className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? '+4 bugün' : '+4 today'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Gönderilen Teklifler' : 'Sent Quotations'}
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">34</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? '12 beklemede' : '12 pending'}
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
                <div className="text-2xl font-bold">22</div>
                <p className="text-xs text-green-600 mt-1">
                  {locale === 'tr' ? '8 teslimat bu hafta' : '8 deliveries this week'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Bu Ay Gelir' : 'Revenue This Month'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$67,450</div>
                <p className="text-xs text-green-600 mt-1">
                  {locale === 'tr' ? '+18% geçen aya göre' : '+18% from last month'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rating Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'Değerlendirme Özeti' : 'Rating Overview'}</CardTitle>
              <CardDescription>
                {locale === 'tr' ? 'Müşteri memnuniyeti puanınız' : 'Your customer satisfaction score'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-primary">4.8</div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-6 w-6 ${i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {locale === 'tr' ? '142 değerlendirme' : '142 reviews'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">98%</p>
                  <p className="text-sm text-gray-600">
                    {locale === 'tr' ? 'Zamanında teslimat' : 'On-time delivery'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <Link href={`/${locale}/supplier/rfqs`}>
                  <Button className="w-full" size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    {locale === 'tr' ? 'RFQ\'ları Görüntüle' : 'View RFQs'}
                  </Button>
                </Link>
                <Link href={`/${locale}/supplier/quotations`}>
                  <Button variant="outline" className="w-full" size="lg">
                    {locale === 'tr' ? 'Tekliflerim' : 'My Quotations'}
                  </Button>
                </Link>
                <Link href={`/${locale}/supplier/orders`}>
                  <Button variant="outline" className="w-full" size="lg">
                    {locale === 'tr' ? 'Siparişleri Yönet' : 'Manage Orders'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent RFQs */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'Yeni RFQ\'lar' : 'New RFQs'}</CardTitle>
              <CardDescription>
                {locale === 'tr' ? 'Teklif verebileceğiniz aktif talepler' : 'Active requests you can quote on'}
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
                          {locale === 'tr' ? 'Mediterranean Shipping Co.' : 'Mediterranean Shipping Co.'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {locale === 'tr' ? 'Son tarih: 3 gün' : 'Deadline: 3 days'}
                      </p>
                      <Button size="sm" className="mt-2">
                        {locale === 'tr' ? 'Teklif Ver' : 'Submit Quote'}
                      </Button>
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

