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
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Star, 
  FileText,
  Loader2,
  Save,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

interface SupplierProfile {
  companyName: string;
  email: string;
  phone: string;
  website?: string;
  country: string;
  city: string;
  address: string;
  description?: string;
  services?: string[];
  rating?: number;
  reviewCount?: number;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  createdAt?: any;
  updatedAt?: any;
}

interface Review {
  id: string;
  orderId: string;
  shipownerUid: string;
  supplierUid: string;
  rating: number;
  comment: string;
  createdAt: string;
  shipownerCompany?: string;
  orderTitle?: string;
}

export default function SupplierProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user, userData } = useAuth();

  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [formData, setFormData] = useState<SupplierProfile>({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    city: '',
    address: '',
    description: '',
    services: [],
  });

  // Fetch profile
  useEffect(() => {
    if (!user?.uid) return;
    fetchProfile();
  }, [user?.uid]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'suppliers', user!.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as SupplierProfile;
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
          description: '',
          services: [],
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

  const fetchReviews = async () => {
    if (!user?.uid) return;
    
    try {
      setReviewsLoading(true);
      console.log('Fetching reviews for supplier:', user.uid);
      const response = await fetch(`/api/review/list?supplierUid=${user.uid}`);
      const data = await response.json();

      console.log('Reviews response:', data);

      if (data.success) {
        console.log('Reviews loaded:', data.reviews.length);
        setReviews(data.reviews);
      } else {
        console.error('Failed to fetch reviews:', data.error);
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch profile and reviews
  useEffect(() => {
    if (!user?.uid) return;
    fetchProfile();
    fetchReviews();
  }, [user?.uid]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      setSaving(true);
      setError('');
      setSuccess(false);

      const docRef = doc(db, 'suppliers', user.uid);
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
      <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
        <DashboardLayout locale={locale} userType="supplier">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
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
                <Building2 className="h-5 w-5 text-emerald-600" />
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
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
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
                <FileText className="h-5 w-5 text-emerald-600" />
                {locale === 'tr' ? 'Şirket Açıklaması' : 'Company Description'}
              </CardTitle>
              <CardDescription>
                {locale === 'tr' 
                  ? 'Şirketiniz hakkında kısa bilgi yazın' 
                  : 'Write a brief description about your company'}
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

          {/* Rating & Reviews */}
          {profile?.rating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-emerald-600" />
                  {locale === 'tr' ? 'Değerlendirmeler' : 'Ratings'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-bold text-yellow-500">
                      {profile.rating.toFixed(1)}
                    </div>
                    <div>
                      <div className="flex gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(profile.rating!) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {profile.reviewCount} {locale === 'tr' ? 'değerlendirme' : 'reviews'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                {locale === 'tr' ? 'Müşteri Yorumları' : 'Customer Reviews'}
              </CardTitle>
              <CardDescription>
                {locale === 'tr' 
                  ? `${reviews.length} yorum` 
                  : `${reviews.length} reviews`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  {locale === 'tr' ? 'Henüz yorum yok' : 'No reviews yet'}
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex gap-1 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            {review.shipownerCompany} • {locale === 'tr' ? 'Sipariş:' : 'Order:'} {review.orderTitle}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(locale)}
                        </p>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditing && (
            <div className="flex gap-3 sticky bottom-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800"
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



