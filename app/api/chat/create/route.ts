import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { CreateChatRequest } from '@/types/message';

export async function POST(request: NextRequest) {
  try {
    const body: CreateChatRequest & { createdBy: string } = await request.json();
    const { type, title, description, participantIds, rfqId, quotationId, orderId, createdBy } = body;

    // Validation
    if (!type || !title || !participantIds || participantIds.length < 2) {
      return NextResponse.json(
        { error: 'Type, title, and at least 2 participants are required' },
        { status: 400 }
      );
    }

    // Get participant details
    const participants = [];
    for (const uid of participantIds) {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        participants.push({
          uid,
          name: userData.fullName || userData.email,
          role: userData.role,
          companyName: userData.companyName,
        });
      }
    }

    // Create chat
    const chatData = {
      type,
      title,
      description: description || '',
      participants,
      participantIds,
      rfqId: rfqId || null,
      quotationId: quotationId || null,
      orderId: orderId || null,
      unreadCount: participantIds.reduce((acc, uid) => {
        acc[uid] = 0;
        return acc;
      }, {} as { [key: string]: number }),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy,
      isArchived: false,
      isMuted: false,
    };

    const chatRef = await addDoc(collection(db, 'chats'), chatData);

    // Create system message
    const systemMessage = {
      chatId: chatRef.id,
      senderId: 'system',
      senderName: 'System',
      senderRole: 'admin',
      type: 'system',
      content: `Chat created: ${title}`,
      readBy: [],
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'messages'), systemMessage);

    return NextResponse.json({
      success: true,
      chat: {
        id: chatRef.id,
        ...chatData,
        createdAt: chatData.createdAt.toDate().toISOString(),
        updatedAt: chatData.updatedAt.toDate().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create chat' },
      { status: 500 }
    );
  }
}

