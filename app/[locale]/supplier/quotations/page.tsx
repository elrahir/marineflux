'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Clock, CheckCircle, XCircle, Building2, DollarSign, Package } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Quotation {
  id: string;
  rfqId: string;
  rfqTitle: string;
  shipownerCompany: string;
  price: number;
  currency: string;
  deliveryTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function SupplierQuotationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    if (user?.uid) {
      fetchQuotations();
    }
  }, [user?.uid, filter]);

  const fetchQuotations = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const response = await fetch(`/api/quotation/list?supplierUid=${user.uid}${statusParam}`);
      const data = await response.json();
      
      if (data.success) {
        setQuotations(data.quotations);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Beklemede' : 'Pending'}
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-teal-100 text-teal-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Kabul Edildi' : 'Accepted'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <XCircle className="h-3 w-3 mr-1" />
            {locale === 'tr' ? 'Reddedildi' : 'Rejected'}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'pending').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
  };

  const filteredQuotations = filter === 'all' ? quotations : quotations.filter(q => q.status === filter);

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Tekliflerim' : 'My Quotations'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' 
                ? 'Gönderdiğiniz teklifleri görüntüleyin ve takip edin'
                : 'View and track your submitted quotations'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilter('all')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Toplam Teklif' : 'Total Quotes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${filter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setFilter('pending')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Beklemede' : 'Pending'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${filter === 'accepted' ? 'ring-2 ring-teal-500' : ''}`}
              onClick={() => setFilter('accepted')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Kabul Edildi' : 'Accepted'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">{stats.accepted}</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${filter === 'rejected' ? 'ring-2 ring-amber-500' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Reddedildi' : 'Rejected'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.rejected}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quotations List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filter === 'all' 
                  ? (locale === 'tr' ? 'Tüm Teklifler' : 'All Quotations')
                  : `${filteredQuotations.length} ${
                      filter === 'pending' 
                        ? (locale === 'tr' ? 'Bekleyen' : 'Pending')
                        : filter === 'accepted'
                        ? (locale === 'tr' ? 'Kabul Edilmiş' : 'Accepted')
                        : (locale === 'tr' ? 'Reddedilmiş' : 'Rejected')
                    } ${locale === 'tr' ? 'Teklif' : 'Quote(s)'}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredQuotations.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {locale === 'tr' ? 'Henüz teklif göndermediniz' : 'No quotations submitted yet'}
                  </p>
                  <Link href={`/${locale}/supplier/rfqs`}>
                    <Button>
                      <Package className="mr-2 h-4 w-4" />
                      {locale === 'tr' ? 'RFQ\'ları Görüntüle' : 'View RFQs'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuotations.map((quotation) => (
                    <div key={quotation.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{quotation.rfqTitle}</h3>
                            {getStatusBadge(quotation.status)}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Building2 className="h-4 w-4" />
                            {quotation.shipownerCompany}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <DollarSign className="h-4 w-4" />
                                {locale === 'tr' ? 'Teklif Fiyatı' : 'Quoted Price'}
                              </div>
                              <div className="text-xl font-bold text-primary">
                                {quotation.price.toLocaleString()} {quotation.currency}
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Clock className="h-4 w-4" />
                                {locale === 'tr' ? 'Teslimat Süresi' : 'Delivery Time'}
                              </div>
                              <div className="font-medium">{quotation.deliveryTime}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-600 mb-1">
                                {locale === 'tr' ? 'Gönderim Tarihi' : 'Submission Date'}
                              </div>
                              <div className="font-medium">
                                {new Date(quotation.createdAt).toLocaleDateString(locale)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/${locale}/supplier/rfqs/${quotation.rfqId}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            {locale === 'tr' ? 'RFQ Detayları' : 'View RFQ'}
                          </Button>
                        </Link>
                        
                        {quotation.status === 'accepted' && (
                          <Link href={`/${locale}/supplier/orders`} className="flex-1">
                            <Button className="w-full">
                              <Package className="mr-2 h-4 w-4" />
                              {locale === 'tr' ? 'Siparişi Görüntüle' : 'View Order'}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

