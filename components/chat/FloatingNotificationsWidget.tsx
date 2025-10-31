'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, limit } from 'firebase/firestore';
import {
  Bell,
  X,
  FileText,
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  AlertCircle,
  Minimize2,
} from 'lucide-react';

interface FloatingNotificationsWidgetProps {
  locale: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function FloatingNotificationsWidget({
  locale,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
}: FloatingNotificationsWidgetProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { user } = useAuth();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for notifications
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifData: any[] = [];
      let unread = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifData.push({ id: doc.id, ...data });
        if (!data.read) unread++;
      });
      setNotifications(notifData);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-gray-200">
      {/* Header */}
      <div className="bg-maritime-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span className="font-semibold">
            {locale === 'tr' ? 'Bildirimler' : 'Notifications'}
          </span>
          {unreadCount > 0 && (
            <Badge className="bg-amber-500 text-white ml-2">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
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
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {locale === 'tr' ? 'Bildirim yok' : 'No notifications'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (notification.link) {
                    // Check if link already contains locale prefix
                    const link = notification.link.startsWith(`/${locale}`) 
                      ? notification.link 
                      : `/${locale}${notification.link}`;
                    window.location.href = link;
                  }
                  if (!notification.read) {
                    updateDoc(doc(db, 'notifications', notification.id), { read: true });
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {notification.type === 'rfq' && <FileText className="h-4 w-4 text-blue-600" />}
                    {notification.type === 'quotation' && <Package className="h-4 w-4 text-purple-600" />}
                    {notification.type === 'order' && <ShoppingCart className="h-4 w-4 text-green-600" />}
                    {notification.type === 'payment' && <DollarSign className="h-4 w-4 text-yellow-600" />}
                    {notification.type === 'review' && <Star className="h-4 w-4 text-orange-600" />}
                    {notification.type === 'system' && <AlertCircle className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.createdAt?.toDate?.()?.toLocaleString() || '-'}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 h-2 w-2 bg-blue-600 rounded-full mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
