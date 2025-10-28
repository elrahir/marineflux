import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userUid = searchParams.get('uid');
    const chatType = searchParams.get('type');
    const limitCount = parseInt(searchParams.get('limit') || '50');

    if (!userUid) {
      return NextResponse.json(
        { error: 'User UID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching chats for user:', userUid);

    // Build query
    let q = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', userUid)
    );

    if (chatType) {
      q = query(q, where('type', '==', chatType));
    }

    q = query(q, orderBy('updatedAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const chats: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      chats.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        lastMessage: data.lastMessage
          ? {
              ...data.lastMessage,
              createdAt: data.lastMessage.createdAt?.toDate?.()?.toISOString(),
            }
          : undefined,
      });
    });

    console.log(`Found ${chats.length} chats for user ${userUid}`);

    return NextResponse.json({
      success: true,
      chats,
      count: chats.length,
    });
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

