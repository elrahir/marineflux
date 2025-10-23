import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { quotationId, shipownerUid, reason } = await request.json();

    if (!quotationId || !shipownerUid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is a shipowner
    const userDoc = await getDoc(doc(db, 'users', shipownerUid));
    if (!userDoc.exists() || userDoc.data().role !== 'shipowner') {
      return NextResponse.json(
        { error: 'Unauthorized - Only shipowners can reject quotations' },
        { status: 403 }
      );
    }

    // Get quotation
    const quotationDoc = await getDoc(doc(db, 'quotations', quotationId));
    if (!quotationDoc.exists()) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const quotation = quotationDoc.data();

    // Verify this is the shipowner's quotation
    if (quotation.shipownerUid !== shipownerUid) {
      return NextResponse.json(
        { error: 'Unauthorized - This quotation does not belong to you' },
        { status: 403 }
      );
    }

    // Check if quotation is still pending
    if (quotation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Quotation has already been processed' },
        { status: 400 }
      );
    }

    // Update quotation status to rejected
    await updateDoc(doc(db, 'quotations', quotationId), {
      status: 'rejected',
      rejectedAt: Timestamp.now(),
      rejectionReason: reason || '',
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Quotation rejected successfully',
    });
  } catch (error: any) {
    console.error('Error rejecting quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject quotation' },
      { status: 500 }
    );
  }
}



