'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Ship, Package, Shield, Trash2, Eye, Loader2 } from 'lucide-react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getCategoryLabel, SupplierType } from '@/types/categories';

interface User {
  uid: string;
  email: string;
  role: 'admin' | 'shipowner' | 'supplier';
  companyName: string;
  createdAt: any;
  supplierType?: SupplierType;
  mainCategories?: string[];
}

export default function UsersListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'shipowner' | 'supplier'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const usersData: User[] = [];
      
      querySnapshot.forEach((doc) => {
        usersData.push(doc.data() as User);
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'shipowner':
        return <Ship className="h-4 w-4" />;
      case 'supplier':
        return <Package className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'shipowner':
        return 'bg-blue-100 text-blue-800';
      case 'supplier':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'shipowner':
        return locale === 'tr' ? 'Armatör' : 'Shipowner';
      case 'supplier':
        return locale === 'tr' ? 'Tedarikçi' : 'Supplier';
      default:
        return role;
    }
  };

  const getCategoryDisplayName = (categoryId: string) => {
    return getCategoryLabel(categoryId, locale === 'tr' ? 'tr' : 'en');
  };

  const getSupplierTypeLabel = (type?: SupplierType) => {
    if (!type) return '-';
    return type === 'supplier'
      ? (locale === 'tr' ? 'Ürün Tedarikçi' : 'Product Supplier')
      : (locale === 'tr' ? 'Servis Sağlayıcı' : 'Service Provider');
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(user => user.role === filter);

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    shipowner: users.filter(u => u.role === 'shipowner').length,
    supplier: users.filter(u => u.role === 'supplier').length,
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!confirm(`${locale === 'tr' ? 'Kullanıcıyı silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this user?'} (${email})`)) {
      return;
    }

    try {
      setDeleting(uid);
      await deleteDoc(doc(db, 'users', uid));
      
      // Also delete from role-specific collections
      const roleCollections = ['shipowners', 'suppliers', 'admins'];
      for (const collection of roleCollections) {
        try {
          await deleteDoc(doc(db, collection, uid));
        } catch (err) {
          // Document might not exist
        }
      }

      setUsers(users.filter(u => u.uid !== uid));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(locale === 'tr' ? 'Kullanıcı silinirken hata oluştu' : 'Error deleting user');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']} locale={locale}>
      <DashboardLayout locale={locale} userType="admin">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('admin.users')}
              </h1>
              <p className="text-gray-600 mt-2">
                {locale === 'tr' 
                  ? 'Tüm kullanıcıları görüntüleyin ve yönetin'
                  : 'View and manage all users'}
              </p>
            </div>
            <Link href={`/${locale}/admin/users/create`}>
              <Button size="lg">
                <UserPlus className="mr-2 h-5 w-5" />
                {t('admin.createUser')}
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilter('all')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Toplam Kullanıcı' : 'Total Users'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${filter === 'admin' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setFilter('admin')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.admin}</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${filter === 'shipowner' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setFilter('shipowner')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Armatör' : 'Shipowner'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.shipowner}</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${filter === 'supplier' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setFilter('supplier')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Tedarikçi' : 'Supplier'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.supplier}</div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filter === 'all' 
                  ? (locale === 'tr' ? 'Tüm Kullanıcılar' : 'All Users')
                  : `${getRoleLabel(filter)} (${filteredUsers.length})`}
              </CardTitle>
              <CardDescription>
                {locale === 'tr' 
                  ? 'Sisteme kayıtlı kullanıcılar'
                  : 'Registered users in the system'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  {t('common.loading')}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {locale === 'tr' ? 'Kullanıcı bulunamadı' : 'No users found'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-gray-600">
                          {t('common.email')}
                        </th>
                        <th className="text-left p-4 font-medium text-gray-600">
                          {locale === 'tr' ? 'Şirket' : 'Company'}
                        </th>
                        <th className="text-left p-4 font-medium text-gray-600">
                          {locale === 'tr' ? 'Rol' : 'Role'}
                        </th>
                        {filter === 'supplier' && (
                          <>
                            <th className="text-left p-4 font-medium text-gray-600">
                              {locale === 'tr' ? 'Tip' : 'Type'}
                            </th>
                            <th className="text-left p-4 font-medium text-gray-600">
                              {locale === 'tr' ? 'Kategoriler' : 'Categories'}
                            </th>
                          </>
                        )}
                        <th className="text-left p-4 font-medium text-gray-600">
                          {locale === 'tr' ? 'Oluşturulma' : 'Created'}
                        </th>
                        <th className="text-left p-4 font-medium text-gray-600">
                          {locale === 'tr' ? 'İşlemler' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.uid} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.uid.substring(0, 8)}...</div>
                          </td>
                          <td className="p-4">{user.companyName}</td>
                          <td className="p-4">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              <span className="flex items-center gap-1">
                                {getRoleIcon(user.role)}
                                {getRoleLabel(user.role)}
                              </span>
                            </Badge>
                          </td>
                          {filter === 'supplier' && (
                            <>
                              <td className="p-4 text-sm text-gray-600">
                                {getSupplierTypeLabel(user.supplierType)}
                              </td>
                              <td className="p-4">
                                {user.mainCategories && user.mainCategories.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {user.mainCategories.slice(0, 2).map((catId) => (
                                      <Badge key={catId} variant="outline" className="text-xs">
                                        {getCategoryDisplayName(catId)}
                                      </Badge>
                                    ))}
                                    {user.mainCategories.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{user.mainCategories.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </>
                          )}
                          <td className="p-4 text-sm text-gray-600">
                            {user.createdAt?.toDate?.()?.toLocaleDateString() || '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = `/${locale}/admin/users/${user.uid}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deleting === user.uid}
                                onClick={() => handleDeleteUser(user.uid, user.email)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {deleting === user.uid ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



