'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, XCircle, Truck, Ship, DollarSign, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

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
  vessel?: {
    name: string;
    type: string;
  };
}

export default function ShipownerOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
    }
  }, [user?.uid, filter]);

  const fetchOrders = async () => {
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
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

  const getStatusBadge = (status: string) => {
    const statusConfig: {[key: string]: { color: string; icon: any; label: { tr: string; en: string } }} = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: { tr: 'Beklemede', en: 'Pending' } },
      'confirmed': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: { tr: 'Onaylandı', en: 'Confirmed' } },
      'in_progress': { color: 'bg-purple-100 text-purple-800', icon: Package, label: { tr: 'Hazırlanıyor', en: 'In Progress' } },
      'shipped': { color: 'bg-indigo-100 text-indigo-800', icon: Truck, label: { tr: 'Kargoda', en: 'Shipped' } },
      'delivered': { color: 'bg-teal-100 text-teal-800', icon: CheckCircle, label: { tr: 'Teslim Edildi', en: 'Delivered' } },
      'completed': { color: 'bg-teal-100 text-teal-800', icon: CheckCircle, label: { tr: 'Tamamlandı', en: 'Completed' } },
      'cancelled': { color: 'bg-amber-100 text-amber-800', icon: XCircle, label: { tr: 'İptal Edildi', en: 'Cancelled' } },
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label[locale as 'tr' | 'en']}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            {locale === 'tr' ? 'Ödeme Bekliyor' : 'Payment Pending'}
          </Badge>
        );
      case 'paid':
        return (
          <Badge className="bg-teal-100 text-teal-800">
            {locale === 'tr' ? 'Ödendi' : 'Paid'}
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {locale === 'tr' ? 'İade Edildi' : 'Refunded'}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    total: orders.length,
    active: orders.filter(o => ['pending', 'confirmed', 'in_progress', 'shipped'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalSpent: orders.reduce((sum, o) => sum + o.amount, 0),
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Siparişlerim' : 'My Orders'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' 
                ? 'Aktif ve geçmiş siparişlerinizi görüntüleyin ve takip edin'
                : 'View and track your active and past orders'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Toplam Sipariş' : 'Total Orders'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Aktif Siparişler' : 'Active Orders'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Tamamlanan' : 'Completed'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">{stats.completed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Toplam Harcama' : 'Total Spent'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ${stats.totalSpent.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'all', label: locale === 'tr' ? 'Tümü' : 'All' },
              { value: 'pending', label: locale === 'tr' ? 'Beklemede' : 'Pending' },
              { value: 'confirmed', label: locale === 'tr' ? 'Onaylandı' : 'Confirmed' },
              { value: 'in_progress', label: locale === 'tr' ? 'Hazırlanıyor' : 'In Progress' },
              { value: 'shipped', label: locale === 'tr' ? 'Kargoda' : 'Shipped' },
              { value: 'completed', label: locale === 'tr' ? 'Tamamlandı' : 'Completed' },
            ].map((item) => (
              <Button
                key={item.value}
                variant={filter === item.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filter === 'all' 
                  ? (locale === 'tr' ? 'Tüm Siparişler' : 'All Orders')
                  : `${filteredOrders.length} ${locale === 'tr' ? 'Sipariş' : 'Orders'}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  {t('common.loading')}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {locale === 'tr' ? 'Sipariş bulunamadı' : 'No orders found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{order.title}</h3>
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {order.supplierCompany}
                            </div>
                            
                            {order.vessel && (
                              <div className="flex items-center gap-1">
                                <Ship className="h-4 w-4" />
                                {order.vessel.name}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {locale === 'tr' ? 'Teslimat: ' : 'Delivery: '}
                              {order.deliveryTime}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{order.description}</p>
                          
                          <div className="text-xs text-gray-500">
                            {locale === 'tr' ? 'Sipariş tarihi:' : 'Order date:'} {new Date(order.createdAt).toLocaleDateString(locale)}
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                            <DollarSign className="h-4 w-4" />
                            {locale === 'tr' ? 'Tutar' : 'Amount'}
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {order.amount.toLocaleString()} {order.currency}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/${locale}/shipowner/orders/${order.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            {locale === 'tr' ? 'Detaylar ve Takip' : 'Details & Tracking'}
                          </Button>
                        </Link>
                        {order.paymentStatus === 'pending' && (
                          <Button className="flex-1">
                            {locale === 'tr' ? 'Ödeme Yap' : 'Make Payment'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}



