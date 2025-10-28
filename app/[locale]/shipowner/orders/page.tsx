'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCategoryLabel } from '@/types/categories';

interface Order {
  id: string;
  title: string;
  description: string;
  category: string;
  supplierCompany: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  deliveryTime: string;
  createdAt: string;
  shipName?: string;
}

export default function ShipownerOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
    }
  }, [user?.uid, filterStatus]);

  const fetchOrders = async () => {
    try {
      const statusParam = filterStatus !== 'all' ? `&status=${filterStatus}` : '';
      const response = await fetch(`/api/order/list?shipownerUid=${user?.uid}${statusParam}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (categoryId: string) => {
    return getCategoryLabel(categoryId, locale === 'tr' ? 'tr' : 'en');
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1 text-maritime-600" />
      : <ArrowDown className="h-3 w-3 ml-1 text-maritime-600" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: {[key: string]: { color: string; label: { tr: string; en: string } }} = {
      'pending': { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: { tr: 'Beklemede', en: 'Pending' } },
      'confirmed': { color: 'bg-blue-50 text-blue-700 border border-blue-200', label: { tr: 'Onaylandı', en: 'Confirmed' } },
      'in_progress': { color: 'bg-purple-50 text-purple-700 border border-purple-200', label: { tr: 'Hazırlanıyor', en: 'In Progress' } },
      'shipped': { color: 'bg-indigo-50 text-indigo-700 border border-indigo-200', label: { tr: 'Kargoda', en: 'Shipped' } },
      'delivered': { color: 'bg-teal-50 text-teal-700 border border-teal-200', label: { tr: 'Teslim Edildi', en: 'Delivered' } },
      'completed': { color: 'bg-teal-50 text-teal-700 border border-teal-200', label: { tr: 'Tamamlandı', en: 'Completed' } },
      'cancelled': { color: 'bg-amber-50 text-amber-700 border border-amber-200', label: { tr: 'İptal Edildi', en: 'Cancelled' } },
    };

    const config = statusConfig[status] || statusConfig['pending'];

    return (
      <Badge className={config.color}>
        {config.label[locale as 'tr' | 'en']}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: {[key: string]: { color: string; label: { tr: string; en: string } }} = {
      'pending': { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: { tr: 'Ödeme Bekliyor', en: 'Payment Pending' } },
      'paid': { color: 'bg-teal-50 text-teal-700 border border-teal-200', label: { tr: 'Ödendi', en: 'Paid' } },
      'refunded': { color: 'bg-gray-50 text-gray-700 border border-gray-200', label: { tr: 'İade Edildi', en: 'Refunded' } },
    };

    const current = config[status] || config['pending'];
        return (
      <Badge className={current.color}>
        {current.label[locale as 'tr' | 'en']}
          </Badge>
        );
  };

  const stats = {
    total: orders.length,
    active: orders.filter(o => ['pending', 'confirmed', 'in_progress', 'shipped'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalSpent: orders.reduce((sum, o) => sum + o.amount, 0),
  };

  // Filter and sort
  let filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
  
  filteredOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'shipName':
        aValue = a.shipName || '';
        bValue = b.shipName || '';
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'category':
        const aCat = a.category || '';
        const bCat = b.category || '';
        aValue = getCategoryDisplayName(aCat);
        bValue = getCategoryDisplayName(bCat);
        break;
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'amount':
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {locale === 'tr' ? 'Siparişlerim' : 'My Orders'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {locale === 'tr' 
                ? 'Aktif ve geçmiş siparişlerinizi görüntüleyin ve takip edin'
                : 'View and track your active and past orders'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                  {locale === 'tr' ? 'Toplam Sipariş' : 'Total Orders'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="text-teal-600 text-xs font-semibold">∑</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Aktif Sipariş' : 'Active'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                  </div>
                  <div className="text-blue-600 text-xs font-semibold">⏳</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                  {locale === 'tr' ? 'Tamamlanan' : 'Completed'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
                  </div>
                  <div className="text-purple-600 text-xs font-semibold">✓</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                  {locale === 'tr' ? 'Toplam Harcama' : 'Total Spent'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">${stats.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="text-green-600 text-xs font-semibold">$</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {locale === 'tr' ? 'Sipariş Listesi' : 'Orders List'}
              </CardTitle>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2"
                >
                  <option value="all">{locale === 'tr' ? 'Tüm Durumlar' : 'All Statuses'}</option>
                  <option value="pending">{locale === 'tr' ? 'Beklemede' : 'Pending'}</option>
                  <option value="confirmed">{locale === 'tr' ? 'Onaylandı' : 'Confirmed'}</option>
                  <option value="in_progress">{locale === 'tr' ? 'Hazırlanıyor' : 'In Progress'}</option>
                  <option value="shipped">{locale === 'tr' ? 'Kargoda' : 'Shipped'}</option>
                  <option value="completed">{locale === 'tr' ? 'Tamamlandı' : 'Completed'}</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-y">
                    <tr>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('shipName')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Gemi' : 'Vessel'}
                          {getSortIcon('shipName')}
                </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Başlık' : 'Title'}
                          {getSortIcon('title')}
                </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Kategori' : 'Category'}
                          {getSortIcon('category')}
                          </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Tutar' : 'Amount'}
                          {getSortIcon('amount')}
                            </div>
                      </th>
                      <th 
                        className="text-center py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center justify-center">
                          {locale === 'tr' ? 'Durum' : 'Status'}
                          {getSortIcon('status')}
                              </div>
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider">
                        {locale === 'tr' ? 'Ödeme' : 'Payment'}
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider">
                        {locale === 'tr' ? 'İşlem' : 'Action'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          {locale === 'tr' ? 'Sipariş bulunamadı' : 'No orders found'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr 
                          key={order.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/${locale}/shipowner/orders/${order.id}`}
                        >
                          <td className="py-3 px-4 text-gray-900">
                            {order.shipName ? (
                              <div className="font-medium">{order.shipName}</div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{order.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{order.description}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {order.category ? getCategoryDisplayName(order.category) : '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            {order.amount.toLocaleString()} {order.currency}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link href={`/${locale}/shipowner/orders/${order.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



