import { Timestamp } from 'firebase/firestore';

export type MessageType = 'text' | 'file' | 'system';
export type ChatType = 'rfq' | 'quotation' | 'order' | 'direct';

export interface MessageAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'shipowner' | 'supplier' | 'admin';
  type: MessageType;
  content: string;
  attachment?: MessageAttachment;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  readBy: string[]; // Array of user UIDs who read the message
  editedAt?: Timestamp | string;
  deletedAt?: Timestamp | string;
}

export interface ChatParticipant {
  uid: string;
  name: string;
  role: 'shipowner' | 'supplier' | 'admin';
  companyName?: string;
  lastReadAt?: Timestamp | string;
}

export interface Chat {
  id: string;
  type: ChatType;
  title: string;
  description?: string;
  
  // Participants
  participants: ChatParticipant[];
  participantIds: string[]; // For easy querying
  
  // Related entities
  rfqId?: string;
  quotationId?: string;
  orderId?: string;
  
  // Last message preview
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    createdAt: Timestamp | string;
  };
  
  // Metadata
  unreadCount?: { [userId: string]: number }; // Unread count per user
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  createdBy: string;
  
  // Settings
  isArchived?: boolean;
  isMuted?: boolean;
}

export interface CreateChatRequest {
  type: ChatType;
  title: string;
  description?: string;
  participantIds: string[];
  rfqId?: string;
  quotationId?: string;
  orderId?: string;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  type?: MessageType;
  attachment?: MessageAttachment;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

