'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  FileText,
  Loader2,
  Save,
  Edit2,
  Check,
  X,
  Anchor
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

interface ShipownerProfile {
  companyName: string;
  email: string;
  phone: string;
  website?: string;
  country: string;
  city: string;
  address: string;
  fleetSize?: number;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function ShipownerProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user, userData } = useAuth();

  const [profile, setProfile] = useState<ShipownerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ShipownerProfile>({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    city: '',
    address: '',
    fleetSize: 0,
    description: '',
  });

  // Fetch profile
  useEffect(() => {
    if (!user?.uid) return;
    fetchProfile();
  }, [user?.uid]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'shipowners', user!.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ShipownerProfile;
        setProfile(data);
        setFormData(data);
      } else {
        // If no profile exists, create from user data
        const userData = {
          companyName: user?.displayName || '',
          email: user?.email || '',
          phone: '',
          website: '',
          country: '',
          city: '',
          address: '',
          fleetSize: 0,
          description: '',
        };
        setProfile(userData);
        setFormData(userData);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      setSaving(true);
      setError('');
      setSuccess(false);

      const docRef = doc(db, 'shipowners', user.uid);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: Timestamp.now(),
      });

      // Also update in users collection
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        companyName: formData.companyName,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        address: formData.address,
      });

      setProfile(formData);
      setSuccess(true);
      setIsEditing(false);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {locale === 'tr' ? 'Şirket Profili' : 'Company Profile'}
              </h1>
              <p className="text-gray-600 mt-2">
                {locale === 'tr' 
                  ? 'Şirket bilgilerinizi görüntüleyin ve güncelleyin' 
                  : 'View and update your company information'}
              </p>
            </div>
            <Button
              onClick={() => {
                if (isEditing) {
                  setFormData(profile || formData);
                  setIsEditing(false);
                } else {
                  setIsEditing(true);
                }
              }}
              variant={isEditing ? 'outline' : 'default'}
              className={isEditing ? 'text-amber-600 border-amber-300' : ''}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  {locale === 'tr' ? 'İptal Et' : 'Cancel'}
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  {locale === 'tr' ? 'Düzenle' : 'Edit'}
                </>
              )}
            </Button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-lg flex items-center">
              <Check className="h-5 w-5 mr-2" />
              {locale === 'tr' ? 'Profil başarıyla güncellendi' : 'Profile updated successfully'}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-maritime-600" />
                {locale === 'tr' ? 'Şirket Bilgileri' : 'Company Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Name */}
              <div>
                <Label htmlFor="companyName">
                  {locale === 'tr' ? 'Şirket Adı' : 'Company Name'} *
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {locale === 'tr' ? 'E-posta' : 'Email'} *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {locale === 'tr' ? 'Telefon' : 'Phone'} *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+90 555 123 4567"
                  className="mt-1"
                />
              </div>

              {/* Website */}
              <div>
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {locale === 'tr' ? 'Website' : 'Website'}
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://example.com"
                  className="mt-1"
                />
              </div>

              {/* Fleet Size */}
              <div>
                <Label htmlFor="fleetSize" className="flex items-center gap-2">
                  <Anchor className="h-4 w-4" />
                  {locale === 'tr' ? 'Filo Büyüklüğü' : 'Fleet Size'}
                </Label>
                <Input
                  id="fleetSize"
                  name="fleetSize"
                  type="number"
                  value={formData.fleetSize}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="0"
                  className="mt-1"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-maritime-600" />
                {locale === 'tr' ? 'Konum Bilgileri' : 'Location Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Country */}
              <div>
                <Label htmlFor="country">
                  {locale === 'tr' ? 'Ülke' : 'Country'} *
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Turkey"
                  className="mt-1"
                />
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city">
                  {locale === 'tr' ? 'Şehir' : 'City'} *
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Istanbul"
                  className="mt-1"
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">
                  {locale === 'tr' ? 'Adres' : 'Address'} *
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder={locale === 'tr' ? 'Şirket adresi' : 'Company address'}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-maritime-600" />
                {locale === 'tr' ? 'Şirket Açıklaması' : 'Company Description'}
              </CardTitle>
              <CardDescription>
                {locale === 'tr' 
                  ? 'Şirketiniz ve operasyonlarınız hakkında bilgi yazın' 
                  : 'Write about your company and operations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder={locale === 'tr' 
                  ? 'Şirketinizin hizmetleri, deneyimi ve özellikleri hakkında yazın...' 
                  : 'Write about your company services, experience and specialties...'}
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditing && (
            <div className="flex gap-3 sticky bottom-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-maritime-600 hover:bg-maritime-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {locale === 'tr' ? 'Kaydediliyor...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {locale === 'tr' ? 'Profili Kaydet' : 'Save Profile'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



