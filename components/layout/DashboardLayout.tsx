'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { logout } from '@/lib/firebase/auth';
import { FloatingChatWidget } from '@/components/chat/FloatingChatWidget';
import { FloatingNotificationsWidget } from '@/components/chat/FloatingNotificationsWidget';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, limit } from 'firebase/firestore';
import {
  Anchor,
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ShoppingCart,
  History,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Ship,
  DollarSign,
  Settings,
  Star,
  MessageCircle,
  Check,
  AlertCircle,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  locale: string;
  userType: 'admin' | 'shipowner' | 'supplier';
}

export function DashboardLayout({ children, locale, userType }: DashboardLayoutProps) {
  const t = useTranslations();
  const router = useRouter();
  const { userData, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messagesWidgetOpen, setMessagesWidgetOpen] = useState(false);
  const [notificationsWidgetOpen, setNotificationsWidgetOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  // Listen for unread messages
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        totalUnread += data.unreadCount?.[user.uid] || 0;
      });
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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
      setUnreadNotifications(unread);
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const getNavigationItems = () => {
    if (userType === 'admin') {
      return [
        { icon: LayoutDashboard, label: t('admin.dashboard'), href: `/${locale}/admin/dashboard` },
        { icon: Users, label: t('admin.users'), href: `/${locale}/admin/users` },
        { icon: Ship, label: t('admin.shipowners'), href: `/${locale}/admin/shipowners` },
        { icon: Package, label: t('admin.suppliers'), href: `/${locale}/admin/suppliers` },
      ];
    } else if (userType === 'shipowner') {
      return [
        { icon: LayoutDashboard, label: t('dashboard.overview'), href: `/${locale}/shipowner/dashboard` },
        { icon: Search, label: t('common.search'), href: `/${locale}/shipowner/search` },
        { icon: FileText, label: t('shipowner.myRfqs'), href: `/${locale}/shipowner/rfq` },
        { icon: ShoppingCart, label: t('shipowner.orders'), href: `/${locale}/shipowner/orders` },
        { icon: History, label: t('shipowner.history'), href: `/${locale}/shipowner/history` },
        { icon: Settings, label: t('common.profile'), href: `/${locale}/shipowner/profile` },
      ];
    } else {
      return [
        { icon: LayoutDashboard, label: t('dashboard.overview'), href: `/${locale}/supplier/dashboard` },
        { icon: FileText, label: t('supplier.rfqs'), href: `/${locale}/supplier/rfqs` },
        { icon: Package, label: t('supplier.myQuotations'), href: `/${locale}/supplier/quotations` },
        { icon: ShoppingCart, label: t('supplier.orders'), href: `/${locale}/supplier/orders` },
        { icon: DollarSign, label: t('supplier.payments'), href: `/${locale}/supplier/payments` },
        { icon: Star, label: t('supplier.profile'), href: `/${locale}/supplier/profile` },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link href={`/${locale}`} className="flex items-center gap-2">
                <Anchor className="h-8 w-8 text-slate-700" />
                <span className="text-xl font-bold text-gray-900">MarineFlux</span>
              </Link>
            </div>

            {/* Right Side Items */}
            <div className="flex items-center gap-4">
              {/* Chat Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => {
                  if (messagesWidgetOpen) {
                    setMessagesWidgetOpen(false);
                  } else {
                    setNotificationsWidgetOpen(false);
                    setMessagesWidgetOpen(true);
                  }
                }}
              >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-500 text-white text-xs rounded-full font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Notification Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => {
                  if (notificationsWidgetOpen) {
                    setNotificationsWidgetOpen(false);
                  } else {
                    setMessagesWidgetOpen(false);
                    setNotificationsWidgetOpen(true);
                  }
                }}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-500 text-white text-xs rounded-full font-bold">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{userData?.companyName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userData?.role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                  {userData?.companyName?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-gradient-to-b from-slate-900 to-slate-800 pt-16 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col h-full">
          {/* Sidebar Header - Logo Section */}
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-white font-bold text-lg">MARINEFLUX</h2>
          </div>

          <div className="flex-1 px-4 py-6 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-50 rounded-lg hover:bg-slate-700 transition-all duration-200 hover:translate-x-1"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-slate-700">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-50 hover:text-gray-200 hover:bg-slate-700 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">{t('common.logout')}</span>
            </Button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Floating Chat Widget */}
      <FloatingChatWidget 
        locale={locale} 
        isOpen={messagesWidgetOpen} 
        setIsOpen={setMessagesWidgetOpen} 
      />
      <FloatingNotificationsWidget 
        locale={locale} 
        isOpen={notificationsWidgetOpen} 
        setIsOpen={setNotificationsWidgetOpen} 
      />
    </div>
  );
}



