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

    let q = query(collection(db, 'quotations'));

    // Filter by RFQ
    if (rfqId) {
      q = query(q, where('rfqId', '==', rfqId));
    }

    // Filter by supplier
    if (supplierUid) {
      q = query(q, where('supplierUid', '==', supplierUid));
    }

    // Filter by shipowner
    if (shipownerUid) {
      q = query(q, where('shipownerUid', '==', shipownerUid));
    }

    // Filter by status
    if (status) {
      q = query(q, where('status', '==', status));
    }

    // Order by created date (newest first)
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const quotations: any[] = [];

    querySnapshot.forEach((doc) => {
      quotations.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString(),
      });
    });

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



