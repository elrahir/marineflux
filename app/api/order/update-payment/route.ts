import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, getDoc, Timestamp, arrayUnion, addDoc, collection } from 'firebase/firestore';

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

    // Send notification to the other party
    const notificationUserId = shipownerUid ? orderData.supplierUid : orderData.shipownerUid;
    const paymentNotifications: { [key: string]: { tr: string; en: string; icon: string } } = {
      'payment_awaiting_confirmation': { tr: 'Ödeme Yapıldı - Onay Bekleniyor', en: 'Payment Made - Awaiting Confirmation', icon: '💰' },
      'paid': { tr: 'Ödeme Onaylandı', en: 'Payment Confirmed', icon: '✅' },
    };

    const paymentNotif = paymentNotifications[paymentStatus] || { tr: 'Ödeme Güncellendi', en: 'Payment Updated', icon: '💳' };

    try {
      // Direct Firestore write instead of API call
      await addDoc(collection(db, 'notifications'), {
        userId: notificationUserId,
        type: 'payment',
        title: paymentNotif.tr,
        message: `${paymentNotif.icon} Sipariş '${orderData.title}' ödeme durumu: ${paymentNotif.tr}`,
        link: `/tr/shipowner/orders/${orderId}`,
        orderId,
        read: false,
        createdAt: Timestamp.now(),
      });
      console.log('✅ Payment notification sent: Success');
    } catch (error) {
      console.error('❌ Error sending payment notification:', error);
    }

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
