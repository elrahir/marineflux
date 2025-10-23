'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Loader2, 
  Ship, 
  Calendar, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  vessel?: {
    name: string;
    type: string;
    imo?: string;
  };
  deadline: string;
  status: 'open' | 'closed' | 'awarded';
  quotationCount: number;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
}

export default function RFQDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchRfqDetails();
    }
  }, [id, user?.uid]);

  const fetchRfqDetails = async () => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch(`/api/rfq/list?uid=${user.uid}&role=shipowner`);
      const data = await response.json();
      
      if (data.success) {
        const rfqData = data.rfqs.find((r: any) => r.id === id);
        if (rfqData) {
          setRfq(rfqData);
        } else {
          // RFQ not found or doesn't belong to this user
          router.push(`/${locale}/shipowner/rfq`);
        }
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
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

  const handleCloseRFQ = async () => {
    if (!confirm(locale === 'tr' ? 'Bu RFQ\'yu kapatmak istediğinize emin misiniz?' : 'Are you sure you want to close this RFQ?')) {
      return;
    }

    try {
      // TODO: Implement close RFQ API
      alert(locale === 'tr' ? 'RFQ kapatma özelliği yakında eklenecek' : 'Close RFQ feature coming soon');
    } catch (error) {
      console.error('Error closing RFQ:', error);
    }
  };

  const handleDeleteRFQ = async () => {
    if (!confirm(locale === 'tr' ? 'Bu RFQ\'yu silmek istediğinize emin misiniz? Bu işlem geri alınamaz!' : 'Are you sure you want to delete this RFQ? This action cannot be undone!')) {
      return;
    }

    try {
      // TODO: Implement delete RFQ API
      alert(locale === 'tr' ? 'RFQ silme özelliği yakında eklenecek' : 'Delete RFQ feature coming soon');
    } catch (error) {
      console.error('Error deleting RFQ:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!rfq) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {locale === 'tr' ? 'RFQ bulunamadı' : 'RFQ not found'}
            </p>
            <Link href={`/${locale}/shipowner/rfq`}>
              <Button>
                {locale === 'tr' ? 'RFQ Listesine Dön' : 'Back to RFQ List'}
              </Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={`/${locale}/shipowner/rfq`} className="hover:text-gray-900">
              {locale === 'tr' ? 'RFQ\'lar' : 'RFQs'}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{rfq.title}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{rfq.title}</h1>
                {getStatusBadge(rfq.status)}
              </div>
              <p className="text-gray-600">
                {locale === 'tr' ? 'Oluşturulma:' : 'Created:'} {new Date(rfq.createdAt).toLocaleString(locale)}
              </p>
            </div>

            {rfq.status === 'open' && (
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  {locale === 'tr' ? 'Düzenle' : 'Edit'}
                </Button>
                <Button variant="outline" onClick={handleCloseRFQ}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {locale === 'tr' ? 'Kapat' : 'Close'}
                </Button>
                <Button variant="destructive" onClick={handleDeleteRFQ}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {locale === 'tr' ? 'Sil' : 'Delete'}
                </Button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Alınan Teklif' : 'Received Quotes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{rfq.quotationCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Kategori' : 'Category'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">{getCategoryLabel(rfq.category)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Son Tarih' : 'Deadline'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-medium ${isDeadlinePassed(rfq.deadline) ? 'text-red-600' : ''}`}>
                  {new Date(rfq.deadline).toLocaleDateString(locale)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Durum' : 'Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getStatusBadge(rfq.status)}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>{locale === 'tr' ? 'Açıklama' : 'Description'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{rfq.description}</p>
                </CardContent>
              </Card>

              {/* Vessel Info */}
              {rfq.vessel && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5" />
                      {locale === 'tr' ? 'Gemi Bilgileri' : 'Vessel Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">
                          {locale === 'tr' ? 'Gemi Adı:' : 'Vessel Name:'}
                        </span>
                        <p className="font-medium">{rfq.vessel.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          {locale === 'tr' ? 'Gemi Tipi:' : 'Vessel Type:'}
                        </span>
                        <p className="font-medium">{rfq.vessel.type}</p>
                      </div>
                      {rfq.vessel.imo && (
                        <div>
                          <span className="text-sm text-gray-600">IMO:</span>
                          <p className="font-medium">{rfq.vessel.imo}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {rfq.attachments && rfq.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{locale === 'tr' ? 'Ekler' : 'Attachments'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rfq.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {locale === 'tr' ? 'İşlemler' : 'Actions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/${locale}/shipowner/rfq/${id}/quotations`} className="block">
                    <Button className="w-full" size="lg">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      {locale === 'tr' 
                        ? `Teklifleri Görüntüle (${rfq.quotationCount})`
                        : `View Quotations (${rfq.quotationCount})`}
                    </Button>
                  </Link>

                  {rfq.status === 'open' && !isDeadlinePassed(rfq.deadline) && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        {locale === 'tr' 
                          ? 'RFQ hala açık ve teklif alıyor'
                          : 'RFQ is still open and accepting quotes'}
                      </p>
                    </div>
                  )}

                  {isDeadlinePassed(rfq.deadline) && rfq.status === 'open' && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        {locale === 'tr' 
                          ? 'Son tarih geçti. RFQ\'yu kapatabilirsiniz.'
                          : 'Deadline passed. You can close this RFQ.'}
                      </p>
                    </div>
                  )}

                  {rfq.status === 'awarded' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {locale === 'tr' 
                          ? 'Bu RFQ için sipariş verildi'
                          : 'Order has been placed for this RFQ'}
                      </p>
                      <Link href={`/${locale}/shipowner/orders`}>
                        <Button variant="link" className="p-0 h-auto">
                          {locale === 'tr' ? 'Siparişi Görüntüle →' : 'View Order →'}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {locale === 'tr' ? 'Zaman Çizelgesi' : 'Timeline'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div className="w-0.5 h-full bg-gray-200" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{locale === 'tr' ? 'Oluşturuldu' : 'Created'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(rfq.createdAt).toLocaleString(locale)}
                        </p>
                      </div>
                    </div>

                    {rfq.quotationCount > 0 && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                          <div className="w-0.5 h-full bg-gray-200" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">
                            {locale === 'tr' ? 'Teklifler Alındı' : 'Quotations Received'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {rfq.quotationCount} {locale === 'tr' ? 'teklif' : 'quote(s)'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          isDeadlinePassed(rfq.deadline) ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{locale === 'tr' ? 'Son Tarih' : 'Deadline'}</p>
                        <p className={`text-sm ${isDeadlinePassed(rfq.deadline) ? 'text-red-600' : 'text-gray-600'}`}>
                          {new Date(rfq.deadline).toLocaleString(locale)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
