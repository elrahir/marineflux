'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { logout } from '@/lib/firebase/auth';
import { FloatingChatWidget } from '@/components/chat/FloatingChatWidget';
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
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  locale: string;
  userType: 'admin' | 'shipowner' | 'supplier';
}

export function DashboardLayout({ children, locale, userType }: DashboardLayoutProps) {
  const t = useTranslations();
  const router = useRouter();
  const { userData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

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
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link href={`/${locale}`} className="flex items-center gap-2">
                <Anchor className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gray-900">MarineFlux</span>
              </Link>
            </div>

            {/* Right Side Items */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{userData?.companyName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userData?.role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                  {userData?.companyName?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 pt-16 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col h-full">
          <div className="flex-1 px-4 py-6 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>{t('common.logout')}</span>
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
      <FloatingChatWidget locale={locale} />
    </div>
  );
}



