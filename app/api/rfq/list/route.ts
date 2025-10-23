import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userUid = searchParams.get('uid');
    const userRole = searchParams.get('role');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limitCount = parseInt(searchParams.get('limit') || '50');

    console.log('Fetching RFQs with params:', { userUid, userRole, status, category, limitCount });

    let q = query(collection(db, 'rfqs'));

    // Filter by shipowner if role is shipowner
    if (userRole === 'shipowner' && userUid) {
      q = query(q, where('shipownerUid', '==', userUid));
      console.log('Filtering by shipownerUid:', userUid);
    }

    // Filter by status
    if (status) {
      q = query(q, where('status', '==', status));
      console.log('Filtering by status:', status);
    }

    // Filter by category
    if (category) {
      q = query(q, where('category', '==', category));
      console.log('Filtering by category:', category);
    }

    // Order by created date (newest first)
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const rfqs: any[] = [];

    querySnapshot.forEach((doc) => {
      rfqs.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString(),
        deadline: doc.data().deadline?.toDate?.()?.toISOString(),
      });
    });

    console.log(`Found ${rfqs.length} RFQs`);

    return NextResponse.json({
      success: true,
      rfqs,
      count: rfqs.length,
    });
  } catch (error: any) {
    console.error('Error fetching RFQs:', error);
    console.error('Error details:', error.code, error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch RFQs' },
      { status: 500 }
    );
  }
}



