'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, DollarSign, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SubmitQuotePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [loadingRfq, setLoadingRfq] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rfq, setRfq] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    price: '',
    currency: 'USD',
    deliveryTime: '',
    deliveryLocation: '',
    notes: '',
    specifications: '',
  });

  const currencies = ['USD', 'EUR', 'GBP', 'TRY'];

  useEffect(() => {
    fetchRfqDetails();
  }, [id]);

  const fetchRfqDetails = async () => {
    try {
      const response = await fetch(`/api/rfq/list?limit=1`);
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
      setLoadingRfq(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/quotation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfqId: id,
          supplierUid: user.uid,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quotation');
      }

      setSuccess(true);
      
      // Redirect to RFQs list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/supplier/rfqs`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingRfq) {
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

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Teklif Gönder' : 'Submit Quotation'}
            </h1>
            <p className="text-gray-600 mt-2">
              {rfq.title}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* RFQ Details (Left Side) */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">
                  {locale === 'tr' ? 'RFQ Detayları' : 'RFQ Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">{locale === 'tr' ? 'Şirket' : 'Company'}</p>
                  <p className="font-medium">{rfq.shipownerCompany}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">{locale === 'tr' ? 'Kategori' : 'Category'}</p>
                  <p className="font-medium">{rfq.category}</p>
                </div>
                {rfq.vessel && (
                  <div>
                    <p className="text-gray-600 mb-1">{locale === 'tr' ? 'Gemi' : 'Vessel'}</p>
                    <p className="font-medium">{rfq.vessel.name}</p>
                    <p className="text-xs text-gray-500">{rfq.vessel.type}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 mb-1">{locale === 'tr' ? 'Son Tarih' : 'Deadline'}</p>
                  <p className="font-medium text-orange-600">
                    {new Date(rfq.deadline).toLocaleDateString(locale)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">{locale === 'tr' ? 'Açıklama' : 'Description'}</p>
                  <p className="text-gray-800">{rfq.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quotation Form (Right Side) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {locale === 'tr' ? 'Teklif Bilgileri' : 'Quotation Details'}
                </CardTitle>
                <CardDescription>
                  {locale === 'tr'
                    ? 'Teklifinizi detaylı olarak hazırlayın'
                    : 'Prepare your detailed quotation'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Price */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="price">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        {locale === 'tr' ? 'Fiyat' : 'Price'} *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">
                        {locale === 'tr' ? 'Para Birimi' : 'Currency'} *
                      </Label>
                      <select
                        id="currency"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={loading}
                      >
                        {currencies.map((curr) => (
                          <option key={curr} value={curr}>
                            {curr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Delivery Time */}
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {locale === 'tr' ? 'Teslimat Süresi' : 'Delivery Time'} *
                    </Label>
                    <Input
                      id="deliveryTime"
                      type="text"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      placeholder={locale === 'tr' ? 'Örn: 5-7 gün' : 'e.g. 5-7 days'}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Delivery Location */}
                  <div className="space-y-2">
                    <Label htmlFor="deliveryLocation">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {locale === 'tr' ? 'Teslimat Yeri' : 'Delivery Location'}
                    </Label>
                    <Input
                      id="deliveryLocation"
                      type="text"
                      value={formData.deliveryLocation}
                      onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                      placeholder={locale === 'tr' ? 'Örn: İstanbul, Türkiye' : 'e.g. Istanbul, Turkey'}
                      disabled={loading}
                    />
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2">
                    <Label htmlFor="specifications">
                      {locale === 'tr' ? 'Teknik Özellikler' : 'Technical Specifications'}
                    </Label>
                    <textarea
                      id="specifications"
                      value={formData.specifications}
                      onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                      placeholder={locale === 'tr' 
                        ? 'Sunduğunuz ürün/hizmetin teknik özelliklerini belirtin...'
                        : 'Specify technical specifications of your product/service...'}
                      rows={4}
                      disabled={loading}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {locale === 'tr' ? 'Notlar ve Şartlar' : 'Notes and Terms'}
                    </Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={locale === 'tr' 
                        ? 'Ek notlar, ödeme şartları, garanti bilgileri vb...'
                        : 'Additional notes, payment terms, warranty info, etc...'}
                      rows={4}
                      disabled={loading}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">
                        {locale === 'tr' 
                          ? '✓ Teklifiniz başarıyla gönderildi! Yönlendiriliyorsunuz...'
                          : '✓ Quotation submitted successfully! Redirecting...'}
                      </p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading 
                        ? (locale === 'tr' ? 'Gönderiliyor...' : 'Submitting...')
                        : (locale === 'tr' ? 'Teklif Gönder' : 'Submit Quotation')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/${locale}/supplier/rfqs`)}
                      disabled={loading}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



