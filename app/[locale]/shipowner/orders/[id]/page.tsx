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
  Star
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
  timeline?: {
    status: string;
    description?: string;
    timestamp: string;
  }[];
}

export default function ShipownerOrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Review form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

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
      const response = await fetch(`/api/order/list?shipownerUid=${user.uid}`);
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

  const handleMakePayment = async () => {
    if (!order) return;

    const confirmed = confirm(
      locale === 'tr'
        ? `${order.amount.toLocaleString()} ${order.currency} ödeme yapmak istediğinize emin misiniz?`
        : `Are you sure you want to pay ${order.amount.toLocaleString()} ${order.currency}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/order/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentStatus: 'payment_awaiting_confirmation',
          shipownerUid: user?.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Update local order state
      setOrder({
        ...order,
        paymentStatus: 'payment_awaiting_confirmation',
      });

      alert(locale === 'tr' ? '✓ Ödeme yapıldı! Satıcının onayı bekleniyor.' : '✓ Payment made! Awaiting supplier confirmation.');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!order) return;

    // Check if order is shipped
    if (order.status !== 'shipped') {
      alert(locale === 'tr' 
        ? 'Sipariş henüz kargoda değil' 
        : 'Order is not shipped yet');
      return;
    }

    const confirmed = confirm(
      locale === 'tr'
        ? 'Siparişi teslim alındı olarak işaretlemek istediğinize emin misiniz? Bu işlemden sonra satıcıyı değerlendirebilirsiniz.'
        : 'Are you sure you want to mark this order as delivered? You can rate the supplier after this.'
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/order/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: 'delivered',
          userUid: user?.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as delivered');
      }

      // Update local order state
      setOrder({
        ...order,
        status: 'delivered',
      });

      alert(locale === 'tr' ? '✓ Sipariş teslim alındı olarak işaretlendi!' : '✓ Order marked as delivered!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleConfirmPayment = async () => {
    if (!order) return;

    // Check if payment is pending confirmation
    if (order.paymentStatus !== 'paid_pending_confirmation') {
      alert(locale === 'tr' 
        ? 'Ödenecek bir ödeme yoktur' 
        : 'No pending payment confirmation');
      return;
    }

    const confirmed = confirm(
      locale === 'tr'
        ? 'Ödemeyi onaylamak istediğinize emin misiniz?'
        : 'Are you sure you want to confirm the payment?'
    );

    if (!confirmed) return;

    try {
      // Update payment status to paid (confirmed)
      const paymentResponse = await fetch('/api/order/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentStatus: 'paid',
          shipownerUid: user?.uid,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to confirm payment');
      }

      // Update order status to pending_shipowner_confirmation, then in_progress
      const statusResponse = await fetch('/api/order/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: 'in_progress',
          userUid: user?.uid,
        }),
      });

      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        throw new Error(statusData.error || 'Failed to update status');
      }

      setOrder({
        ...order,
        paymentStatus: 'paid',
        status: 'in_progress',
      });

      alert(locale === 'tr' ? '✓ Ödeme onaylandı!' : '✓ Payment confirmed!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setReviewError(locale === 'tr' ? 'Lütfen bir rating seçin' : 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setReviewError(locale === 'tr' ? 'Lütfen bir yorum yazın' : 'Please write a comment');
      return;
    }

    setSubmitLoading(true);
    setReviewError(null);

    try {
      const response = await fetch('/api/review/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order?.id,
          shipownerUid: user?.uid,
          supplierUid: order?.supplierUid,
          rating,
          comment,
          shipownerCompany: order?.shipownerCompany,
          orderTitle: order?.rfqTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviewSuccess(true);
      setShowReviewModal(false);
      setRating(0);
      setComment('');
      
      setTimeout(() => {
        setReviewSuccess(false);
        fetchOrderDetails();
      }, 2000);
    } catch (error: any) {
      setReviewError(error.message);
    } finally {
      setSubmitLoading(false);
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
      case 'payment_awaiting_confirmation':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {locale === 'tr' ? 'Ödeme Onayı Bekleniyor' : 'Awaiting Confirmation'}
          </Badge>
        );
      case 'paid_pending_confirmation':
        // Backward compatibility - old status name
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {locale === 'tr' ? 'Ödeme Onayı Bekleniyor' : 'Awaiting Confirmation'}
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

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-lg text-amber-600 mb-4">{error}</p>
            <Link href={`/${locale}/shipowner/orders`}>
              <Button>{locale === 'tr' ? 'Siparişlere Dön' : 'Back to Orders'}</Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-4">
              {locale === 'tr' ? 'Sipariş bulunamadı.' : 'Order not found.'}
            </p>
            <Link href={`/${locale}/shipowner/orders`}>
              <Button>{locale === 'tr' ? 'Siparişlere Dön' : 'Back to Orders'}</Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/${locale}/shipowner/orders`}
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
                {order.paymentStatus === 'pending' && order.status === 'pending_payment' && (
                  <Button size="sm" onClick={handleMakePayment}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    {locale === 'tr' ? 'Ödeme Yap' : 'Make Payment'}
                  </Button>
                )}
                {order.paymentStatus === 'payment_awaiting_confirmation' && (
                  <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                    {locale === 'tr' ? '⏳ Satıcının ödeme onayı bekleniyor' : '⏳ Awaiting supplier confirmation'}
                  </div>
                )}
                {order.status === 'shipped' && (
                  <Button size="sm" onClick={handleMarkAsDelivered}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {locale === 'tr' ? 'Teslim Alındı Olarak İşaretle' : 'Mark as Delivered'}
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
                  {locale === 'tr' ? 'Toplam Tutar' : 'Total Amount'}
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
                  {locale === 'tr' ? 'Tahmini' : 'Estimated'}
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
            {/* Supplier Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {locale === 'tr' ? 'Tedarikçi Bilgileri' : 'Supplier Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{locale === 'tr' ? 'Şirket Adı' : 'Company Name'}</h4>
                  <p className="text-gray-700">{order.supplierCompany}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <Link href={`/${locale}/shipowner/rfq/${order.rfqId}`}>
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
                {order.timeline && order.timeline.length > 0 ? (
                  order.timeline.map((event: any, index: number) => {
                    const getStatusColor = (status: string) => {
                      const colors: {[key: string]: string} = {
                        'pending_supplier_approval': 'bg-yellow-100 text-yellow-600',
                        'pending_payment': 'bg-orange-100 text-orange-600',
                        'paid_pending_confirmation': 'bg-blue-100 text-blue-600',
                        'paid': 'bg-teal-100 text-teal-600',
                        'in_progress': 'bg-purple-100 text-purple-600',
                        'shipped': 'bg-indigo-100 text-indigo-600',
                        'delivered': 'bg-green-100 text-green-600',
                      };
                      return colors[status] || 'bg-gray-100 text-gray-600';
                    };

                    const getStatusLabel = (status: string) => {
                      const labels: {[key: string]: {tr: string; en: string}} = {
                        // New system statuses
                        'pending_supplier_approval': { tr: 'Sipariş oluşturuldu', en: 'Order created' },
                        'pending_payment': { tr: 'Satıcı tarafından onaylandı', en: 'Supplier approved' },
                        'payment_awaiting_confirmation': { tr: 'Ödeme yapıldı', en: 'Payment made' },
                        'paid': { tr: 'Ödeme onaylandı', en: 'Payment confirmed' },
                        // Old system statuses (backward compatibility)
                        'pending': { tr: 'Sipariş oluşturuldu', en: 'Order created' },
                        'confirmed': { tr: 'Satıcı tarafından onaylandı', en: 'Supplier approved' },
                        'paid_pending_confirmation': { tr: 'Ödeme yapıldı', en: 'Payment made' }, // Old name for compatibility
                        'in_progress': { tr: 'Hazırlığa başlandı', en: 'Preparation started' },
                        'shipped': { tr: 'Kargolandı', en: 'Shipped' },
                        'delivered': { tr: 'Teslim alındı', en: 'Delivered' },
                      };
                      return labels[status]?.[locale as 'tr' | 'en'] || status;
                    };

                    const colorClass = getStatusColor(event.status);

                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{getStatusLabel(event.status)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(event.timestamp?.toDate?.() || event.timestamp).toLocaleString(locale)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {locale === 'tr' ? 'Geçmiş bulunamadı' : 'No timeline events'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Section - Show when order is delivered */}
          {order.status === 'delivered' && (
            <Card className="border-2 border-teal-200 bg-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-teal-600" />
                  {locale === 'tr' ? 'Satıcıyı Değerlendir' : 'Rate Supplier'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {locale === 'tr' 
                    ? 'Bu satıcıya yorum yaparak diğer gemi sahiplerine yardımcı olun.'
                    : 'Help other shipowners by sharing your experience with this supplier.'}
                </p>
                <Button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Star className="mr-2 h-4 w-4" />
                  {locale === 'tr' ? 'Değerlendirme Yaz' : 'Write Review'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Review Success Message */}
          {reviewSuccess && (
            <Card className="border-2 border-teal-200 bg-teal-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-teal-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>
                    {locale === 'tr' 
                      ? '✓ Değerlendirmeniz başarıyla kaydedildi!' 
                      : '✓ Your review has been saved!'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{locale === 'tr' ? 'Satıcıyı Değerlendir' : 'Rate Supplier'}</CardTitle>
                <CardDescription>{order?.supplierCompany}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'tr' ? 'Puanınız (1-5)' : 'Your Rating (1-5)'}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? 'fill-teal-500 text-teal-500'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'tr' ? 'Yorum' : 'Comment'}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={locale === 'tr' ? 'Deneyiminizi yazın...' : 'Write your experience...'}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={4}
                  />
                </div>

                {/* Error Message */}
                {reviewError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">
                    {reviewError}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewModal(false);
                      setRating(0);
                      setComment('');
                      setReviewError(null);
                    }}
                  >
                    {locale === 'tr' ? 'İptal' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitLoading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {locale === 'tr' ? 'Kaydediliyor...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Star className="mr-2 h-4 w-4" />
                        {locale === 'tr' ? 'Gönder' : 'Submit'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

