import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';

// GET - Fetch shipowner profile
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'Missing shipowner UID' },
        { status: 400 }
      );
    }

    // Get shipowner document
    const shipownerDoc = await getDoc(doc(db, 'shipowners', uid));
    
    if (!shipownerDoc.exists()) {
      return NextResponse.json(
        { error: 'Shipowner not found' },
        { status: 404 }
      );
    }

    // Get user document for company name
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    const profile = {
      id: shipownerDoc.id,
      ...shipownerDoc.data(),
      companyName: userDoc.exists() ? userDoc.data().companyName : '',
      email: userDoc.exists() ? userDoc.data().email : '',
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Error fetching shipowner profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shipowner profile' },
      { status: 500 }
    );
  }
}

// PUT - Update shipowner profile
export async function PUT(request: NextRequest) {
  try {
    const {
      uid,
      vessels,
      description,
      location,
      contactEmail,
      contactPhone,
      website,
    } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'Missing shipowner UID' },
        { status: 400 }
      );
    }

    // Verify user is a shipowner
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists() || userDoc.data().role !== 'shipowner') {
      return NextResponse.json(
        { error: 'Unauthorized - Only shipowners can update their profile' },
        { status: 403 }
      );
    }

    // Check if shipowner document exists
    const shipownerDoc = await getDoc(doc(db, 'shipowners', uid));
    
    const profileData = {
      uid,
      vessels: vessels || [],
      description: description || '',
      location: location || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      website: website || '',
      updatedAt: Timestamp.now(),
    };

    if (shipownerDoc.exists()) {
      // Update existing
      await updateDoc(doc(db, 'shipowners', uid), profileData);
    } else {
      // Create new
      await setDoc(doc(db, 'shipowners', uid), {
        ...profileData,
        activeOrders: 0,
        totalSpent: 0,
        createdAt: Timestamp.now(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating shipowner profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update shipowner profile' },
      { status: 500 }
    );
  }
}



