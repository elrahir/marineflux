import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q')?.toLowerCase() || '';
    const mainCategory = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const supplierType = searchParams.get('type'); // 'supplier' or 'service-provider'
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const verified = searchParams.get('verified');
    const limitCount = parseInt(searchParams.get('limit') || '50');

    let constraints: any[] = [];

    // Filter by supplier type
    if (supplierType && supplierType !== 'all') {
      constraints.push(where('supplierType', '==', supplierType));
    }

    // Filter by main category (using new mainCategories field)
    if (mainCategory && mainCategory !== 'all') {
      constraints.push(where('mainCategories', 'array-contains', mainCategory));
    }

    // Filter by verified status
    if (verified === 'true') {
      constraints.push(where('isVerified', '==', true));
    }

    // Filter by minimum rating
    if (minRating > 0) {
      constraints.push(where('rating', '>=', minRating));
    }

    // Build query with all constraints
    let q = constraints.length > 0 
      ? query(collection(db, 'suppliers'), ...constraints, orderBy('rating', 'desc'), limit(limitCount))
      : query(collection(db, 'suppliers'), orderBy('rating', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const suppliers: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Client-side text search filter (Firestore doesn't support full-text search)
      const matchesSearch = !searchQuery || 
        data.companyName?.toLowerCase().includes(searchQuery) ||
        data.description?.toLowerCase().includes(searchQuery);

      // Client-side subcategory filter
      const matchesSubcategory = !subcategory || 
        data.subcategories?.includes(subcategory);

      if (matchesSearch && matchesSubcategory) {
        suppliers.push({
          id: doc.id,
          uid: data.uid,
          companyName: data.companyName,
          email: data.email,
          supplierType: data.supplierType || 'supplier',
          mainCategories: data.mainCategories || [],
          subcategories: data.subcategories || [],
          // Support old field for backward compatibility
          serviceTypes: data.mainCategories || data.serviceTypes || [],
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          totalOrders: data.totalOrders || 0,
          isVerified: data.isVerified || false,
          description: data.description || '',
          location: data.location || '',
          address: data.address || '',
          country: data.country || '',
          city: data.city || '',
          phone: data.phone || '',
          website: data.website || '',
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



