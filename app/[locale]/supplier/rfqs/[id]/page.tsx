'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  Building2,
  MessageSquare,
  Send
} from 'lucide-react';

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
  status: string;
  quotationCount: number;
  shipownerCompany: string;
  attachments?: string[];
  createdAt: string;
}

export default function SupplierRFQDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmittedQuote, setHasSubmittedQuote] = useState(false);

  useEffect(() => {
    fetchRfqDetails();
  }, [id]);

  const fetchRfqDetails = async () => {
    try {
      const response = await fetch(`/api/rfq/list?status=open`);
      const data = await response.json();
      
      if (data.success) {
        const rfqData = data.rfqs.find((r: any) => r.id === id);
        if (rfqData) {
          setRfq(rfqData);
          // TODO: Check if supplier has already submitted a quote
        }
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
      'other': { tr: 'Diğer', en: 'Other' },
    };
    
    return categories[category]?.[locale as 'tr' | 'en'] || category;
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return locale === 'tr' ? 'Süresi doldu' : 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} ${locale === 'tr' ? 'gün' : 'days'} ${hours} ${locale === 'tr' ? 'saat' : 'hours'}`;
    }
    return `${hours} ${locale === 'tr' ? 'saat' : 'hours'}`;
  };

  const isDeadlineSoon = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return diff < 2 * 24 * 60 * 60 * 1000; // Less than 2 days
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {locale === 'tr' ? 'RFQ bulunamadı veya artık açık değil' : 'RFQ not found or no longer open'}
            </p>
            <Link href={`/${locale}/supplier/rfqs`}>
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
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={`/${locale}/supplier/rfqs`} className="hover:text-gray-900">
              {locale === 'tr' ? 'RFQ Fırsatları' : 'RFQ Opportunities'}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{rfq.title}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{rfq.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {rfq.shipownerCompany}
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {rfq.quotationCount} {locale === 'tr' ? 'teklif' : 'quotes'}
                </div>
              </div>
            </div>

            {!hasSubmittedQuote && (
              <Link href={`/${locale}/supplier/rfqs/${id}/quote`}>
                <Button size="lg" className="gap-2">
                  <Send className="h-5 w-5" />
                  {locale === 'tr' ? 'Teklif Ver' : 'Submit Quote'}
                </Button>
              </Link>
            )}
          </div>

          {/* Deadline Warning */}
          {isDeadlineSoon(rfq.deadline) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="font-medium">
                    {locale === 'tr' ? 'Son teklif tarihi yaklaşıyor!' : 'Deadline approaching!'}
                  </p>
                  <p className="text-sm">
                    {locale === 'tr' ? 'Kalan süre:' : 'Time remaining:'} {getTimeRemaining(rfq.deadline)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Kategori' : 'Category'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-medium">{getCategoryLabel(rfq.category)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Son Teklif Tarihi' : 'Deadline'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className={`font-medium ${isDeadlineSoon(rfq.deadline) ? 'text-orange-600' : ''}`}>
                    {new Date(rfq.deadline).toLocaleDateString(locale)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Rekabet Seviyesi' : 'Competition Level'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {rfq.quotationCount} {locale === 'tr' ? 'teklif' : 'quote(s)'}
                  </span>
                </div>
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
                  <CardTitle>{locale === 'tr' ? 'Talep Detayları' : 'Request Details'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {rfq.description}
                  </p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">
                          {locale === 'tr' ? 'Gemi Adı' : 'Vessel Name'}
                        </span>
                        <p className="font-medium mt-1">{rfq.vessel.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          {locale === 'tr' ? 'Gemi Tipi' : 'Vessel Type'}
                        </span>
                        <p className="font-medium mt-1">{rfq.vessel.type}</p>
                      </div>
                      {rfq.vessel.imo && (
                        <div>
                          <span className="text-sm text-gray-600">IMO</span>
                          <p className="font-medium mt-1">{rfq.vessel.imo}</p>
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
                    <CardDescription>
                      {locale === 'tr' 
                        ? 'Talep ile ilgili dökümanlar ve teknik çizimler'
                        : 'Documents and technical drawings related to the request'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rfq.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Actions & Info */}
            <div className="space-y-6">
              {/* Submit Quote Card */}
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {locale === 'tr' ? 'Teklifinizi Gönderin' : 'Submit Your Quote'}
                  </CardTitle>
                  <CardDescription>
                    {locale === 'tr' 
                      ? 'Bu fırsatı değerlendirmek için teklifinizi hazırlayın'
                      : 'Prepare your quote to evaluate this opportunity'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasSubmittedQuote ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-2">
                        {locale === 'tr' ? 'Teklifiniz gönderildi' : 'Your quote has been submitted'}
                      </p>
                      <Link href={`/${locale}/supplier/quotations`}>
                        <Button variant="outline" size="sm" className="w-full">
                          {locale === 'tr' ? 'Tekliflerime Git' : 'View My Quotes'}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <Link href={`/${locale}/supplier/rfqs/${id}/quote`}>
                        <Button className="w-full" size="lg">
                          <Send className="mr-2 h-5 w-5" />
                          {locale === 'tr' ? 'Teklif Hazırla' : 'Prepare Quote'}
                        </Button>
                      </Link>
                      <p className="text-xs text-gray-600 text-center">
                        {locale === 'tr' 
                          ? 'Rekabetçi fiyatlandırma yaparak kazanma şansınızı artırın'
                          : 'Increase your chances of winning with competitive pricing'}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {locale === 'tr' ? 'Önemli Tarihler' : 'Important Dates'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        {locale === 'tr' ? 'Yayınlanma Tarihi' : 'Published'}
                      </p>
                      <p className="font-medium">
                        {new Date(rfq.createdAt).toLocaleDateString(locale)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {locale === 'tr' ? 'Son Teklif Tarihi' : 'Deadline'}
                      </p>
                      <p className={`font-medium ${isDeadlineSoon(rfq.deadline) ? 'text-orange-600' : ''}`}>
                        {new Date(rfq.deadline).toLocaleDateString(locale)}
                        <br />
                        <span className="text-sm text-gray-600">
                          {new Date(rfq.deadline).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {locale === 'tr' ? 'Kalan Süre' : 'Time Remaining'}
                      </p>
                      <p className="font-medium text-primary">
                        {getTimeRemaining(rfq.deadline)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {locale === 'tr' ? '💡 Teklif İpuçları' : '💡 Bidding Tips'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>
                        {locale === 'tr' 
                          ? 'Detaylı ve net bir teklif hazırlayın'
                          : 'Prepare a detailed and clear quote'}
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>
                        {locale === 'tr' 
                          ? 'Teslimat sürelerini gerçekçi belirtin'
                          : 'Set realistic delivery times'}
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>
                        {locale === 'tr' 
                          ? 'Rekabetçi fiyatlandırma yapın'
                          : 'Offer competitive pricing'}
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>
                        {locale === 'tr' 
                          ? 'Varsa sertifikalarınızı ekleyin'
                          : 'Include certificates if available'}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
