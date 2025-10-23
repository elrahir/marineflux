'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Clock, Search, Ship, MapPin, Package, Calendar, Building2 } from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  quotationCount: number;
  deadline: string;
  vessel?: {
    name: string;
    type: string;
  };
  shipownerCompany: string;
  createdAt: string;
}

export default function SupplierRFQsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchRfqs();
  }, [categoryFilter]);

  const fetchRfqs = async () => {
    try {
      // Tedarikçiler sadece açık RFQ'ları görebilir
      const categoryParam = categoryFilter !== 'all' ? `&category=${categoryFilter}` : '';
      const response = await fetch(`/api/rfq/list?status=open${categoryParam}`);
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

  const categories = [
    { value: 'all', label: locale === 'tr' ? 'Tümü' : 'All' },
    { value: 'spare-parts', label: locale === 'tr' ? 'Yedek Parça' : 'Spare Parts' },
    { value: 'provisions', label: locale === 'tr' ? 'İaşe' : 'Provisions' },
    { value: 'deck-equipment', label: locale === 'tr' ? 'Güverte Ekipmanı' : 'Deck Equipment' },
    { value: 'engine-parts', label: locale === 'tr' ? 'Makine Parçaları' : 'Engine Parts' },
    { value: 'safety-equipment', label: locale === 'tr' ? 'Güvenlik Ekipmanı' : 'Safety Equipment' },
    { value: 'chemicals', label: locale === 'tr' ? 'Kimyasallar' : 'Chemicals' },
    { value: 'navigation', label: locale === 'tr' ? 'Navigasyon' : 'Navigation' },
    { value: 'electrical', label: locale === 'tr' ? 'Elektrik' : 'Electrical' },
    { value: 'services', label: locale === 'tr' ? 'Hizmetler' : 'Services' },
    { value: 'other', label: locale === 'tr' ? 'Diğer' : 'Other' },
  ];

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const isDeadlineSoon = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return diff < 2 * 24 * 60 * 60 * 1000; // Less than 2 days
  };

  const filteredRfqs = rfqs.filter(rfq => 
    rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rfq.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rfq.shipownerCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['supplier']} locale={locale}>
      <DashboardLayout locale={locale} userType="supplier">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Teklif Talepleri' : 'RFQ Opportunities'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' 
                ? 'Açık teklif taleplerini görüntüleyin ve tekliflerinizi gönderin'
                : 'Browse open RFQs and submit your quotations'}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={locale === 'tr' ? 'RFQ ara...' : 'Search RFQs...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-64"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Açık RFQ\'lar' : 'Open RFQs'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{rfqs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Bugün Sona Erenler' : 'Ending Today'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {rfqs.filter(r => {
                    const diff = new Date(r.deadline).getTime() - new Date().getTime();
                    return diff < 24 * 60 * 60 * 1000 && diff > 0;
                  }).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {locale === 'tr' ? 'Toplam Fırsat' : 'Total Opportunities'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{filteredRfqs.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* RFQ List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'tr' ? 'Mevcut Fırsatlar' : 'Available Opportunities'}
              </CardTitle>
              <CardDescription>
                {locale === 'tr' 
                  ? 'Size uygun teklif taleplerini inceleyin'
                  : 'Browse RFQs that match your capabilities'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  {t('common.loading')}
                </div>
              ) : filteredRfqs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {locale === 'tr' ? 'Şu anda açık RFQ bulunmuyor' : 'No open RFQs at the moment'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRfqs.map((rfq) => (
                    <div key={rfq.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{rfq.title}</h3>
                            {isDeadlineSoon(rfq.deadline) && (
                              <Badge className="bg-orange-100 text-orange-800">
                                <Clock className="h-3 w-3 mr-1" />
                                {locale === 'tr' ? 'Yakında Bitiyor' : 'Ending Soon'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{rfq.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {rfq.shipownerCompany}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {getCategoryLabel(rfq.category)}
                            </div>
                            
                            {rfq.vessel && (
                              <div className="flex items-center gap-1">
                                <Ship className="h-4 w-4" />
                                {rfq.vessel.name} ({rfq.vessel.type})
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {locale === 'tr' ? 'Son tarih: ' : 'Deadline: '}
                              <span className={isDeadlineSoon(rfq.deadline) ? 'text-orange-600 font-medium' : ''}>
                                {new Date(rfq.deadline).toLocaleDateString(locale)} {new Date(rfq.deadline).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-sm text-gray-600 mb-1">
                            {locale === 'tr' ? 'Teklif Sayısı' : 'Quotations'}
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {rfq.quotationCount}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/${locale}/supplier/rfqs/${rfq.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            {locale === 'tr' ? 'Detayları Görüntüle' : 'View Details'}
                          </Button>
                        </Link>
                        <Link href={`/${locale}/supplier/rfqs/${rfq.id}/quote`} className="flex-1">
                          <Button className="w-full">
                            {locale === 'tr' ? 'Teklif Ver' : 'Submit Quote'}
                          </Button>
                        </Link>
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
