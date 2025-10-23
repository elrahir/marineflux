import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userUid = searchParams.get('uid');
    const userRole = searchParams.get('role');
    const status = searchParams.get('status');
    const mainCategory = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const limitCount = parseInt(searchParams.get('limit') || '50');

    console.log('Fetching RFQs with params:', { userUid, userRole, status, mainCategory, subcategory, limitCount });

    let constraints: any[] = [];

    // Filter by shipowner if role is shipowner
    if (userRole === 'shipowner' && userUid) {
      constraints.push(where('shipownerUid', '==', userUid));
      console.log('Filtering by shipownerUid:', userUid);
    }

    // Filter by status
    if (status) {
      constraints.push(where('status', '==', status));
      console.log('Filtering by status:', status);
    }

    // Filter by main category (using new mainCategories array)
    if (mainCategory && mainCategory !== 'all') {
      constraints.push(where('mainCategories', 'array-contains', mainCategory));
      console.log('Filtering by mainCategory:', mainCategory);
    }

    // Build query with all constraints
    let q = constraints.length > 0 
      ? query(collection(db, 'rfqs'), ...constraints, orderBy('createdAt', 'desc'), limit(limitCount))
      : query(collection(db, 'rfqs'), orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const rfqs: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Client-side subcategory filter
      const matchesSubcategory = !subcategory || 
        data.subcategories?.includes(subcategory);

      if (matchesSubcategory) {
        rfqs.push({
          id: doc.id,
          ...data,
          mainCategories: data.mainCategories || data.category ? [data.category] : [],
          subcategories: data.subcategories || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
          deadline: data.deadline?.toDate?.()?.toISOString(),
        });
      }
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



