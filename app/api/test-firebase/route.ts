import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';

export async function GET() {
  try {
    // Test Firebase config
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ OK' : '✗ Missing',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ OK' : '✗ Missing',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ OK' : '✗ Missing',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ OK' : '✗ Missing',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ OK' : '✗ Missing',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ OK' : '✗ Missing',
    };

    // Test Firestore access
    let firestoreStatus = '✗ Not initialized';
    try {
      if (db) {
        firestoreStatus = '✓ Initialized';
      }
    } catch (error: any) {
      firestoreStatus = `✗ Error: ${error.message}`;
    }

    return NextResponse.json({
      success: true,
      environment: config,
      firestore: firestoreStatus,
      dbObject: db ? 'Exists' : 'Null',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}



