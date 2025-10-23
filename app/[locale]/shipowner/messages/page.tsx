'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical, 
  Paperclip,
  Users,
  Clock,
  CheckCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Chat, Message } from '@/types/message';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

export default function ShipownerMessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user, userData } = useAuth();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Real-time chat list subscription
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData: Chat[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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
          updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
          editedAt: data.editedAt?.toDate?.()?.toISOString(),
        } as Message);
      });
      setMessages(messagesData);
      
      // Scroll to bottom
      setTimeout(() => {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedChat?.id]);

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

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.uid !== user?.uid);
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getOtherParticipant(chat)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return locale === 'tr' ? 'Dün' : 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString(locale, { weekday: 'short' });
    } else {
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="h-[calc(100vh-120px)]">
          <Card className="h-full flex flex-col">
            <div className="flex h-full">
              {/* Chat List Sidebar */}
              <div className="w-full md:w-96 border-r border-gray-200 flex flex-col bg-white">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {locale === 'tr' ? 'Mesajlar' : 'Messages'}
                    </h2>
                    <Button size="sm" className="bg-maritime-600 hover:bg-maritime-700">
                      <Plus className="h-4 w-4 mr-1" />
                      {locale === 'tr' ? 'Yeni' : 'New'}
                    </Button>
                  </div>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={locale === 'tr' ? 'Ara...' : 'Search...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                    </div>
                  ) : filteredChats.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {locale === 'tr' ? 'Henüz mesaj yok' : 'No messages yet'}
                      </p>
                    </div>
                  ) : (
                    filteredChats.map((chat) => {
                      const otherParticipant = getOtherParticipant(chat);
                      const unreadCount = chat.unreadCount?.[user?.uid || ''] || 0;
                      const isSelected = selectedChat?.id === chat.id;

                      return (
                        <div
                          key={chat.id}
                          onClick={() => setSelectedChat(chat)}
                          className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                            isSelected ? 'bg-maritime-50 border-l-4 border-l-maritime-600' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-maritime-100 flex items-center justify-center flex-shrink-0">
                              <Users className="h-6 w-6 text-maritime-600" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {otherParticipant?.name || chat.title}
                                </h3>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {chat.lastMessage && formatTime(chat.lastMessage.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 truncate">
                                  {chat.lastMessage?.content || (locale === 'tr' ? 'Mesaj yok' : 'No messages')}
                                </p>
                                {unreadCount > 0 && (
                                  <Badge className="ml-2 bg-maritime-600 text-white">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                              {otherParticipant?.companyName && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {otherParticipant.companyName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-1 flex flex-col bg-gray-50">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-maritime-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-maritime-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getOtherParticipant(selectedChat)?.name || selectedChat.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getOtherParticipant(selectedChat)?.companyName}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-5 w-5 text-gray-500" />
                      </Button>
                    </div>

                    {/* Messages */}
                    <div 
                      id="messages-container"
                      className="flex-1 overflow-y-auto p-4 space-y-4"
                    >
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
                            <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                              {!isOwnMessage && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {message.senderName}
                                </span>
                              )}
                              <div
                                className={`px-4 py-2 rounded-2xl ${
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
                                  {new Date(message.createdAt).toLocaleTimeString(locale, {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {isOwnMessage && (
                                  <CheckCheck className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 bg-white border-t border-gray-200">
                      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm">
                          <Paperclip className="h-5 w-5 text-gray-500" />
                        </Button>
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder={locale === 'tr' ? 'Mesajınızı yazın...' : 'Type your message...'}
                          disabled={sending}
                          className="flex-1"
                        />
                        <Button 
                          type="submit" 
                          disabled={!messageText.trim() || sending}
                          className="bg-maritime-600 hover:bg-maritime-700"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">
                        {locale === 'tr' ? 'Bir sohbet seçin' : 'Select a chat'}
                      </h3>
                      <p className="text-gray-400">
                        {locale === 'tr' 
                          ? 'Mesajlaşmaya başlamak için soldaki listeden bir sohbet seçin'
                          : 'Choose a chat from the list to start messaging'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

