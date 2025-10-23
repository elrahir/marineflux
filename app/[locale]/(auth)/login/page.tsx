'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { login } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Anchor, Ship, Package } from 'lucide-react';
import Link from 'next/link';

import { use } from 'react';

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'shipowner';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      
      // Redirect based on user type
      if (userType === 'shipowner') {
        router.push(`/${locale}/shipowner/dashboard`);
      } else if (userType === 'supplier') {
        router.push(`/${locale}/supplier/dashboard`);
      } else {
        router.push(`/${locale}/admin/dashboard`);
      }
    } catch (err: any) {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 mb-4">
            <Anchor className="h-10 w-10" />
            <span className="text-3xl font-bold">MarineFlux</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              {userType === 'shipowner' ? (
                <Ship className="h-12 w-12 text-primary" />
              ) : userType === 'supplier' ? (
                <Package className="h-12 w-12 text-primary" />
              ) : (
                <Anchor className="h-12 w-12 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl text-center">
              {t('auth.loginTitle')}
            </CardTitle>
            <CardDescription className="text-center">
              {userType === 'shipowner' && t('shipowner.dashboard')}
              {userType === 'supplier' && t('supplier.dashboard')}
              {userType === 'admin' && t('admin.dashboard')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t('common.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  {t('common.password')}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('common.login')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600 mb-2">
                {locale === 'tr' ? 'Hesabınız yok mu?' : "Don't have an account?"}{' '}
                <Link href={`/${locale}/register`} className="text-maritime-600 hover:underline font-semibold">
                  {locale === 'tr' ? 'Kayıt Ol' : 'Register'}
                </Link>
              </p>
              <Link href={`/${locale}`} className="text-primary hover:underline">
                {locale === 'tr' ? '← Ana sayfaya dön' : '← Back to homepage'}
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            {locale === 'tr' 
              ? 'Farklı kullanıcı türü için giriş yapmak ister misiniz?'
              : 'Want to login as a different user type?'}
          </p>
          <div className="flex gap-2 justify-center mt-2">
            <Link href={`/${locale}/login?type=shipowner`}>
              <Button variant="ghost" size="sm">
                {t('landing.hero.ctaShipowner')}
              </Button>
            </Link>
            <Link href={`/${locale}/login?type=supplier`}>
              <Button variant="ghost" size="sm">
                {t('landing.hero.ctaSupplier')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

