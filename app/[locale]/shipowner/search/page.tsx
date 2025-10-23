'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MapPin, Package, CheckCircle, Building2, Mail } from 'lucide-react';

interface Supplier {
  id: string;
  companyName: string;
  serviceTypes: string[];
  rating: number;
  reviewCount: number;
  totalOrders: number;
  isVerified: boolean;
  description?: string;
  location?: string;
  contactEmail?: string;
}

export default function SupplierSearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const categories = [
    { value: 'all', label: locale === 'tr' ? 'Tüm Kategoriler' : 'All Categories' },
    { value: 'spare-parts', label: locale === 'tr' ? 'Yedek Parça' : 'Spare Parts' },
    { value: 'provisions', label: locale === 'tr' ? 'İaşe' : 'Provisions' },
    { value: 'deck-equipment', label: locale === 'tr' ? 'Güverte Ekipmanı' : 'Deck Equipment' },
    { value: 'engine-parts', label: locale === 'tr' ? 'Makine Parçaları' : 'Engine Parts' },
    { value: 'safety-equipment', label: locale === 'tr' ? 'Güvenlik Ekipmanı' : 'Safety Equipment' },
    { value: 'chemicals', label: locale === 'tr' ? 'Kimyasallar' : 'Chemicals' },
    { value: 'navigation', label: locale === 'tr' ? 'Navigasyon' : 'Navigation' },
    { value: 'electrical', label: locale === 'tr' ? 'Elektrik' : 'Electrical' },
    { value: 'services', label: locale === 'tr' ? 'Hizmetler' : 'Services' },
  ];

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuppliers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, categoryFilter, minRating, verifiedOnly]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: searchQuery,
        category: categoryFilter,
        minRating: minRating.toString(),
        verified: verifiedOnly.toString(),
      });

      const response = await fetch(`/api/supplier/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Tedarikçi Ara' : 'Search Suppliers'}
            </h1>
            <p className="text-gray-600 mt-2">
              {locale === 'tr' 
                ? 'Güvenilir tedarikçiler bulun ve iş ortaklığı kurun'
                : 'Find trusted suppliers and establish partnerships'}
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'tr' ? 'Arama ve Filtreler' : 'Search & Filters'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={locale === 'tr' ? 'Şirket adı ara...' : 'Search company name...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'tr' ? 'Kategori' : 'Category'}
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'tr' ? 'Minimum Puan' : 'Minimum Rating'}
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="0">{locale === 'tr' ? 'Hepsi' : 'All'}</option>
                    <option value="3">3+ ⭐</option>
                    <option value="4">4+ ⭐</option>
                    <option value="4.5">4.5+ ⭐</option>
                  </select>
                </div>

                {/* Verified Only */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {locale === 'tr' ? 'Sadece Onaylı Tedarikçiler' : 'Verified Only'}
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'tr' ? 'Sonuçlar' : 'Results'} ({suppliers.length})
              </CardTitle>
              <CardDescription>
                {locale === 'tr' 
                  ? 'Arama kriterlerinize uygun tedarikçiler'
                  : 'Suppliers matching your search criteria'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  {t('common.loading')}
                </div>
              ) : suppliers.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {locale === 'tr' ? 'Tedarikçi bulunamadı' : 'No suppliers found'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {locale === 'tr' 
                      ? 'Farklı filtreler deneyiniz'
                      : 'Try different filters'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-semibold">{supplier.companyName}</h3>
                            {supplier.isVerified && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {locale === 'tr' ? 'Onaylı' : 'Verified'}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1">
                              {renderStars(supplier.rating)}
                              <span className="text-sm text-gray-600 ml-1">
                                {supplier.rating.toFixed(1)} ({supplier.reviewCount} {locale === 'tr' ? 'değerlendirme' : 'reviews'})
                              </span>
                            </div>
                          </div>

                          {supplier.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {supplier.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mb-3">
                            {supplier.serviceTypes.slice(0, 3).map((type, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <Package className="h-3 w-3 mr-1" />
                                {categories.find(c => c.value === type)?.label || type}
                              </Badge>
                            ))}
                            {supplier.serviceTypes.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{supplier.serviceTypes.length - 3} {locale === 'tr' ? 'daha' : 'more'}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {supplier.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {supplier.location}
                              </div>
                            )}
                            <div>
                              {supplier.totalOrders} {locale === 'tr' ? 'sipariş' : 'orders'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Mail className="h-4 w-4 mr-2" />
                          {locale === 'tr' ? 'İletişim' : 'Contact'}
                        </Button>
                        <Button className="flex-1">
                          {locale === 'tr' ? 'Profili Görüntüle' : 'View Profile'}
                        </Button>
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
