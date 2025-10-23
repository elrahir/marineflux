'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Globe, Phone, Mail, FileText, MapPin, CreditCard, Truck, Award, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

const categories = [
  { value: 'spare-parts', labelTr: 'Yedek Parça', labelEn: 'Spare Parts' },
  { value: 'provisions', labelTr: 'İaşe', labelEn: 'Provisions' },
  { value: 'deck-equipment', labelTr: 'Güverte Ekipmanı', labelEn: 'Deck Equipment' },
  { value: 'engine-parts', labelTr: 'Makine Parçaları', labelEn: 'Engine Parts' },
  { value: 'safety-equipment', labelTr: 'Güvenlik Ekipmanı', labelEn: 'Safety Equipment' },
  { value: 'chemicals', labelTr: 'Kimyasallar', labelEn: 'Chemicals' },
  { value: 'navigation', labelTr: 'Navigasyon', labelEn: 'Navigation' },
  { value: 'electrical', labelTr: 'Elektrik', labelEn: 'Electrical' },
  { value: 'services', labelTr: 'Hizmetler', labelEn: 'Services' },
  { value: 'paint-coating', labelTr: 'Boya ve Kaplama', labelEn: 'Paint & Coating' },
  { value: 'oil-lubricant', labelTr: 'Yağ ve Yağlayıcılar', labelEn: 'Oil & Lubricants' },
  { value: 'hardware-tools', labelTr: 'Donanım ve Aletler', labelEn: 'Hardware & Tools' },
];

export default function SupplierProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState<any>({
    serviceTypes: [],
    description: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    certifications: [],
    paymentTerms: '',
    deliveryAreas: [],
  });

  const [newCertification, setNewCertification] = useState('');
  const [newDeliveryArea, setNewDeliveryArea] = useState('');

  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
    }
  }, [user?.uid]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/supplier/profile?uid=${user?.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile({
          serviceTypes: data.profile.serviceTypes || [],
          description: data.profile.description || '',
          location: data.profile.location || '',
          contactEmail: data.profile.contactEmail || user?.email || '',
          contactPhone: data.profile.contactPhone || '',
          website: data.profile.website || '',
          certifications: data.profile.certifications || [],
          paymentTerms: data.profile.paymentTerms || '',
          deliveryAreas: data.profile.deliveryAreas || [],
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/supplier/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user?.uid,
          ...profile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceType = (type: string) => {
    setProfile((prev: any) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t: string) => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfile((prev: any) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      certifications: prev.certifications.filter((_: any, i: number) => i !== index),
    }));
  };

  const addDeliveryArea = () => {
    if (newDeliveryArea.trim()) {
      setProfile((prev: any) => ({
        ...prev,
        deliveryAreas: [...prev.deliveryAreas, newDeliveryArea.trim()],
      }));
      setNewDeliveryArea('');
    }
  };

  const removeDeliveryArea = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      deliveryAreas: prev.deliveryAreas.filter((_: any, i: number) => i !== index),
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

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Profil Ayarları' : 'Profile Settings'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' 
                ? 'Şirket bilgilerinizi ve hizmet kategorilerinizi güncelleyin'
                : 'Update your company information and service categories'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {locale === 'tr' ? 'Hizmet Kategorileri' : 'Service Categories'}
                </CardTitle>
                <CardDescription>
                  {locale === 'tr'
                    ? 'Sunduğunuz hizmetleri seçin (Birden fazla seçebilirsiniz)'
                    : 'Select the services you provide (Multiple selection allowed)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleServiceType(cat.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        profile.serviceTypes.includes(cat.value)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 bg-white hover:border-primary/50'
                      }`}
                    >
                      {locale === 'tr' ? cat.labelTr : cat.labelEn}
                    </button>
                  ))}
                </div>
                {profile.serviceTypes.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    {locale === 'tr' ? 'En az bir kategori seçmelisiniz' : 'Please select at least one category'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {locale === 'tr' ? 'Şirket Bilgileri' : 'Company Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {locale === 'tr' ? 'Şirket Açıklaması' : 'Company Description'}
                  </Label>
                  <textarea
                    id="description"
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    placeholder={locale === 'tr' 
                      ? 'Şirketiniz ve sunduğunuz hizmetler hakkında detaylı bilgi...'
                      : 'Detailed information about your company and services...'}
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {locale === 'tr' ? 'Konum' : 'Location'}
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder={locale === 'tr' ? 'Örn: İstanbul, Türkiye' : 'e.g. Istanbul, Turkey'}
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    <Mail className="h-4 w-4 inline mr-1" />
                    {locale === 'tr' ? 'İletişim E-postası' : 'Contact Email'}
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={profile.contactEmail}
                    onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                    placeholder="info@company.com"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    {locale === 'tr' ? 'İletişim Telefonu' : 'Contact Phone'}
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={profile.contactPhone}
                    onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
                    placeholder="+90 555 123 4567"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">
                    <Globe className="h-4 w-4 inline mr-1" />
                    {locale === 'tr' ? 'Website' : 'Website'}
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://www.company.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {locale === 'tr' ? 'Sertifikalar' : 'Certifications'}
                </CardTitle>
                <CardDescription>
                  {locale === 'tr'
                    ? 'ISO, CE gibi sertifikalarınızı ekleyin'
                    : 'Add your certifications like ISO, CE, etc.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder={locale === 'tr' ? 'Örn: ISO 9001:2015' : 'e.g. ISO 9001:2015'}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification}>
                    {locale === 'tr' ? 'Ekle' : 'Add'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {locale === 'tr' ? 'Ödeme Şartları' : 'Payment Terms'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={profile.paymentTerms}
                  onChange={(e) => setProfile({ ...profile, paymentTerms: e.target.value })}
                  placeholder={locale === 'tr' 
                    ? 'Örn: %30 peşin, %70 teslimatta...'
                    : 'e.g. 30% advance, 70% on delivery...'}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </CardContent>
            </Card>

            {/* Delivery Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {locale === 'tr' ? 'Teslimat Bölgeleri' : 'Delivery Areas'}
                </CardTitle>
                <CardDescription>
                  {locale === 'tr'
                    ? 'Teslimat yapabildiğiniz bölgeleri ekleyin'
                    : 'Add areas where you can deliver'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newDeliveryArea}
                    onChange={(e) => setNewDeliveryArea(e.target.value)}
                    placeholder={locale === 'tr' ? 'Örn: İstanbul, İzmir' : 'e.g. Istanbul, Izmir'}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliveryArea())}
                  />
                  <Button type="button" onClick={addDeliveryArea}>
                    {locale === 'tr' ? 'Ekle' : 'Add'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.deliveryAreas.map((area: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {area}
                      <button
                        type="button"
                        onClick={() => removeDeliveryArea(index)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-600">
                  {locale === 'tr' ? '✓ Profil başarıyla güncellendi!' : '✓ Profile updated successfully!'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" size="lg" disabled={saving || profile.serviceTypes.length === 0} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving 
                ? (locale === 'tr' ? 'Kaydediliyor...' : 'Saving...')
                : (locale === 'tr' ? 'Profili Kaydet' : 'Save Profile')}
            </Button>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



