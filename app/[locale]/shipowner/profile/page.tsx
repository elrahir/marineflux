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
import { Building2, Globe, Phone, Mail, MapPin, Ship, Plus, X, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Vessel {
  name: string;
  type: string;
  imo: string;
  flag: string;
  yearBuilt: string;
}

export default function ShipownerProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState<any>({
    vessels: [],
    description: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
  });

  const [newVessel, setNewVessel] = useState<Vessel>({
    name: '',
    type: '',
    imo: '',
    flag: '',
    yearBuilt: '',
  });

  const vesselTypes = [
    { value: 'bulk-carrier', labelTr: 'Dökme Yük Gemisi', labelEn: 'Bulk Carrier' },
    { value: 'container', labelTr: 'Konteyner Gemisi', labelEn: 'Container Ship' },
    { value: 'tanker', labelTr: 'Tanker', labelEn: 'Tanker' },
    { value: 'cargo', labelTr: 'Kargo Gemisi', labelEn: 'Cargo Ship' },
    { value: 'ro-ro', labelTr: 'Ro-Ro', labelEn: 'Ro-Ro' },
    { value: 'passenger', labelTr: 'Yolcu Gemisi', labelEn: 'Passenger Ship' },
    { value: 'tug', labelTr: 'Römorkör', labelEn: 'Tug' },
    { value: 'fishing', labelTr: 'Balıkçı Teknesi', labelEn: 'Fishing Vessel' },
    { value: 'yacht', labelTr: 'Yat', labelEn: 'Yacht' },
    { value: 'other', labelTr: 'Diğer', labelEn: 'Other' },
  ];

  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
    }
  }, [user?.uid]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/shipowner/profile?uid=${user?.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile({
          vessels: data.profile.vessels || [],
          description: data.profile.description || '',
          location: data.profile.location || '',
          contactEmail: data.profile.contactEmail || user?.email || '',
          contactPhone: data.profile.contactPhone || '',
          website: data.profile.website || '',
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
      const response = await fetch('/api/shipowner/profile', {
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

  const addVessel = () => {
    if (newVessel.name && newVessel.type) {
      setProfile((prev: any) => ({
        ...prev,
        vessels: [...prev.vessels, { ...newVessel }],
      }));
      setNewVessel({
        name: '',
        type: '',
        imo: '',
        flag: '',
        yearBuilt: '',
      });
    }
  };

  const removeVessel = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      vessels: prev.vessels.filter((_: any, i: number) => i !== index),
    }));
  };

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
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Profil Ayarları' : 'Profile Settings'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' 
                ? 'Şirket bilgilerinizi ve gemi filonuzu güncelleyin'
                : 'Update your company information and vessel fleet'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                      ? 'Şirketiniz ve operasyonlarınız hakkında detaylı bilgi...'
                      : 'Detailed information about your company and operations...'}
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

            {/* Vessels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  {locale === 'tr' ? 'Gemi Filosu' : 'Vessel Fleet'}
                </CardTitle>
                <CardDescription>
                  {locale === 'tr'
                    ? 'Filonuzdaki gemileri ekleyin ve yönetin'
                    : 'Add and manage vessels in your fleet'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Vessel Form */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">
                    {locale === 'tr' ? 'Yeni Gemi Ekle' : 'Add New Vessel'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder={locale === 'tr' ? 'Gemi Adı *' : 'Vessel Name *'}
                      value={newVessel.name}
                      onChange={(e) => setNewVessel({ ...newVessel, name: e.target.value })}
                    />
                    <select
                      value={newVessel.type}
                      onChange={(e) => setNewVessel({ ...newVessel, type: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">{locale === 'tr' ? 'Gemi Tipi Seçin *' : 'Select Vessel Type *'}</option>
                      {vesselTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {locale === 'tr' ? type.labelTr : type.labelEn}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder={locale === 'tr' ? 'IMO Numarası' : 'IMO Number'}
                      value={newVessel.imo}
                      onChange={(e) => setNewVessel({ ...newVessel, imo: e.target.value })}
                    />
                    <Input
                      placeholder={locale === 'tr' ? 'Bayrak' : 'Flag'}
                      value={newVessel.flag}
                      onChange={(e) => setNewVessel({ ...newVessel, flag: e.target.value })}
                    />
                    <Input
                      placeholder={locale === 'tr' ? 'İnşa Yılı' : 'Year Built'}
                      value={newVessel.yearBuilt}
                      onChange={(e) => setNewVessel({ ...newVessel, yearBuilt: e.target.value })}
                    />
                    <Button
                      type="button"
                      onClick={addVessel}
                      disabled={!newVessel.name || !newVessel.type}
                      className="md:col-span-2"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {locale === 'tr' ? 'Gemi Ekle' : 'Add Vessel'}
                    </Button>
                  </div>
                </div>

                {/* Vessels List */}
                <div className="space-y-3">
                  {profile.vessels.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {locale === 'tr' ? 'Henüz gemi eklenmedi' : 'No vessels added yet'}
                    </p>
                  ) : (
                    profile.vessels.map((vessel: Vessel, index: number) => (
                      <div key={index} className="border rounded-lg p-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Ship className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-lg">{vessel.name}</h4>
                            <Badge variant="outline">
                              {vesselTypes.find(t => t.value === vessel.type)?.[locale === 'tr' ? 'labelTr' : 'labelEn'] || vessel.type}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            {vessel.imo && <div><strong>IMO:</strong> {vessel.imo}</div>}
                            {vessel.flag && <div><strong>{locale === 'tr' ? 'Bayrak' : 'Flag'}:</strong> {vessel.flag}</div>}
                            {vessel.yearBuilt && <div><strong>{locale === 'tr' ? 'İnşa' : 'Built'}:</strong> {vessel.yearBuilt}</div>}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVessel(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
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
            <Button type="submit" size="lg" disabled={saving} className="w-full">
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



