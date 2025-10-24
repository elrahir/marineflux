import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supplierUid = searchParams.get('supplierUid');
    const orderId = searchParams.get('orderId');
    const limitCount = parseInt(searchParams.get('limit') || '50');

    if (!supplierUid && !orderId) {
      return NextResponse.json(
        { error: 'Missing supplierUid or orderId parameter' },
        { status: 400 }
      );
    }

    let constraints: any[] = [];

    if (supplierUid) {
      constraints.push(where('supplierUid', '==', supplierUid));
    }

    if (orderId) {
      constraints.push(where('orderId', '==', orderId));
    }

    const q = constraints.length > 0
      ? query(collection(db, 'reviews'), ...constraints, limit(limitCount))
      : query(collection(db, 'reviews'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const reviews: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
      });
    });

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
