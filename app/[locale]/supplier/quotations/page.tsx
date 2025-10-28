'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/useAuth';

interface Quotation {
  id: string;
  rfqId: string;
  rfqTitle: string;
  shipownerCompany: string;
  vesselName?: string; // Ship name from RFQ
  rfqCategory?: string; // RFQ category
  price: number;
  currency: string;
  deliveryTime: string;
  estimatedReadyDate?: string; // Estimated ready date (when supplier can prepare items)
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function SupplierQuotationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user?.uid) {
      fetchQuotations();
    }
  }, [user?.uid]);

  const fetchQuotations = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/quotation/list?supplierUid=${user.uid}`);
      const data = await response.json();
      
      console.log('🔍 API Response:', { status: response.status, data });
      
      if (data.success) {
        // Sort quotations by createdAt (newest first) on client side
        const sorted = [...data.quotations].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order
        });
        console.log(`📊 Total quotations fetched: ${sorted.length}`, sorted.map(q => ({ 
          id: q.id, 
          rfqTitle: q.rfqTitle, 
          status: q.status,
          supplierUid: q.supplierUid 
        })));
        setQuotations(sorted);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1 text-maritime-600" />
      : <ArrowDown className="h-3 w-3 ml-1 text-maritime-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{locale === 'tr' ? 'Beklemede' : 'Pending'}</Badge>;
      case 'accepted':
        return <Badge className="bg-teal-100 text-teal-800">{locale === 'tr' ? 'Kabul Edildi' : 'Accepted'}</Badge>;
      case 'rejected':
        return <Badge className="bg-amber-100 text-amber-800">{locale === 'tr' ? 'Reddedildi' : 'Rejected'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  let filteredQuotations = quotations.filter(q =>
    (q.rfqTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     q.shipownerCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     q.vesselName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     q.rfqCategory?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || q.status === filterStatus)
  );

  // Apply sorting
  filteredQuotations = [...filteredQuotations].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'rfqTitle':
        aValue = a.rfqTitle;
        bValue = b.rfqTitle;
        break;
      case 'shipowner':
        aValue = a.shipownerCompany;
        bValue = b.shipownerCompany;
        break;
      case 'vessel':
        aValue = a.vesselName;
        bValue = b.vesselName;
        break;
      case 'category':
        aValue = a.rfqCategory;
        bValue = b.rfqCategory;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'deliveryTime':
        aValue = a.deliveryTime;
        bValue = b.deliveryTime;
        break;
      case 'estimatedReadyDate':
        aValue = a.estimatedReadyDate ? new Date(a.estimatedReadyDate).getTime() : 0;
        bValue = b.estimatedReadyDate ? new Date(b.estimatedReadyDate).getTime() : 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'pending').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
  };

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {locale === 'tr' ? 'Tekliflerim' : 'My Quotations'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {locale === 'tr' ? 'Gönderdiğiniz teklifleri görüntüleyin ve takip edin' : 'View and track your submitted quotations'}
              </p>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={locale === 'tr' ? 'Ara...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Toplam Teklif' : 'Total'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="text-blue-600 text-xs font-semibold">Tümü</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Beklemede' : 'Pending'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                  </div>
                  <div className="text-yellow-600 text-xs font-semibold">⏳</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Kabul Edildi' : 'Accepted'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.accepted}</p>
                  </div>
                  <div className="text-teal-600 text-xs font-semibold">✓</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Reddedildi' : 'Rejected'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rejected}</p>
                  </div>
                  <div className="text-amber-600 text-xs font-semibold">✗</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quotations List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {locale === 'tr' ? 'Tüm Teklifler' : 'All Quotations'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-y">
                    <tr>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('rfqTitle')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'RFQ Başlığı' : 'RFQ Title'}
                          {getSortIcon('rfqTitle')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('shipowner')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Armatör' : 'Shipowner'}
                          {getSortIcon('shipowner')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('vessel')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Gemi' : 'Vessel'}
                          {getSortIcon('vessel')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Kategori' : 'Category'}
                          {getSortIcon('category')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Fiyat' : 'Price'}
                          {getSortIcon('price')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('estimatedReadyDate')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Tahmini Hazırlık' : 'Est. Ready Date'}
                          {getSortIcon('estimatedReadyDate')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Durum' : 'Status'}
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Gönderim Tarihi' : 'Submission Date'}
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider">
                        {locale === 'tr' ? 'İşlem' : 'Action'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-500">
                          {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                        </td>
                      </tr>
                    ) : filteredQuotations.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-500">
                          {locale === 'tr' ? 'Teklif bulunamadı' : 'No quotations found'}
                        </td>
                      </tr>
                    ) : (
                      filteredQuotations.map((quotation) => (
                        <tr 
                          key={quotation.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/${locale}/supplier/rfqs/${quotation.rfqId}`}
                        >
                          <td className="py-3 px-4 text-gray-900 font-medium">{quotation.rfqTitle}</td>
                          <td className="py-3 px-4 text-gray-700">{quotation.shipownerCompany}</td>
                          <td className="py-3 px-4 text-gray-700">{quotation.vesselName}</td>
                          <td className="py-3 px-4 text-gray-700">{quotation.rfqCategory}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-maritime-600">{quotation.price.toLocaleString()} {quotation.currency}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {quotation.estimatedReadyDate ? new Date(quotation.estimatedReadyDate).toLocaleDateString(locale, { 
                              month: 'short', 
                              day: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(quotation.status)}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {new Date(quotation.createdAt).toLocaleDateString(locale, { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link href={`/${locale}/supplier/rfqs/${quotation.rfqId}`} onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" className="text-xs h-7 bg-maritime-600 hover:bg-maritime-700">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

