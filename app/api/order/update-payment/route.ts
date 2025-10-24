import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, getDoc, Timestamp, arrayUnion } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentStatus, shipownerUid, supplierUid } = body;

    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the order document
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    
    if (!orderDoc.exists()) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();

    // Verify authorization - either shipowner or supplier can update payment
    if (shipownerUid && orderData.shipownerUid !== shipownerUid) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid shipowner' },
        { status: 403 }
      );
    }

    if (supplierUid && orderData.supplierUid !== supplierUid) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid supplier' },
        { status: 403 }
      );
    }

    // Create timeline event with localized descriptions
    let description = 'Payment updated';
    if (paymentStatus === 'payment_awaiting_confirmation') {
      description = 'Payment made - Awaiting confirmation';
    } else if (paymentStatus === 'paid') {
      description = 'Payment confirmed';
    }

    const timelineEvent = {
      status: paymentStatus,
      description,
      timestamp: Timestamp.now(),
      updatedBy: shipownerUid || supplierUid,
    };

    // Update order payment status and timeline
    await updateDoc(doc(db, 'orders', orderId), {
      paymentStatus,
      timeline: arrayUnion(timelineEvent),
      updatedAt: Timestamp.now(),
    });

    console.log('Order payment status updated:', {
      orderId,
      paymentStatus,
      updatedBy: shipownerUid ? 'shipowner' : 'supplier',
    });

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
