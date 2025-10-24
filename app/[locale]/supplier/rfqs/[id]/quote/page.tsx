'use client';

import { use, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface RFQ {
  id: string;
  title: string;
  description: string;
  shipownerUid: string;
  shipownerCompany: string;
  category: string;
}

export default function SubmitQuotePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user, userData } = useAuth();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    price: '',
    currency: 'USD',
    deliveryTime: '',
    deliveryLocation: '',
    specifications: '',
    notes: '',
  });

  useEffect(() => {
    if (user?.uid) {
      fetchRfqDetails();
    }
  }, [id, user?.uid]);

  const fetchRfqDetails = async () => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch(`/api/rfq/list?status=open&uid=${user.uid}&role=supplier`);
      const data = await response.json();
      
      if (data.success) {
        const rfqData = data.rfqs.find((r: any) => r.id === id);
        if (rfqData) {
          setRfq(rfqData);
        }
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!user?.uid || !userData) {
        throw new Error(locale === 'tr' ? 'Kullanıcı bilgisi bulunamadı' : 'User information not found');
      }

      if (!formData.price || !formData.deliveryTime) {
        throw new Error(locale === 'tr' ? 'Lütfen zorunlu alanları doldurun' : 'Please fill in required fields');
      }

      console.log('🔍 DEBUG - Submitting quotation for RFQ ID:', id);
      console.log('🔍 DEBUG - RFQ ID type:', typeof id);
      console.log('🔍 DEBUG - Current RFQ object:', rfq);

      const quotationData = {
        rfqId: id,
        supplierUid: user.uid,
        supplierCompany: userData.companyName || 'Unknown Company',
        price: parseFloat(formData.price),
        currency: formData.currency,
        deliveryTime: formData.deliveryTime,
        deliveryLocation: formData.deliveryLocation,
        specifications: formData.specifications,
        notes: formData.notes,
      };

      console.log('🔍 DEBUG - Quotation data being sent:', quotationData);

      const response = await fetch('/api/quotation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || locale === 'tr' ? 'Teklif gönderilemedi' : 'Failed to submit quote');
      }

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/supplier/quotations`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactShipowner = () => {
    console.log('Opening chat with shipowner:', { shipownerUid: rfq?.shipownerUid, shipownerCompany: rfq?.shipownerCompany, rfqId: id });
    
    if (!rfq?.shipownerUid) {
      alert(locale === 'tr' ? 'Armatör bilgisi bulunamadı' : 'Shipowner info not found');
      return;
    }
    
    // Trigger floating chat widget to open with shipowner
    window.dispatchEvent(new CustomEvent('openChat', {
      detail: {
        recipientId: rfq.shipownerUid,
        recipientName: rfq.shipownerCompany,
        relatedEntityId: id,
        relatedEntityType: 'rfq'
      }
    }));
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
            <p className="text-gray-500 mb-4">
              {locale === 'tr' ? 'RFQ bulunamadı' : 'RFQ not found'}
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
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={`/${locale}/supplier/rfqs`} className="hover:text-gray-900">
              {locale === 'tr' ? 'RFQ\'lar' : 'RFQs'}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/supplier/rfqs/${id}`} className="hover:text-gray-900">
              {rfq.title}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{locale === 'tr' ? 'Teklif Ver' : 'Submit Quote'}</span>
          </div>

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Link href={`/${locale}/supplier/rfqs/${id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {locale === 'tr' ? 'Geri' : 'Back'}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleContactShipowner}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {locale === 'tr' ? 'Armatöre Mesaj Gönder' : 'Message Shipowner'}
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {locale === 'tr' ? 'Teklif Hazırla' : 'Prepare Your Quote'}
            </h1>
            <p className="text-gray-600">{rfq.title}</p>
            <p className="text-sm text-gray-500">{rfq.shipownerCompany}</p>
          </div>

          {/* RFQ Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {locale === 'tr' ? 'Talep Özeti' : 'Request Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 line-clamp-3">{rfq.description}</p>
              <Link href={`/${locale}/supplier/rfqs/${id}`} className="text-sm text-primary hover:underline mt-2 inline-block">
                {locale === 'tr' ? 'Detayları görüntüle →' : 'View details →'}
              </Link>
            </CardContent>
          </Card>

          {/* Quote Form */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'Teklif Bilgileri' : 'Quote Information'}</CardTitle>
              <CardDescription>
                {locale === 'tr' 
                  ? 'Lütfen teklifinizi detaylı ve eksiksiz şekilde doldurun'
                  : 'Please fill out your quote completely and in detail'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Price and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="price">
                      {locale === 'tr' ? 'Fiyat' : 'Price'} *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={locale === 'tr' ? 'Teklif fiyatı' : 'Quote price'}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">
                      {locale === 'tr' ? 'Para Birimi' : 'Currency'}
                    </Label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="TRY">TRY</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Time */}
                <div>
                  <Label htmlFor="deliveryTime">
                    {locale === 'tr' ? 'Teslimat Süresi' : 'Delivery Time'} *
                  </Label>
                  <Input
                    id="deliveryTime"
                    type="text"
                    placeholder={locale === 'tr' ? 'Örn: 7-10 iş günü' : 'e.g., 7-10 business days'}
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                    required
                  />
                </div>

                {/* Delivery Location */}
                <div>
                  <Label htmlFor="deliveryLocation">
                    {locale === 'tr' ? 'Teslimat Yeri' : 'Delivery Location'}
                  </Label>
                  <Input
                    id="deliveryLocation"
                    type="text"
                    placeholder={locale === 'tr' ? 'Örn: İstanbul, Türkiye' : 'e.g., Istanbul, Turkey'}
                    value={formData.deliveryLocation}
                    onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {locale === 'tr' 
                      ? 'Malı nereden teslim edebileceğinizi belirtin'
                      : 'Specify where you can deliver the goods'}
                  </p>
                </div>

                {/* Specifications */}
                <div>
                  <Label htmlFor="specifications">
                    {locale === 'tr' ? 'Teknik Özellikler' : 'Technical Specifications'}
                  </Label>
                  <Textarea
                    id="specifications"
                    placeholder={locale === 'tr' 
                      ? 'Teklif ettiğiniz ürün veya hizmetin teknik detayları...'
                      : 'Technical details of your product or service...'}
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    rows={4}
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">
                    {locale === 'tr' ? 'Notlar ve Şartlar' : 'Notes and Terms'}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={locale === 'tr' 
                      ? 'Ödeme şartları, garanti bilgileri, özel koşullar...'
                      : 'Payment terms, warranty information, special conditions...'}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
                    <p className="text-sm font-medium">
                      {locale === 'tr' 
                        ? '✓ Teklifiniz başarıyla gönderildi! Yönlendiriliyorsunuz...'
                        : '✓ Your quote has been submitted successfully! Redirecting...'}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Link href={`/${locale}/supplier/rfqs/${id}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full" disabled={submitting}>
                      {locale === 'tr' ? 'İptal' : 'Cancel'}
                    </Button>
                  </Link>
                  <Button type="submit" className="flex-1" disabled={submitting || success}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {locale === 'tr' ? 'Gönderiliyor...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {locale === 'tr' ? 'Teklif Gönder' : 'Submit Quote'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {locale === 'tr' ? '💡 İpuçları' : '💡 Tips'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    {locale === 'tr' 
                      ? 'Rekabetçi ama gerçekçi bir fiyat belirleyin'
                      : 'Set a competitive but realistic price'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    {locale === 'tr' 
                      ? 'Teslimat sürelerinde güvenilir olun'
                      : 'Be reliable with delivery times'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    {locale === 'tr' 
                      ? 'Teknik özellikleri detaylı açıklayın'
                      : 'Explain technical specifications in detail'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    {locale === 'tr' 
                      ? 'Ödeme ve garanti şartlarınızı net belirtin'
                      : 'Clearly state your payment and warranty terms'}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
