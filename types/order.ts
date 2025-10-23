import { Timestamp } from 'firebase/firestore';

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface TimelineEvent {
  status: OrderStatus;
  timestamp: Timestamp;
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



