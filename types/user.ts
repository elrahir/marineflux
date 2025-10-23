import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'shipowner' | 'supplier';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  companyName: string;
  createdAt: Timestamp;
  createdBy?: string;
}

export interface Shipowner extends User {
  role: 'shipowner';
  vessels: Vessel[];
  activeOrders: number;
  totalSpent: number;
}

export interface Supplier extends User {
  role: 'supplier';
  serviceTypes: string[];
  rating: number;
  reviewCount: number;
  totalOrders: number;
  isVerified: boolean;
  description?: string;
  location?: string;
}

export interface Vessel {
  id: string;
  name: string;
  type: string;
  imo: string;
  flag: string;
  portOfRegistry?: string;
}



