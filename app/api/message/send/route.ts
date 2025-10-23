import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { SendMessageRequest } from '@/types/message';

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest & { 
      senderId: string;
      senderName: string;
      senderRole: 'shipowner' | 'supplier' | 'admin';
    } = await request.json();
    
    const { chatId, content, type = 'text', attachment, senderId, senderName, senderRole } = body;

    // Validation
    if (!chatId || !content || !senderId) {
      return NextResponse.json(
        { error: 'Chat ID, content, and sender ID are required' },
        { status: 400 }
      );
    }

    // Verify chat exists and user is participant
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const chatData = chatDoc.data();
    if (!chatData.participantIds.includes(senderId)) {
      return NextResponse.json(
        { error: 'User is not a participant in this chat' },
        { status: 403 }
      );
    }

    // Create message
    const messageData = {
      chatId,
      senderId,
      senderName,
      senderRole,
      type,
      content,
      attachment: attachment || null,
      readBy: [senderId], // Sender has read their own message
      createdAt: Timestamp.now(),
    };

    const messageRef = await addDoc(collection(db, 'messages'), messageData);

    // Update chat's last message and increment unread counts
    const unreadCount: { [key: string]: any } = {};
    chatData.participantIds.forEach((uid: string) => {
      if (uid !== senderId) {
        unreadCount[`unreadCount.${uid}`] = increment(1);
      }
    });

    await updateDoc(chatRef, {
      lastMessage: {
        content: type === 'file' ? '📎 File attachment' : content,
        senderId,
        senderName,
        createdAt: Timestamp.now(),
      },
      updatedAt: Timestamp.now(),
      ...unreadCount,
    });

    return NextResponse.json({
      success: true,
      message: {
        id: messageRef.id,
        ...messageData,
        createdAt: messageData.createdAt.toDate().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

