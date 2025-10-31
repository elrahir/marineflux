/**
 * Timeline Event Color System - Hybrid Approach
 * 
 * Base colors by event type + status-based overrides
 * Combines event type identity with status meaning
 */

export type EventType = 'rfq' | 'quotation' | 'order';
export type EventStatus = 
  // RFQ statuses
  | 'active' 
  | 'open' 
  | 'closed' 
  | 'awarded'
  | 'created'
  | 'cancelled'
  // Quotation statuses
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'estimated_ready'
  | 'received'
  // Order statuses
  | 'pending_supplier_approval'
  | 'pending_payment'
  | 'payment_awaiting_confirmation'
  | 'paid'
  | 'pending_shipowner_confirmation'
  | 'confirmed'
  | 'in_progress'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'expected_delivery';

/**
 * Base colors for each event type
 * Using dashboard card color palette - darker, muted tones
 */
const BASE_COLORS: Record<EventType, string> = {
  rfq: 'blue-800',            // Dashboard: blue-900/cyan-950
  quotation: 'purple-800',    // Dashboard: purple-900/indigo-950
  order: 'teal-800',          // Dashboard: teal-900/cyan-950
};

/**
 * Status-based color overrides
 * Using dashboard card palette: blue-900/cyan-950, purple-900/indigo-950, teal-900/cyan-950, orange-900/red-950
 * Avoiding bright colors and near-black tones
 */
const STATUS_COLORS: Partial<Record<EventStatus, string>> = {
  // Başarılı/Onaylı durumlar - Teal/Cyan (dashboard completed orders)
  accepted: 'teal-700',
  delivered: 'teal-700',
  completed: 'teal-800',
  confirmed: 'cyan-700',
  ready: 'teal-600', // Hazır durumu
  
  // Beklemede durumlar - Cyan/Blue (dashboard pending)
  pending: 'cyan-700',
  pending_payment: 'cyan-700',
  pending_supplier_approval: 'cyan-600',
  pending_shipowner_confirmation: 'cyan-600',
  payment_awaiting_confirmation: 'cyan-600',
  
  // Devam eden durumlar - Blue (dashboard active)
  in_progress: 'blue-700',
  shipped: 'blue-700',
  expected_delivery: 'blue-600',
  active: 'blue-600',
  open: 'blue-600',
  
  // Hazırlık/İşlem durumları - Purple/Indigo (dashboard pending responses)
  created: 'indigo-700',
  received: 'purple-700', // Teklif alındı
  
  // İptal/Hata durumları - Orange/Red (dashboard urgent - muted)
  cancelled: 'orange-700',
  rejected: 'orange-700',
  
  // Özel durumlar
  estimated_ready: 'cyan-600',
  awarded: 'teal-700',
  closed: 'slate-700',
};

/**
 * Get hybrid color for event (base color + status override)
 * 
 * Priority:
 * 1. Status override (if status has specific meaning)
 * 2. Base color (event type identity)
 * 
 * @param type Event type
 * @param status Event status
 * @returns Tailwind color class (using full class names for Tailwind JIT)
 */
export function getEventColor(type: EventType, status?: EventStatus): string {
  // If status has a specific color override, use it
  if (status && STATUS_COLORS[status]) {
    const statusColor = STATUS_COLORS[status];
    
    // Map status colors to full Tailwind classes
    const colorMap: Record<string, string> = {
      'teal-700': 'bg-teal-700 border-teal-500',
      'teal-800': 'bg-teal-800 border-teal-600',
      'teal-600': 'bg-teal-600 border-teal-500',
      'cyan-700': 'bg-cyan-700 border-cyan-500',
      'cyan-600': 'bg-cyan-600 border-cyan-500',
      'blue-700': 'bg-blue-700 border-blue-500',
      'blue-600': 'bg-blue-600 border-blue-500',
      'indigo-700': 'bg-indigo-700 border-indigo-500',
      'purple-700': 'bg-purple-700 border-purple-500',
      'purple-800': 'bg-purple-800 border-purple-600',
      'orange-700': 'bg-orange-700 border-orange-500',
      'slate-700': 'bg-slate-700 border-slate-500',
    };
    
    if (colorMap[statusColor]) {
      return colorMap[statusColor];
    }
    
    // Fallback for unmapped colors
    let borderColor = statusColor;
    if (statusColor.includes('-800')) {
      borderColor = statusColor.replace('-800', '-600');
    } else if (statusColor.includes('-700')) {
      borderColor = statusColor.replace('-700', '-500');
    } else if (statusColor.includes('-600')) {
      borderColor = statusColor.replace('-600', '-500');
    }
    return `bg-${statusColor} border-${borderColor}`;
  }
  
  // Otherwise, use base color for event type
  const baseColorMap: Record<EventType, string> = {
    rfq: 'bg-blue-800 border-blue-600',
    quotation: 'bg-purple-800 border-purple-600',
    order: 'bg-teal-800 border-teal-600',
  };
  
  return baseColorMap[type] || 'bg-gray-800 border-gray-600';
}

/**
 * Get color for minimap dot (simplified version)
 * Same logic but returns only background color
 */
export function getMinimapColor(type: EventType, status?: EventStatus): string {
  if (status && STATUS_COLORS[status]) {
    const statusColor = STATUS_COLORS[status];
    
    // Map status colors to full Tailwind classes
    const colorMap: Record<string, string> = {
      'teal-700': 'bg-teal-700',
      'teal-800': 'bg-teal-800',
      'teal-600': 'bg-teal-600',
      'cyan-700': 'bg-cyan-700',
      'cyan-600': 'bg-cyan-600',
      'blue-700': 'bg-blue-700',
      'blue-600': 'bg-blue-600',
      'indigo-700': 'bg-indigo-700',
      'purple-700': 'bg-purple-700',
      'purple-800': 'bg-purple-800',
      'orange-700': 'bg-orange-700',
      'slate-700': 'bg-slate-700',
    };
    
    if (colorMap[statusColor]) {
      return colorMap[statusColor];
    }
    
    return `bg-${statusColor}`;
  }
  
  // Base colors
  const baseColorMap: Record<EventType, string> = {
    rfq: 'bg-blue-800',
    quotation: 'bg-purple-800',
    order: 'bg-teal-800',
  };
  
  return baseColorMap[type] || 'bg-gray-800';
}

/**
 * Get color category for grouping in legend
 */
export function getColorCategory(type: EventType, status?: EventStatus): {
  category: 'success' | 'pending' | 'progress' | 'error' | 'info' | 'base';
  color: string;
  label: string;
} {
  if (status && STATUS_COLORS[status]) {
    const color = STATUS_COLORS[status];
    
    // Success states
    if (['accepted', 'paid', 'completed', 'delivered', 'confirmed', 'awarded'].includes(status)) {
      return { category: 'success', color, label: color };
    }
    
    // Pending states
    if (status.includes('pending') || status === 'payment_awaiting_confirmation') {
      return { category: 'pending', color, label: color };
    }
    
    // Progress states
    if (['in_progress', 'shipped', 'expected_delivery', 'active', 'open'].includes(status)) {
      return { category: 'progress', color, label: color };
    }
    
    // Error states
    if (['cancelled', 'rejected'].includes(status)) {
      return { category: 'error', color, label: color };
    }
    
    // Info states
    return { category: 'info', color, label: color };
  }
  
  // Base event type colors
  return { 
    category: 'base', 
    color: BASE_COLORS[type], 
    label: BASE_COLORS[type] 
  };
}

