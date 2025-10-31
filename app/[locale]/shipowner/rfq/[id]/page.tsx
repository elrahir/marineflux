'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Loader2, 
  Ship, 
  Calendar, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MessageSquare,
  ArrowLeft,
  Tag,
  AlertCircle,
  Download
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCategoryLabel as getCategoryName } from '@/types/categories';

interface RFQ {
  id: string;
  title: string;
  description: string;
  supplierType: 'supplier' | 'service-provider';
  mainCategory: string;
  subcategory?: string;
  category?: string; // Backward compatibility
  vessel?: {
    name: string;
    type: string;
    imo?: string;
  };
  deadline: string;
  status: 'open' | 'closed' | 'awarded';
  quotationCount: number;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
}

export default function RFQDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [acceptedQuotation, setAcceptedQuotation] = useState<any>(null);
  const [actualQuotationCount, setActualQuotationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchRfqDetails();
    }
  }, [id, user?.uid]);

  const fetchRfqDetails = async () => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch(`/api/rfq/list?uid=${user.uid}&role=shipowner`);
      const data = await response.json();
      
      if (data.success) {
        const rfqData = data.rfqs.find((r: any) => r.id === id);
        if (rfqData) {
          setRfq(rfqData);
          
          // Fetch actual quotation count
          fetchActualQuotationCount(rfqData.id);
          
          // Always try to fetch order if it exists (regardless of status)
          fetchOrder(rfqData.id);
          
          // If RFQ is awarded, fetch the accepted quotation
          if (rfqData.status === 'awarded') {
            fetchAcceptedQuotation(rfqData.id);
          }
        } else {
          // RFQ not found or doesn't belong to this user
          router.push(`/${locale}/shipowner/rfq`);
        }
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async (rfqId: string) => {
    try {
      const response = await fetch(`/api/order/list?shipownerUid=${user?.uid}&rfqId=${rfqId}`);
      const data = await response.json();
      
      if (data.success && data.orders && data.orders.length > 0) {
        // Get the first order (should be only one per RFQ)
        const orderData = data.orders[0];
        setOrder({
          id: orderData.id,
          createdAt: orderData.createdAt,
          status: orderData.status,
          paymentStatus: orderData.paymentStatus,
          amount: orderData.amount,
          timeline: orderData.timeline || [],
          expectedDeliveryDate: orderData.expectedDeliveryDate,
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const fetchActualQuotationCount = async (rfqId: string) => {
    try {
      const response = await fetch(`/api/quotation/list?shipownerUid=${user?.uid}&rfqId=${rfqId}`);
      const data = await response.json();
      
      if (data.success && data.quotations) {
        // Count all quotations (pending, accepted, rejected)
        setActualQuotationCount(data.quotations.length);
      }
    } catch (error) {
      console.error('Error fetching quotation count:', error);
    }
  };

  const fetchAcceptedQuotation = async (rfqId: string) => {
    try {
      const response = await fetch(`/api/quotation/list?shipownerUid=${user?.uid}&rfqId=${rfqId}`);
      const data = await response.json();
      
      if (data.success && data.quotations) {
        // Find accepted quotation
        const accepted = data.quotations.find((q: any) => q.status === 'accepted');
        if (accepted) {
          setAcceptedQuotation({
            id: accepted.id,
            estimatedReadyDate: accepted.estimatedReadyDate,
            price: accepted.price,
            currency: accepted.currency,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching accepted quotation:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-teal-100 text-teal-900 border border-teal-300 px-3 py-1">
            <Clock className="h-3 w-3 mr-1.5" />
            {locale === 'tr' ? 'Açık' : 'Open'}
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-gray-200 text-gray-900 border border-gray-300 px-3 py-1">
            <XCircle className="h-3 w-3 mr-1.5" />
            {locale === 'tr' ? 'Kapalı' : 'Closed'}
          </Badge>
        );
      case 'awarded':
        return (
          <Badge className="bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1.5" />
            {locale === 'tr' ? 'Verildi' : 'Awarded'}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCloseRFQ = async () => {
    if (!confirm(locale === 'tr' ? 'Bu RFQ\'yu kapatmak istediğinize emin misiniz?' : 'Are you sure you want to close this RFQ?')) {
      return;
    }

    try {
      // TODO: Implement close RFQ API
      alert(locale === 'tr' ? 'RFQ kapatma özelliği yakında eklenecek' : 'Close RFQ feature coming soon');
    } catch (error) {
      console.error('Error closing RFQ:', error);
    }
  };

  const handleDeleteRFQ = async () => {
    if (!confirm(locale === 'tr' ? 'Bu RFQ\'yu silmek istediğinize emin misiniz? Bu işlem geri alınamaz!' : 'Are you sure you want to delete this RFQ? This action cannot be undone!')) {
      return;
    }

    try {
      // TODO: Implement delete RFQ API
      alert(locale === 'tr' ? 'RFQ silme özelliği yakında eklenecek' : 'Delete RFQ feature coming soon');
    } catch (error) {
      console.error('Error deleting RFQ:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!rfq) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {locale === 'tr' ? 'RFQ bulunamadı' : 'RFQ not found'}
            </p>
            <Link href={`/${locale}/shipowner/rfq`}>
              <Button>
                {locale === 'tr' ? 'RFQ Listesine Dön' : 'Back to RFQ List'}
              </Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const daysRemaining = getDaysRemaining(rfq.deadline);
  const deadlinePassed = isDeadlinePassed(rfq.deadline);

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Back Button */}
          <Link 
            href={`/${locale}/shipowner/rfq`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {locale === 'tr' ? 'RFQ Listesine Dön' : 'Back to RFQ List'}
          </Link>

          {/* Header Section */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">{rfq.title}</h1>
                  {getStatusBadge(rfq.status)}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {locale === 'tr' ? 'Oluşturulma:' : 'Created:'} {new Date(rfq.createdAt).toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {rfq.mainCategory && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-4 w-4" />
                      <span>{getCategoryName(rfq.mainCategory || rfq.category || '', locale === 'tr' ? 'tr' : 'en')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {rfq.status === 'open' && (
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" disabled>
                    <Edit className="h-4 w-4 mr-2" />
                    {locale === 'tr' ? 'Düzenle' : 'Edit'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCloseRFQ}>
                    <XCircle className="h-4 w-4 mr-2" />
                    {locale === 'tr' ? 'Kapat' : 'Close'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteRFQ}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {locale === 'tr' ? 'Sil' : 'Delete'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Compact Horizontal Timeline */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-1">
                {/* RFQ Created */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    true ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[9px] font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'RFQ' : 'RFQ'}
                  </p>
                  <p className="text-[8px] text-gray-600 mt-0.5 text-center px-0.5 truncate w-full">
                    {new Date(rfq.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                  </p>
                </div>

                {/* Connector */}
                <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[20px]"></div>

                {/* Quotations Received */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    actualQuotationCount > 0 ? 'bg-teal-900 text-white border-teal-900' : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}>
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[9px] font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                    {locale === 'tr' ? 'Teklif' : 'Quote'}
                  </p>
                  <p className="text-[8px] text-gray-600 mt-0.5 text-center px-0.5">
                    {actualQuotationCount || rfq.quotationCount}
                  </p>
                </div>

                {/* Connector - Show order timeline if RFQ is awarded OR if order exists */}
                {(rfq.status === 'awarded' || order) && (
                  <>
                    {/* Connector */}
                    <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[20px]"></div>

                    {/* Quotation Accepted */}
                    {rfq.status === 'awarded' && (
                      <>
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                            acceptedQuotation ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-200 text-gray-500 border-gray-300'
                          }`}>
                            <CheckCircle className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-[9px] font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                            {locale === 'tr' ? 'Seçildi' : 'Accept'}
                          </p>
                          {acceptedQuotation?.estimatedReadyDate && (
                            <p className="text-[8px] text-emerald-700 font-medium mt-0.5 text-center px-0.5 truncate w-full">
                              {new Date(acceptedQuotation.estimatedReadyDate).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[20px]"></div>
                      </>
                    )}

                    {/* Order Created */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order ? 'bg-purple-900 text-white border-purple-900' : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[9px] font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                        {locale === 'tr' ? 'Sipariş' : 'Order'}
                      </p>
                      {order?.createdAt && (
                        <p className="text-[8px] text-gray-600 mt-0.5 text-center px-0.5 truncate w-full">
                          {new Date(order.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>

                    {/* Connector */}
                    <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[20px]"></div>

                    {/* Supplier Approval / Confirmed */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order && ['confirmed', 'in_progress', 'shipped', 'delivered', 'completed'].includes(order.status) 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[9px] font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                        {locale === 'tr' ? 'Onay' : 'Confirm'}
                      </p>
                    </div>

                    {/* Connector */}
                    <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[20px]"></div>

                    {/* Payment */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order && order.paymentStatus === 'paid' 
                          ? 'bg-green-600 text-white border-green-600' 
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[9px] font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                        {locale === 'tr' ? 'Ödeme' : 'Pay'}
                      </p>
                      {order && order.paymentStatus === 'paid' && order.amount && (
                        <p className="text-[8px] text-green-700 font-medium mt-0.5 text-center px-0.5">
                          ${(order.amount / 1000).toFixed(0)}k
                        </p>
                      )}
                    </div>

                    {/* Connector */}
                    <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[20px]"></div>

                    {/* In Progress */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order && ['in_progress', 'shipped', 'delivered', 'completed'].includes(order.status) 
                          ? 'bg-purple-600 text-white border-purple-600' 
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[9px] font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                        {locale === 'tr' ? 'Hazır' : 'Progress'}
                      </p>
                    </div>

                    {/* Connector */}
                    <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[20px]"></div>

                    {/* Shipped */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order && ['shipped', 'delivered', 'completed'].includes(order.status) 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[9px] font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                        {locale === 'tr' ? 'Kargo' : 'Ship'}
                      </p>
                      {order && order.status === 'shipped' && order.expectedDeliveryDate && (
                        <p className="text-[8px] text-blue-700 font-medium mt-0.5 text-center px-0.5 truncate w-full">
                          {new Date(order.expectedDeliveryDate).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>

                    {/* Connector */}
                    <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[20px]"></div>

                    {/* Delivered */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        order && ['delivered', 'completed'].includes(order.status) 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-gray-200 text-gray-500 border-gray-300'
                      }`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[9px] font-semibold text-gray-900 mt-1.5 text-center leading-tight px-0.5">
                        {locale === 'tr' ? 'Teslim' : 'Deliver'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics - Dashboard Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quotations */}
            <Card className="border-l-4 border-l-blue-900">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      {locale === 'tr' ? 'Alınan Teklif' : 'Received Quotes'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{rfq.quotationCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-900" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deadline */}
            <Card className={`border-l-4 ${deadlinePassed ? 'border-l-orange-900' : 'border-l-teal-900'}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      {locale === 'tr' ? 'Son Tarih' : 'Deadline'}
                    </p>
                    <p className={`text-2xl font-bold ${deadlinePassed ? 'text-orange-900' : 'text-gray-900'}`}>
                      {new Date(rfq.deadline).toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                    {!deadlinePassed && (
                      <p className="text-xs text-gray-500 mt-1">
                        {daysRemaining > 0 
                          ? `${daysRemaining} ${locale === 'tr' ? 'gün kaldı' : 'days left'}`
                          : locale === 'tr' ? 'Bugün' : 'Today'}
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${deadlinePassed ? 'bg-orange-100' : 'bg-teal-100'}`}>
                    <Clock className={`h-6 w-6 ${deadlinePassed ? 'text-orange-900' : 'text-teal-900'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card className="border-l-4 border-l-cyan-950">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      {locale === 'tr' ? 'Kategori' : 'Category'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {rfq.mainCategory ? getCategoryName(rfq.mainCategory || rfq.category || '', locale === 'tr' ? 'tr' : 'en') : '-'}
                    </p>
                    {rfq.subcategory && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {getCategoryName(rfq.subcategory, locale === 'tr' ? 'tr' : 'en')}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center ml-2">
                    <Tag className="h-6 w-6 text-cyan-950" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vessel */}
            {rfq.vessel ? (
              <Card className="border-l-4 border-l-purple-900">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        {locale === 'tr' ? 'Gemi' : 'Vessel'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{rfq.vessel.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{rfq.vessel.type}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center ml-2">
                      <Ship className="h-6 w-6 text-purple-900" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-l-4 border-l-gray-400">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        {locale === 'tr' ? 'Durum' : 'Status'}
                      </p>
                      <p className="text-lg font-semibold text-gray-700">
                        {getStatusBadge(rfq.status)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {locale === 'tr' ? 'Açıklama' : 'Description'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{rfq.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Vessel Information */}
              {rfq.vessel && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5" />
                      {locale === 'tr' ? 'Gemi Bilgileri' : 'Vessel Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {locale === 'tr' ? 'Gemi Adı' : 'Vessel Name'}
                        </p>
                        <p className="text-base font-semibold text-gray-900">{rfq.vessel.name}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {locale === 'tr' ? 'Gemi Tipi' : 'Vessel Type'}
                        </p>
                        <p className="text-base font-semibold text-gray-900">{rfq.vessel.type}</p>
                      </div>
                      {rfq.vessel.imo && (
                        <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">IMO Number</p>
                          <p className="text-base font-semibold text-gray-900">{rfq.vessel.imo}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {rfq.attachments && rfq.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      {locale === 'tr' ? 'Ekler' : 'Attachments'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rfq.attachments.map((attachment, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-900" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{attachment}</p>
                            <p className="text-xs text-gray-500">{locale === 'tr' ? 'Dosya' : 'File'}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Actions & Timeline */}
            <div className="space-y-6">
              {/* Primary Action */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {locale === 'tr' ? 'Teklifler' : 'Quotations'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href={`/${locale}/shipowner/rfq/${id}/quotations`} className="block">
                    <Button className="w-full" size="lg" variant="default">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      {locale === 'tr' 
                        ? `Teklifleri Görüntüle`
                        : `View Quotations`}
                    </Button>
                  </Link>
                  
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-900">{actualQuotationCount || rfq.quotationCount}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {locale === 'tr' 
                        ? (actualQuotationCount || rfq.quotationCount) === 1 ? 'teklif alındı' : 'teklif alındı'
                        : (actualQuotationCount || rfq.quotationCount) === 1 ? 'quote received' : 'quotes received'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {locale === 'tr' ? 'Durum Bilgisi' : 'Status Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rfq.status === 'open' && !deadlinePassed && (
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-teal-900 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-teal-900">
                            {locale === 'tr' ? 'RFQ Aktif' : 'RFQ Active'}
                          </p>
                          <p className="text-sm text-teal-700 mt-1">
                            {locale === 'tr' 
                              ? 'RFQ hala açık ve teklif alıyor'
                              : 'RFQ is still open and accepting quotes'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {deadlinePassed && rfq.status === 'open' && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-900 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-900">
                            {locale === 'tr' ? 'Son Tarih Geçti' : 'Deadline Passed'}
                          </p>
                          <p className="text-sm text-orange-700 mt-1">
                            {locale === 'tr' 
                              ? 'Son tarih geçti. RFQ\'yu kapatabilirsiniz.'
                              : 'Deadline passed. You can close this RFQ.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {rfq.status === 'awarded' && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-purple-900 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-900">
                            {locale === 'tr' ? 'Sipariş Verildi' : 'Order Placed'}
                          </p>
                          <p className="text-sm text-purple-700 mt-1">
                            {locale === 'tr' 
                              ? 'Bu RFQ için sipariş verildi'
                              : 'Order has been placed for this RFQ'}
                          </p>
                          <Link href={`/${locale}/shipowner/orders`}>
                            <Button variant="link" className="p-0 h-auto mt-2 text-purple-900">
                              {locale === 'tr' ? 'Siparişi Görüntüle →' : 'View Order →'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {rfq.status === 'closed' && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {locale === 'tr' ? 'RFQ Kapalı' : 'RFQ Closed'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {locale === 'tr' 
                              ? 'Bu RFQ kapatıldı'
                              : 'This RFQ has been closed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
