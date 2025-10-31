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
import { formatDateShort, formatDateTimeline } from '@/lib/utils';
import { getCategoryLabel as getCategoryName } from '@/types/categories';
import { ArrowLeft, Tag } from 'lucide-react';

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
  expectedDeliveryDate?: string | Date;
  estimatedReadyDate?: string | Date;
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
          {/* Back Button */}
          <Link 
            href={`/${locale}/shipowner/orders`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {locale === 'tr' ? 'Siparişlere Dön' : 'Back to Orders'}
          </Link>

          {/* Header Section */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Primary Information (2/3 width) */}
              <div className="lg:col-span-2 space-y-4">
                {/* Title and Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{order.rfqTitle}</h1>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </div>
                    
                    {/* Metadata - Two Rows Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDateShort(order.createdAt, locale)}</span>
                          </div>
                          {order.category && (
                            <div className="flex items-center gap-1.5">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <span>{getCategoryLabel(order.category)}</span>
                            </div>
                          )}
                        </div>
                        
                        {order.vessel && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Ship className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{order.vessel.name}</span>
                            {order.vessel.type && <span className="text-gray-500">({order.vessel.type})</span>}
                            {order.vessel.imo && <span className="text-gray-500">• IMO: {order.vessel.imo}</span>}
                          </div>
                        )}
                      </div>

                      {/* Supplier Info in Metadata Area */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">{locale === 'tr' ? 'Tedarikçi:' : 'Supplier:'}</span>
                          <span className="font-semibold text-gray-900">{order.supplierCompany}</span>
                        </div>

                        {/* Ready Date - Estimated and Actual */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Package className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">
                              {locale === 'tr' ? 'Hazır Tarihi' : 'Ready Date'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-gray-500 block mb-0.5">{locale === 'tr' ? 'Tahmini' : 'Estimated'}</span>
                              <p className="text-xs font-semibold text-gray-700">
                                {order.estimatedReadyDate 
                                  ? formatDateShort(order.estimatedReadyDate, locale)
                                  : <span className="text-gray-400 italic">{locale === 'tr' ? 'Bekleniyor' : 'Pending'}</span>
                                }
                              </p>
                            </div>
                            {(() => {
                              const actualReadyEvent = order.timeline?.find((event: any) => 
                                event.status === 'in_progress' || event.status === 'confirmed'
                              );
                              const actualReadyDate = actualReadyEvent?.timestamp 
                                ? (typeof actualReadyEvent.timestamp === 'string' 
                                    ? new Date(actualReadyEvent.timestamp) 
                                    : actualReadyEvent.timestamp)
                                : null;
                              
                              return (
                                <div>
                                  <span className="text-[10px] text-gray-500 block mb-0.5">{locale === 'tr' ? 'Gerçek' : 'Actual'}</span>
                                  <p className="text-xs font-semibold text-emerald-700">
                                    {actualReadyDate 
                                      ? formatDateShort(actualReadyDate, locale)
                                      : <span className="text-gray-400 italic">{locale === 'tr' ? 'Bekleniyor' : 'Pending'}</span>
                                    }
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Delivery Date - Expected and Actual */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">
                              {locale === 'tr' ? 'Teslimat Tarihi' : 'Delivery Date'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-gray-500 block mb-0.5">{locale === 'tr' ? 'Tahmini' : 'Expected'}</span>
                              <p className="text-xs font-semibold text-gray-700">
                                {order.expectedDeliveryDate 
                                  ? formatDateShort(order.expectedDeliveryDate, locale)
                                  : <span className="text-gray-400 italic">{locale === 'tr' ? 'Bekleniyor' : 'Pending'}</span>
                                }
                              </p>
                            </div>
                            {(() => {
                              const actualDeliveredEvent = order.timeline?.find((event: any) => 
                                event.status === 'delivered'
                              );
                              const actualDeliveredDate = actualDeliveredEvent?.timestamp 
                                ? (typeof actualDeliveredEvent.timestamp === 'string' 
                                    ? new Date(actualDeliveredEvent.timestamp) 
                                    : actualDeliveredEvent.timestamp)
                                : null;
                              
                              return (
                                <div>
                                  <span className="text-[10px] text-gray-500 block mb-0.5">{locale === 'tr' ? 'Gerçek' : 'Actual'}</span>
                                  <p className="text-xs font-semibold text-emerald-700">
                                    {actualDeliveredDate 
                                      ? formatDateShort(actualDeliveredDate, locale)
                                      : <span className="text-gray-400 italic">{locale === 'tr' ? 'Bekleniyor' : 'Pending'}</span>
                                    }
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {order.rfqDescription && (
                  <p className="text-gray-700 text-sm leading-relaxed">{order.rfqDescription}</p>
                )}
              </div>

              {/* Right Column - Summary & Actions (1/3 width) */}
              <div className="flex flex-col gap-4">
                {/* Financial Information Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-gray-900">
                      {locale === 'tr' ? 'Toplam Tutar' : 'Total Amount'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-primary mb-4">
                    {order.amount.toLocaleString()} <span className="text-xl text-gray-600">{order.currency}</span>
                  </p>
                  
                  {/* Delivery Info */}
                  {(order.deliveryTime || order.deliveryLocation) && (
                    <>
                      <div className="border-t border-gray-200 my-4"></div>
                      <div className="space-y-3">
                        {order.deliveryTime && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600">
                                {locale === 'tr' ? 'Teslimat Süresi' : 'Delivery Time'}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {order.deliveryTime}
                            </p>
                          </div>
                        )}
                        
                        {order.deliveryLocation && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600">
                                {locale === 'tr' ? 'Teslimat Yeri' : 'Delivery Location'}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {order.deliveryLocation}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                  <Link href={`/${locale}/shipowner/rfq/${order.rfqId}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs py-2 h-auto justify-start">
                      <FileText className="h-3.5 w-3.5 mr-2" />
                      {locale === 'tr' ? 'RFQ Detayını Görüntüle' : 'View RFQ Details'}
                    </Button>
                  </Link>
                  
                  {order.paymentStatus === 'pending' && order.status === 'pending_payment' && (
                    <Button size="sm" onClick={handleMakePayment} className="w-full text-xs py-2 h-auto">
                      <DollarSign className="h-3.5 w-3.5 mr-2" />
                      {locale === 'tr' ? 'Ödeme Yap' : 'Make Payment'}
                    </Button>
                  )}
                  
                  {order.paymentStatus === 'payment_awaiting_confirmation' && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded text-center">
                      {locale === 'tr' ? '⏳ Ödeme onayı bekleniyor' : '⏳ Awaiting confirmation'}
                    </div>
                  )}
                  
                  {order.status === 'shipped' && (
                    <Button size="sm" onClick={handleMarkAsDelivered} className="w-full text-xs py-2 h-auto">
                      <CheckCircle className="h-3.5 w-3.5 mr-2" />
                      {locale === 'tr' ? 'Teslim Alındı' : 'Mark Delivered'}
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="w-full text-xs py-2 h-auto">
                    <FileText className="h-3.5 w-3.5 mr-2" />
                    {locale === 'tr' ? 'Yazdır' : 'Print'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Horizontal Timeline */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-1">
                {/* Order Created */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    true ? 'bg-purple-900 text-white border-purple-900' : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'Sipariş' : 'Order'}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5 text-center px-0.5 truncate w-full">
                    {formatDateTimeline(order.createdAt, locale)}
                  </p>
                </div>

                {/* Connector - Active if order is confirmed or beyond */}
                <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                  (() => {
                    if (['confirmed', 'in_progress', 'shipped', 'delivered', 'completed'].includes(order.status)) {
                      return true;
                    }
                    if (order.timeline && Array.isArray(order.timeline)) {
                      return order.timeline.some((event: any) => event.status === 'confirmed');
                    }
                    return false;
                  })() ? 'bg-indigo-600' : 'bg-gray-200'
                }`}></div>

                {/* Supplier Approval / Confirmed */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    (() => {
                      if (['confirmed', 'in_progress', 'shipped', 'delivered', 'completed'].includes(order.status)) {
                        return true;
                      }
                      if (order.timeline && Array.isArray(order.timeline)) {
                        return order.timeline.some((event: any) => event.status === 'confirmed');
                      }
                      return false;
                    })()
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'Onay' : 'Confirm'}
                  </p>
                </div>

                {/* Connector - Active if payment is paid */}
                <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                  (() => {
                    if (order.paymentStatus === 'paid') {
                      return true;
                    }
                    if (order.timeline && Array.isArray(order.timeline)) {
                      return order.timeline.some((event: any) => event.status === 'paid');
                    }
                    return false;
                  })() ? 'bg-green-600' : 'bg-gray-200'
                }`}></div>

                {/* Payment */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    (() => {
                      if (order.paymentStatus === 'paid') {
                        return true;
                      }
                      if (order.timeline && Array.isArray(order.timeline)) {
                        return order.timeline.some((event: any) => event.status === 'paid');
                      }
                      return false;
                    })()
                      ? 'bg-green-600 text-white border-green-600' 
                      : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'Ödeme' : 'Pay'}
                  </p>
                  {order.paymentStatus === 'paid' && order.amount && (
                    <p className="text-[10px] text-green-700 font-medium mt-0.5 text-center px-0.5">
                      ${(order.amount / 1000).toFixed(0)}k
                    </p>
                  )}
                </div>

                {/* Connector - Active if order is in progress or beyond */}
                <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                  ['in_progress', 'shipped', 'delivered', 'completed'].includes(order.status) 
                    ? 'bg-purple-600' 
                    : 'bg-gray-200'
                }`}></div>

                {/* In Progress */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    ['in_progress', 'shipped', 'delivered', 'completed'].includes(order.status) 
                      ? 'bg-purple-600 text-white border-purple-600' 
                      : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'Hazır' : 'Progress'}
                  </p>
                </div>

                {/* Connector - Active if order is shipped or delivered */}
                <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                  ['shipped', 'delivered', 'completed'].includes(order.status) 
                    ? 'bg-blue-600' 
                    : 'bg-gray-200'
                }`}></div>

                {/* Shipped */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    ['shipped', 'delivered', 'completed'].includes(order.status) 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'Kargo' : 'Ship'}
                  </p>
                  {(() => {
                    // Find shipped event in timeline
                    if (order.timeline && Array.isArray(order.timeline)) {
                      const shippedEvent = order.timeline.find((event: any) => event.status === 'shipped');
                      if (shippedEvent && shippedEvent.timestamp) {
                        return (
                          <>
                            <p className="text-[10px] text-blue-700 font-medium mt-0.5 text-center px-0.5 truncate w-full">
                              {formatDateTimeline(shippedEvent.timestamp?.toDate?.() || shippedEvent.timestamp, locale)}
                            </p>
                            {order.expectedDeliveryDate && (
                              <p className="text-[9px] text-blue-600 mt-0.5 text-center px-0.5 truncate w-full">
                                {locale === 'tr' ? 'Tahmini varış:' : 'ETA:'} {formatDateTimeline(order.expectedDeliveryDate, locale)}
                              </p>
                            )}
                          </>
                        );
                      }
                    }
                    // Fallback to expectedDeliveryDate if timeline doesn't have shipped event yet
                    if (order.status === 'shipped' && order.expectedDeliveryDate) {
                      return (
                        <>
                          <p className="text-[10px] text-blue-700 font-medium mt-0.5 text-center px-0.5 truncate w-full">
                            {formatDateTimeline(order.expectedDeliveryDate, locale)}
                          </p>
                          <p className="text-[9px] text-blue-600 mt-0.5 text-center px-0.5 truncate w-full">
                            {locale === 'tr' ? 'Tahmini varış:' : 'ETA:'} {formatDateTimeline(order.expectedDeliveryDate, locale)}
                          </p>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Connector - Active if order is delivered */}
                <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                  ['delivered', 'completed'].includes(order.status) 
                    ? 'bg-emerald-600' 
                    : 'bg-gray-200'
                }`}></div>

                {/* Delivered */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    ['delivered', 'completed'].includes(order.status) 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'Teslim' : 'Deliver'}
                  </p>
                  {(() => {
                    if (order.timeline && Array.isArray(order.timeline)) {
                      const deliveredEvent = order.timeline.find((event: any) => event.status === 'delivered');
                      if (deliveredEvent && deliveredEvent.timestamp) {
                        return (
                          <p className="text-[10px] text-emerald-700 font-medium mt-0.5 text-center px-0.5 truncate w-full">
                            {formatDateTimeline(deliveredEvent.timestamp?.toDate?.() || deliveredEvent.timestamp, locale)}
                          </p>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          {(order.specifications || order.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>{locale === 'tr' ? 'Teknik Detaylar' : 'Technical Details'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
          )}

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

