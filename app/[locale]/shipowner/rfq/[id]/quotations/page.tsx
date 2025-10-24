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
                        <div className="absolute top-0 right-0 bg-teal-500 text-white px-2 py-0.5 text-xs font-bold rounded-bl">
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

                      <CardHeader className="pt-10 pb-2">
                        {/* Company Name */}
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{quotation.supplierCompany}</h3>
                        </div>
                        
                        {/* Supplier Rating */}
                        {(quotation.supplierRating !== undefined && quotation.supplierRating > 0) && (
                          <div className="flex items-center gap-1 mb-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= Math.round(quotation.supplierRating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                              {quotation.supplierRating?.toFixed(1)}
                            </span>
                          </div>
                        )}
                        
                        {getStatusBadge(quotation.status)}
                      </CardHeader>

                      <CardContent className="space-y-2 p-3">
                        {/* Price - Most Important */}
                        <div className={`rounded p-2 text-center text-xs ${
                          quotation.price === lowestPrice 
                            ? 'bg-teal-50 border border-teal-500' 
                            : 'bg-maritime-50 border border-maritime-200'
                        }`}>
                          <div className="text-gray-600">
                            {locale === 'tr' ? 'Fiyat' : 'Price'}
                          </div>
                          <div className={`text-lg font-bold ${
                            quotation.price === lowestPrice ? 'text-teal-600' : 'text-maritime-700'
                          }`}>
                            {quotation.price.toLocaleString()}
                            <span className="text-xs ml-1">{quotation.currency}</span>
                          </div>
                          {/* Price Difference from Lowest */}
                          {quotation.price !== lowestPrice && (
                            <div className="text-xs text-amber-600 mt-0.5">
                              +{((quotation.price - lowestPrice) / lowestPrice * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>

                        {/* Key Metrics */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                              {locale === 'tr' ? 'Teslimat' : 'Delivery'}
                            </span>
                            <span className="font-semibold">
                              {quotation.deliveryTime} {locale === 'tr' ? 'g' : 'd'}
                            </span>
                          </div>

                          {quotation.deliveryLocation && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">
                                {locale === 'tr' ? 'Yer' : 'Location'}
                              </span>
                              <span className="font-semibold truncate ml-1 text-right">
                                {quotation.deliveryLocation.split(',')[0]}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Submission Date */}
                        <div className="text-xs text-gray-500 text-center pt-1 border-t">
                          {new Date(quotation.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-1 pt-2">
                          {quotation.status === 'pending' && (
                            <>
                              <Button 
                                className="w-full bg-teal-600 hover:bg-teal-700 h-8 text-xs"
                                onClick={() => handleAcceptQuotation(quotation.id)}
                                disabled={processing === quotation.id}
                              >
                                {processing === quotation.id ? (
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                )}
                                {locale === 'tr' ? 'Kabul' : 'Accept'}
                              </Button>
                              <div className="grid grid-cols-2 gap-1">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleContactSupplier(quotation.supplierUid, quotation.supplierCompany)}
                                >
                                  <MessageCircle className="mr-0.5 h-3 w-3" />
                                  {locale === 'tr' ? 'Mesaj' : 'Msg'}
                                </Button>
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleRejectQuotation(quotation.id)}
                                  disabled={processing === quotation.id}
                                >
                                  {locale === 'tr' ? 'Red' : 'Reject'}
                                </Button>
                              </div>
                            </>
                          )}
                          
                          {quotation.status === 'accepted' && (
                            <div className="bg-teal-50 border border-teal-200 rounded p-1 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-teal-600" />
                              <span className="text-xs text-teal-800 font-medium">
                                {locale === 'tr' ? 'Kabul' : 'Accepted'}
                              </span>
                            </div>
                          )}
                          
                          {quotation.status === 'rejected' && (
                            <div className="bg-gray-50 border border-gray-200 rounded p-1 text-center">
                              <span className="text-xs text-gray-600">
                                {locale === 'tr' ? 'Red' : 'Rejected'}
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

