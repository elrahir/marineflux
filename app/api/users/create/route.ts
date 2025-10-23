import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, companyName } = await request.json();

    // Validate input
    if (!email || !password || !role || !companyName) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      role,
      companyName,
      createdAt: Timestamp.now(),
    });

    // Create role-specific document
    if (role === 'shipowner') {
      await setDoc(doc(db, 'shipowners', uid), {
        uid,
        vessels: [],
        activeOrders: 0,
        totalSpent: 0,
      });
    } else if (role === 'supplier') {
      await setDoc(doc(db, 'suppliers', uid), {
        uid,
        companyName,
        serviceTypes: [],
        rating: 0,
        reviewCount: 0,
        totalOrders: 0,
        isVerified: false,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        uid,
        email,
        role,
        companyName,
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



