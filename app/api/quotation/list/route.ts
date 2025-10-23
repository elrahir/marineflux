import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

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

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      quotations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      });
    });

    console.log(`Found ${quotations.length} quotations`);

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



