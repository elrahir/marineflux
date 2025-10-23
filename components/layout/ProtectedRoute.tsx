'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  locale: string;
}

export function ProtectedRoute({ children, allowedRoles, locale }: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('ProtectedRoute: Kullanıcı yok, login sayfasına yönlendiriliyor');
        router.push(`/${locale}/login`);
      } else if (!userData) {
        console.error('ProtectedRoute: Kullanıcı var ama userData yok. Firestore\'da kullanıcı belgesi bulunamadı:', user.uid);
      } else if (!allowedRoles.includes(userData.role)) {
        console.log('ProtectedRoute: Yetki uyumsuzluğu. Mevcut rol:', userData.role, 'İzin verilen roller:', allowedRoles);
        // Redirect to appropriate dashboard based on role
        if (userData.role === 'admin') {
          router.push(`/${locale}/admin/dashboard`);
        } else if (userData.role === 'shipowner') {
          router.push(`/${locale}/shipowner/dashboard`);
        } else if (userData.role === 'supplier') {
          router.push(`/${locale}/supplier/dashboard`);
        }
      } else {
        console.log('ProtectedRoute: Erişim izni verildi. Rol:', userData.role);
      }
    }
  }, [user, userData, loading, router, locale, allowedRoles]);

  // Loading durumu
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Kullanıcı yok
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // UserData yok - Firestore'da kullanıcı belgesi bulunamadı
  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Verisi Bulunamadı</h2>
          <p className="text-gray-600">
            Hesabınız için Firestore'da kullanıcı belgesi bulunamadı. 
            Lütfen yönetici ile iletişime geçin.
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700 font-mono">
              User ID: {user.uid}
            </p>
            <p className="text-sm text-gray-700 font-mono">
              Email: {user.email}
            </p>
          </div>
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  // Yetkisiz erişim
  if (!allowedRoles.includes(userData.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}


