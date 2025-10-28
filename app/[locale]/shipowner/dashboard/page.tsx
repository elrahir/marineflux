'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Package, DollarSign, Star, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { TimelineSchedule } from '@/components/supplier/TimelineSchedule';

interface RFQ {
  id: string;
  title: string;
  description: string;
  status: string;
  quotationCount: number;
  deadline: string;
  vessel?: {
    name: string;
    type: string;
  };
  createdAt: string;
}

interface Quotation {
  id: string;
  rfqId: string;
  supplierCompany: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface Order {
  id: string;
  title: string;
  status: string;
  amount: number;
  currency: string;
  supplierCompany: string;
  createdAt: string;
}

interface TimelineEvent {
  status: string;
  timestamp: any;
  description?: string;
  note?: string;
  updatedBy: string;
}

export default function ShipownerDashboard({ params }: { params: Promise<{ locale: string }> }) {
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
    try {
      setLoading(true);
      
      // Fetch RFQs
      const rfqResponse = await fetch(`/api/rfq/list?uid=${user?.uid}&role=shipowner&limit=100`);
      const rfqData = await rfqResponse.json();
      if (rfqData.success) {
        setRfqs(rfqData.rfqs);
      }

      // Fetch Quotations
      const quotResponse = await fetch(`/api/quotation/list?shipownerUid=${user?.uid}`);
      const quotData = await quotResponse.json();
      if (quotData.success) {
        setQuotations(quotData.quotations);
      }

      // Fetch Orders
      const orderResponse = await fetch(`/api/order/list?shipownerUid=${user?.uid}`);
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

  // Calculate metrics
  const calculateMetrics = () => {
    const openRfqs = rfqs.filter(r => r.status === 'open').length;
    const pendingQuotations = quotations.filter(q => q.status === 'pending').length;
    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'in_progress', 'shipped'].includes(o.status)).length;
    const completedOrders = orders.filter(o => ['completed', 'delivered'].includes(o.status)).length;
    const totalQuotations = quotations.length;
    const acceptedQuotations = quotations.filter(q => q.status === 'accepted').length;

    return {
      openRfqs,
      pendingQuotations,
      activeOrders,
      completedOrders,
      totalQuotations,
      acceptedQuotations,
    };
  };

  const metrics = calculateMetrics();

  // Calculate urgent RFQs
  const urgentRfqs = rfqs.filter(r => {
    const diff = new Date(r.deadline).getTime() - new Date().getTime();
    return diff < 48 * 60 * 60 * 1000 && diff > 0;
  });

