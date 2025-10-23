'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCategoryLabel } from '@/types/categories';

interface RFQ {
  id: string;
  title: string;
  description: string;
  mainCategories?: string[];
  category?: string;
  status: 'open' | 'closed' | 'awarded';
  quotationCount: number;
  deadline: string;
  vessel?: {
    name: string;
    type: string;
  };
  createdAt: string;
}

export default function RFQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'awarded'>('all');
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user?.uid) {
      fetchRfqs();
    }
  }, [user?.uid, filter]);

  const fetchRfqs = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const response = await fetch(`/api/rfq/list?uid=${user?.uid}&role=shipowner${statusParam}`);
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setRfqs(data.rfqs);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (categoryId: string) => {
    return getCategoryLabel(categoryId, locale === 'tr' ? 'tr' : 'en');
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

  const stats = {
    open: rfqs.filter(r => r.status === 'open').length,
    pending: rfqs.filter(r => r.status === 'open' && r.quotationCount > 0).length,
    awarded: rfqs.filter(r => r.status === 'awarded').length,
  };

  // Filter and sort
  let filteredRfqs = filter === 'all' ? rfqs : rfqs.filter(r => r.status === filter);
  
  // Apply sorting
  filteredRfqs = [...filteredRfqs].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'vessel':
        aValue = a.vessel?.name || '';
        bValue = b.vessel?.name || '';
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'deadline':
        aValue = new Date(a.deadline).getTime();
        bValue = new Date(b.deadline).getTime();
        break;
      case 'category':
        const aCat = a.mainCategories?.[0] || a.category || '';
        const bCat = b.mainCategories?.[0] || b.category || '';
        aValue = getCategoryDisplayName(aCat);
        bValue = getCategoryDisplayName(bCat);
        break;
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'quotationCount':
        aValue = a.quotationCount || 0;
        bValue = b.quotationCount || 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {locale === 'tr' ? 'RFQ Yönetimi' : 'RFQ Management'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {locale === 'tr' ? 'Teklif taleplerini yönetin ve takip edin' : 'Manage and track your RFQs'}
              </p>
            </div>
            <Link href={`/${locale}/shipowner/rfq/create`}>
              <Button size="sm" className="bg-maritime-600 hover:bg-maritime-700">
                <Plus className="h-4 w-4 mr-2" />
                {locale === 'tr' ? 'Yeni RFQ' : 'New RFQ'}
              </Button>
            </Link>
          </div>

          {/* Stats Row - Compact */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Açık RFQ' : 'Open RFQs'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.open}</p>
                  </div>
                  <div className="text-green-600 text-xs font-semibold">
                    {locale === 'tr' ? 'Aktif' : 'Active'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Teklif Bekleyen' : 'Pending Quotes'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                  </div>
                  <div className="text-blue-600 text-xs font-semibold">
                    {locale === 'tr' ? 'Devam Eden' : 'In Progress'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Sipariş Verilen' : 'Awarded'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.awarded}</p>
                  </div>
                  <div className="text-purple-600 text-xs font-semibold">
                    {locale === 'tr' ? 'Tamamlandı' : 'Completed'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {locale === 'tr' ? 'RFQ Listesi' : 'RFQ List'}
              </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="text-xs"
                  >
                    {locale === 'tr' ? 'Tümü' : 'All'}
                  </Button>
                  <Button
                    variant={filter === 'open' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('open')}
                    className="text-xs"
                  >
                    {locale === 'tr' ? 'Açık' : 'Open'}
                  </Button>
                  <Button
                    variant={filter === 'awarded' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('awarded')}
                    className="text-xs"
                  >
                    {locale === 'tr' ? 'Verildi' : 'Awarded'}
                  </Button>
                  <Button
                    variant={filter === 'closed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('closed')}
                    className="text-xs"
                  >
                    {locale === 'tr' ? 'Kapalı' : 'Closed'}
                  </Button>
                </div>
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
                        onClick={() => handleSort('vessel')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Gemi' : 'Vessel'}
                          {getSortIcon('vessel')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Tarih' : 'Date'}
                          {getSortIcon('createdAt')}
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
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Başlık' : 'Title'}
                          {getSortIcon('title')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('deadline')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Son Tarih' : 'Deadline'}
                          {getSortIcon('deadline')}
                        </div>
                      </th>
                      <th 
                        className="text-center py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('quotationCount')}
                      >
                        <div className="flex items-center justify-center">
                          {locale === 'tr' ? 'Teklifler' : 'Offers'}
                          {getSortIcon('quotationCount')}
                        </div>
                      </th>
                      <th 
                        className="text-center py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center justify-center">
                          {locale === 'tr' ? 'Durum' : 'Status'}
                          {getSortIcon('status')}
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
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                        </td>
                      </tr>
              ) : filteredRfqs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          {locale === 'tr' ? 'RFQ bulunamadı' : 'No RFQs found'}
                        </td>
                      </tr>
                    ) : (
                      filteredRfqs.map((rfq) => {
                        const mainCategoryId = rfq.mainCategories?.[0] || rfq.category || '';
                        return (
                          <tr 
                            key={rfq.id} 
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/${locale}/shipowner/rfq/${rfq.id}`}
                          >
                            <td className="py-3 px-4 text-gray-900">
                              {rfq.vessel ? (
                                <div>
                                  <div className="font-medium">{rfq.vessel.name}</div>
                                  <div className="text-xs text-gray-500">{rfq.vessel.type}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {new Date(rfq.createdAt).toLocaleDateString(locale, { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {mainCategoryId ? getCategoryDisplayName(mainCategoryId) : '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{rfq.title}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">{rfq.description}</div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {new Date(rfq.deadline).toLocaleDateString(locale, { 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs">
                                {rfq.quotationCount}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {rfq.status === 'open' && (
                                <Badge className="bg-green-50 text-green-700 border border-green-200">
                                  {locale === 'tr' ? 'Açık' : 'Open'}
                                </Badge>
                              )}
                              {rfq.status === 'closed' && (
                                <Badge className="bg-gray-50 text-gray-700 border border-gray-200">
                                  {locale === 'tr' ? 'Kapalı' : 'Closed'}
                                </Badge>
                              )}
                              {rfq.status === 'awarded' && (
                                <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
                                  {locale === 'tr' ? 'Verildi' : 'Awarded'}
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Link href={`/${locale}/shipowner/rfq/${rfq.id}`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                            </td>
                          </tr>
                        );
                      })
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
