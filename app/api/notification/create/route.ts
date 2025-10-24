import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, link, orderId, relatedId } = body;

    console.log('📬 Notification create request:', { userId, type, title, message });

    if (!userId || !type || !title || !message) {
      console.error('❌ Missing required fields:', { userId, type, title, message });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Notifikasyon oluştur
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      userId,
      type, // 'order', 'quotation', 'payment', 'review', 'system'
      title,
      message,
      link: link || null,
      orderId: orderId || null,
      relatedId: relatedId || null,
      read: false,
      createdAt: Timestamp.now(),
    });

    console.log('✅ Notification created:', notificationRef.id);

    return NextResponse.json({
      success: true,
      notification: {
        id: notificationRef.id,
        userId,
        type,
        title,
        message,
        link,
        read: false,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Error creating notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}
