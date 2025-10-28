import { Timestamp } from 'firebase/firestore';

export type QuotationStatus = 'pending' | 'accepted' | 'rejected';
export type RFQStatus = 'open' | 'closed' | 'awarded';

export interface VesselInfo {
  name: string;
  type: string;
  imo?: string;
}

export interface RFQ {
  id: string;
  shipownerUid: string;
  title: string;
  description: string;
  supplierType: 'supplier' | 'service-provider'; // Tedarikçi mi / Servis Sağlayıcı mı
  mainCategory: string; // Ana kategori ID
  subcategory?: string; // Alt kategori ID (opsiyonel, sadece LSA, Maintenance, Surveys için)
  vessel: VesselInfo;
  deadline: Timestamp;
  status: RFQStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  
  // Additional details
  shipownerCompany?: string;
  attachments?: string[];
  quotationCount?: number;
  
  // Backward compatibility (deprecated)
  category?: string;
}

export interface Quotation {
  id: string;
  rfqId: string;
  supplierUid: string;
  price: number;
  currency: string;
  deliveryTime: string;
  notes: string;
  status: QuotationStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  
  // Additional details
  supplierCompany?: string;
  supplierRating?: number;
  validUntil?: Timestamp;
  rfqCategory?: string; // RFQ main category for calendar display
  vesselName?: string; // Ship name from RFQ
  vesselType?: string; // Ship type from RFQ
  estimatedReadyDate?: Timestamp; // Estimated date when supplier can prepare the items
  expectedDeliveryDate?: Timestamp; // Estimated delivery date (set after order is created)
}




