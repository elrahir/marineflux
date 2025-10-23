import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shipownerUid = searchParams.get('shipownerUid');
    const supplierUid = searchParams.get('supplierUid');
    const status = searchParams.get('status');
    const limitCount = parseInt(searchParams.get('limit') || '50');

    let q = query(collection(db, 'orders'));

    // Filter by shipowner
    if (shipownerUid) {
      q = query(q, where('shipownerUid', '==', shipownerUid));
    }

    // Filter by supplier
    if (supplierUid) {
      q = query(q, where('supplierUid', '==', supplierUid));
    }

    // Filter by status
    if (status) {
      q = query(q, where('status', '==', status));
    }

    // Order by created date (newest first)
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const orders: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        timeline: data.timeline?.map((event: any) => ({
          ...event,
          timestamp: event.timestamp?.toDate?.()?.toISOString(),
        })),
      });
    });

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}



