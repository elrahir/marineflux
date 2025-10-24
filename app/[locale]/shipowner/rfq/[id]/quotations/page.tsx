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
import { FileText, Loader2, DollarSign, Clock, MapPin, Building2, CheckCircle, MessageCircle, Star } from 'lucide-react';
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
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Kabul Edildi' : 'Accepted'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
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
                <div className="text-2xl font-bold text-green-600">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedQuotations.map((quotation, index) => (
                    <Card 
                      key={quotation.id} 
                      className={`relative overflow-hidden transition-all hover:shadow-lg ${
                        quotation.price === lowestPrice 
                          ? 'ring-2 ring-green-500 shadow-green-100' 
                          : ''
                      }`}
                    >
                      {/* Best Offer Badge */}
                      {quotation.price === lowestPrice && (
                        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                          {locale === 'tr' ? '🏆 EN İYİ TEKLİF' : '🏆 BEST OFFER'}
                        </div>
                      )}

                      {/* Rank Badge */}
                      <div className="absolute top-4 left-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                        #{index + 1}
                      </div>

                      <CardHeader className="pt-16 pb-4">
                        {/* Company Name */}
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="h-5 w-5 text-maritime-600" />
                          <h3 className="text-xl font-bold text-gray-900">{quotation.supplierCompany}</h3>
                        </div>
                        
                        {/* Supplier Rating */}
                        {(quotation.supplierRating !== undefined && quotation.supplierRating > 0) && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(quotation.supplierRating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {quotation.supplierRating?.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({quotation.supplierReviewCount || 0} {locale === 'tr' ? 'değerlendirme' : 'reviews'})
                            </span>
                          </div>
                        )}
                        
                        {getStatusBadge(quotation.status)}
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Price - Most Important */}
                        <div className={`rounded-lg p-4 text-center ${
                          quotation.price === lowestPrice 
                            ? 'bg-green-50 border-2 border-green-500' 
                            : 'bg-maritime-50 border-2 border-maritime-200'
                        }`}>
                          <div className="text-sm text-gray-600 mb-1">
                            {locale === 'tr' ? 'Toplam Fiyat' : 'Total Price'}
                          </div>
                          <div className={`text-3xl font-bold ${
                            quotation.price === lowestPrice ? 'text-green-600' : 'text-maritime-700'
                          }`}>
                            {quotation.price.toLocaleString()}
                            <span className="text-lg ml-1">{quotation.currency}</span>
                          </div>
                          {/* Price Difference from Lowest */}
                          {quotation.price !== lowestPrice && (
                            <div className="text-xs text-red-600 mt-1">
                              +{((quotation.price - lowestPrice) / lowestPrice * 100).toFixed(1)}% 
                              <span className="ml-1">
                                ({(quotation.price - lowestPrice).toLocaleString()} {quotation.currency} {locale === 'tr' ? 'fazla' : 'more'})
                              </span>
                            </div>
                          )}
                          {quotation.price === lowestPrice && (
                            <div className="text-xs text-green-600 font-semibold mt-1">
                              {locale === 'tr' ? '✓ En düşük fiyat' : '✓ Lowest price'}
                            </div>
                          )}
                        </div>

                        {/* Key Metrics */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {locale === 'tr' ? 'Teslimat Süresi' : 'Delivery Time'}
                            </div>
                            <div className="font-semibold text-gray-900">
                              {quotation.deliveryTime} {locale === 'tr' ? 'gün' : 'days'}
                            </div>
                          </div>

                          {quotation.deliveryLocation && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                {locale === 'tr' ? 'Teslimat Yeri' : 'Delivery Location'}
                              </div>
                              <div className="font-semibold text-gray-900 text-right text-sm">
                                {quotation.deliveryLocation}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Specifications & Notes */}
                        {(quotation.specifications || quotation.notes) && (
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            {quotation.specifications && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  {locale === 'tr' ? 'Teknik Özellikler' : 'Specifications'}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">{quotation.specifications}</p>
                              </div>
                            )}

                            {quotation.notes && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  {locale === 'tr' ? 'Notlar' : 'Notes'}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">{quotation.notes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Submission Date */}
                        <div className="text-xs text-gray-500 text-center pt-2 border-t">
                          {locale === 'tr' ? 'Gönderilme:' : 'Submitted:'} {new Date(quotation.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-4">
                          {quotation.status === 'pending' && (
                            <>
                              <Button 
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleAcceptQuotation(quotation.id)}
                                disabled={processing === quotation.id}
                              >
                                {processing === quotation.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                {locale === 'tr' ? 'Kabul Et' : 'Accept'}
                              </Button>
                              <div className="grid grid-cols-2 gap-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContactSupplier(quotation.supplierUid, quotation.supplierCompany)}
                                >
                                  <MessageCircle className="mr-1 h-4 w-4" />
                                  {locale === 'tr' ? 'Mesaj' : 'Message'}
                                </Button>
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectQuotation(quotation.id)}
                                  disabled={processing === quotation.id}
                                >
                                  {locale === 'tr' ? 'Reddet' : 'Reject'}
                                </Button>
                              </div>
                            </>
                          )}
                          
                          {quotation.status === 'accepted' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-800 font-medium">
                                {locale === 'tr' ? 'Kabul edildi' : 'Accepted'}
                              </span>
                            </div>
                          )}
                          
                          {quotation.status === 'rejected' && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                              <span className="text-xs text-gray-600">
                                {locale === 'tr' ? 'Reddedildi' : 'Rejected'}
                              </span>
                            </div>
                          )}
                        </div>
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

