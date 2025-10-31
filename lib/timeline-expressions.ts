/**
 * Timeline Event Expression System
 * 
 * Provides user-friendly, action-oriented labels for timeline events
 * Replaces technical status codes with clear, understandable expressions
 */

import { EventType, EventStatus } from './timeline-colors';

export interface EventExpression {
  label: string;           // Ana aksiyon ifadesi (örn: "Ödeme Alındı")
  description: string;     // Açıklayıcı metin (örn: "Sipariş ödemesi tamamlandı")
  badge: string;           // Kısa badge metni (örn: "Ödendi")
  icon?: string;           // İkon adı (opsiyonel)
}

/**
 * RFQ Event Expressions
 * Only concrete events, not statuses
 */
const RFQ_EXPRESSIONS: Record<string, { tr: EventExpression; en: EventExpression }> = {
  created: {
    tr: {
      label: 'RFQ Oluşturuldu',
      description: 'Yeni teklif talebi oluşturuldu',
      badge: 'RFQ',
      icon: 'FileText',
    },
    en: {
      label: 'RFQ Created',
      description: 'New request for quotation created',
      badge: 'RFQ',
      icon: 'FileText',
    },
  },
  cancelled: {
    tr: {
      label: 'RFQ İptal Edildi',
      description: 'Teklif talebi iptal edildi',
      badge: 'İptal',
      icon: 'XCircle',
    },
    en: {
      label: 'RFQ Cancelled',
      description: 'Request for quotation cancelled',
      badge: 'Cancelled',
      icon: 'XCircle',
    },
  },
};

/**
 * Quotation Event Expressions
 * Only concrete events, not statuses
 */
const QUOTATION_EXPRESSIONS: Record<string, { tr: EventExpression; en: EventExpression }> = {
  received: {
    tr: {
      label: 'Teklif Alındı',
      description: 'Yeni teklif alındı',
      badge: 'Teklif',
      icon: 'MessageSquare',
    },
    en: {
      label: 'Quote Received',
      description: 'New quotation received',
      badge: 'Quote',
      icon: 'MessageSquare',
    },
  },
  accepted: {
    tr: {
      label: 'Teklif Onaylandı',
      description: 'Teklif onaylandı',
      badge: 'Onay',
      icon: 'CheckCircle',
    },
    en: {
      label: 'Quote Accepted',
      description: 'Quotation accepted',
      badge: 'Accepted',
      icon: 'CheckCircle',
    },
  },
  rejected: {
    tr: {
      label: 'Teklif Reddedildi',
      description: 'Teklif reddedildi',
      badge: 'Red',
      icon: 'XCircle',
    },
    en: {
      label: 'Quote Rejected',
      description: 'Quotation rejected',
      badge: 'Rejected',
      icon: 'XCircle',
    },
  },
  estimated_ready: {
    tr: {
      label: 'Tahmini Hazır Tarihi',
      description: 'Tahmini hazır olma tarihi',
      badge: 'Tahmini',
      icon: 'Clock',
    },
    en: {
      label: 'Estimated Ready Date',
      description: 'Estimated ready date',
      badge: 'Estimated',
      icon: 'Clock',
    },
  },
};

/**
 * Order Event Expressions
 * Only concrete events, not process statuses
 */
const ORDER_EXPRESSIONS: Record<string, { tr: EventExpression; en: EventExpression }> = {
  confirmed: {
    tr: {
      label: 'Sipariş Onaylandı',
      description: 'Sipariş onaylandı (Ödeme bekleniyor)',
      badge: 'Onaylandı',
      icon: 'CheckCircle',
    },
    en: {
      label: 'Order Confirmed',
      description: 'Order confirmed (Payment pending)',
      badge: 'Confirmed',
      icon: 'CheckCircle',
    },
  },
  ready: {
    tr: {
      label: 'Hazır',
      description: 'Sipariş hazır',
      badge: 'Hazır',
      icon: 'Package',
    },
    en: {
      label: 'Ready',
      description: 'Order ready',
      badge: 'Ready',
      icon: 'Package',
    },
  },
  shipped: {
    tr: {
      label: 'Kargolandı',
      description: 'Sipariş kargoya verildi',
      badge: 'Kargo',
      icon: 'Truck',
    },
    en: {
      label: 'Shipped',
      description: 'Order has been shipped',
      badge: 'Shipped',
      icon: 'Truck',
    },
  },
  delivered: {
    tr: {
      label: 'Teslim Alındı',
      description: 'Sipariş teslim alındı',
      badge: 'Teslim',
      icon: 'CheckCircle',
    },
    en: {
      label: 'Delivered',
      description: 'Order delivered',
      badge: 'Delivered',
      icon: 'CheckCircle',
    },
  },
  estimated_ready: {
    tr: {
      label: 'Tahmini Hazır Tarihi',
      description: 'Tahmini hazır olma tarihi',
      badge: 'Tahmini',
      icon: 'Clock',
    },
    en: {
      label: 'Estimated Ready Date',
      description: 'Estimated ready date',
      badge: 'Estimated',
      icon: 'Clock',
    },
  },
  expected_delivery: {
    tr: {
      label: 'Tahmini Teslimat Tarihi',
      description: 'Tahmini teslimat tarihi',
      badge: 'Tahmini',
      icon: 'Clock',
    },
    en: {
      label: 'Expected Delivery Date',
      description: 'Estimated delivery date',
      badge: 'Expected',
      icon: 'Clock',
    },
  },
};

/**
 * Get event expression based on type, status and locale
 */
export function getEventExpression(
  type: EventType,
  status?: EventStatus,
  locale: string = 'tr'
): EventExpression {
  const isTurkish = locale === 'tr';
  let expressions: Record<string, { tr: EventExpression; en: EventExpression }>;

  switch (type) {
    case 'rfq':
      expressions = RFQ_EXPRESSIONS;
      break;
    case 'quotation':
      expressions = QUOTATION_EXPRESSIONS;
      break;
    case 'order':
      expressions = ORDER_EXPRESSIONS;
      break;
    default:
      expressions = {};
  }

  // Get expression for specific status or default
  const statusKey = status || 'default';
  const expressionPair = expressions[statusKey] || expressions.default || {
    tr: { label: 'Event', description: '', badge: '' },
    en: { label: 'Event', description: '', badge: '' },
  };

  return isTurkish ? expressionPair.tr : expressionPair.en;
}

/**
 * Get short label for event (used in event cards)
 */
export function getEventLabel(
  type: EventType,
  status?: EventStatus,
  locale: string = 'tr'
): string {
  const expression = getEventExpression(type, status, locale);
  return expression.label;
}

/**
 * Get badge text for event
 */
export function getEventBadge(
  type: EventType,
  status?: EventStatus,
  locale: string = 'tr'
): string {
  const expression = getEventExpression(type, status, locale);
  return expression.badge;
}

