'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2,
  Users,
  Clock,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Chat, Message } from '@/types/message';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface FloatingChatWidgetProps {
  locale: string;
  initialChatId?: string;
  recipientId?: string;
  recipientName?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'rfq' | 'quotation' | 'order';
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function FloatingChatWidget({ 
  locale, 
  initialChatId,
  recipientId,
  recipientName,
  relatedEntityId,
  relatedEntityType,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen
}: FloatingChatWidgetProps) {
  const { user, userData } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Use external state if provided, otherwise use internal
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time chat list subscription
  useEffect(() => {
    if (!user?.uid || !isOpen) return;

    const q = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData: Chat[] = [];
      let unreadCount = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const chatUnread = data.unreadCount?.[user.uid] || 0;
        unreadCount += chatUnread;
        
        chatsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            createdAt: data.lastMessage.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          } : undefined,
        } as Chat);
      });
      
      setChats(chatsData);
      setTotalUnread(unreadCount);

      // Auto-open initial chat
      if (initialChatId && !selectedChat) {
        const chat = chatsData.find(c => c.id === initialChatId);
        if (chat) {
          setSelectedChat(chat);
          setView('chat');
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid, isOpen, initialChatId]);

  // Real-time messages subscription
  useEffect(() => {
    if (!selectedChat?.id) return;

    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', selectedChat.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Message);
      });
      setMessages(messagesData);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedChat?.id]);

  // Update total unread when not open
  useEffect(() => {
    if (!user?.uid || isOpen) return;

    const q = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let unreadCount = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        unreadCount += data.unreadCount?.[user.uid] || 0;
      });
      setTotalUnread(unreadCount);
    });

    return () => unsubscribe();
  }, [user?.uid, isOpen]);

  // Listen for custom event to open chat
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      const { recipientId, recipientName, relatedEntityId, relatedEntityType } = event.detail;
      setIsOpen(true);
      setIsMinimized(false);
      
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.participantIds.includes(recipientId) &&
        (relatedEntityType === 'rfq' ? chat.rfqId === relatedEntityId : true)
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        setView('chat');
      } else {
        // Create new chat
        handleCreateChatWithDetails(recipientId, recipientName, relatedEntityId, relatedEntityType);
      }
    };

    window.addEventListener('openChat', handleOpenChat as EventListener);
    return () => window.removeEventListener('openChat', handleOpenChat as EventListener);
  }, [chats, user?.uid, userData]);

  const handleCreateChatWithDetails = async (
    recipientId: string,
    recipientName: string,
    relatedEntityId?: string,
    relatedEntityType?: 'rfq' | 'quotation' | 'order'
  ) => {
    if (!user?.uid || !userData) return;

    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: relatedEntityType || 'direct',
          title: `${userData.companyName} - ${recipientName}`,
          participantIds: [user.uid, recipientId],
          rfqId: relatedEntityType === 'rfq' ? relatedEntityId : null,
          quotationId: relatedEntityType === 'quotation' ? relatedEntityId : null,
          orderId: relatedEntityType === 'order' ? relatedEntityId : null,
          createdBy: user.uid,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedChat(data.chat);
        setView('chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || !user?.uid || !userData) {
      console.log('Cannot send message - missing data:', {
        hasText: !!messageText.trim(),
        hasChat: !!selectedChat,
        hasUser: !!user?.uid,
        hasUserData: !!userData
      });
      return;
    }

    console.log('Sending message:', {
      chatId: selectedChat.id,
      senderId: user.uid,
      senderName: userData.fullName || userData.email,
      senderRole: userData.role,
      contentLength: messageText.trim().length
    });

    setSending(true);
    try {
      const response = await fetch('/api/message/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: messageText.trim(),
          type: 'text',
          senderId: user.uid,
          senderName: userData.fullName || userData.email,
          senderRole: userData.role,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      console.log('Message sent successfully:', data);
      setMessageText('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleCreateChat = async () => {
    if (!recipientId || !user?.uid || !userData) return;

    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: relatedEntityType || 'direct',
          title: `${userData.companyName} - ${recipientName}`,
          participantIds: [user.uid, recipientId],
          rfqId: relatedEntityType === 'rfq' ? relatedEntityId : null,
          quotationId: relatedEntityType === 'quotation' ? relatedEntityId : null,
          orderId: relatedEntityType === 'order' ? relatedEntityId : null,
          createdBy: user.uid,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedChat(data.chat);
        setView('chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.uid !== user?.uid);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return null;
  }

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-maritime-600 text-white px-4 py-3 rounded-lg shadow-2xl cursor-pointer hover:bg-maritime-700 transition-colors z-50 flex items-center gap-3"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">{locale === 'tr' ? 'Mesajlar' : 'Messages'}</span>
        {totalUnread > 0 && (
          <Badge className="bg-red-500 text-white">
            {totalUnread}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-gray-200">
      {/* Header */}
      <div className="bg-maritime-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view === 'chat' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setView('list');
                setSelectedChat(null);
              }}
              className="text-white hover:bg-maritime-700 p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">
            {view === 'list' 
              ? (locale === 'tr' ? 'Mesajlar' : 'Messages')
              : getOtherParticipant(selectedChat!)?.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-maritime-700 p-1 h-8 w-8"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-maritime-700 p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="flex-1 overflow-y-auto bg-white">
          {chats.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {locale === 'tr' ? 'Henüz mesaj yok' : 'No messages yet'}
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              const unreadCount = chat.unreadCount?.[user?.uid || ''] || 0;

              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setView('chat');
                  }}
                  className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-maritime-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-maritime-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {otherParticipant?.name || chat.title}
                        </h4>
                        {unreadCount > 0 && (
                          <Badge className="ml-2 bg-maritime-600 text-white text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {chat.lastMessage?.content || (locale === 'tr' ? 'Mesaj yok' : 'No messages')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.uid;
              const isSystemMessage = message.type === 'system';

              if (isSystemMessage) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {message.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {!isOwnMessage && (
                      <span className="text-xs text-gray-500 ml-2">
                        {message.senderName}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-maritime-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500">
                        {formatTime(message.createdAt)}
                      </span>
                      {isOwnMessage && (
                        <CheckCheck className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={locale === 'tr' ? 'Mesaj yaz...' : 'Type a message...'}
                disabled={sending}
                className="flex-1 text-sm"
              />
              <Button 
                type="submit" 
                disabled={!messageText.trim() || sending}
                size="sm"
                className="bg-maritime-600 hover:bg-maritime-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  );
}

