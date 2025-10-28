import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'shipowner' | 'supplier';
export type SupplierType = 'supplier' | 'service-provider';

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
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
}

export interface Supplier extends User {
  role: 'supplier';
  supplierType: SupplierType; // 'supplier' or 'service-provider'
  mainCategories: string[]; // Main category IDs from categories.ts
  subcategories?: string[]; // Subcategory IDs if applicable
  rating: number;
  reviewCount: number;
  totalOrders: number;
  isVerified: boolean;
  description?: string;
  location?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  website?: string;
}

export interface Vessel {
  id: string;
  name: string;
  type: string;
  imo: string;
  flag: string;
  portOfRegistry?: string;
}



