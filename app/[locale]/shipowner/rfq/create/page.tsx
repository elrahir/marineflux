'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, Ship } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CreateRFQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'spare-parts',
    vesselName: '',
    vesselType: '',
    vesselIMO: '',
    deadline: '',
  });

  const categories = [
    { value: 'spare-parts', label: locale === 'tr' ? 'Yedek Parça' : 'Spare Parts' },
    { value: 'provisions', label: locale === 'tr' ? 'İaşe' : 'Provisions' },
    { value: 'deck-equipment', label: locale === 'tr' ? 'Güverte Ekipmanı' : 'Deck Equipment' },
    { value: 'engine-parts', label: locale === 'tr' ? 'Makine Parçaları' : 'Engine Parts' },
    { value: 'safety-equipment', label: locale === 'tr' ? 'Güvenlik Ekipmanı' : 'Safety Equipment' },
    { value: 'chemicals', label: locale === 'tr' ? 'Kimyasallar' : 'Chemicals' },
    { value: 'navigation', label: locale === 'tr' ? 'Navigasyon' : 'Navigation' },
    { value: 'electrical', label: locale === 'tr' ? 'Elektrik' : 'Electrical' },
    { value: 'services', label: locale === 'tr' ? 'Hizmetler' : 'Services' },
    { value: 'other', label: locale === 'tr' ? 'Diğer' : 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const vessel = formData.vesselName ? {
        name: formData.vesselName,
        type: formData.vesselType,
        imo: formData.vesselIMO,
      } : null;

      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipownerUid: user.uid,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          vessel,
          deadline: formData.deadline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create RFQ');
      }

      setSuccess(true);
      
      // Redirect to RFQ list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/shipowner/rfq`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Yeni Teklif Talebi Oluştur' : 'Create New RFQ'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' 
                ? 'Tedarikçilerden teklif almak için talebinizi oluşturun'
                : 'Create your request to receive quotations from suppliers'}
            </p>
          </div>

          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {locale === 'tr' ? 'RFQ Detayları' : 'RFQ Details'}
              </CardTitle>
              <CardDescription>
                {locale === 'tr'
                  ? 'İhtiyacınız olan ürün veya hizmet hakkında detaylı bilgi verin'
                  : 'Provide detailed information about the product or service you need'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {locale === 'tr' ? 'Başlık' : 'Title'} *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={locale === 'tr' ? 'Örn: Diesel Motor Yedek Parçası' : 'e.g. Diesel Engine Spare Parts'}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    {locale === 'tr' ? 'Kategori' : 'Category'} *
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={loading}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {locale === 'tr' ? 'Açıklama' : 'Description'} *
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={locale === 'tr' 
                      ? 'İhtiyacınız olan ürün veya hizmeti detaylı olarak açıklayın...'
                      : 'Describe the product or service you need in detail...'}
                    rows={5}
                    required
                    disabled={loading}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {/* Vessel Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    {locale === 'tr' ? 'Gemi Bilgileri (Opsiyonel)' : 'Vessel Information (Optional)'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vesselName">
                        {locale === 'tr' ? 'Gemi Adı' : 'Vessel Name'}
                      </Label>
                      <Input
                        id="vesselName"
                        type="text"
                        value={formData.vesselName}
                        onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                        placeholder={locale === 'tr' ? 'Örn: M/V Akdeniz' : 'e.g. M/V Mediterranean'}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vesselType">
                        {locale === 'tr' ? 'Gemi Tipi' : 'Vessel Type'}
                      </Label>
                      <Input
                        id="vesselType"
                        type="text"
                        value={formData.vesselType}
                        onChange={(e) => setFormData({ ...formData, vesselType: e.target.value })}
                        placeholder={locale === 'tr' ? 'Örn: Konteyner Gemisi' : 'e.g. Container Ship'}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vesselIMO">
                        {locale === 'tr' ? 'IMO Numarası' : 'IMO Number'}
                      </Label>
                      <Input
                        id="vesselIMO"
                        type="text"
                        value={formData.vesselIMO}
                        onChange={(e) => setFormData({ ...formData, vesselIMO: e.target.value })}
                        placeholder="1234567"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="deadline">
                    {locale === 'tr' ? 'Son Teklif Tarihi' : 'Deadline'} *
                  </Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    disabled={loading}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-sm text-gray-500">
                    {locale === 'tr' 
                      ? 'Tedarikçilerin teklif verebileceği son tarih'
                      : 'Last date for suppliers to submit quotations'}
                  </p>
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
                        ? '✓ RFQ başarıyla oluşturuldu! Yönlendiriliyorsunuz...'
                        : '✓ RFQ created successfully! Redirecting...'}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading 
                      ? (locale === 'tr' ? 'Oluşturuluyor...' : 'Creating...')
                      : (locale === 'tr' ? 'RFQ Oluştur' : 'Create RFQ')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/${locale}/shipowner/rfq`)}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



