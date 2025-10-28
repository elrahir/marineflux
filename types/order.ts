import { Timestamp } from 'firebase/firestore';

export type OrderStatus = 
  | 'pending' 
  | 'pending_supplier_approval'
  | 'pending_payment'
  | 'pending_shipowner_confirmation'
  | 'confirmed' 
  | 'in_progress' 
  | 'shipped'
  | 'delivered'
  | 'completed' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'payment_awaiting_confirmation'
  | 'paid' 
  | 'refunded';

export interface TimelineEvent {
  status: string; // Can be OrderStatus or PaymentStatus
  timestamp: Timestamp;
  description?: string;
  note?: string;
  updatedBy: string;
}

export interface Order {
  id: string;
  rfqId: string;
  quotationId: string;
  shipownerUid: string;
  supplierUid: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  timeline: TimelineEvent[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  
  // Additional details
  shipownerCompany?: string;
  supplierCompany?: string;
  title?: string;
  description?: string;
}




