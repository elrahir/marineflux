'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock, DollarSign, FileX, TrendingDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Alert {
  id: string;
  type: 'delayed_delivery' | 'pending_payment' | 'no_quotation' | 'pending_long';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  link: string;
  count?: number;
}

interface AlertsWidgetProps {
  locale: string;
  userId: string;
}

export function AlertsWidget({ locale, userId }: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAlerts();
    }
  }, [userId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [rfqsRes, quotationsRes, ordersRes] = await Promise.all([
        fetch(`/api/rfq/list?uid=${userId}&role=shipowner&limit=1000`),
        fetch(`/api/quotation/list?shipownerUid=${userId}`),
        fetch(`/api/order/list?shipownerUid=${userId}`)
      ]);

      let rfqs: any[] = [];
      let quotations: any[] = [];
      let orders: any[] = [];

      // Parse RFQs
      if (rfqsRes.ok) {
        try {
          const rfqsData = await rfqsRes.json();
          rfqs = rfqsData.success ? (rfqsData.rfqs || []) : [];
        } catch (e) {
          console.error('Error parsing RFQs:', e);
        }
      }

      // Parse Quotations
      if (quotationsRes.ok) {
        try {
          const quotationsData = await quotationsRes.json();
          quotations = quotationsData.success ? (quotationsData.quotations || []) : [];
        } catch (e) {
          console.error('Error parsing Quotations:', e);
        }
      }

      // Parse Orders
      if (ordersRes.ok) {
        try {
          const ordersData = await ordersRes.json();
          orders = ordersData.success ? (ordersData.orders || []) : [];
        } catch (e) {
          console.error('Error parsing Orders:', e);
        }
      }

      // Calculate alerts
      const calculatedAlerts: Alert[] = [];

      // 1. Geciken teslimatlar
      const now = new Date();
      const delayedDeliveries = orders.filter((order: any) => {
        if (order.status === 'delivered' || order.status === 'completed' || order.status === 'cancelled') {
          return false;
        }
        if (order.expectedDeliveryDate) {
          const deliveryDate = order.expectedDeliveryDate?.toDate 
            ? order.expectedDeliveryDate.toDate() 
            : new Date(order.expectedDeliveryDate);
          return deliveryDate < now;
        }
        return false;
      });

      if (delayedDeliveries.length > 0) {
        calculatedAlerts.push({
          id: 'delayed-delivery',
          type: 'delayed_delivery',
          priority: 'high',
          title: locale === 'tr' ? 'Geciken Teslimatlar' : 'Delayed Deliveries',
          description: locale === 'tr' 
            ? `${delayedDeliveries.length} siparişin teslimat tarihi geçti`
            : `${delayedDeliveries.length} order(s) past delivery date`,
          link: `/${locale}/shipowner/orders?filter=delayed`,
          count: delayedDeliveries.length,
        });
      }

      // 2. Ödeme bekleyen siparişler
      const pendingPayments = orders.filter((order: any) => 
        order.paymentStatus === 'pending' || order.paymentStatus === 'pending_payment'
      );

      if (pendingPayments.length > 0) {
        calculatedAlerts.push({
          id: 'pending-payment',
          type: 'pending_payment',
          priority: 'high',
          title: locale === 'tr' ? 'Ödeme Bekleyen Siparişler' : 'Orders Awaiting Payment',
          description: locale === 'tr'
            ? `${pendingPayments.length} sipariş için ödeme bekleniyor`
            : `${pendingPayments.length} order(s) awaiting payment`,
          link: `/${locale}/shipowner/orders?filter=pending_payment`,
          count: pendingPayments.length,
        });
      }

      // 3. Hiç teklif alınmayan RFQ'lar (deadline yakın)
      const rfqsWithoutQuotations = rfqs.filter((rfq: any) => {
        const hasQuotation = quotations.some((q: any) => q.rfqId === rfq.id);
        if (hasQuotation) return false;
        
        const deadline = new Date(rfq.deadline);
        const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilDeadline > 0 && hoursUntilDeadline < 48; // 48 saat içinde sona erecek
      });

      if (rfqsWithoutQuotations.length > 0) {
        calculatedAlerts.push({
          id: 'no-quotation',
          type: 'no_quotation',
          priority: 'medium',
          title: locale === 'tr' ? 'Teklif Alınmayan RFQlar' : 'RFQs Without Quotations',
          description: locale === 'tr'
            ? `${rfqsWithoutQuotations.length} RFQ için henüz teklif alınmadı`
            : `${rfqsWithoutQuotations.length} RFQ(s) without quotations yet`,
          link: `/${locale}/shipowner/rfq?filter=no_quotation`,
          count: rfqsWithoutQuotations.length,
        });
      }

      // 4. Çok uzun süredir bekleyen teklifler (7 günden fazla)
      const longPendingQuotations = quotations.filter((quotation: any) => {
        if (quotation.status !== 'pending') return false;
        const createdDate = new Date(quotation.createdAt);
        const daysPending = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysPending > 7;
      });

      if (longPendingQuotations.length > 0) {
        calculatedAlerts.push({
          id: 'pending-long',
          type: 'pending_long',
          priority: 'medium',
          title: locale === 'tr' ? 'Uzun Süredir Bekleyen Teklifler' : 'Long-Pending Quotations',
          description: locale === 'tr'
            ? `${longPendingQuotations.length} teklif 7 günden fazla süredir bekliyor`
            : `${longPendingQuotations.length} quotation(s) pending for over 7 days`,
          link: `/${locale}/shipowner/rfq?filter=pending_quotations`,
          count: longPendingQuotations.length,
        });
      }

      setAlerts(calculatedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'delayed_delivery':
        return <Clock className="h-3.5 w-3.5" />;
      case 'pending_payment':
        return <DollarSign className="h-3.5 w-3.5" />;
      case 'no_quotation':
        return <FileX className="h-3.5 w-3.5" />;
      case 'pending_long':
        return <TrendingDown className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  const getPriorityStyles = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'bg-red-100 text-red-600',
          badge: 'bg-red-500',
        };
      case 'medium':
        return {
          bg: 'bg-orange-50 border-orange-200',
          icon: 'bg-orange-100 text-orange-600',
          badge: 'bg-orange-500',
        };
      case 'low':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'bg-yellow-100 text-yellow-600',
          badge: 'bg-yellow-500',
        };
    }
  };

  if (loading || alerts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
      {alerts.map((alert) => {
        const styles = getPriorityStyles(alert.priority);
        return (
          <Link
            key={alert.id}
            href={alert.link}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border ${styles.bg} hover:opacity-90 transition-opacity min-w-fit flex-shrink-0 group`}
          >
            <div className={`p-1 rounded ${styles.icon}`}>
              {getAlertIcon(alert.type)}
            </div>
            <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">
              {alert.title}
            </span>
            {alert.count && alert.count > 1 && (
              <Badge className={`${styles.badge} text-white text-[10px] px-1.5 py-0 h-4 flex-shrink-0`}>
                {alert.count}
              </Badge>
            )}
            <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}