  const recentRfqs = rfqs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentOrders = orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Calculate revenue
  const totalSpent = orders
    .filter(o => o.status === 'delivered' || o.status === 'completed')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const pendingOrders = orders
    .filter(o => ['pending', 'confirmed', 'in_progress', 'shipped'].includes(o.status))
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  // Timeline events
  const generateTimelineEvents = () => {
    const events: any[] = [];
    const now = new Date();
    const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
    const fortyFiveDaysLater = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

    // Category label helper
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

    // Add RFQ events with deadline
    rfqs.forEach((rfq) => {
      const deadlineDate = new Date(rfq.deadline);
      if (deadlineDate >= fortyFiveDaysAgo && deadlineDate <= fortyFiveDaysLater) {
        const vesselName = rfq.vessel?.name || 'RFQ';
        events.push({
          id: `rfq-${rfq.id}`,
          type: 'rfq',
          title: vesselName,
          date: deadlineDate,
          eventType: rfq.title.substring(0, 30),
          description: locale === 'tr' ? 'Teklif Alma Deadline' : 'Quotation Deadline',
          status: 'active',
        });
      }
    });

    // Add Quotation events
    quotations.forEach((quot) => {
      const quotDate = new Date(quot.createdAt);
      if (quotDate >= fortyFiveDaysAgo && quotDate <= fortyFiveDaysLater) {
        const supplierName = (quot as any).supplierCompany || 'Tedarikçi';
        const categoryLabel = getCategoryLabel((quot as any).rfqCategory || '');
        
        // Translate quotation status
        const statusTranslations: { [key: string]: { tr: string; en: string } } = {
          'pending': { tr: 'Bekleme', en: 'Pending' },
          'accepted': { tr: 'Kabul Edildi', en: 'Accepted' },
          'rejected': { tr: 'Reddedildi', en: 'Rejected' },
        };
        const statusText = statusTranslations[quot.status];
        const statusDisplay = statusText ? (locale === 'tr' ? statusText.tr : statusText.en) : quot.status;
        
        events.push({
          id: `quot-${quot.id}`,
          type: 'quotation',
          title: supplierName,
          date: quotDate,
          eventType: statusDisplay,
          description: categoryLabel,
          status: quot.status,
          amount: (quot as any).price,
        });
      }

      // Add quotation estimated ready date if available
      if ((quot as any).estimatedReadyDate) {
        const readyDate = (quot as any).estimatedReadyDate?.toDate 
          ? (quot as any).estimatedReadyDate.toDate() 
          : new Date((quot as any).estimatedReadyDate);
        if (readyDate >= fortyFiveDaysAgo && readyDate <= fortyFiveDaysLater) {
          const categoryLabel = getCategoryLabel((quot as any).rfqCategory || '');
          const supplierName = (quot as any).supplierCompany || 'Tedarikçi';
          events.push({
            id: `estimated-ready-${quot.id}`,
            type: 'quotation',
            title: supplierName,
            date: readyDate,
            eventType: locale === 'tr' ? 'Tahmini Hazır' : 'Estimated Ready',
            description: categoryLabel,
            status: 'estimated_ready',
            amount: (quot as any).price,
          });
        }
      }
    });

    // Add Order events with all details
    orders.forEach((order) => {
      const shipName = (order as any).shipName || 'Gemi';
      const categoryLabel = getCategoryLabel((order as any).category || '');

      // Add order creation event
      const orderDate = new Date(order.createdAt);
      if (orderDate >= fortyFiveDaysAgo && orderDate <= fortyFiveDaysLater) {
        const supplierName = (order as any).supplierCompany || 'Tedarikçi';
        events.push({
          id: `order-created-${order.id}`,
          type: 'order',
          title: shipName,
          date: orderDate,
          eventType: locale === 'tr' ? 'Sipariş Oluşturuldu' : 'Order Created',
          description: categoryLabel,
          status: 'created',
          amount: order.amount,
        });
      }

      // Add timeline events (status changes)
      if ((order as any).timeline && (order as any).timeline.length > 0) {
        (order as any).timeline.forEach((timelineEvent: any, index: number) => {
          const eventDate = timelineEvent.timestamp?.toDate 
            ? timelineEvent.timestamp.toDate() 
            : new Date(timelineEvent.timestamp);
          
          if (eventDate >= fortyFiveDaysAgo && eventDate <= fortyFiveDaysLater) {
            const statusDescriptions: { [key: string]: { tr: string; en: string } } = {
              'pending': { tr: 'Bekleme', en: 'Pending' },
              'confirmed': { tr: 'Onaylandı', en: 'Confirmed' },
              'in_progress': { tr: 'Hazırlanıyor', en: 'In Progress' },
              'shipped': { tr: 'Kargoya Verildi', en: 'Shipped' },
              'delivered': { tr: 'Teslim Edildi', en: 'Delivered' },
              'completed': { tr: 'Tamamlandı', en: 'Completed' },
              'cancelled': { tr: 'İptal Edildi', en: 'Cancelled' },
              'pending_supplier_approval': { tr: 'Tedarikçi Onayı Bekleniyor', en: 'Awaiting Supplier Approval' },
              'pending_payment': { tr: 'Ödeme Bekleniyor', en: 'Awaiting Payment' },
              'payment_awaiting_confirmation': { tr: 'Ödeme Onayı Bekleniyor', en: 'Payment Confirmation Pending' },
              'paid': { tr: 'Ödeme Tamamlandı', en: 'Payment Completed' },
              'pending_shipowner_confirmation': { tr: 'Gemi Sahibi Onayı Bekleniyor', en: 'Awaiting Shipowner Confirmation' },
            };

            const statusDesc = statusDescriptions[timelineEvent.status];
            const description = timelineEvent.description || 
              (statusDesc ? (locale === 'tr' ? statusDesc.tr : statusDesc.en) : timelineEvent.status);

            events.push({
              id: `order-timeline-${order.id}-${index}`,
              type: 'order',
              title: shipName,
              date: eventDate,
              eventType: description,
              description: categoryLabel,
              status: timelineEvent.status,
              amount: order.amount,
            });
          }
        });
      }

      // Add expected delivery date if available
      if ((order as any).expectedDeliveryDate) {
        const deliveryDate = (order as any).expectedDeliveryDate?.toDate 
          ? (order as any).expectedDeliveryDate.toDate() 
          : new Date((order as any).expectedDeliveryDate);
        if (deliveryDate >= fortyFiveDaysAgo && deliveryDate <= fortyFiveDaysLater && order.status !== 'completed') {
          events.push({
            id: `delivery-expected-${order.id}`,
            type: 'order',
            title: shipName,
            date: deliveryDate,
            eventType: locale === 'tr' ? 'Beklenen Teslimat' : 'Expected Delivery',
            description: categoryLabel,
            status: 'expected_delivery',
            amount: order.amount,
          });
        }
      }
    });

    return events;
  };

