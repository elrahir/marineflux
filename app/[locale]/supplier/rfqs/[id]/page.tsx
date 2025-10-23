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
import { FileText, Loader2, Calendar, Package, Ship, Clock, ArrowLeft, Building2, Send } from 'lucide-react';

export default function SupplierRFQDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  
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

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff < 0) {
      return { expired: true, text: locale === 'tr' ? 'Süresi Doldu' : 'Expired' };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return { expired: false, text: `${days} ${locale === 'tr' ? 'gün' : 'days'}` };
    } else if (hours > 0) {
      return { expired: false, text: `${hours} ${locale === 'tr' ? 'saat' : 'hours'}` };
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return { expired: false, text: `${minutes} ${locale === 'tr' ? 'dakika' : 'minutes'}` };
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
        <DashboardLayout locale={locale} userType="supplier">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!rfq) {
    return (
      <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
        <DashboardLayout locale={locale} userType="supplier">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'tr' ? 'RFQ Bulunamadı' : 'RFQ Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {locale === 'tr' ? 'Aradığınız teklif talebi bulunamadı.' : 'The RFQ you are looking for was not found.'}
            </p>
            <Button onClick={() => router.push(`/${locale}/supplier/rfqs`)}>
              {locale === 'tr' ? 'RFQ Listesine Dön' : 'Back to RFQ List'}
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const timeRemaining = getTimeRemaining(rfq.deadline);

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Back Button */}
          <div>
            <Link 
              href={`/${locale}/supplier/rfqs`}
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
                <Badge variant="outline" className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {getCategoryLabel(rfq.category)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {rfq.shipownerCompany}
                </Badge>
              </div>
            </div>
            {rfq.status === 'open' && !timeRemaining.expired && (
              <Link href={`/${locale}/supplier/rfqs/${id}/quote`}>
                <Button size="lg">
                  <Send className="mr-2 h-5 w-5" />
                  {locale === 'tr' ? 'Teklif Gönder' : 'Submit Quote'}
                </Button>
              </Link>
            )}
          </div>

          {/* Deadline Warning */}
          {timeRemaining.expired ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <Clock className="h-5 w-5" />
                <span className="font-medium">
                  {locale === 'tr' ? 'Bu RFQ\'nun süresi doldu' : 'This RFQ has expired'}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-800">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">
                    {locale === 'tr' ? 'Kalan Süre:' : 'Time Remaining:'}
                  </span>
                  <span className="text-lg font-bold">{timeRemaining.text}</span>
                </div>
                <div className="text-sm text-orange-700">
                  {locale === 'tr' ? 'Son Tarih:' : 'Deadline:'} {new Date(rfq.deadline).toLocaleString(locale)}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {locale === 'tr' ? 'RFQ Detayları' : 'RFQ Details'}
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

              {/* Quotation Guidelines */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base text-blue-900">
                    {locale === 'tr' ? '💡 Teklif Verme İpuçları' : '💡 Quotation Tips'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>{locale === 'tr' ? 'Fiyatınızı net ve detaylı belirtin' : 'Provide clear and detailed pricing'}</li>
                    <li>{locale === 'tr' ? 'Teslimat sürenizi gerçekçi belirtin' : 'Set realistic delivery times'}</li>
                    <li>{locale === 'tr' ? 'Teknik özellikleri eksiksiz yazın' : 'Include complete technical specifications'}</li>
                    <li>{locale === 'tr' ? 'Ödeme şartlarınızı açıkça belirtin' : 'Clearly state payment terms'}</li>
                    <li>{locale === 'tr' ? 'Sertifikalarınızı ve referanslarınızı ekleyin' : 'Add certifications and references'}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Info */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {locale === 'tr' ? 'RFQ Bilgileri' : 'RFQ Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      {locale === 'tr' ? 'Yayınlanma' : 'Published'}
                    </div>
                    <div className="font-medium">
                      {new Date(rfq.createdAt).toLocaleDateString(locale)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      {locale === 'tr' ? 'Son Teklif Tarihi' : 'Deadline'}
                    </div>
                    <div className={`font-medium ${timeRemaining.expired ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(rfq.deadline).toLocaleDateString(locale)}
                      <div className="text-xs text-gray-500">
                        {new Date(rfq.deadline).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      {locale === 'tr' ? 'Rakip Teklif Sayısı' : 'Competing Quotes'}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {rfq.quotationCount || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {locale === 'tr' ? 'Teklif gönderildi' : 'Quotes submitted'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {locale === 'tr' ? 'Alıcı Bilgisi' : 'Buyer Info'}
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
              {rfq.status === 'open' && !timeRemaining.expired && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {locale === 'tr' ? 'İşlemler' : 'Actions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href={`/${locale}/supplier/rfqs/${id}/quote`} className="block">
                      <Button className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        {locale === 'tr' ? 'Teklif Gönder' : 'Submit Quotation'}
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full" disabled>
                      {locale === 'tr' ? 'Soru Sor' : 'Ask Question'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



