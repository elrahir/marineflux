'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, CheckCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

interface RFQ {
  id: string;
  title: string;
  description: string;
  status: string;
  quotationCount: number;
  createdAt: string;
}

export default function ShipownerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchDashboardData();
    }
  }, [user?.uid]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/rfq/list?uid=${user?.uid}&role=shipowner&limit=100`);
      const data = await response.json();
      
      if (data.success) {
        setRfqs(data.rfqs);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    activeRfqs: rfqs.filter(r => r.status === 'open').length,
    pendingQuotes: rfqs.reduce((sum, r) => sum + (r.quotationCount || 0), 0),
    closedRfqs: rfqs.filter(r => r.status === 'closed').length,
    awardedRfqs: rfqs.filter(r => r.status === 'awarded').length,
  };

  const recentRfqs = rfqs.slice(0, 3);

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
                <div className="text-2xl font-bold">{loading ? '...' : stats.activeRfqs}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Açık teklif talepleri' : 'Open requests'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Alınan Teklifler' : 'Received Quotes'}
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.pendingQuotes}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Toplam teklif sayısı' : 'Total quotations'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Kapalı RFQ' : 'Closed RFQs'}
                </CardTitle>
                <Package className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.closedRfqs}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Sonlandırılmış talepler' : 'Completed requests'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Verilmiş RFQ' : 'Awarded RFQs'}
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.awardedRfqs}</div>
                <p className="text-xs text-green-600 mt-1">
                  {locale === 'tr' ? 'Sipariş verildi' : 'Orders placed'}
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
                <Link href={`/${locale}/shipowner/rfq/create`}>
                  <Button className="w-full" size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    {locale === 'tr' ? 'Yeni RFQ Oluştur' : 'Create New RFQ'}
                  </Button>
                </Link>
                <Link href={`/${locale}/shipowner/search`}>
                  <Button variant="outline" className="w-full" size="lg">
                    {locale === 'tr' ? 'Tedarikçi Ara' : 'Find Suppliers'}
                  </Button>
                </Link>
                <Link href={`/${locale}/shipowner/rfq`}>
                  <Button variant="outline" className="w-full" size="lg">
                    {locale === 'tr' ? 'Tüm RFQ\'ları Görüntüle' : 'View All RFQs'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent RFQs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{locale === 'tr' ? 'Son RFQ\'lar' : 'Recent RFQs'}</CardTitle>
                  <CardDescription>
                    {locale === 'tr' ? 'Son oluşturulan teklif talepleri' : 'Recently created requests for quotations'}
                  </CardDescription>
                </div>
                <Link href={`/${locale}/shipowner/rfq`}>
                  <Button variant="outline" size="sm">
                    {locale === 'tr' ? 'Tümünü Gör' : 'View All'}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                </div>
              ) : recentRfqs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {locale === 'tr' ? 'Henüz RFQ oluşturmadınız' : 'No RFQs created yet'}
                  </p>
                  <Link href={`/${locale}/shipowner/rfq/create`}>
                    <Button>
                      {locale === 'tr' ? 'İlk RFQ\'nuzu Oluşturun' : 'Create Your First RFQ'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRfqs.map((rfq) => (
                    <Link 
                      key={rfq.id} 
                      href={`/${locale}/shipowner/rfq/${rfq.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="h-10 w-10 text-primary" />
                        <div>
                          <h4 className="font-semibold">{rfq.title}</h4>
                          <p className="text-sm text-gray-600">
                            {rfq.quotationCount} {locale === 'tr' ? 'teklif alındı' : 'quotes received'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(rfq.createdAt).toLocaleDateString(locale)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rfq.status === 'open' 
                            ? 'bg-green-100 text-green-800' 
                            : rfq.status === 'closed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rfq.status === 'open' 
                            ? (locale === 'tr' ? 'Açık' : 'Open')
                            : rfq.status === 'closed'
                            ? (locale === 'tr' ? 'Kapalı' : 'Closed')
                            : (locale === 'tr' ? 'Verildi' : 'Awarded')
                          }
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

