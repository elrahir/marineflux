'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Ship, 
  DollarSign, 
  Building2,
  MapPin,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Order {
  id: string;
  rfqId: string;
  quotationId: string;
  shipownerUid: string;
  supplierUid: string;
  rfqTitle: string;
  rfqDescription: string;
  category: string;
  shipownerCompany: string;
  supplierCompany: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  deliveryTime: string;
  deliveryLocation: string;
  notes: string;
  specifications: string;
  createdAt: string;
  updatedAt?: string;
  vessel?: {
    name: string;
    type: string;
    imo?: string;
  };
}

export default function SupplierOrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchOrderDetails();
    }
  }, [id, user?.uid]);

  const fetchOrderDetails = async () => {
    if (!user?.uid) {
      setLoading(false);
      setError('User not authenticated.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/order/list?supplierUid=${user.uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order details');
      }

      const orderData = data.orders.find((o: Order) => o.id === id);
      if (orderData) {
        setOrder(orderData);
      } else {
        setError(locale === 'tr' ? 'Sipariş bulunamadı.' : 'Order not found.');
      }
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      setError(err.message || (locale === 'tr' ? 'Sipariş detayları yüklenirken bir hata oluştu.' : 'Failed to load order details.'));
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/order/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      // Refresh order data
      await fetchOrderDetails();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert(err.message || (locale === 'tr' ? 'Durum güncellenirken hata oluştu' : 'Error updating status'));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: {[key: string]: { color: string; icon: any; label: { tr: string; en: string } }} = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: { tr: 'Beklemede', en: 'Pending' } },
      'confirmed': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: { tr: 'Onaylandı', en: 'Confirmed' } },
      'in_progress': { color: 'bg-purple-100 text-purple-800', icon: Package, label: { tr: 'Hazırlanıyor', en: 'In Progress' } },
      'shipped': { color: 'bg-indigo-100 text-indigo-800', icon: Truck, label: { tr: 'Kargoda', en: 'Shipped' } },
      'delivered': { color: 'bg-teal-100 text-teal-800', icon: CheckCircle, label: { tr: 'Teslim Edildi', en: 'Delivered' } },
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: { tr: 'Tamamlandı', en: 'Completed' } },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle, label: { tr: 'İptal Edildi', en: 'Cancelled' } },
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
            <AlertCircle className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Ödeme Bekliyor' : 'Payment Pending'}
          </Badge>
        );
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
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

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: { tr: string; en: string } } = {
      'spare-parts': { tr: 'Yedek Parça', en: 'Spare Parts' },
      'provisions': { tr: 'İaşe', en: 'Provisions' },
      'deck-equipment': { tr: 'Güverte Ekipmanı', en: 'Deck Equipment' },
      'engine-parts': { tr: 'Makine Parçaları', en: 'Engine Parts' },
      'safety-equipment': { tr: 'Güvenlik Ekipmanı', en: 'Safety Equipment' },
      'chemicals': { tr: 'Kimyasallar', en: 'Chemicals' },
      'navigation': { tr: 'Navigasyon', en: 'Navigation' },
      'electrical': { tr: 'Elektrik', en: 'Electrical' },
      'services': { tr: 'Hizmetler', en: 'Services' },
      'other': { tr: 'Diğer', en: 'Other' },
    };
    return categories[category]?.[locale as 'tr' | 'en'] || category;
  };

  const getNextStatus = (currentStatus: string): { status: string; label: { tr: string; en: string } } | null => {
    const statusFlow: {[key: string]: { status: string; label: { tr: string; en: string } }} = {
      'pending': { status: 'confirmed', label: { tr: 'Onayla', en: 'Confirm' } },
      'confirmed': { status: 'in_progress', label: { tr: 'Hazırlığa Başla', en: 'Start Preparation' } },
      'in_progress': { status: 'shipped', label: { tr: 'Kargoya Ver', en: 'Mark as Shipped' } },
      'shipped': { status: 'delivered', label: { tr: 'Teslim Edildi', en: 'Mark as Delivered' } },
    };
    return statusFlow[currentStatus] || null;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
        <DashboardLayout locale={locale} userType="supplier">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
        <DashboardLayout locale={locale} userType="supplier">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <Link href={`/${locale}/supplier/orders`}>
              <Button>{locale === 'tr' ? 'Siparişlere Dön' : 'Back to Orders'}</Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
        <DashboardLayout locale={locale} userType="supplier">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-4">
              {locale === 'tr' ? 'Sipariş bulunamadı.' : 'Order not found.'}
            </p>
            <Link href={`/${locale}/supplier/orders`}>
              <Button>{locale === 'tr' ? 'Siparişlere Dön' : 'Back to Orders'}</Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/${locale}/supplier/orders`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {locale === 'tr' ? '← Siparişlere Dön' : '← Back to Orders'}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{order.rfqTitle}</h1>
                {getStatusBadge(order.status)}
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
              <div className="flex gap-2">
                {nextStatus && order.status !== 'delivered' && order.status !== 'completed' && order.status !== 'cancelled' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateOrderStatus(nextStatus.status)}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {locale === 'tr' ? 'Güncelleniyor...' : 'Updating...'}
                      </>
                    ) : (
                      nextStatus.label[locale as 'tr' | 'en']
                    )}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <FileText className="mr-2 h-4 w-4" />
                  {locale === 'tr' ? 'Yazdır' : 'Print'}
                </Button>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' ? 'Sipariş No:' : 'Order ID:'} #{order.id.substring(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Sipariş Tutarı' : 'Order Amount'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {order.amount.toLocaleString()} {order.currency}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'KDV dahil' : 'VAT included'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Teslimat Süresi' : 'Delivery Time'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{order.deliveryTime}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Taahhüt edilen' : 'Committed'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Kategori' : 'Category'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">{getCategoryLabel(order.category)}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {locale === 'tr' ? 'Ürün kategorisi' : 'Product category'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {locale === 'tr' ? 'Müşteri Bilgileri' : 'Customer Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{locale === 'tr' ? 'Şirket Adı' : 'Company Name'}</h4>
                  <p className="text-gray-700">{order.shipownerCompany}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <Link href={`/${locale}/supplier/rfqs/${order.rfqId}`}>
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      {locale === 'tr' ? 'Orijinal RFQ\'yu Görüntüle' : 'View Original RFQ'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {locale === 'tr' ? 'Teslimat Bilgileri' : 'Delivery Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{locale === 'tr' ? 'Teslimat Yeri' : 'Delivery Location'}</h4>
                  <p className="text-gray-700">{order.deliveryLocation}</p>
                </div>

                {order.vessel && (
                  <div>
                    <h4 className="font-semibold mb-1">{locale === 'tr' ? 'Gemi Bilgileri' : 'Vessel Information'}</h4>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Ship className="h-4 w-4" />
                      <span>{order.vessel.name} ({order.vessel.type})</span>
                    </div>
                    {order.vessel.imo && (
                      <p className="text-sm text-gray-600 mt-1">IMO: {order.vessel.imo}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'Sipariş Detayları' : 'Order Details'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">{locale === 'tr' ? 'Açıklama' : 'Description'}</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{order.rfqDescription}</p>
              </div>

              {order.specifications && (
                <div>
                  <h4 className="font-semibold mb-1">{locale === 'tr' ? 'Teknik Özellikler' : 'Technical Specifications'}</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{order.specifications}</p>
                </div>
              )}

              {order.notes && (
                <div>
                  <h4 className="font-semibold mb-1">{locale === 'tr' ? 'Notlar' : 'Notes'}</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'tr' ? 'Sipariş Geçmişi' : 'Order Timeline'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{locale === 'tr' ? 'Sipariş Alındı' : 'Order Received'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString(locale)}
                    </p>
                  </div>
                </div>

                {order.updatedAt && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{locale === 'tr' ? 'Son Güncelleme' : 'Last Updated'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.updatedAt).toLocaleString(locale)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

