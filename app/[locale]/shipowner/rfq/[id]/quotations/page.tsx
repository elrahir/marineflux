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
import { FileText, Loader2, DollarSign, Clock, MapPin, Building2, CheckCircle, MessageCircle, Star, Info } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Quotation {
  id: string;
  supplierUid: string;
  supplierCompany: string;
  price: number;
  currency: string;
  deliveryTime: string;
  deliveryLocation: string;
  notes: string;
  specifications: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  supplierRating?: number;
  supplierReviewCount?: number;
  estimatedReadyDate?: string; // Added for estimated ready date
}

export default function RFQQuotationsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [rfq, setRfq] = useState<any>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchQuotations();
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
        }
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
    }
  };

  const fetchQuotations = async () => {
    try {
      console.log('Fetching quotations for RFQ:', id);
      const response = await fetch(`/api/quotation/list?rfqId=${id}`);
      const data = await response.json();
      
      console.log('Quotations response:', data);
      console.log('Number of quotations received:', data.quotations?.length || 0);
      
      if (data.success) {
        setQuotations(data.quotations);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Beklemede' : 'Pending'}
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-teal-100 text-teal-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Kabul Edildi' : 'Accepted'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-amber-100 text-amber-800">
            {locale === 'tr' ? 'Reddedildi' : 'Rejected'}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleAcceptQuotation = async (quotationId: string) => {
    if (!confirm(locale === 'tr' ? 'Bu teklifi kabul edip sipariş oluşturmak istediğinize emin misiniz?' : 'Are you sure you want to accept this quote and create an order?')) {
      return;
    }

    setProcessing(quotationId);

    try {
      const response = await fetch('/api/quotation/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId,
          shipownerUid: user?.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept quotation');
      }

      alert(locale === 'tr' ? '✓ Teklif kabul edildi ve sipariş oluşturuldu!' : '✓ Quotation accepted and order created!');
      
      // Redirect to orders page
      router.push(`/${locale}/shipowner/orders/${data.orderId}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectQuotation = async (quotationId: string) => {
    const reason = prompt(locale === 'tr' ? 'Red nedeni (opsiyonel):' : 'Rejection reason (optional):');
    
    if (reason === null) return; // User cancelled

    setProcessing(quotationId);

    try {
      const response = await fetch('/api/quotation/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId,
          shipownerUid: user?.uid,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject quotation');
      }

      alert(locale === 'tr' ? '✓ Teklif reddedildi' : '✓ Quotation rejected');
      fetchQuotations(); // Refresh
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleContactSupplier = (supplierUid: string, supplierCompany: string) => {
    console.log('Opening chat with:', { supplierUid, supplierCompany, rfqId: id });
    
    if (!supplierUid) {
      alert(locale === 'tr' ? 'Tedarikçi bilgisi bulunamadı' : 'Supplier info not found');
      return;
    }
    
    // Trigger floating chat widget to open with this supplier
    window.dispatchEvent(new CustomEvent('openChat', {
      detail: {
        recipientId: supplierUid,
        recipientName: supplierCompany,
        relatedEntityId: id,
        relatedEntityType: 'rfq'
      }
    }));
  };

  const sortedQuotations = [...quotations].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedQuotations[0]?.price;

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

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href={`/${locale}/shipowner/rfq`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {locale === 'tr' ? '← RFQ\'lara Dön' : '← Back to RFQs'}
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Gelen Teklifler' : 'Received Quotations'}
            </h1>
            {rfq && (
              <p className="text-gray-600 mt-2">{rfq.title}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Toplam Teklif' : 'Total Quotes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotations.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'En Düşük Fiyat' : 'Lowest Price'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {lowestPrice ? `${lowestPrice.toLocaleString()} ${sortedQuotations[0].currency}` : '-'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Bekleyen' : 'Pending'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {quotations.filter(q => q.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Kabul Edilen' : 'Accepted'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {quotations.filter(q => q.status === 'accepted').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quotations Comparison Grid */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {locale === 'tr' ? 'Teklif Karşılaştırması' : 'Quotation Comparison'}
              </h2>
              <p className="text-gray-600">
                {locale === 'tr' 
                  ? 'Gelen teklifleri yan yana karşılaştırın ve en uygununu seçin'
                  : 'Compare quotations side-by-side and select the best one'}
              </p>
            </div>

            {quotations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {locale === 'tr' ? 'Henüz teklif alınmadı' : 'No quotations received yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {sortedQuotations.map((quotation, index) => (
                    <Card 
                      key={quotation.id} 
                      className={`relative overflow-hidden transition-all hover:shadow-lg ${
                        quotation.price === lowestPrice 
                          ? 'ring-2 ring-teal-500 shadow-teal-100' 
                          : ''
                      }`}
                    >
                      {/* Best Offer Badge */}
                      {quotation.price === lowestPrice && (
                        <div className="absolute top-0 right-0 bg-teal-600 text-white px-2 py-0.5 text-xs font-bold rounded-bl">
                          {locale === 'tr' ? '🏆 EN İYİ' : '🏆 BEST'}
                        </div>
                      )}

                      {/* Rank Badge */}
                      <div className="absolute top-2 left-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs text-gray-600">
                        #{index + 1}
                      </div>

                      {/* Info Icon with Tooltip */}
                      {(quotation.specifications || quotation.notes) && (
                        <div className="absolute top-2 right-2 group">
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                          <div className="absolute right-0 top-6 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg whitespace-normal">
                            {quotation.specifications && (
                              <div className="mb-2 pb-2 border-b border-gray-700">
                                <p className="font-semibold text-xs mb-1">{locale === 'tr' ? 'Teknik Özellikler' : 'Specifications'}</p>
                                <p className="text-xs text-gray-200">{quotation.specifications}</p>
                              </div>
                            )}
                            {quotation.notes && (
                              <div>
                                <p className="font-semibold text-xs mb-1">{locale === 'tr' ? 'Notlar' : 'Notes'}</p>
                                <p className="text-xs text-gray-200">{quotation.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <CardHeader className="pb-3 pt-10">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-maritime-600 flex-shrink-0 mt-1" />
                          <h3 className="text-base font-bold text-gray-900 break-words">{quotation.supplierCompany}</h3>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Price Section */}
                        <div className={`rounded-lg p-3 text-center border-2 ${
                          quotation.price === lowestPrice 
                            ? 'bg-teal-50 border-teal-600' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="text-xs text-gray-600 mb-1">
                            {locale === 'tr' ? 'Toplam Fiyat' : 'Total Price'}
                          </div>
                          <div className={`text-2xl font-bold ${
                            quotation.price === lowestPrice ? 'text-teal-600' : 'text-gray-900'
                          }`}>
                            {quotation.price.toLocaleString()}
                            <span className="text-sm ml-1">{quotation.currency}</span>
                          </div>
                          {quotation.price !== lowestPrice && (
                            <div className="text-xs text-yellow-600 font-semibold mt-2">
                              +{((quotation.price - lowestPrice) / lowestPrice * 100).toFixed(1)}%
                              <span className="text-xs text-gray-600 ml-1">({(quotation.price - lowestPrice).toLocaleString()} fazla)</span>
                            </div>
                          )}
                        </div>

                        {/* Details Section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="h-3.5 w-3.5" />
                              {locale === 'tr' ? 'Teslimat' : 'Delivery'}
                            </div>
                            <div className="font-semibold text-gray-900 text-xs">
                              {quotation.deliveryTime} {locale === 'tr' ? 'gün' : 'days'}
                            </div>
                          </div>
                          {quotation.deliveryLocation && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="h-3.5 w-3.5" />
                                {locale === 'tr' ? 'Yer' : 'Location'}
                              </div>
                              <div className="font-semibold text-gray-900 text-xs text-right">
                                {quotation.deliveryLocation}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Section */}
                        <div>
                          {quotation.status === 'pending' && (
                            <Badge className="w-full justify-center bg-gradient-to-r from-yellow-200 to-yellow-100 text-yellow-900 border border-yellow-300">
                              <Clock className="h-3 w-3 mr-1" />
                              {locale === 'tr' ? 'Beklemede' : 'Pending'}
                            </Badge>
                          )}
                          {quotation.status === 'accepted' && (
                            <Badge className="w-full justify-center bg-gradient-to-r from-teal-200 to-teal-100 text-teal-900 border border-teal-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {locale === 'tr' ? 'Kabul Edildi' : 'Accepted'}
                            </Badge>
                          )}
                          {quotation.status === 'rejected' && (
                            <Badge className="w-full justify-center bg-gradient-to-r from-gray-200 to-gray-100 text-gray-900 border border-gray-300">
                              {locale === 'tr' ? 'Reddedildi' : 'Rejected'}
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                          {quotation.status === 'pending' && (
                            <>
                              <Button 
                                className="w-full bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white text-sm py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                onClick={() => handleAcceptQuotation(quotation.id)}
                                disabled={processing === quotation.id}
                              >
                                {processing === quotation.id ? (
                                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-2 h-3.5 w-3.5" />
                                )}
                                {locale === 'tr' ? 'Kabul Et' : 'Accept'}
                              </Button>
                              <div className="grid grid-cols-2 gap-2">
                                <Button 
                                  className="bg-gradient-to-r from-maritime-600 to-maritime-500 hover:from-maritime-700 hover:to-maritime-600 text-white text-xs py-1.5 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                  size="sm"
                                  onClick={() => handleContactSupplier(quotation.supplierUid, quotation.supplierCompany)}
                                >
                                  <MessageCircle className="mr-1 h-3 w-3" />
                                  {locale === 'tr' ? 'Mesaj' : 'Message'}
                                </Button>
                                <Button 
                                  className="bg-gradient-to-r from-orange-900 to-red-950 hover:from-orange-950 hover:to-red-1000 text-white text-xs py-1.5 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                  size="sm"
                                  onClick={() => handleRejectQuotation(quotation.id)}
                                  disabled={processing === quotation.id}
                                >
                                  {locale === 'tr' ? 'Reddet' : 'Reject'}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Timestamp */}
                        <p className="text-xs text-gray-500 text-center pt-2 border-t">
                          {locale === 'tr' ? 'Gönderme:' : 'Submitted:'} {new Date(quotation.createdAt).toLocaleDateString(locale)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

