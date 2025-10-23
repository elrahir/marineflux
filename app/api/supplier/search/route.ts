import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const verified = searchParams.get('verified');
    const limitCount = parseInt(searchParams.get('limit') || '50');

    let q = query(collection(db, 'suppliers'));

    // Filter by category
    if (category && category !== 'all') {
      q = query(q, where('serviceTypes', 'array-contains', category));
    }

    // Filter by verified status
    if (verified === 'true') {
      q = query(q, where('isVerified', '==', true));
    }

    // Filter by minimum rating
    if (minRating > 0) {
      q = query(q, where('rating', '>=', minRating));
    }

    // Order by rating (highest first)
    q = query(q, orderBy('rating', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const suppliers: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Client-side text search filter (Firestore doesn't support full-text search)
      const matchesSearch = !searchQuery || 
        data.companyName?.toLowerCase().includes(searchQuery) ||
        data.description?.toLowerCase().includes(searchQuery);

      if (matchesSearch) {
        suppliers.push({
          id: doc.id,
          uid: data.uid,
          companyName: data.companyName,
          serviceTypes: data.serviceTypes || [],
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          totalOrders: data.totalOrders || 0,
          isVerified: data.isVerified || false,
          description: data.description || '',
          location: data.location || '',
          contactEmail: data.contactEmail || '',
        });
      }
    });

    return NextResponse.json({
      success: true,
      suppliers,
      count: suppliers.length,
    });
  } catch (error: any) {
    console.error('Error searching suppliers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search suppliers' },
      { status: 500 }
    );
  }
}