  const timelineEvents = generateTimelineEvents();

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">

          {/* Key Metrics - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Open RFQs */}
            <Card className={urgentRfqs.length > 0 ? "bg-gradient-to-br from-orange-900 to-red-950 border-0 text-white" : "bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white"}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'AÇIK RFQ' : 'OPEN RFQs'}
                    </p>
                    <div className="text-3xl font-bold text-white">{loading ? '...' : metrics.openRfqs}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'Teklifler Alınıyor' : 'Awaiting Quotes'}
                    </p>
                  </div>
                  <FileText className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>

            {/* Pending Quotations */}
            <Card className="bg-gradient-to-br from-blue-900 to-cyan-950 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
          <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'BEKLENEN TEKLİFLER' : 'PENDING QUOTES'}
                    </p>
                    <div className="text-3xl font-bold text-white">{loading ? '...' : metrics.pendingQuotations}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'Cevap Bekliyor' : 'Awaiting Response'}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-white opacity-20" />
          </div>
              </CardContent>
            </Card>

            {/* Active Orders */}
            <Card className="bg-gradient-to-br from-purple-900 to-indigo-950 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'AKTİF SİPARİŞLER' : 'ACTIVE ORDERS'}
                    </p>
                    <div className="text-3xl font-bold text-white">{loading ? '...' : metrics.activeOrders}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'İşlem Görüyor' : 'In Progress'}
                    </p>
                  </div>
                  <Package className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>

            {/* Completed Orders */}
            <Card className="bg-gradient-to-br from-teal-900 to-cyan-950 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'TAMAMLANAN' : 'COMPLETED'}
                    </p>
                    <div className="text-3xl font-bold text-white">{loading ? '...' : metrics.completedOrders}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'Teslim Edilen' : 'Delivered'}
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Schedule */}
          <TimelineSchedule 
            events={timelineEvents}
            locale={locale}
          />

          {/* Revenue & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Spent */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{locale === 'tr' ? 'Harcama Özeti' : 'Spending Overview'}</span>
                  <DollarSign className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm opacity-80 mb-1">{locale === 'tr' ? 'Tamamlanan' : 'Completed'}</p>
                  <p className="text-2xl font-bold">
                    ${loading ? '...' : totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm opacity-80 mb-1">{locale === 'tr' ? 'Beklenen' : 'Pending'}</p>
                  <p className="text-xl font-semibold">
                    ${loading ? '...' : pendingOrders.toLocaleString()}
                  </p>
                </div>
                <div className="text-xs opacity-75 pt-2">
                  {locale === 'tr' 
                    ? `${metrics.completedOrders} sipariş tamamlandı`
                    : `${metrics.completedOrders} orders completed`}
                </div>
              </CardContent>
            </Card>

            {/* Quote Acceptance Rate */}
            <Card className="bg-gradient-to-br from-maritime-700 to-ocean-700 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{locale === 'tr' ? 'Kabul Oranı' : 'Acceptance Rate'}</span>
                  <TrendingUp className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">
                      {metrics.totalQuotations > 0 
                        ? Math.round((metrics.acceptedQuotations / metrics.totalQuotations) * 100)
                        : 0}%
                    </span>
                    <span className="text-sm opacity-80">{locale === 'tr' ? 'kabul' : 'acceptance'}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all"
                      style={{ 
                        width: metrics.totalQuotations > 0 
                          ? `${Math.round((metrics.acceptedQuotations / metrics.totalQuotations) * 100)}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">{locale === 'tr' ? 'Kabul' : 'Accepted'}</span>
                    <span className="font-semibold">{metrics.acceptedQuotations}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">{locale === 'tr' ? 'Toplam' : 'Total'}</span>
                    <span className="font-semibold">{metrics.totalQuotations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Pipeline */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-base text-white">{locale === 'tr' ? 'Sipariş Pipeline' : 'Order Pipeline'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-48 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Pie Chart - Manual SVG Implementation */}
                    {(() => {
                      const total = metrics.pendingQuotations + metrics.acceptedQuotations + metrics.activeOrders + metrics.completedOrders;
                      if (total === 0) return <text x="100" y="100" textAnchor="middle" fill="#888" className="text-sm">{locale === 'tr' ? 'Veri yok' : 'No data'}</text>;
                      
                      const segments = [
                        { value: metrics.pendingQuotations, color: '#60A5FA', label: locale === 'tr' ? 'Beklenen' : 'Pending' },
                        { value: metrics.acceptedQuotations, color: '#FBBF24', label: locale === 'tr' ? 'Kabul' : 'Accepted' },
                        { value: metrics.activeOrders, color: '#A78BFA', label: locale === 'tr' ? 'Aktif' : 'Active' },
                        { value: metrics.completedOrders, color: '#2DD4BF', label: locale === 'tr' ? 'Tamamlandı' : 'Completed' },
                      ];

                      let currentAngle = -90;
                      const paths: React.ReactNode[] = [];

                      segments.forEach((segment) => {
                        const sliceAngle = (segment.value / total) * 360;
                        const endAngle = currentAngle + sliceAngle;

                        const startRad = (currentAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;

                        const x1 = 100 + 80 * Math.cos(startRad);
                        const y1 = 100 + 80 * Math.sin(startRad);
                        const x2 = 100 + 80 * Math.cos(endRad);
                        const y2 = 100 + 80 * Math.sin(endRad);

                        const largeArc = sliceAngle > 180 ? 1 : 0;

                        const pathData = [
                          `M 100 100`,
                          `L ${x1} ${y1}`,
                          `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                          'Z'
                        ].join(' ');

                        paths.push(
                          <path key={segment.label} d={pathData} fill={segment.color} stroke="none" opacity="0.8" />
                        );

                        currentAngle = endAngle;
                      });

                      return paths;
                    })()}
                  </svg>
                </div>

                {/* Legend */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-gray-200">{locale === 'tr' ? 'Beklenen' : 'Pending'}</span>
                    </div>
                    <span className="text-xs font-bold">{metrics.pendingQuotations}</span>
                  </div>
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-xs text-gray-200">{locale === 'tr' ? 'Kabul' : 'Accepted'}</span>
                    </div>
                    <span className="text-xs font-bold">{metrics.acceptedQuotations}</span>
                  </div>
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-xs text-gray-200">{locale === 'tr' ? 'Aktif' : 'Active'}</span>
                    </div>
                    <span className="text-xs font-bold">{metrics.activeOrders}</span>
                  </div>
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                      <span className="text-xs text-gray-200">{locale === 'tr' ? 'Tamamlandı' : 'Completed'}</span>
                    </div>
                    <span className="text-xs font-bold">{metrics.completedOrders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent RFQs */}
            {urgentRfqs.length > 0 && (
              <Card className="bg-gradient-to-br from-orange-900 to-red-950 border-0 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {locale === 'tr' ? 'Acil RFQlar' : 'Urgent RFQs'}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {locale === 'tr' ? '48 saat içinde sona erecek' : 'Expiring within 48 hours'}
                  </CardDescription>
                </div>
                <Link href={`/${locale}/shipowner/rfq`}>
                      <Button size="sm" className="text-xs h-7 bg-white text-orange-900 hover:bg-gray-100">
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
                            <p className="text-xs text-gray-300">{rfq.vessel?.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-orange-300 whitespace-nowrap">
                              {hoursLeft}h
                            </span>
                            <Link href={`/${locale}/shipowner/rfq/${rfq.id}`}>
                              <Button size="sm" className="text-xs h-7 bg-white text-orange-900 hover:bg-gray-100">
                                {locale === 'tr' ? 'Görüntüle' : 'View'}
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

            {/* Recent Orders */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{locale === 'tr' ? 'Son Siparişler' : 'Recent Orders'}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {locale === 'tr' ? 'Devam eden siparişler' : 'Active orders'}
                    </CardDescription>
                </div>
                  <Link href={`/${locale}/shipowner/orders`}>
                    <Button size="sm" variant="outline" className="text-black border-white/30 hover:bg-white/10">
                      {locale === 'tr' ? 'Tümü' : 'View All'}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {locale === 'tr' ? 'Aktif sipariş yok' : 'No active orders'}
                    </p>
                </div>
              ) : (
                  <div className="space-y-2">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{order.title}</p>
                          <p className="text-xs text-gray-300">{order.supplierCompany}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            ${order.amount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">{order.status}</p>
                        </div>
                      </div>
                  ))}
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

