import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, Timestamp, arrayUnion, addDoc, collection } from 'firebase/firestore';

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

    // Send notification to the other party
    const notificationUserId = userUid === order.shipownerUid ? order.supplierUid : order.shipownerUid;
    const userType = userUid === order.shipownerUid ? 'Gemi Sahibi' : 'Satıcı';
    
    const statusNotifications: { [key: string]: { tr: string; en: string; icon: string } } = {
      'pending_supplier_approval': { tr: 'Sipariş Onay Bekleniyor', en: 'Order Awaiting Approval', icon: '⏳' },
      'pending_payment': { tr: 'Ödeme Bekleniyor', en: 'Payment Pending', icon: '💰' },
      'in_progress': { tr: 'Hazırlığa Başlandı', en: 'Preparation Started', icon: '📦' },
      'shipped': { tr: 'Kargoya Verildi', en: 'Shipped', icon: '🚚' },
      'delivered': { tr: 'Teslim Alındı', en: 'Delivered', icon: '✅' },
      'completed': { tr: 'Tamamlandı', en: 'Completed', icon: '🎉' },
      'cancelled': { tr: 'İptal Edildi', en: 'Cancelled', icon: '❌' },
    };

    const notifData = statusNotifications[status] || { tr: 'Durum Güncellendi', en: 'Status Updated', icon: '📢' };

    console.log('📢 Sending notification to:', notificationUserId, 'for status:', status);

    try {
      // Direct Firestore write instead of API call
      await addDoc(collection(db, 'notifications'), {
        userId: notificationUserId,
        type: 'order',
        title: notifData.tr,
        message: `${notifData.icon} Sipariş '${order.title}' durumu güncellendi: ${notifData.tr}`,
        link: `/tr/shipowner/orders/${orderId}`,
        orderId,
        read: false,
        createdAt: Timestamp.now(),
      });
      console.log('✅ Notification sent: Success');
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      // Don't fail the request if notification fails
    }

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



