import { Timestamp } from 'firebase/firestore';

export interface Review {
  id: string;
  orderId: string;
  shipownerUid: string;
  supplierUid: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp;
  
  // Additional details
  shipownerCompany?: string;
  orderTitle?: string;
}

export interface Notification {
  id: string;
  uid: string; // recipient user id
  type: 'rfq' | 'quotation' | 'order' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Timestamp;
  
  // Additional metadata
  referenceId?: string;
}



