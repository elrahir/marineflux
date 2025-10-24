import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { 
      orderId,
      status,
      description,
      userUid,
    } = await request.json();

    // Validate input
    if (!orderId || !status || !userUid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending_supplier_approval', 'pending_payment', 'pending_shipowner_confirmation', 'in_progress', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get order
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (!orderDoc.exists()) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderDoc.data();

    // Verify user is authorized (shipowner or supplier of this order)
    if (order.shipownerUid !== userUid && order.supplierUid !== userUid) {
      return NextResponse.json(
        { error: 'Unauthorized - You are not part of this order' },
        { status: 403 }
      );
    }

    // Supplier approval logic - only supplier can approve from pending_supplier_approval
    if (order.status === 'pending_supplier_approval' && status === 'pending_payment') {
      if (order.supplierUid !== userUid) {
        return NextResponse.json(
          { error: 'Only the supplier can approve this order' },
          { status: 403 }
        );
      }
    }

    // Payment confirmation logic - only shipowner can confirm payment
    if (status === 'pending_shipowner_confirmation' && order.shipownerUid !== userUid) {
      return NextResponse.json(
        { error: 'Only the shipowner can confirm payment' },
        { status: 403 }
      );
    }

    // After payment confirmation, move to in_progress
    if (order.status === 'pending_shipowner_confirmation' && status === 'in_progress') {
      if (order.shipownerUid !== userUid) {
        return NextResponse.json(
          { error: 'Only the shipowner can proceed to in progress' },
          { status: 403 }
        );
      }
    }

    // Create timeline event
    const timelineEvent = {
      status,
      description: description || `Order status updated to ${status}`,
      timestamp: Timestamp.now(),
      updatedBy: userUid,
    };

    // Update order
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      timeline: arrayUnion(timelineEvent),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        status,
      },
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}



