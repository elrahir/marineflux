'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, DollarSign, Star, TrendingUp, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { TimelineSchedule } from '@/components/supplier/TimelineSchedule';
import { getEventLabel } from '@/lib/timeline-expressions';

interface RFQ {
  id: string;
  title: string;
  description: string;
  status: string;
  quotationCount: number;
  deadline: string;
  shipownerCompany: string;
  createdAt: string;
}

interface Quotation {
  id: string;
  rfqId: string;
  rfqTitle?: string;
  status: 'pending' | 'accepted' | 'rejected';
  totalPrice?: number;
  createdAt: string;
}

interface TimelineEvent {
  status: string;
  timestamp: any;
  description?: string;
  note?: string;
  updatedBy: string;
}

interface Order {
  id: string;
  title: string;
  status: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'payment_awaiting_confirmation';
  amount: number;
  currency: string;
  shipownerCompany: string;
  expectedDeliveryDate?: string;
  timeline?: TimelineEvent[];
  createdAt: string;
}

export default function SupplierDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchDashboardData();
    }
  }, [user?.uid]);

  const fetchDashboardData = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      
      // Fetch RFQs
      const rfqResponse = await fetch(`/api/rfq/list?status=open&uid=${user.uid}&role=supplier&limit=100`);
      const rfqData = await rfqResponse.json();
      if (rfqData.success) {
        setRfqs(rfqData.rfqs);
      }

      // Fetch Quotations
      const quotResponse = await fetch(`/api/quotation/list?supplierUid=${user.uid}`);
      const quotData = await quotResponse.json();
      if (quotData.success) {
        setQuotations(quotData.quotations);
      }

      // Fetch Orders
      const orderResponse = await fetch(`/api/order/list?supplierUid=${user.uid}`);
      const orderData = await orderResponse.json();
      if (orderData.success) {
        setOrders(orderData.orders);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate workflow metrics
  const calculateWorkflowMetrics = () => {
    // RFQs: Sadece teklif verilebilecek RFQlar (henüz teklif vermedikleri)
    const rfqQuotedIds = new Set(quotations.map(q => q.rfqId || ''));
    const rfqWithoutQuotation = rfqs.filter(rfq => !rfqQuotedIds.has(rfq.id));
    const rfqOpen = rfqWithoutQuotation.length;

    // Quotations: Sadece cevap bekleyen teklifler (pending status)
    const quotationPending = quotations.filter(q => q.status === 'pending').length;
    const quotationAccepted = quotations.filter(q => q.status === 'accepted').length;

    // Orders - Durumlara göre breakdown
    const ordersActivePending = orders.filter(o => o.status === 'pending').length;
    const ordersActiveConfirmed = orders.filter(o => o.status === 'confirmed').length;
    const ordersActiveInProgress = orders.filter(o => o.status === 'in_progress').length;
    const ordersActiveShipped = orders.filter(o => o.status === 'shipped').length;
    const ordersActiveTotal = ordersActivePending + ordersActiveConfirmed + ordersActiveInProgress + ordersActiveShipped;
    const ordersCompleted = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;

    // Payments: Sadece beklenen ödemeler (pending payment status)
    const paymentPending = orders.filter(o => o.paymentStatus === 'pending').length;
    const paymentCompleted = orders.filter(o => o.paymentStatus === 'paid').length;

    return {
      rfqOpen,
      quotationPending,
      quotationAccepted,
      ordersActive: {
        pending: ordersActivePending,
        confirmed: ordersActiveConfirmed,
        inProgress: ordersActiveInProgress,
        shipped: ordersActiveShipped,
        total: ordersActiveTotal,
      },
      ordersCompleted,
      paymentPending,
      paymentCompleted,
    };
  };

  // Calculate comprehensive statistics
  const urgentRfqs = rfqs.filter(r => {
    const diff = new Date(r.deadline).getTime() - new Date().getTime();
    return diff < 48 * 60 * 60 * 1000 && diff > 0; // Next 48 hours
  });

  const recentRfqs = rfqs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentOrders = orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const workflowMetrics = calculateWorkflowMetrics();

  // Calculate revenue insights (orders with 'paid' payment status)
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const pendingRevenue = orders
    .filter(o => o.paymentStatus === 'pending' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  // Generate timeline events from real data (RFQs, Quotations, Orders)
  const generateTimelineEvents = () => {
    const events: Array<{
      id: string;
      type: 'rfq' | 'quotation' | 'order';
      title: string;
      date: Date;
      description?: string;
      eventType?: string;
      status?: string;
      amount?: number;
    }> = [];
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeWeeksLater = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    // Import category labels
    const getCategoryLabel = (categoryId: string): string => {
      const categoryMap: { [key: string]: { tr: string; en: string } } = {
        'chandler': { tr: 'Kaptanlık Malzemeleri', en: 'Chandler' },
        'spares': { tr: 'Yedek Parçalar', en: 'Spares' },
        'fire-safety': { tr: 'İtfaiye & Güvenlik', en: 'Fire & Safety' },
        'electrical': { tr: 'Elektrik & Otomasyon', en: 'Electrical & Automation' },
        'paints': { tr: 'Boyalar', en: 'Paints' },
        'lubricants-oil': { tr: 'Yağlayıcılar/Yağ', en: 'Lubricants/Oil' },
        'chemicals': { tr: 'Kimyasallar', en: 'Chemicals' },
        'ropes-anchors': { tr: 'Halatlar & Zincirler', en: 'Ropes & Anchors' },
        'nautical-charts': { tr: 'Deniz Haritaları & Yayınlar', en: 'Nautical Charts' },
        'medical': { tr: 'Tıbbi Malzeme', en: 'Medical' },
        'it-stationery': { tr: 'BT / Kırtasiye', en: 'IT / Stationery' },
        'lsa': { tr: 'Hayat Kurtarma Cihazları (LSA)', en: 'Life Saving Appliances' },
        'maintenance': { tr: 'Bakım, Onarım & Elden Geçirme', en: 'Maintenance & Repair' },
        'hydraulic-cranes': { tr: 'Hidrolik / Vinçler', en: 'Hydraulic / Cranes' },
        'radio-navigation': { tr: 'Radyo & Navigasyon', en: 'Radio & Navigation' },
        'underwater-diving': { tr: 'Su Altı & Dalış', en: 'Underwater & Diving' },
        'surveys-analyses': { tr: 'Analizleri & Surveyler', en: 'Analyses & Surveys' },
        'utm': { tr: 'Ultrasonik Kalınlık Ölçümü', en: 'Ultrasonic Measurement' },
        'salvage': { tr: 'Kurtarma Hizmetleri', en: 'Salvage' },
        'consultant': { tr: 'Danışmanlık Hizmetleri', en: 'Consultant Services' },
      };
      const catData = categoryMap[categoryId];
      return catData ? (locale === 'tr' ? catData.tr : catData.en) : categoryId;
    };

    // Add RFQ created events
    rfqs.forEach((rfq) => {
      const vesselName = (rfq as any).vessel?.name || 'Gemi';
      const categoryLabel = getCategoryLabel((rfq as any).mainCategory || (rfq as any).category || '');
      const titleWithCategory = `${vesselName} - ${categoryLabel}`;
      
      const createdDate = new Date(rfq.createdAt);
      if (createdDate >= oneWeekAgo && createdDate <= threeWeeksLater) {
        const rfqCreatedLabel = getEventLabel('rfq', 'created', locale);
        events.push({
          id: `rfq-created-${rfq.id}`,
          type: 'rfq' as const,
          title: titleWithCategory,
          date: createdDate,
          eventType: rfqCreatedLabel,
          description: categoryLabel,
          status: 'created',
          rfqId: rfq.id,
        });
      }

      // Add RFQ cancelled event if status is closed/cancelled
      if (rfq.status === 'closed' || rfq.status === 'cancelled') {
        const updatedDate = new Date(rfq.updatedAt || rfq.createdAt);
        if (updatedDate >= oneWeekAgo && updatedDate <= threeWeeksLater) {
          const rfqCancelledLabel = getEventLabel('rfq', 'cancelled', locale);
          events.push({
            id: `rfq-cancelled-${rfq.id}`,
            type: 'rfq' as const,
            title: titleWithCategory,
            date: updatedDate,
            eventType: rfqCancelledLabel,
            description: categoryLabel,
            status: 'cancelled',
            rfqId: rfq.id,
          });
        }
      }
    });

    // Add Quotation events - only concrete events
    quotations.forEach((quot) => {
      const vesselName = (quot as any).vesselName || 'Gemi';
      const categoryLabel = getCategoryLabel((quot as any).rfqCategory || '');
      const titleWithCategory = `${vesselName} - ${categoryLabel}`;
      
      // Teklif alındı - always show when quotation is created (status pending)
      // Note: For supplier, this is when they sent the quotation
      if (quot.status === 'pending') {
        const quotDate = new Date(quot.createdAt);
        if (quotDate >= oneWeekAgo && quotDate <= threeWeeksLater) {
          // For supplier, this means "Teklif Verildi" but we'll show as "received" in timeline
          const quotationReceivedLabel = getEventLabel('quotation', 'received', locale);
          
          events.push({
            id: `quot-received-${quot.id}`,
            type: 'quotation' as const,
            title: titleWithCategory,
            date: quotDate,
            eventType: quotationReceivedLabel,
            description: categoryLabel,
            status: 'received',
            quotationId: quot.id,
            quotationRfqId: quot.rfqId,
          });
        }
      }

      // Teklif onaylandı
      if (quot.status === 'accepted') {
        const acceptedDate = new Date((quot as any).acceptedAt || quot.updatedAt || quot.createdAt);
        if (acceptedDate >= oneWeekAgo && acceptedDate <= threeWeeksLater) {
          const quotationAcceptedLabel = getEventLabel('quotation', 'accepted', locale);
          
          events.push({
            id: `quot-accepted-${quot.id}`,
            type: 'quotation' as const,
            title: titleWithCategory,
            date: acceptedDate,
            eventType: quotationAcceptedLabel,
            description: categoryLabel,
            status: 'accepted',
            quotationId: quot.id,
            quotationRfqId: quot.rfqId,
            quotationOrderId: (quot as any).orderId,
          });
        }
      }

      // Teklif reddedildi
      if (quot.status === 'rejected') {
        const rejectedDate = new Date(quot.updatedAt || quot.createdAt);
        if (rejectedDate >= oneWeekAgo && rejectedDate <= threeWeeksLater) {
          const quotationRejectedLabel = getEventLabel('quotation', 'rejected', locale);
          
          events.push({
            id: `quot-rejected-${quot.id}`,
            type: 'quotation' as const,
            title: titleWithCategory,
            date: rejectedDate,
            eventType: quotationRejectedLabel,
            description: categoryLabel,
            status: 'rejected',
            quotationId: quot.id,
            quotationRfqId: quot.rfqId,
          });
        }
      }
    });

    // Add Orders with their creation, timeline events, and expected delivery dates
    orders.forEach((order) => {
      const shipName = (order as any).shipName || 'Gemi';
      const categoryLabel = getCategoryLabel((order as any).category || '');
      const titleWithCategory = `${shipName} - ${categoryLabel}`;

      // Add timeline events - only concrete events, filter process statuses
      if (order.timeline && order.timeline.length > 0) {
        order.timeline.forEach((timelineEvent, index) => {
          const eventDate = timelineEvent.timestamp?.toDate ? timelineEvent.timestamp.toDate() : new Date(timelineEvent.timestamp);
          
          if (eventDate >= oneWeekAgo && eventDate <= threeWeeksLater) {
            const eventStatus = timelineEvent.status;
            
            // Skip process statuses - only show concrete events
            const processStatuses = [
              'pending',
              'pending_payment',
              'pending_supplier_approval',
              'pending_shipowner_confirmation',
              'payment_awaiting_confirmation',
              'in_progress',
              'created'
            ];
            
            if (processStatuses.includes(eventStatus)) {
              return; // Skip this event
            }

            // Map timeline events to our event system
            let mappedStatus = eventStatus;
            if (eventStatus === 'confirmed') {
              mappedStatus = 'confirmed'; // Sipariş Onaylandı
            } else if (eventStatus === 'ready') {
              mappedStatus = 'ready'; // Hazır
            } else if (eventStatus === 'shipped') {
              mappedStatus = 'shipped'; // Kargolandı
            } else if (eventStatus === 'delivered') {
              mappedStatus = 'delivered'; // Teslim Alındı
            } else {
              // Only process if it's a concrete event we want to show
              return;
            }

            const eventLabel = getEventLabel('order', mappedStatus as any, locale);

            events.push({
              id: `order-timeline-${order.id}-${index}`,
              type: 'order' as const,
              title: titleWithCategory,
              date: eventDate,
              eventType: eventLabel,
              description: categoryLabel,
              status: mappedStatus,
              orderId: order.id,
            });
          }
        });
      }

      // Add estimated ready date if order is active (in_progress, confirmed, ready, shipped)
      if ((order as any).estimatedReadyDate && ['in_progress', 'confirmed', 'ready', 'shipped'].includes(order.status)) {
        const readyDate = (order as any).estimatedReadyDate?.toDate 
          ? (order as any).estimatedReadyDate.toDate() 
          : new Date((order as any).estimatedReadyDate);
        if (readyDate >= oneWeekAgo && readyDate <= threeWeeksLater) {
          const readyLabel = getEventLabel('order', 'estimated_ready', locale);
          events.push({
            id: `estimated-ready-${order.id}`,
            type: 'order' as const,
            title: titleWithCategory,
            date: readyDate,
            eventType: readyLabel,
            description: categoryLabel,
            status: 'estimated_ready',
            orderId: order.id,
          });
        }
      }

      // Add expected delivery date if order is active (in_progress, confirmed, ready, shipped)
      if ((order as any).expectedDeliveryDate && ['in_progress', 'confirmed', 'ready', 'shipped'].includes(order.status)) {
        const deliveryDate = (order as any).expectedDeliveryDate?.toDate 
          ? (order as any).expectedDeliveryDate.toDate() 
          : new Date((order as any).expectedDeliveryDate);
        if (deliveryDate >= oneWeekAgo && deliveryDate <= threeWeeksLater) {
          const deliveryLabel = getEventLabel('order', 'expected_delivery', locale);
          events.push({
            id: `delivery-expected-${order.id}`,
            type: 'order' as const,
            title: titleWithCategory,
            date: deliveryDate,
            eventType: deliveryLabel,
            description: categoryLabel,
            status: 'expected_delivery',
            orderId: order.id,
          });
        }
      }
    });

    return events;
  };

  const timelineEvents = generateTimelineEvents();

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">

          {/* Key Metrics - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Urgent RFQs - Needs Immediate Attention */}
            <Card className={urgentRfqs.length > 0 ? "bg-gradient-to-br from-orange-900 to-red-950 border-0 text-white" : "bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white"}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'ACİL RFQLAR' : 'URGENT RFQs'}
                    </p>
                    <div className="text-3xl font-bold text-white">{loading ? '...' : urgentRfqs.length}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? '48 saat içinde' : 'Within 48 hours'}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>

            {/* Available Opportunities */}
            <Card className="bg-gradient-to-br from-blue-900 to-cyan-950 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'AÇIK FIRSATLAR' : 'OPEN OPPORTUNITIES'}
                    </p>
                    <div className="text-3xl font-bold text-white">{loading ? '...' : workflowMetrics.rfqOpen}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'Teklif verilebilir' : 'Ready to quote'}
                    </p>
                  </div>
                  <FileText className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>

            {/* Pending Responses */}
            <Card className="bg-gradient-to-br from-purple-900 to-indigo-950 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'CEVAP BEKLİYOR' : 'AWAITING RESPONSE'}
                    </p>
                    <div className="text-3xl font-bold text-white">{loading ? '...' : workflowMetrics.quotationPending}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'Gönderilen teklifler' : 'Pending quotations'}
                    </p>
                  </div>
                  <MessageSquare className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>

            {/* Active Orders */}
            <Card className="bg-gradient-to-br from-teal-900 to-cyan-950 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'AKTİF SİPARİŞLER' : 'ACTIVE ORDERS'}
                    </p>
                    <div className="text-3xl font-bold text-white">{loading ? '...' : workflowMetrics.ordersActive.total}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'İşlem görüyor' : 'In progress'}
                    </p>
                  </div>
                  <Package className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Schedule */}
          <TimelineSchedule 
            events={timelineEvents}
            locale={locale}
            userType="supplier"
          />

          {/* Revenue & Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Overview */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{locale === 'tr' ? 'Gelir Özeti' : 'Revenue Overview'}</span>
                  <DollarSign className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm opacity-80 mb-1">{locale === 'tr' ? 'Tahsil Edilen' : 'Collected'}</p>
                  <p className="text-2xl font-bold">
                    ${loading ? '...' : totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm opacity-80 mb-1">{locale === 'tr' ? 'Beklenen' : 'Pending'}</p>
                  <p className="text-xl font-semibold">
                    ${loading ? '...' : pendingRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="text-xs opacity-75 pt-2">
                  {locale === 'tr' 
                    ? `${workflowMetrics.paymentCompleted} ödeme tamamlandı`
                    : `${workflowMetrics.paymentCompleted} payments completed`}
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="bg-gradient-to-br from-maritime-700 to-ocean-700 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{locale === 'tr' ? 'Başarı Oranı' : 'Win Rate'}</span>
                  <TrendingUp className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">
                      {quotations.length > 0 
                        ? Math.round((workflowMetrics.quotationAccepted / quotations.length) * 100)
                        : 0}%
                    </span>
                    <span className="text-sm opacity-80">{locale === 'tr' ? 'kazanma' : 'win rate'}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all"
                      style={{ 
                        width: quotations.length > 0 
                          ? `${Math.round((workflowMetrics.quotationAccepted / quotations.length) * 100)}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">{locale === 'tr' ? 'Kabul' : 'Accepted'}</span>
                    <span className="font-semibold">{workflowMetrics.quotationAccepted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">{locale === 'tr' ? 'Toplam' : 'Total'}</span>
                    <span className="font-semibold">{quotations.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Pipeline */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-base text-white">{locale === 'tr' ? 'İş Akışı Pipeline' : 'Business Pipeline'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white/10 backdrop-blur-sm rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-maritime-400 rounded-full"></div>
                    <span className="text-sm text-gray-200">{locale === 'tr' ? 'RFQ Fırsatları' : 'RFQ Opportunities'}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{workflowMetrics.rfqOpen}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/10 backdrop-blur-sm rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm text-gray-200">{locale === 'tr' ? 'Bekleyen Teklifler' : 'Pending Quotes'}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{workflowMetrics.quotationPending}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/10 backdrop-blur-sm rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-ocean-400 rounded-full"></div>
                    <span className="text-sm text-gray-200">{locale === 'tr' ? 'Kabul Edilen' : 'Accepted'}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{workflowMetrics.quotationAccepted}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/10 backdrop-blur-sm rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-sm text-gray-200">{locale === 'tr' ? 'Aktif Siparişler' : 'Active Orders'}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{workflowMetrics.ordersActive.total}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/10 backdrop-blur-sm rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-200">{locale === 'tr' ? 'Ödeme Bekleyen' : 'Pending Payment'}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{workflowMetrics.paymentPending}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent RFQs Requiring Attention */}
            {urgentRfqs.length > 0 && (
              <Card className="bg-gradient-to-br from-orange-900 to-red-950 border-0 text-white">
            <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {locale === 'tr' ? 'Acil RFQ\'lar' : 'Urgent RFQs'}
                      </CardTitle>
              <CardDescription className="text-gray-300">
                        {locale === 'tr' ? '48 saat içinde sona erecek' : 'Expiring within 48 hours'}
              </CardDescription>
                    </div>
                <Link href={`/${locale}/supplier/rfqs`}>
                      <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                        {locale === 'tr' ? 'Tümü' : 'View All'}
                  </Button>
                </Link>
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="space-y-2">
                    {urgentRfqs.slice(0, 3).map((rfq) => {
                      const hoursLeft = Math.floor((new Date(rfq.deadline).getTime() - Date.now()) / (1000 * 60 * 60));
                      return (
                        <div key={rfq.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{rfq.title}</p>
                            <p className="text-xs text-gray-300">{rfq.shipownerCompany}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-orange-300 whitespace-nowrap">
                              {hoursLeft}h
                            </span>
                            <Link href={`/${locale}/supplier/rfqs/${rfq.id}/quote`}>
                              <Button size="sm" className="text-xs h-7 bg-white text-orange-900 hover:bg-gray-100">
                                {locale === 'tr' ? 'Teklif Ver' : 'Quote'}
                  </Button>
                </Link>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </CardContent>
          </Card>
            )}

          {/* Recent RFQs */}
          <Card className="bg-gradient-to-br from-maritime-800 to-maritime-900 border-0 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-white">{locale === 'tr' ? 'Yeni RFQ Fırsatları' : 'New RFQ Opportunities'}</CardTitle>
                  <CardDescription className="text-gray-300">
                      {locale === 'tr' ? 'Son eklenen talepler' : 'Recently added requests'}
                  </CardDescription>
                </div>
                <Link href={`/${locale}/supplier/rfqs`}>
                    <Button size="sm" className="bg-white text-maritime-900 hover:bg-gray-200">
                      {locale === 'tr' ? 'Tümü' : 'View All'}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-300">
                  {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                </div>
              ) : recentRfqs.length === 0 ? (
                <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">
                      {locale === 'tr' ? 'Yeni RFQ bulunmuyor' : 'No new RFQs'}
                  </p>
                </div>
              ) : (
                  <div className="space-y-2">
                  {recentRfqs.map((rfq) => (
                      <div key={rfq.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{rfq.title}</p>
                          <p className="text-xs text-gray-300">{rfq.shipownerCompany}</p>
                      </div>
                        <Link href={`/${locale}/supplier/rfqs/${rfq.id}/quote`}>
                          <Button size="sm" className="text-xs h-7 bg-white text-maritime-900 hover:bg-gray-200">
                            {locale === 'tr' ? 'Görüntüle' : 'View'}
                          </Button>
                        </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

            {/* Active Orders Requiring Action */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-white">{locale === 'tr' ? 'Bekleyen Siparişler' : 'Orders Requiring Action'}</CardTitle>
                  <CardDescription className="text-gray-300">
                      {locale === 'tr' ? 'İşlem gerektiren aktif siparişler' : 'Active orders needing attention'}
                  </CardDescription>
                </div>
                  <Link href={`/${locale}/supplier/orders`}>
                    <Button size="sm" className="bg-white text-slate-900 hover:bg-gray-200">
                      {locale === 'tr' ? 'Tümü' : 'View All'}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-300">
                  {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                </div>
                ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">
                      {locale === 'tr' ? 'Aktif sipariş yok' : 'No active orders'}
                  </p>
                </div>
              ) : (
                  <div className="space-y-2">
                    {recentOrders.map((order) => {
                      const statusColor = 
                        order.status === 'pending' ? 'yellow' :
                        order.status === 'confirmed' ? 'blue' :
                        order.status === 'in_progress' ? 'purple' : 'teal';
                      const statusLabel =
                        order.status === 'pending' ? (locale === 'tr' ? 'Bekliyor' : 'Pending') :
                        order.status === 'confirmed' ? (locale === 'tr' ? 'Onaylı' : 'Confirmed') :
                        order.status === 'in_progress' ? (locale === 'tr' ? 'Hazırlanıyor' : 'In Progress') :
                        (locale === 'tr' ? 'Kargoda' : 'Shipped');
                      
                      return (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{order.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full bg-${statusColor}-900 text-${statusColor}-300 font-medium`}>
                                {statusLabel}
                              </span>
                              <span className="text-xs text-gray-300">
                                ${order.amount.toLocaleString()}
                              </span>
                        </div>
                      </div>
                          <Link href={`/${locale}/supplier/orders/${order.id}`}>
                            <Button size="sm" className="bg-white text-slate-900 hover:bg-gray-200 text-xs h-7">
                              {locale === 'tr' ? 'Detay' : 'Details'}
                          </Button>
                        </Link>
                      </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Breakdown */}
            <Card className="bg-gradient-to-br from-ocean-800 to-ocean-900 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white">{locale === 'tr' ? 'Sipariş Durumları' : 'Order Status Breakdown'}</CardTitle>
                <CardDescription className="text-gray-300">
                  {locale === 'tr' ? 'Aktif siparişlerin detaylı dağılımı' : 'Detailed distribution of active orders'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {workflowMetrics.ordersActive.pending > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                        <span className="text-sm text-gray-200">{locale === 'tr' ? 'Onay Bekleyen' : 'Awaiting Confirmation'}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{workflowMetrics.ordersActive.pending}</span>
                    </div>
                  )}
                  {workflowMetrics.ordersActive.confirmed > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded"></div>
                        <span className="text-sm text-gray-200">{locale === 'tr' ? 'Onaylandı' : 'Confirmed'}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{workflowMetrics.ordersActive.confirmed}</span>
                    </div>
                  )}
                  {workflowMetrics.ordersActive.inProgress > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-400 rounded"></div>
                        <span className="text-sm text-gray-200">{locale === 'tr' ? 'Hazırlanıyor' : 'In Preparation'}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{workflowMetrics.ordersActive.inProgress}</span>
                    </div>
                  )}
                  {workflowMetrics.ordersActive.shipped > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-400 rounded"></div>
                        <span className="text-sm text-gray-200">{locale === 'tr' ? 'Kargoda' : 'In Transit'}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{workflowMetrics.ordersActive.shipped}</span>
                    </div>
                  )}
                  {workflowMetrics.ordersCompleted > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-white/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-teal-400 rounded"></div>
                        <span className="text-sm text-gray-200">{locale === 'tr' ? 'Tamamlandı' : 'Completed'}</span>
                      </div>
                      <span className="text-sm font-bold text-teal-300">{workflowMetrics.ordersCompleted}</span>
                    </div>
                  )}
                    </div>
                
                {workflowMetrics.ordersActive.total === 0 && workflowMetrics.ordersCompleted === 0 && (
                  <div className="text-center py-6">
                    <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">{locale === 'tr' ? 'Henüz sipariş yok' : 'No orders yet'}</p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

