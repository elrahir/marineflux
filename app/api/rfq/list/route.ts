import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';

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
    let supplierCategories: string[] = [];
    let supplierSubcategories: string[] = [];

    // Get supplier's categories if role is supplier
    if (userRole === 'supplier' && userUid) {
      const supplierDoc = await getDoc(doc(db, 'suppliers', userUid));
      if (supplierDoc.exists()) {
        const supplierData = supplierDoc.data();
        supplierCategories = supplierData.mainCategories || [];
        supplierSubcategories = supplierData.subcategories || [];
        console.log('Supplier categories:', { supplierCategories, supplierSubcategories });
      }
    }

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

    // Filter by main category (supports both new and old format)
    if (mainCategory && mainCategory !== 'all') {
      // Try filtering by new mainCategory field first, fallback to old category field
      constraints.push(where('mainCategory', '==', mainCategory));
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
        subcategory === 'all' ||
        data.subcategory === subcategory;

      // Filter RFQs for suppliers based on their categories
      let matchesSupplierCategories = true;
      if (userRole === 'supplier' && supplierCategories.length > 0) {
        const rfqMainCategory = data.mainCategory || data.category;
        const rfqSubcategory = data.subcategory;

        // Check if RFQ's main category matches supplier's categories
        matchesSupplierCategories = supplierCategories.includes(rfqMainCategory);

        // If RFQ has subcategory, also check if supplier has that subcategory
        if (matchesSupplierCategories && rfqSubcategory && supplierSubcategories.length > 0) {
          matchesSupplierCategories = supplierSubcategories.includes(rfqSubcategory);
        }

        console.log('Category match check:', {
          rfqId: doc.id,
          rfqMainCategory,
          rfqSubcategory,
          supplierCategories,
          supplierSubcategories,
          matches: matchesSupplierCategories
        });
      }

      if (matchesSubcategory && matchesSupplierCategories) {
        rfqs.push({
          id: doc.id,
          ...data,
          // Return new format fields
          supplierType: data.supplierType || 'supplier',
          mainCategory: data.mainCategory || data.category,
          subcategory: data.subcategory || null,
          // Keep backward compatibility fields
          category: data.category || data.mainCategory,
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



