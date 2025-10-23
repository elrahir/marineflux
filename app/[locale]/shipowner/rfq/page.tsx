'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, XCircle, Plus, Ship, Calendar, Package } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'closed' | 'awarded';
  quotationCount: number;
  deadline: string;
  vessel?: {
    name: string;
    type: string;
  };
  createdAt: string;
}

export default function RFQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'awarded'>('all');

  useEffect(() => {
    if (user?.uid) {
      fetchRfqs();
    }
  }, [user?.uid, filter]);

  const fetchRfqs = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const response = await fetch(`/api/rfq/list?uid=${user?.uid}&role=shipowner${statusParam}`);
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRfqs(data.rfqs);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-green-100 text-green-800">
            <Clock className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Açık' : 'Open'}
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Kapalı' : 'Closed'}
          </Badge>
        );
      case 'awarded':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Verildi' : 'Awarded'}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: { tr: string; en: string } } = {
      'spare-parts': { tr: 'Yedek Parça', en: 'Spare Parts' },
      'provisions': { tr: 'İaşe', en: 'Provisions' },
      'deck-equipment': { tr: 'Güverte Ekipmanı', en: 'Deck Equipment' },
      'engine-parts': { tr: 'Makine Parçaları', en: 'Engine Parts' },
      'safety-equipment': { tr: 'Güvenlik Ekipmanı', en: 'Safety Equipment' },
      'chemicals': { tr: 'Kimyasallar', en: 'Chemicals' },
      'navigation': { tr: 'Navigasyon', en: 'Navigation' },
      'electrical': { tr: 'Elektrik', en: 'Electrical' },
      'services': { tr: 'Hizmetler', en: 'Services' },
      'other': { tr: 'Diğer', en: 'Other' },
    };
    
    return categories[category]?.[locale as 'tr' | 'en'] || category;
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const stats = {
    total: rfqs.length,
    open: rfqs.filter(r => r.status === 'open').length,
    closed: rfqs.filter(r => r.status === 'closed').length,
    awarded: rfqs.filter(r => r.status === 'awarded').length,
  };

  const filteredRfqs = filter === 'all' ? rfqs : rfqs.filter(r => r.status === filter);

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {locale === 'tr' ? 'Teklif Taleplerim' : 'My RFQs'}
              </h1>
              <p className="text-gray-600 mt-2">
                {locale === 'tr' 
                  ? 'Oluşturduğunuz teklif taleplerini görüntüleyin ve yönetin'
                  : 'View and manage your quotation requests'}
              </p>
            </div>
            <Link href={`/${locale}/shipowner/rfq/create`}>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                {locale === 'tr' ? 'Yeni RFQ Oluştur' : 'Create New RFQ'}
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilter('all')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Toplam RFQ' : 'Total RFQs'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${filter === 'open' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setFilter('open')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Açık' : 'Open'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.open}</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${filter === 'closed' ? 'ring-2 ring-gray-500' : ''}`}
              onClick={() => setFilter('closed')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Kapalı' : 'Closed'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${filter === 'awarded' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setFilter('awarded')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Verildi' : 'Awarded'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.awarded}</div>
              </CardContent>
            </Card>
          </div>

          {/* RFQ List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filter === 'all' 
                  ? (locale === 'tr' ? 'Tüm RFQ\'lar' : 'All RFQs')
                  : `${filteredRfqs.length} ${filter === 'open' ? (locale === 'tr' ? 'Açık' : 'Open') : filter === 'closed' ? (locale === 'tr' ? 'Kapalı' : 'Closed') : (locale === 'tr' ? 'Verilmiş' : 'Awarded')} RFQ`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  {t('common.loading')}
                </div>
              ) : filteredRfqs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {locale === 'tr' ? 'Henüz RFQ oluşturmadınız' : 'No RFQs created yet'}
                  </p>
                  <Link href={`/${locale}/shipowner/rfq/create`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {locale === 'tr' ? 'İlk RFQ\'nuzu Oluşturun' : 'Create Your First RFQ'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRfqs.map((rfq) => (
                    <div key={rfq.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{rfq.title}</h3>
                            {getStatusBadge(rfq.status)}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{rfq.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {getCategoryLabel(rfq.category)}
                            </div>
                            
                            {rfq.vessel && (
                              <div className="flex items-center gap-1">
                                <Ship className="h-4 w-4" />
                                {rfq.vessel.name}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {locale === 'tr' ? 'Son tarih: ' : 'Deadline: '}
                              <span className={isDeadlinePassed(rfq.deadline) ? 'text-red-600 font-medium' : ''}>
                                {new Date(rfq.deadline).toLocaleDateString(locale)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-primary">
                            {rfq.quotationCount}
                          </div>
                          <div className="text-sm text-gray-600">
                            {locale === 'tr' ? 'Teklif' : 'Quotes'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/${locale}/shipowner/rfq/${rfq.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            {locale === 'tr' ? 'Detaylar' : 'View Details'}
                          </Button>
                        </Link>
                        {rfq.quotationCount > 0 && (
                          <Link href={`/${locale}/shipowner/rfq/${rfq.id}/quotations`} className="flex-1">
                            <Button className="w-full">
                              {locale === 'tr' ? 'Teklifleri Görüntüle' : 'View Quotations'}
                            </Button>
                          </Link>
                        )}
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
