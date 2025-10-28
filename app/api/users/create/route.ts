import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      role, 
      companyName,
      // Optional fields
      fullName,
      phone,
      country,
      city,
      address,
      website,
      // Supplier-specific fields
      supplierType,
      mainCategories,
      subcategories,
    } = body;

    // Validate required fields
    if (!email || !password || !role || !companyName) {
      return NextResponse.json(
        { error: 'Email, password, role, and company name are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'shipowner', 'supplier'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Validate supplier type if role is supplier
    if (role === 'supplier' && supplierType && !['supplier', 'service-provider'].includes(supplierType)) {
      return NextResponse.json(
        { error: 'Invalid supplier type' },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    // Create user document in Firestore with all provided fields
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      role,
      companyName,
      ...(fullName && { fullName }),
      ...(phone && { phone }),
      ...(country && { country }),
      ...(city && { city }),
      ...(address && { address }),
      ...(website && { website }),
      createdAt: Timestamp.now(),
    });

    // Create role-specific document
    if (role === 'shipowner') {
      await setDoc(doc(db, 'shipowners', uid), {
        uid,
        companyName,
        ...(phone && { phone }),
        ...(country && { country }),
        ...(city && { city }),
        ...(address && { address }),
        ...(website && { website }),
        vessels: [],
        activeOrders: 0,
        totalSpent: 0,
        createdAt: Timestamp.now(),
      });
    } else if (role === 'supplier') {
      await setDoc(doc(db, 'suppliers', uid), {
        uid,
        companyName,
        email,
        ...(phone && { phone }),
        ...(country && { country }),
        ...(city && { city }),
        ...(address && { address }),
        ...(website && { website }),
        supplierType: supplierType || 'supplier',
        mainCategories: mainCategories || [],
        subcategories: subcategories || [],
        rating: 0,
        reviewCount: 0,
        totalOrders: 0,
        isVerified: false,
        createdAt: Timestamp.now(),
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        uid,
        email,
        role,
        companyName,
        ...(supplierType && { supplierType }),
        ...(mainCategories && { mainCategories }),
      },
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}



