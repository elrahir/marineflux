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
import { UserPlus, Loader2 } from 'lucide-react';

export default function CreateUserPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'shipowner',
    companyName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(true);
      setFormData({
        email: '',
        password: '',
        role: 'shipowner',
        companyName: '',
      });

      // Redirect to users list after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/admin/users`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']} locale={locale}>
      <DashboardLayout locale={locale} userType="admin">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('admin.createUser')}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' 
                ? 'Yeni kullanıcı oluşturun ve sisteme ekleyin'
                : 'Create a new user and add to the system'}
            </p>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {locale === 'tr' ? 'Kullanıcı Bilgileri' : 'User Information'}
              </CardTitle>
              <CardDescription>
                {locale === 'tr'
                  ? 'Yeni kullanıcı için gerekli bilgileri girin'
                  : 'Enter required information for the new user'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">{t('common.password')}</Label>
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={locale === 'tr' ? 'Minimum 6 karakter' : 'Minimum 6 characters'}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    {locale === 'tr' 
                      ? 'Kullanıcı bu şifre ile giriş yapacak'
                      : 'User will use this password to login'}
                  </p>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {locale === 'tr' ? 'Şirket Adı' : 'Company Name'}
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder={locale === 'tr' ? 'Şirket adını girin' : 'Enter company name'}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">
                    {locale === 'tr' ? 'Kullanıcı Rolü' : 'User Role'}
                  </Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={loading}
                  >
                    <option value="shipowner">
                      {locale === 'tr' ? 'Armatör (Shipowner)' : 'Shipowner'}
                    </option>
                    <option value="supplier">
                      {locale === 'tr' ? 'Tedarikçi (Supplier)' : 'Supplier'}
                    </option>
                    <option value="admin">
                      {locale === 'tr' ? 'Admin' : 'Admin'}
                    </option>
                  </select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-600">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-md">
                    <p className="text-sm text-teal-600">
                      {locale === 'tr' 
                        ? '✓ Kullanıcı başarıyla oluşturuldu! Yönlendiriliyorsunuz...'
                        : '✓ User created successfully! Redirecting...'}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading 
                      ? (locale === 'tr' ? 'Oluşturuluyor...' : 'Creating...')
                      : (locale === 'tr' ? 'Kullanıcı Oluştur' : 'Create User')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/${locale}/admin/users`)}
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



