'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  SUPPLIER_MAIN_CATEGORIES, 
  SERVICE_PROVIDER_MAIN_CATEGORIES, 
  getSubcategories, 
  getCategoryLabel 
} from '@/types/categories';

interface RFQ {
  id: string;
  shipownerUid: string;
  title: string;
  description: string;
  supplierType: 'supplier' | 'service-provider';
  mainCategory: string;
  subcategory?: string;
  category?: string; // Backward compatibility
  vessel?: {
    name: string;
    type: string;
  };
  deadline: string;
  status: string;
  createdAt: string;
  quotationCount?: number;
  shipownerCompany?: string;
}

export default function SupplierRFQsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Combine all categories (suppliers + service providers)
  const allCategories = [...SUPPLIER_MAIN_CATEGORIES, ...SERVICE_PROVIDER_MAIN_CATEGORIES];
  const currentSubcategories = categoryFilter && categoryFilter !== 'all' 
    ? getSubcategories(categoryFilter)
    : [];

  useEffect(() => {
    if (user?.uid) {
      fetchRfqs();
    }
  }, [categoryFilter, user?.uid]);

  // Reset subcategory when main category changes
  useEffect(() => {
    setSubcategoryFilter('all');
  }, [categoryFilter]);

  const fetchRfqs = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const categoryParam = categoryFilter !== 'all' ? `&category=${categoryFilter}` : '';
      const response = await fetch(`/api/rfq/list?status=open&uid=${user.uid}&role=supplier${categoryParam}`);
      
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

  let filteredRfqs = rfqs.filter(rfq => 
    rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.shipownerCompany?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply sorting
  filteredRfqs = [...filteredRfqs].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'shipowner':
        aValue = a.shipownerCompany || '';
        bValue = b.shipownerCompany || '';
        break;
      case 'vessel':
        aValue = a.vessel?.name || '';
        bValue = b.vessel?.name || '';
        break;
      case 'category':
        // Get first main category for display
        const aCat = a.mainCategory || a.category || '';
        const bCat = b.mainCategory || b.category || '';
        aValue = getCategoryDisplayName(aCat);
        bValue = getCategoryDisplayName(bCat);
        break;
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'deadline':
        aValue = new Date(a.deadline).getTime();
        bValue = new Date(b.deadline).getTime();
        break;
      case 'quotationCount':
        aValue = a.quotationCount || 0;
        bValue = b.quotationCount || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const stats = {
    total: rfqs.length,
    newToday: rfqs.filter(r => {
      const diff = new Date().getTime() - new Date(r.createdAt).getTime();
      return diff < 24 * 60 * 60 * 1000;
    }).length,
    endingSoon: rfqs.filter(r => {
      const diff = new Date(r.deadline).getTime() - new Date().getTime();
      return diff < 48 * 60 * 60 * 1000 && diff > 0;
    }).length,
  };

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {locale === 'tr' ? 'RFQ Fırsatları' : 'RFQ Opportunities'}
            </h1>
              <p className="text-sm text-gray-600 mt-1">
                {locale === 'tr' ? 'Teklif verebileceğiniz açık talepler' : 'Open requests you can quote on'}
            </p>
          </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={locale === 'tr' ? 'RFQ ara...' : 'Search RFQs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Stats Row - Compact */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Açık RFQ' : 'Open RFQs'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="text-blue-600 text-xs font-semibold">
                    {locale === 'tr' ? 'Toplam' : 'Total'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Bugün Eklenen' : 'Added Today'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.newToday}</p>
                  </div>
                  <div className="text-teal-600 text-xs font-semibold">
                    {locale === 'tr' ? 'Yeni' : 'New'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      {locale === 'tr' ? 'Yakında Bitiyor' : 'Ending Soon'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.endingSoon}</p>
                  </div>
                  <div className="text-orange-600 text-xs font-semibold">
                    {locale === 'tr' ? 'Acil' : 'Urgent'}
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
                  {/* Main Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">{locale === 'tr' ? 'Tüm Kategoriler' : 'All Categories'}</option>
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getCategoryDisplayName(cat.id)}
                      </option>
                    ))}
                  </select>

                  {/* Subcategory Filter */}
                  <select
                    value={subcategoryFilter}
                    onChange={(e) => setSubcategoryFilter(e.target.value)}
                    disabled={categoryFilter === 'all' || currentSubcategories.length === 0}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <option value="all">{locale === 'tr' ? 'Tüm Alt Kategoriler' : 'All Subcategories'}</option>
                    {currentSubcategories.map((subcat) => (
                      <option key={subcat.id} value={subcat.id}>
                        {locale === 'tr' ? subcat.labelTr : subcat.labelEn}
                      </option>
                    ))}
                  </select>
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
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Başlık' : 'Title'}
                          {getSortIcon('title')}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          {locale === 'tr' ? 'Yayın Tarihi' : 'Published'}
                          {getSortIcon('createdAt')}
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
                        const daysUntilDeadline = Math.ceil(
                          (new Date(rfq.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const isUrgent = daysUntilDeadline <= 2;
                        const mainCategoryId = rfq.mainCategory || rfq.category || '';

                        return (
                          <tr 
                            key={rfq.id} 
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/${locale}/supplier/rfqs/${rfq.id}`}
                          >
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              {rfq.shipownerCompany || '-'}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {rfq.vessel ? (
                                <div>
                                  <div className="font-medium text-sm">{rfq.vessel.name}</div>
                                  <div className="text-xs text-gray-500">{rfq.vessel.type}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
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
                              {new Date(rfq.createdAt).toLocaleDateString(locale, { 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <div className={`font-medium ${isUrgent ? 'text-orange-600' : 'text-gray-700'}`}>
                                {new Date(rfq.deadline).toLocaleDateString(locale, { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </div>
                              {isUrgent && (
                                <Badge className="text-xs mt-1 bg-orange-100 text-orange-700">
                                  {locale === 'tr' ? 'Acil' : 'Urgent'}
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full font-semibold text-xs">
                                {rfq.quotationCount || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Link href={`/${locale}/supplier/rfqs/${rfq.id}/quote`} onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" className="text-xs h-7 bg-maritime-600 hover:bg-maritime-700">
                                  {locale === 'tr' ? 'Teklif Ver' : 'Quote'}
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
