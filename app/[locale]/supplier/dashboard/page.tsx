'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, DollarSign, Star, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

interface RFQ {
  id: string;
  title: string;
  description: string;
  status: string;
  quotationCount: number;
  deadline: string;
  shipownerCompany: string;
  createdAt: string;
}

export default function SupplierDashboard({ params }: { params: Promise<{ locale: string }> }) {
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
    if (!user?.uid) return;
    
    try {
      // Tedarikçiler için kendi kategorilerindeki açık RFQ'ları getir
      const response = await fetch(`/api/rfq/list?status=open&uid=${user.uid}&role=supplier&limit=100`);
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
    newRfqs: rfqs.length,
    endingToday: rfqs.filter(r => {
      const diff = new Date(r.deadline).getTime() - new Date().getTime();
      return diff < 24 * 60 * 60 * 1000 && diff > 0;
    }).length,
  };

  const recentRfqs = rfqs.slice(0, 3);

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
                  {locale === 'tr' ? 'Açık RFQ\'lar' : 'Open RFQs'}
                </CardTitle>
                <FileText className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.newRfqs}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Teklif verilebilir' : 'Available to quote'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Bugün Bitenler' : 'Ending Today'}
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.endingToday}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Acil teklifler' : 'Urgent opportunities'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Gönderilen Teklifler' : 'Sent Quotations'}
                </CardTitle>
                <Package className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Henüz teklif yok' : 'No quotes yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Aktif Siparişler' : 'Active Orders'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Henüz sipariş yok' : 'No orders yet'}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{locale === 'tr' ? 'Yeni RFQ\'lar' : 'New RFQs'}</CardTitle>
                  <CardDescription>
                    {locale === 'tr' ? 'Teklif verebileceğiniz aktif talepler' : 'Active requests you can quote on'}
                  </CardDescription>
                </div>
                <Link href={`/${locale}/supplier/rfqs`}>
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
                  <p className="text-gray-500">
                    {locale === 'tr' ? 'Şu anda açık RFQ bulunmuyor' : 'No open RFQs at the moment'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRfqs.map((rfq) => (
                    <div key={rfq.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <FileText className="h-10 w-10 text-primary" />
                        <div>
                          <h4 className="font-semibold">{rfq.title}</h4>
                          <p className="text-sm text-gray-600">{rfq.shipownerCompany}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {locale === 'tr' ? 'Son tarih: ' : 'Deadline: '}
                          {new Date(rfq.deadline).toLocaleDateString(locale)}
                        </p>
                        <Link href={`/${locale}/supplier/rfqs/${rfq.id}/quote`}>
                          <Button size="sm" className="mt-2">
                            {locale === 'tr' ? 'Teklif Ver' : 'Submit Quote'}
                          </Button>
                        </Link>
                      </div>
                    </div>
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

