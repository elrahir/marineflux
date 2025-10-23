import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, getDocs, limit, doc, updateDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get('chatId');
    const userId = searchParams.get('userId');
    const limitCount = parseInt(searchParams.get('limit') || '100');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching messages for chat:', chatId);

    // Build query
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('deletedAt', '==', null),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        editedAt: data.editedAt?.toDate?.()?.toISOString(),
      });
    });

    // Reverse to show oldest first
    messages.reverse();

    // Mark messages as read if userId provided
    if (userId) {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0,
      });
    }

    console.log(`Found ${messages.length} messages for chat ${chatId}`);

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

