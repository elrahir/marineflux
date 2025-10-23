import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

// GET - Fetch supplier profile
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'Missing supplier UID' },
        { status: 400 }
      );
    }

    // Get supplier document
    const supplierDoc = await getDoc(doc(db, 'suppliers', uid));
    
    if (!supplierDoc.exists()) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Get user document for company name
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    const profile = {
      id: supplierDoc.id,
      ...supplierDoc.data(),
      companyName: userDoc.exists() ? userDoc.data().companyName : '',
      email: userDoc.exists() ? userDoc.data().email : '',
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Error fetching supplier profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch supplier profile' },
      { status: 500 }
    );
  }
}

// PUT - Update supplier profile
export async function PUT(request: NextRequest) {
  try {
    const {
      uid,
      serviceTypes,
      description,
      location,
      contactEmail,
      contactPhone,
      website,
      certifications,
      paymentTerms,
      deliveryAreas,
    } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'Missing supplier UID' },
        { status: 400 }
      );
    }

    // Verify user is a supplier
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists() || userDoc.data().role !== 'supplier') {
      return NextResponse.json(
        { error: 'Unauthorized - Only suppliers can update their profile' },
        { status: 403 }
      );
    }

    // Check if supplier document exists
    const supplierDoc = await getDoc(doc(db, 'suppliers', uid));
    
    const profileData = {
      uid,
      serviceTypes: serviceTypes || [],
      description: description || '',
      location: location || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      website: website || '',
      certifications: certifications || [],
      paymentTerms: paymentTerms || '',
      deliveryAreas: deliveryAreas || [],
      updatedAt: Timestamp.now(),
    };

    if (supplierDoc.exists()) {
      // Update existing
      await updateDoc(doc(db, 'suppliers', uid), profileData);
    } else {
      // Create new
      await setDoc(doc(db, 'suppliers', uid), {
        ...profileData,
        rating: 0,
        reviewCount: 0,
        totalOrders: 0,
        isVerified: false,
        createdAt: Timestamp.now(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating supplier profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update supplier profile' },
      { status: 500 }
    );
  }
}



