import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shipownerUid = searchParams.get('shipownerUid');
    const supplierUid = searchParams.get('supplierUid');
    const rfqId = searchParams.get('rfqId');
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

    // Filter by RFQ ID
    if (rfqId) {
      q = query(q, where('rfqId', '==', rfqId));
    }

    // Filter by status
    if (status) {
      q = query(q, where('status', '==', status));
    }

    // Order by created date (newest first)
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const orders: any[] = [];

    // Fetch quotations to get estimatedReadyDate
    const quotationPromises: Promise<any>[] = [];
    querySnapshot.forEach((orderDoc) => {
      const data = orderDoc.data();
      if (data.quotationId) {
        quotationPromises.push(
          getDoc(doc(db, 'quotations', data.quotationId)).then((quotationDoc) => {
            return {
              orderId: orderDoc.id,
              estimatedReadyDate: quotationDoc.data()?.estimatedReadyDate,
            };
          }).catch(() => null)
        );
      }
    });

    const quotationsData = await Promise.all(quotationPromises);
    const estimatedReadyDateMap = new Map<string, any>();
    quotationsData.forEach((item) => {
      if (item && item.orderId) {
        estimatedReadyDateMap.set(item.orderId, item.estimatedReadyDate);
      }
    });

    querySnapshot.forEach((orderDoc) => {
      const data = orderDoc.data();
      const estimatedReadyDate = estimatedReadyDateMap.get(orderDoc.id);
      orders.push({
        id: orderDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        expectedDeliveryDate: data.expectedDeliveryDate?.toDate?.()?.toISOString(),
        estimatedReadyDate: estimatedReadyDate?.toDate?.()?.toISOString(),
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




