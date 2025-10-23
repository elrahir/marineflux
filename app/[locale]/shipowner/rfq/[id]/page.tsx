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
import { FileText, Loader2, Calendar, Package, Ship, Clock, ArrowLeft, Mail, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function RFQDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFQDetails();
  }, [id]);

  const fetchRFQDetails = async () => {
    try {
      const response = await fetch(`/api/rfq/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setRfq(data.rfq);
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
        return <Badge className="bg-green-100 text-green-800">{locale === 'tr' ? 'Açık' : 'Open'}</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">{locale === 'tr' ? 'Kapalı' : 'Closed'}</Badge>;
      case 'awarded':
        return <Badge className="bg-blue-100 text-blue-800">{locale === 'tr' ? 'Verildi' : 'Awarded'}</Badge>;
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
    };
    
    return categories[category]?.[locale as 'tr' | 'en'] || category;
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'tr' ? 'RFQ Bulunamadı' : 'RFQ Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {locale === 'tr' ? 'Aradığınız teklif talebi bulunamadı.' : 'The RFQ you are looking for was not found.'}
            </p>
            <Button onClick={() => router.push(`/${locale}/shipowner/rfq`)}>
              {locale === 'tr' ? 'RFQ Listesine Dön' : 'Back to RFQ List'}
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Back Button */}
          <div>
            <Link 
              href={`/${locale}/shipowner/rfq`}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {locale === 'tr' ? 'RFQ Listesine Dön' : 'Back to RFQ List'}
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{rfq.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(rfq.status)}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {getCategoryLabel(rfq.category)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {locale === 'tr' ? 'Oluşturulma:' : 'Created:'} {new Date(rfq.createdAt).toLocaleDateString(locale)}
                </span>
              </div>
            </div>
            {rfq.quotationCount > 0 && (
              <Link href={`/${locale}/shipowner/rfq/${id}/quotations`}>
                <Button size="lg">
                  {locale === 'tr' ? 'Teklifleri Görüntüle' : 'View Quotations'} ({rfq.quotationCount})
                </Button>
              </Link>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {locale === 'tr' ? 'Açıklama' : 'Description'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{rfq.description}</p>
                </CardContent>
              </Card>

              {/* Vessel Information */}
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">{locale === 'tr' ? 'Gemi Adı:' : 'Vessel Name:'}</span>
                        <span className="font-medium">{rfq.vessel.name}</span>
                      </div>
                      {rfq.vessel.type && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{locale === 'tr' ? 'Tip:' : 'Type:'}</span>
                          <span className="font-medium">{rfq.vessel.type}</span>
                        </div>
                      )}
                      {rfq.vessel.imo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">IMO:</span>
                          <span className="font-medium">{rfq.vessel.imo}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments (if any) */}
              {rfq.attachments && rfq.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {locale === 'tr' ? 'Ekler' : 'Attachments'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rfq.attachments.map((attachment: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Info */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {locale === 'tr' ? 'RFQ Bilgileri' : 'RFQ Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      {locale === 'tr' ? 'Durum' : 'Status'}
                    </div>
                    {getStatusBadge(rfq.status)}
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      {locale === 'tr' ? 'Son Teklif Tarihi' : 'Deadline'}
                    </div>
                    <div className={`font-medium ${isDeadlinePassed(rfq.deadline) ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(rfq.deadline).toLocaleDateString(locale)}
                      <div className="text-xs text-gray-500">
                        {new Date(rfq.deadline).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {isDeadlinePassed(rfq.deadline) && (
                      <Badge variant="outline" className="text-red-600 border-red-600 mt-2">
                        {locale === 'tr' ? 'Süresi Doldu' : 'Expired'}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      {locale === 'tr' ? 'Alınan Teklif Sayısı' : 'Quotations Received'}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {rfq.quotationCount || 0}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      {locale === 'tr' ? 'Kategori' : 'Category'}
                    </div>
                    <Badge variant="outline">
                      {getCategoryLabel(rfq.category)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {locale === 'tr' ? 'Şirket Bilgisi' : 'Company Info'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div className="font-medium">{rfq.shipownerCompany}</div>
                    <div className="text-gray-600 text-xs mt-1">
                      {locale === 'tr' ? 'Armatör' : 'Shipowner'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {locale === 'tr' ? 'İşlemler' : 'Actions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rfq.quotationCount > 0 && (
                    <Link href={`/${locale}/shipowner/rfq/${id}/quotations`} className="block">
                      <Button variant="default" className="w-full">
                        {locale === 'tr' ? 'Teklifleri İncele' : 'Review Quotations'}
                      </Button>
                    </Link>
                  )}
                  
                  {rfq.status === 'open' && (
                    <Button variant="outline" className="w-full" disabled>
                      <Mail className="mr-2 h-4 w-4" />
                      {locale === 'tr' ? 'Hatırlatıcı Gönder' : 'Send Reminder'}
                    </Button>
                  )}

                  {rfq.status === 'open' && (
                    <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                      {locale === 'tr' ? 'RFQ\'yu Kapat' : 'Close RFQ'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



