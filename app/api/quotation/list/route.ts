import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rfqId = searchParams.get('rfqId');
    const supplierUid = searchParams.get('supplierUid');
    const shipownerUid = searchParams.get('shipownerUid');
    const status = searchParams.get('status');
    const limitCount = parseInt(searchParams.get('limit') || '50');

    console.log('Fetching quotations with params:', {
      rfqId,
      supplierUid,
      shipownerUid,
      status,
      limitCount,
    });

    let constraints: any[] = [];

    // Filter by RFQ
    if (rfqId) {
      constraints.push(where('rfqId', '==', rfqId));
      console.log('Filtering by rfqId:', rfqId);
    }

    // Filter by supplier
    if (supplierUid) {
      constraints.push(where('supplierUid', '==', supplierUid));
    }

    // Filter by shipowner
    if (shipownerUid) {
      constraints.push(where('shipownerUid', '==', shipownerUid));
    }

    // Filter by status
    if (status) {
      constraints.push(where('status', '==', status));
    }

    // Build query with all constraints
    let q = constraints.length > 0 
      ? query(collection(db, 'quotations'), ...constraints, orderBy('createdAt', 'desc'), limit(limitCount))
      : query(collection(db, 'quotations'), orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const quotations: any[] = [];

    // Fetch supplier ratings for each quotation
    for (const quotationDoc of querySnapshot.docs) {
      const data = quotationDoc.data();
      
      // Satıcı bilgilerini çek
      let supplierRating = 0;
      let supplierReviewCount = 0;
      
      if (data.supplierUid) {
        try {
          const supplierDoc = await getDoc(doc(db, 'users', data.supplierUid));
          if (supplierDoc.exists()) {
            const supplierData = supplierDoc.data();
            supplierRating = supplierData.rating || 0;
            supplierReviewCount = supplierData.reviewCount || 0;
          }
        } catch (error) {
          console.error(`Error fetching supplier data for ${data.supplierUid}:`, error);
        }
      }
      
      console.log('Quotation found:', {
        id: quotationDoc.id,
        rfqId: data.rfqId,
        supplierCompany: data.supplierCompany,
        price: data.price,
        status: data.status,
        supplierRating,
        supplierReviewCount,
        createdAt: data.createdAt?.toDate?.()?.toISOString()
      });
      
      quotations.push({
        id: quotationDoc.id,
        ...data,
        supplierRating,
        supplierReviewCount,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      });
    }

    console.log(`Found ${quotations.length} quotations total`);

    return NextResponse.json({
      success: true,
      quotations,
      count: quotations.length,
    });
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}



