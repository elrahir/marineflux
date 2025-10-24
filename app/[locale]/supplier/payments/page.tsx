'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, TrendingUp, Package, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Payment {
  id: string;
  orderId: string;
  orderTitle: string;
  shipownerCompany: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  paidAt?: string;
  createdAt: string;
}

export default function SupplierPaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.uid) {
      fetchPayments();
    }
  }, [user?.uid, filter]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/order/list?supplierUid=${user?.uid}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter orders dengan paymentStatus 'paid' atau 'payment_awaiting_confirmation'
        const paymentOrders = data.orders
          .filter((o: any) => o.paymentStatus && (o.paymentStatus === 'paid' || o.paymentStatus === 'payment_awaiting_confirmation' || o.paymentStatus === 'paid_pending_confirmation'))
          .map((o: any) => ({
            id: o.id,
            orderId: o.id,
            orderTitle: o.title || o.rfqTitle || 'N/A',
            shipownerCompany: o.shipownerCompany,
            amount: o.amount,
            currency: o.currency,
            paymentStatus: o.paymentStatus,
            orderStatus: o.status,
            paidAt: o.paidAt,
            createdAt: o.createdAt,
          }));
        setPayments(paymentOrders);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-teal-100 text-teal-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Ödendi' : 'Paid'}
          </Badge>
        );
      case 'payment_awaiting_confirmation':
      case 'paid_pending_confirmation':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Ödeme Onayı Bekleniyor' : 'Awaiting Confirmation'}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig: {[key: string]: { color: string; icon: any; label: { tr: string; en: string } }} = {
      'pending_supplier_approval': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: { tr: 'Onay Bekleniyor', en: 'Pending Approval' } },
      'pending_payment': { color: 'bg-orange-100 text-orange-800', icon: DollarSign, label: { tr: 'Ödeme Bekleniyor', en: 'Awaiting Payment' } },
      'in_progress': { color: 'bg-purple-100 text-purple-800', icon: Package, label: { tr: 'Hazırlanıyor', en: 'In Progress' } },
      'shipped': { color: 'bg-indigo-100 text-indigo-800', icon: Package, label: { tr: 'Kargoda', en: 'Shipped' } },
      'delivered': { color: 'bg-teal-100 text-teal-800', icon: CheckCircle, label: { tr: 'Teslim Edildi', en: 'Delivered' } },
      'completed': { color: 'bg-teal-100 text-teal-800', icon: CheckCircle, label: { tr: 'Tamamlandı', en: 'Completed' } },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Package, label: { tr: status, en: status } };
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label[locale as 'tr' | 'en']}
      </Badge>
    );
  };

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.paymentStatus === 'paid').length,
    pending: payments.filter(p => (p.paymentStatus === 'payment_awaiting_confirmation' || p.paymentStatus === 'paid_pending_confirmation')).length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.amount, 0),
  };

  const filteredPayments = filter === 'all' 
    ? payments 
    : filter === 'paid' 
      ? payments.filter(p => p.paymentStatus === 'paid')
      : payments.filter(p => (p.paymentStatus === 'payment_awaiting_confirmation' || p.paymentStatus === 'paid_pending_confirmation'));

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Ödemeler' : 'Payments'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' ? 'Tamamlanan siparişlerden alınan ödemeleri takip edin' : 'Track payments received from completed orders'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {locale === 'tr' ? 'Toplam İşlem' : 'Total Transactions'}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stats.total}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {locale === 'tr' ? 'Ödenen' : 'Paid'}
                    </p>
                    <p className="text-2xl font-bold text-teal-600 mt-2">{stats.paid}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-teal-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {locale === 'tr' ? 'Onay Bekleyen' : 'Pending Confirmation'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {locale === 'tr' ? 'Toplam Tutar' : 'Total Amount'}
                    </p>
                    <p className="text-2xl font-bold text-teal-600 mt-2">
                      {stats.totalAmount.toLocaleString()} {payments[0]?.currency}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-teal-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              {locale === 'tr' ? 'Tümü' : 'All'} ({stats.total})
            </Button>
            <Button
              variant={filter === 'paid' ? 'default' : 'outline'}
              onClick={() => setFilter('paid')}
              size="sm"
              className={filter === 'paid' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              {locale === 'tr' ? 'Ödenen' : 'Paid'} ({stats.paid})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              size="sm"
              className={filter === 'pending' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {locale === 'tr' ? 'Onay Bekleyen' : 'Pending'} ({stats.pending})
            </Button>
          </div>

          {/* Payments List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600">
                  {locale === 'tr' ? 'Ödeme bulunamadı' : 'No payments found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          {locale === 'tr' ? 'Sipariş' : 'Order'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          {locale === 'tr' ? 'Müşteri' : 'Customer'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          {locale === 'tr' ? 'Tutar' : 'Amount'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          {locale === 'tr' ? 'Ödeme Durumu' : 'Payment Status'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          {locale === 'tr' ? 'Sipariş Durumu' : 'Order Status'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          {locale === 'tr' ? 'Tarih' : 'Date'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          {locale === 'tr' ? 'İşlem' : 'Action'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {(payment.orderTitle || 'N/A').substring(0, 30)}{(payment.orderTitle?.length || 0) > 30 ? '...' : ''}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {payment.shipownerCompany}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {payment.amount.toLocaleString()} {payment.currency}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {getPaymentStatusBadge(payment.paymentStatus)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {getOrderStatusBadge(payment.orderStatus)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString(locale)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Link href={`/${locale}/supplier/orders/${payment.orderId}`}>
                              <Button variant="outline" size="sm">
                                {locale === 'tr' ? 'Detay' : 'View'}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
