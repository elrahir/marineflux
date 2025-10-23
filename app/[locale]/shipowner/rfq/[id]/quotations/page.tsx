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
import { FileText, Loader2, DollarSign, Clock, MapPin, Building2, CheckCircle, MessageCircle } from 'lucide-react';
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
      const response = await fetch(`/api/quotation/list?rfqId=${id}`);
      const data = await response.json();
      
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

          {/* Quotations List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'tr' ? 'Teklif Karşılaştırması' : 'Quotation Comparison'}
              </CardTitle>
              <CardDescription>
                {locale === 'tr' 
                  ? 'Gelen teklifleri karşılaştırın ve en uygununu seçin'
                  : 'Compare quotations and select the best one'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {locale === 'tr' ? 'Henüz teklif alınmadı' : 'No quotations received yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedQuotations.map((quotation) => (
                    <div 
                      key={quotation.id} 
                      className={`border rounded-lg p-6 ${
                        quotation.price === lowestPrice 
                          ? 'ring-2 ring-green-500 bg-green-50/30' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Building2 className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">{quotation.supplierCompany}</h3>
                            {getStatusBadge(quotation.status)}
                            {quotation.price === lowestPrice && (
                              <Badge className="bg-green-100 text-green-800">
                                {locale === 'tr' ? '💰 En Uygun Fiyat' : '💰 Best Price'}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <DollarSign className="h-4 w-4" />
                                {locale === 'tr' ? 'Fiyat' : 'Price'}
                              </div>
                              <div className="text-xl font-bold text-primary">
                                {quotation.price.toLocaleString()} {quotation.currency}
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Clock className="h-4 w-4" />
                                {locale === 'tr' ? 'Teslimat Süresi' : 'Delivery Time'}
                              </div>
                              <div className="font-medium">{quotation.deliveryTime}</div>
                            </div>
                            
                            {quotation.deliveryLocation && (
                              <div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                  <MapPin className="h-4 w-4" />
                                  {locale === 'tr' ? 'Teslimat Yeri' : 'Delivery Location'}
                                </div>
                                <div className="font-medium">{quotation.deliveryLocation}</div>
                              </div>
                            )}
                          </div>

                          {quotation.specifications && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                {locale === 'tr' ? 'Teknik Özellikler:' : 'Technical Specifications:'}
                              </p>
                              <p className="text-sm text-gray-600">{quotation.specifications}</p>
                            </div>
                          )}

                          {quotation.notes && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                {locale === 'tr' ? 'Notlar ve Şartlar:' : 'Notes and Terms:'}
                              </p>
                              <p className="text-sm text-gray-600">{quotation.notes}</p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            {locale === 'tr' ? 'Gönderilme:' : 'Submitted:'} {new Date(quotation.createdAt).toLocaleString(locale)}
                          </div>
                        </div>
                      </div>
                      
                      {quotation.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => handleAcceptQuotation(quotation.id)}
                            disabled={processing === quotation.id}
                          >
                            {processing === quotation.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {locale === 'tr' ? 'Teklifi Kabul Et' : 'Accept Quote'}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleContactSupplier(quotation.supplierUid, quotation.supplierCompany)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            {locale === 'tr' ? 'İletişime Geç' : 'Contact Supplier'}
                          </Button>
                          <Button 
                            variant="ghost"
                            onClick={() => handleRejectQuotation(quotation.id)}
                            disabled={processing === quotation.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {locale === 'tr' ? 'Reddet' : 'Reject'}
                          </Button>
                        </div>
                      )}
                      
                      {quotation.status === 'accepted' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-800 font-medium">
                            {locale === 'tr' ? 'Bu teklif kabul edildi ve sipariş oluşturuldu' : 'This quote was accepted and order created'}
                          </span>
                        </div>
                      )}
                      
                      {quotation.status === 'rejected' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <span className="text-sm text-gray-600">
                            {locale === 'tr' ? 'Bu teklif reddedildi' : 'This quote was rejected'}
                          </span>
                        </div>
                      )}
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

