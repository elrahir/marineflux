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
  FileText, 
  Loader2, 
  Ship, 
  Calendar, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MessageSquare,
  ArrowLeft,
  Tag,
  AlertCircle,
  Download,
  Building2,
  MapPin,
  Info,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCategoryLabel as getCategoryName } from '@/types/categories';
import { formatDateShort, formatDateTimeline } from '@/lib/utils';

interface RFQ {
  id: string;
  title: string;
  description: string;
  supplierType: 'supplier' | 'service-provider';
  mainCategory: string;
  subcategory?: string;
  category?: string; // Backward compatibility
  vessel?: {
    name: string;
    type: string;
    imo?: string;
  };
  deadline: string;
  status: 'open' | 'closed' | 'awarded';
  quotationCount: number;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
}

export default function RFQDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [acceptedQuotation, setAcceptedQuotation] = useState<any>(null);
  const [actualQuotationCount, setActualQuotationCount] = useState<number>(0);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchRfqDetails();
      fetchQuotations();
    }
  }, [id, user?.uid]);

  // Refresh order data if RFQ is awarded (to catch status updates)
  useEffect(() => {
    if (rfq?.id && user?.uid && rfq.status === 'awarded') {
      // Refresh order immediately
      fetchOrder(rfq.id);
      
      // Then set up periodic refresh every 5 seconds
      const interval = setInterval(() => {
        fetchOrder(rfq.id);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [rfq?.id, rfq?.status, user?.uid]);

  const fetchRfqDetails = async () => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch(`/api/rfq/list?uid=${user.uid}&role=shipowner`);
      const data = await response.json();
      
      if (data.success) {
        const rfqData = data.rfqs.find((r: any) => r.id === id);
        if (rfqData) {
          setRfq(rfqData);
          
          // Fetch actual quotation count
          fetchActualQuotationCount(rfqData.id);
          
          // Always try to fetch order if it exists (regardless of status)
          fetchOrder(rfqData.id);
          
          // If RFQ is awarded, fetch the accepted quotation
          if (rfqData.status === 'awarded') {
            fetchAcceptedQuotation(rfqData.id);
          }
        } else {
          // RFQ not found or doesn't belong to this user
          router.push(`/${locale}/shipowner/rfq`);
        }
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async (rfqId: string) => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch(`/api/order/list?shipownerUid=${user.uid}&rfqId=${rfqId}`);
      const data = await response.json();
      
      if (data.success && data.orders && data.orders.length > 0) {
        // Get the first order (should be only one per RFQ)
        const orderData = data.orders[0];
        setOrder({
          id: orderData.id,
          createdAt: orderData.createdAt,
          status: orderData.status,
          paymentStatus: orderData.paymentStatus,
          amount: orderData.amount,
          timeline: orderData.timeline || [],
          expectedDeliveryDate: orderData.expectedDeliveryDate,
        });
      } else {
        // No order found, clear order state
        setOrder(null);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setOrder(null);
    }
  };

  const fetchActualQuotationCount = async (rfqId: string) => {
    try {
      const response = await fetch(`/api/quotation/list?shipownerUid=${user?.uid}&rfqId=${rfqId}`);
      const data = await response.json();
      
      if (data.success && data.quotations) {
        // Count all quotations (pending, accepted, rejected)
        setActualQuotationCount(data.quotations.length);
      }
    } catch (error) {
      console.error('Error fetching quotation count:', error);
    }
  };

  const fetchQuotations = async () => {
    try {
      const response = await fetch(`/api/quotation/list?rfqId=${id}`);
      const data = await response.json();
      
      console.log('Quotations fetch response:', data);
      
      if (data.success) {
        setQuotations(data.quotations || []);
        console.log('Quotations set:', data.quotations?.length || 0);
      } else {
        console.error('Failed to fetch quotations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    }
  };

  const fetchAcceptedQuotation = async (rfqId: string) => {
    try {
      const response = await fetch(`/api/quotation/list?shipownerUid=${user?.uid}&rfqId=${rfqId}`);
      const data = await response.json();
      
      if (data.success && data.quotations) {
        // Find accepted quotation
        const accepted = data.quotations.find((q: any) => q.status === 'accepted');
        if (accepted) {
          setAcceptedQuotation({
            id: accepted.id,
            estimatedReadyDate: accepted.estimatedReadyDate,
            price: accepted.price,
            currency: accepted.currency,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching accepted quotation:', error);
    }
  };

  const handleAcceptQuotation = async (quotationId: string) => {
    if (!confirm(locale === 'tr' ? 'Bu teklifi kabul edip sipariş oluşturmak istediğinize emin misiniz?' : 'Are you sure you want to accept this quote and create an order?')) {
      return;
    }

    setProcessing(quotationId);

    try {
      const response = await fetch('/api/quotation/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId,
          shipownerUid: user?.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept quotation');
      }

      alert(locale === 'tr' ? '✓ Teklif kabul edildi ve sipariş oluşturuldu!' : '✓ Quotation accepted and order created!');
      
      // Refresh data
      fetchQuotations();
      fetchRfqDetails();
      fetchOrder(id);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectQuotation = async (quotationId: string) => {
    const reason = prompt(locale === 'tr' ? 'Red nedeni (opsiyonel):' : 'Rejection reason (optional):');
    
    if (reason === null) return;

    setProcessing(quotationId);

    try {
      const response = await fetch('/api/quotation/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId,
          shipownerUid: user?.uid,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject quotation');
      }

      alert(locale === 'tr' ? '✓ Teklif reddedildi' : '✓ Quotation rejected');
      fetchQuotations();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleContactSupplier = (supplierUid: string, supplierCompany: string) => {
    if (!supplierUid) {
      alert(locale === 'tr' ? 'Tedarikçi bilgisi bulunamadı' : 'Supplier info not found');
      return;
    }
    
    window.dispatchEvent(new CustomEvent('openChat', {
      detail: {
        recipientId: supplierUid,
        recipientName: supplierCompany,
        relatedEntityId: id,
        relatedEntityType: 'rfq'
      }
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-cyan-100 text-cyan-700 border border-cyan-300 px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5" />
            {locale === 'tr' ? 'Açık' : 'Open'}
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1">
            <XCircle className="h-3 w-3 mr-1.5" />
            {locale === 'tr' ? 'Kapalı' : 'Closed'}
          </Badge>
        );
      case 'awarded':
        return (
          <Badge className="bg-teal-100 text-teal-700 border border-teal-300 px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            {locale === 'tr' ? 'Verildi' : 'Awarded'}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCloseRFQ = async () => {
    if (!confirm(locale === 'tr' ? 'Bu RFQ\'yu kapatmak istediğinize emin misiniz?' : 'Are you sure you want to close this RFQ?')) {
      return;
    }

    try {
      // TODO: Implement close RFQ API
      alert(locale === 'tr' ? 'RFQ kapatma özelliği yakında eklenecek' : 'Close RFQ feature coming soon');
    } catch (error) {
      console.error('Error closing RFQ:', error);
    }
  };

  const handleDeleteRFQ = async () => {
    if (!confirm(locale === 'tr' ? 'Bu RFQ\'yu silmek istediğinize emin misiniz? Bu işlem geri alınamaz!' : 'Are you sure you want to delete this RFQ? This action cannot be undone!')) {
      return;
    }

    try {
      // TODO: Implement delete RFQ API
      alert(locale === 'tr' ? 'RFQ silme özelliği yakında eklenecek' : 'Delete RFQ feature coming soon');
    } catch (error) {
      console.error('Error deleting RFQ:', error);
    }
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

  if (!rfq) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {locale === 'tr' ? 'RFQ bulunamadı' : 'RFQ not found'}
            </p>
            <Link href={`/${locale}/shipowner/rfq`}>
              <Button>
                {locale === 'tr' ? 'RFQ Listesine Dön' : 'Back to RFQ List'}
              </Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const daysRemaining = getDaysRemaining(rfq.deadline);
  const deadlinePassed = isDeadlinePassed(rfq.deadline);

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Back Button */}
          <Link 
            href={`/${locale}/shipowner/rfq`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {locale === 'tr' ? 'RFQ Listesine Dön' : 'Back to RFQ List'}
          </Link>

          {/* Header Section */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{rfq.title}</h1>
                  {getStatusBadge(rfq.status)}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateShort(rfq.createdAt, locale)}</span>
                  </div>
                  {rfq.mainCategory && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-4 w-4" />
                      <span>{getCategoryName(rfq.mainCategory || rfq.category || '', locale === 'tr' ? 'tr' : 'en')}</span>
                    </div>
                  )}
                  {rfq.vessel && (
                    <div className="flex items-center gap-1.5">
                      <Ship className="h-4 w-4" />
                      <span className="font-medium">{rfq.vessel.name}</span>
                      {rfq.vessel.type && <span className="text-gray-500">({rfq.vessel.type})</span>}
                      {rfq.vessel.imo && <span className="text-gray-500">• IMO: {rfq.vessel.imo}</span>}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm leading-relaxed">{rfq.description}</p>
              </div>

              {/* Right Side - Stats Cards */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                {/* Quotations Count */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-medium text-gray-600">
                        {locale === 'tr' ? 'Alınan Teklif' : 'Received Quotes'}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {actualQuotationCount || rfq.quotationCount}
                    </span>
                  </div>
                </div>

                {/* Deadline */}
                <div className={`bg-white rounded-lg border p-3 ${
                  deadlinePassed ? 'border-orange-200 bg-orange-50' : 'border-teal-200 bg-teal-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${deadlinePassed ? 'text-orange-900' : 'text-teal-900'}`} />
                      <span className={`text-xs font-medium ${deadlinePassed ? 'text-orange-700' : 'text-teal-700'}`}>
                        {locale === 'tr' ? 'Son Tarih' : 'Deadline'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${deadlinePassed ? 'text-orange-900' : 'text-teal-900'}`}>
                        {formatDateTimeline(rfq.deadline, locale)}
                      </span>
                      {!deadlinePassed && daysRemaining > 0 && (
                        <p className="text-[10px] text-gray-600 mt-0.5">
                          {daysRemaining} {locale === 'tr' ? 'gün' : 'days'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {rfq.status === 'open' && (
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" disabled className="text-xs py-1.5 h-auto">
                      <Edit className="h-3 w-3 mr-1.5" />
                      {locale === 'tr' ? 'Düzenle' : 'Edit'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCloseRFQ} className="text-xs py-1.5 h-auto">
                      <XCircle className="h-3 w-3 mr-1.5" />
                      {locale === 'tr' ? 'Kapat' : 'Close'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDeleteRFQ} className="text-xs py-1.5 h-auto">
                      <Trash2 className="h-3 w-3 mr-1.5" />
                      {locale === 'tr' ? 'Sil' : 'Delete'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Horizontal Timeline */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-1">
                {/* RFQ Created */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    true ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'RFQ' : 'RFQ'}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5 text-center px-0.5 truncate w-full">
                    {formatDateTimeline(rfq.createdAt, locale)}
                  </p>
                </div>

                {/* Connector */}
                <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                  actualQuotationCount > 0 ? 'bg-teal-900' : 'bg-gray-200'
                }`}></div>

                {/* Quotations Received */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    actualQuotationCount > 0 ? 'bg-teal-900 text-white border-teal-900' : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'Teklif' : 'Quote'}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5 text-center px-0.5">
                    {actualQuotationCount || rfq.quotationCount}
                  </p>
                </div>

                {/* Connector - Show order timeline if RFQ is awarded OR if order exists */}
                {(rfq.status === 'awarded' || order) && (
                  <>
                    {/* Connector - Active if RFQ is awarded */}
                    <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                      rfq.status === 'awarded' ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}></div>

                    {/* Quotation Accepted */}
                    {rfq.status === 'awarded' && (
                      <>
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                            acceptedQuotation ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-200 text-gray-500 border-gray-300'
                          }`}>
                            <CheckCircle className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                            {locale === 'tr' ? 'Seçildi' : 'Accept'}
                          </p>
                          {acceptedQuotation?.estimatedReadyDate && (
                            <p className="text-[10px] text-emerald-700 font-medium mt-0.5 text-center px-0.5 truncate w-full">
                              {formatDateTimeline(acceptedQuotation.estimatedReadyDate, locale)}
                            </p>
                          )}
                        </div>
                        {/* Connector - Active if order exists */}
                        <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                          order ? 'bg-purple-900' : 'bg-gray-200'
                        }`}></div>
                      </>
                    )}

                    {/* Order Created */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order ? 'bg-purple-900 text-white border-purple-900' : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                        {locale === 'tr' ? 'Sipariş' : 'Order'}
                      </p>
                      {order?.createdAt && (
                        <p className="text-[10px] text-gray-600 mt-0.5 text-center px-0.5 truncate w-full">
                          {formatDateTimeline(order.createdAt, locale)}
                        </p>
                      )}
                    </div>

                    {/* Connector - Active if order is confirmed or beyond */}
                    <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                      order && (() => {
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
                        order && (() => {
                          // Check if order status is confirmed or beyond
                          if (['confirmed', 'in_progress', 'shipped', 'delivered', 'completed'].includes(order.status)) {
                            return true;
                          }
                          // Also check timeline events - if there's a 'confirmed' event, order is confirmed
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
                      order && (() => {
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
                        order && (() => {
                          // Check payment status
                          if (order.paymentStatus === 'paid') {
                            return true;
                          }
                          // Also check timeline events - if there's a 'paid' event, payment is done
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
                      {order && order.paymentStatus === 'paid' && order.amount && (
                        <p className="text-[10px] text-green-700 font-medium mt-0.5 text-center px-0.5">
                          ${(order.amount / 1000).toFixed(0)}k
                        </p>
                      )}
                    </div>

                    {/* Connector - Active if order is in progress or beyond */}
                    <div className={`flex-1 h-0.5 mt-3.5 max-w-[20px] ${
                      order && ['in_progress', 'shipped', 'delivered', 'completed'].includes(order.status) 
                        ? 'bg-purple-600' 
                        : 'bg-gray-200'
                    }`}></div>

                    {/* In Progress */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order && ['in_progress', 'shipped', 'delivered', 'completed'].includes(order.status) 
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
                      order && ['shipped', 'delivered', 'completed'].includes(order.status) 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200'
                    }`}></div>

                    {/* Shipped */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order && ['shipped', 'delivered', 'completed'].includes(order.status) 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                        {locale === 'tr' ? 'Kargo' : 'Ship'}
                      </p>
                      {order && (() => {
                        const elements: JSX.Element[] = [];
                        // Find shipped event in timeline
                        if (order.timeline && Array.isArray(order.timeline)) {
                          const shippedEvent = order.timeline.find((event: any) => event.status === 'shipped');
                          if (shippedEvent && shippedEvent.timestamp) {
                            elements.push(
                              <p key="shipped" className="text-[10px] text-blue-700 font-medium mt-0.5 text-center px-0.5 truncate w-full">
                                {formatDateTimeline(shippedEvent.timestamp, locale)}
                              </p>
                            );
                          }
                        } else if (order.status === 'shipped' && order.expectedDeliveryDate) {
                          // Fallback to expectedDeliveryDate if timeline doesn't have shipped event yet
                          elements.push(
                            <p key="shipped-fallback" className="text-[10px] text-blue-700 font-medium mt-0.5 text-center px-0.5 truncate w-full">
                              {formatDateTimeline(order.expectedDeliveryDate, locale)}
                            </p>
                          );
                        }
                        // Add expected delivery date if order is shipped and has expectedDeliveryDate
                        if (order.status === 'shipped' && order.expectedDeliveryDate) {
                          elements.push(
                            <p key="expected" className="text-[9px] text-blue-600 mt-0.5 text-center px-0.5 truncate w-full">
                              {locale === 'tr' ? 'Tahmini varış:' : 'ETA:'} {formatDateTimeline(order.expectedDeliveryDate, locale)}
                            </p>
                          );
                        }
                        return elements.length > 0 ? <>{elements}</> : null;
                      })()}
                    </div>

                    {/* Connector */}
                    <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[20px]"></div>

                    {/* Delivered */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order && ['delivered', 'completed'].includes(order.status) 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                        {locale === 'tr' ? 'Teslim' : 'Deliver'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Attachments */}
          {rfq.attachments && rfq.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {locale === 'tr' ? 'Ekler' : 'Attachments'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rfq.attachments.map((attachment, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{attachment}</p>
                        <p className="text-xs text-gray-500">{locale === 'tr' ? 'Dosya' : 'File'}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quotations Comparison Grid */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {locale === 'tr' ? 'Teklif Karşılaştırması' : 'Quotation Comparison'}
              </h2>
              <p className="text-gray-600">
                {locale === 'tr' 
                  ? 'Gelen teklifleri yan yana karşılaştırın ve en uygununu seçin'
                  : 'Compare quotations side-by-side and select the best one'}
              </p>
            </div>

            {quotations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {locale === 'tr' ? 'Henüz teklif alınmadı' : 'No quotations received yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {(() => {
                  const sortedQuotations = [...quotations].sort((a, b) => a.price - b.price);
                  const lowestPrice = sortedQuotations.length > 0 ? sortedQuotations[0].price : 0;
                  return sortedQuotations.map((quotation, index) => {
                    return (
                    <Card 
                      key={quotation.id} 
                      className={`relative overflow-hidden transition-all hover:shadow-lg flex flex-col h-full ${
                        quotation.price === lowestPrice 
                          ? 'ring-2 ring-teal-500 shadow-teal-100' 
                          : ''
                      }`}
                    >
                      {/* Best Offer Badge */}
                      {quotation.price === lowestPrice && (
                        <div className="absolute top-0 right-0 bg-teal-600 text-white px-2 py-0.5 text-xs font-bold rounded-bl">
                          {locale === 'tr' ? '🏆 EN İYİ' : '🏆 BEST'}
                        </div>
                      )}

                      {/* Rank Badge */}
                      <div className="absolute top-2 left-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs text-gray-600">
                        #{index + 1}
                      </div>

                      {/* Info Icon with Tooltip */}
                      {(quotation.specifications || quotation.notes) && (
                        <div className="absolute top-2 right-2 group">
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                          <div className="absolute right-0 top-6 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg whitespace-normal">
                            {quotation.specifications && (
                              <div className="mb-2 pb-2 border-b border-gray-700">
                                <p className="font-semibold text-xs mb-1">{locale === 'tr' ? 'Teknik Özellikler' : 'Specifications'}</p>
                                <p className="text-xs text-gray-200">{quotation.specifications}</p>
                              </div>
                            )}
                            {quotation.notes && (
                              <div>
                                <p className="font-semibold text-xs mb-1">{locale === 'tr' ? 'Notlar' : 'Notes'}</p>
                                <p className="text-xs text-gray-200">{quotation.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <CardHeader className="pb-3 pt-10">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-maritime-600 flex-shrink-0 mt-1" />
                          <h3 className="text-base font-bold text-gray-900 break-words">{quotation.supplierCompany}</h3>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 flex flex-col">
                        {/* Price Section - Fixed height */}
                        <div className={`rounded-lg p-3 text-center border-2 min-h-[90px] flex flex-col justify-center ${
                          quotation.price === lowestPrice 
                            ? 'bg-teal-50 border-teal-600' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="text-xs text-gray-600 mb-1">
                            {locale === 'tr' ? 'Toplam Fiyat' : 'Total Price'}
                          </div>
                          <div className={`text-2xl font-bold ${
                            quotation.price === lowestPrice ? 'text-teal-600' : 'text-gray-900'
                          }`}>
                            {quotation.price.toLocaleString()}
                            <span className="text-sm ml-1">{quotation.currency}</span>
                          </div>
                          <div className="h-6 flex items-center justify-center">
                            {quotation.price !== lowestPrice ? (
                              <div className="text-xs text-yellow-600 font-semibold">
                                +{((quotation.price - lowestPrice) / lowestPrice * 100).toFixed(1)}%
                                <span className="text-xs text-gray-600 ml-1">
                                  ({(quotation.price - lowestPrice).toLocaleString()} {locale === 'tr' ? 'fazla' : 'more'})
                                </span>
                              </div>
                            ) : (
                              <div className="h-4"></div>
                            )}
                          </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="h-3.5 w-3.5" />
                              {locale === 'tr' ? 'Teslimat' : 'Delivery'}
                            </div>
                            <div className="font-semibold text-gray-900 text-xs">
                              {quotation.deliveryTime} {locale === 'tr' ? 'gün' : 'days'}
                            </div>
                          </div>
                          {quotation.deliveryLocation && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="h-3.5 w-3.5" />
                                {locale === 'tr' ? 'Yer' : 'Location'}
                              </div>
                              <div className="font-semibold text-gray-900 text-xs text-right">
                                {quotation.deliveryLocation}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Section - Fixed height */}
                        <div className="min-h-[32px] flex items-center">
                          {quotation.status === 'pending' && (
                            <Badge className="w-full justify-center bg-cyan-100 text-cyan-700 border border-cyan-300">
                              <Clock className="h-3 w-3 mr-1" />
                              {locale === 'tr' ? 'Beklemede' : 'Pending'}
                            </Badge>
                          )}
                          {quotation.status === 'accepted' && (
                            <Badge className="w-full justify-center bg-teal-100 text-teal-700 border border-teal-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {locale === 'tr' ? 'Kabul Edildi' : 'Accepted'}
                            </Badge>
                          )}
                          {quotation.status === 'rejected' && (
                            <Badge className="w-full justify-center bg-orange-100 text-orange-700 border border-orange-300">
                              {locale === 'tr' ? 'Reddedildi' : 'Rejected'}
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons - Fixed height */}
                        <div className="min-h-[100px] flex flex-col justify-start space-y-2 pt-2">
                          {quotation.status === 'pending' && (
                            <>
                              <Button 
                                className="w-full bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white text-sm py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                onClick={() => handleAcceptQuotation(quotation.id)}
                                disabled={processing === quotation.id}
                              >
                                {processing === quotation.id ? (
                                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-2 h-3.5 w-3.5" />
                                )}
                                {locale === 'tr' ? 'Kabul Et' : 'Accept'}
                              </Button>
                              <div className="grid grid-cols-2 gap-2">
                                <Button 
                                  className="bg-gradient-to-r from-maritime-600 to-maritime-500 hover:from-maritime-700 hover:to-maritime-600 text-white text-xs py-1.5 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                  size="sm"
                                  onClick={() => handleContactSupplier(quotation.supplierUid, quotation.supplierCompany)}
                                >
                                  <MessageCircle className="mr-1 h-3 w-3" />
                                  {locale === 'tr' ? 'Mesaj' : 'Message'}
                                </Button>
                                <Button 
                                  className="bg-gradient-to-r from-orange-900 to-red-950 hover:from-orange-950 hover:to-red-1000 text-white text-xs py-1.5 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                  size="sm"
                                  onClick={() => handleRejectQuotation(quotation.id)}
                                  disabled={processing === quotation.id}
                                >
                                  {locale === 'tr' ? 'Reddet' : 'Reject'}
                                </Button>
                              </div>
                            </>
                          )}
                          {quotation.status !== 'pending' && (
                            <div className="h-full"></div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <p className="text-xs text-gray-500 text-center pt-2 border-t">
                          {locale === 'tr' ? 'Gönderme:' : 'Submitted:'} {new Date(quotation.createdAt).toLocaleDateString(locale)}
                        </p>
                      </CardContent>
                    </Card>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
