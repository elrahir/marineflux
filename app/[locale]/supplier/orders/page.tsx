'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/useAuth';

interface Order {
  id: string;
  title: string;
  description: string;
  shipownerCompany: string;
  shipName?: string; // Ship name
  category?: string; // RFQ category
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  expectedDeliveryDate?: string; // Expected delivery date (set when cargo is prepared)
  createdAt: string;
}

export default function SupplierOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
    }
  }, [user?.uid]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/order/list?supplierUid=${user?.uid}`);
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
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: { tr: 'Beklemede', en: 'Pending' } },
      'confirmed': { color: 'bg-blue-100 text-blue-800', label: { tr: 'Onaylandı', en: 'Confirmed' } },
      'in_progress': { color: 'bg-purple-100 text-purple-800', label: { tr: 'Hazırlanıyor', en: 'In Progress' } },
      'shipped': { color: 'bg-indigo-100 text-indigo-800', label: { tr: 'Kargoda', en: 'Shipped' } },
      'delivered': { color: 'bg-teal-100 text-teal-800', label: { tr: 'Teslim Edildi', en: 'Delivered' } },
      'completed': { color: 'bg-teal-100 text-teal-800', label: { tr: 'Tamamlandı', en: 'Completed' } },
      'cancelled': { color: 'bg-amber-100 text-amber-800', label: { tr: 'İptal Edildi', en: 'Cancelled' } },
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <Badge className={config.color}>
        {config.label[locale as 'tr' | 'en']}
      </Badge>
    );
  };

  let filteredOrders = orders.filter(o =>
    (o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     o.shipownerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
     o.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || o.status === filterStatus)
  );

  // Apply sorting
  filteredOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'shipowner':
        aValue = a.shipownerCompany;
        bValue = b.shipownerCompany;
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'paymentStatus':
        aValue = a.paymentStatus;
        bValue = b.paymentStatus;
        break;
      case 'expectedDeliveryDate':
        aValue = a.expectedDeliveryDate ? new Date(a.expectedDeliveryDate).getTime() : 0;
        bValue = b.expectedDeliveryDate ? new Date(b.expectedDeliveryDate).getTime() : 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {locale === 'tr' ? 'Siparişler' : 'Orders'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {locale === 'tr' ? 'Aldığınız siparişleri yönetin ve takip edin' : 'Manage and track your received orders'}
              </p>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={locale === 'tr' ? 'Ara...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Toplam' : 'Total'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="text-blue-600 text-xs font-semibold">📦</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Beklemede' : 'Pending'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                  </div>
                  <div className="text-yellow-600 text-xs font-semibold">⏳</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Onaylandı' : 'Confirmed'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.confirmed}</p>
                  </div>
                  <div className="text-blue-600 text-xs font-semibold">✓</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Hazırlanıyor' : 'In Progress'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
                  </div>
                  <div className="text-purple-600 text-xs font-semibold">⚙</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Tamamlandı' : 'Completed'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
                  </div>
                  <div className="text-teal-600 text-xs font-semibold">✅</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {locale === 'tr' ? 'Tüm Siparişler' : 'All Orders'}
                </CardTitle>
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">{locale === 'tr' ? 'Tüm Durumlar' : 'All Statuses'}</option>
                    <option value="pending">{locale === 'tr' ? 'Beklemede' : 'Pending'}</option>
                    <option value="confirmed">{locale === 'tr' ? 'Onaylandı' : 'Confirmed'}</option>
                    <option value="in_progress">{locale === 'tr' ? 'Hazırlanıyor' : 'In Progress'}</option>
                    <option value="completed">{locale === 'tr' ? 'Tamamlandı' : 'Completed'}</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-y">
                    <tr>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Sipariş Başlığı' : 'Order Title'}
                          {getSortIcon('title')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('shipowner')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Armatör' : 'Shipowner'}
                          {getSortIcon('shipowner')}
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
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Durum' : 'Status'}
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('paymentStatus')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Ödeme' : 'Payment'}
                          {getSortIcon('paymentStatus')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('expectedDeliveryDate')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Tahmini Teslimat' : 'Est. Delivery'}
                          {getSortIcon('expectedDeliveryDate')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Tarih' : 'Date'}
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider">
                        {locale === 'tr' ? 'İşlem' : 'Action'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          {locale === 'tr' ? 'Sipariş bulunamadı' : 'No orders found'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr 
                          key={order.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/${locale}/supplier/orders/${order.id}`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{order.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{order.description}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{order.shipownerCompany}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-maritime-600">{order.amount.toLocaleString()} {order.currency}</div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={order.paymentStatus === 'paid' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'}>
                              {order.paymentStatus === 'paid' ? (locale === 'tr' ? 'Ödendi' : 'Paid') : (locale === 'tr' ? 'Beklemede' : 'Pending')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString(locale, { 
                              month: 'short', 
                              day: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString(locale, { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link href={`/${locale}/supplier/orders/${order.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" className="text-xs h-7 bg-maritime-600 hover:bg-maritime-700">
                                <Eye className="h-3 w-3" />
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



