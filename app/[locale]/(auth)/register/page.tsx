'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Package, Building2, User, Mail, Lock, Phone, MapPin, Globe, CheckCircle, Wrench } from 'lucide-react';
import Link from 'next/link';
import { SUPPLIER_MAIN_CATEGORIES, SERVICE_PROVIDER_MAIN_CATEGORIES, getSubcategories, hasSubcategories } from '@/types/categories';

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const [step, setStep] = useState<'type' | 'supplier-type' | 'categories' | 'details'>("type");
  const [userType, setUserType] = useState<'shipowner' | 'supplier'>('shipowner');
  const [supplierType, setSupplierType] = useState<'supplier' | 'service-provider'>('supplier');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Company Info
    companyName: '',
    companyWebsite: '',
    country: '',
    city: '',
    address: '',
    
    // Terms
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTypeSelect = (type: 'shipowner' | 'supplier') => {
    setUserType(type);
    // If supplier, go to supplier type selection, otherwise go to details
    if (type === 'supplier') {
      setStep('supplier-type');
    } else {
      setStep('details');
    }
  };

  const handleSupplierTypeSelect = (type: 'supplier' | 'service-provider') => {
    setSupplierType(type);
    setStep('categories');
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubcategoryToggle = (subcategoryId: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const getDisplayCategories = () => {
    return supplierType === 'supplier' 
      ? SUPPLIER_MAIN_CATEGORIES 
      : SERVICE_PROVIDER_MAIN_CATEGORIES;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'tr' ? 'Şifreler eşleşmiyor' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      setError(locale === 'tr' ? 'Lütfen şartları kabul edin' : 'Please accept terms and privacy policy');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: userType,
          fullName: formData.fullName,
          companyName: formData.companyName,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          website: formData.companyWebsite,
          // Supplier-specific data
          ...(userType === 'supplier' && {
            supplierType: supplierType,
            mainCategories: selectedCategories,
            subcategories: selectedSubcategories,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Success - redirect to login
      router.push(`/${locale}/login?type=${userType}&registered=true`);
    } catch (err: any) {
      setError(err.message || (locale === 'tr' ? 'Kayıt başarısız oldu' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maritime-50 via-ocean-50 to-white flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-maritime-600 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-maritime-700 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
            <Ship className="h-8 w-8 text-maritime-600" />
            <span className="text-3xl font-bold text-gradient-maritime">MARINEFLUX</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {locale === 'tr' ? 'Hesap Oluştur' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {locale === 'tr' 
              ? 'Denizcilik tedarik platformuna katılın' 
              : 'Join the maritime procurement platform'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'type' ? 'text-maritime-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'type' ? 'bg-maritime-600' : 'bg-green-600'
              } text-white font-semibold`}>
                {step === 'details' ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="font-medium text-sm">
                {locale === 'tr' ? 'Rol Seçimi' : 'Select Role'}
              </span>
            </div>
            <div className={`w-16 h-0.5 ${step === 'details' ? 'bg-maritime-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center gap-2 ${step === 'details' ? 'text-maritime-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'details' ? 'bg-maritime-600 text-white' : 'bg-gray-300 text-gray-600'
              } font-semibold`}>
                2
              </div>
              <span className="font-medium text-sm">
                {locale === 'tr' ? 'Bilgiler' : 'Details'}
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: User Type Selection */}
        {step === 'type' && (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Shipowner Card */}
            <Card 
              className="cursor-pointer border-2 border-gray-200 hover:border-maritime-600 hover:shadow-2xl transition-all duration-300 card-hover"
              onClick={() => handleTypeSelect('shipowner')}
            >
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-maritime-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Ship className="h-10 w-10 text-maritime-600" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">
                  {locale === 'tr' ? 'Gemi Sahibi' : 'Shipowner'}
                </CardTitle>
                <CardDescription className="text-base">
                  {locale === 'tr'
                    ? 'Filonuz için RFQ oluşturun ve teklifleri yönetin'
                    : 'Create RFQs for your fleet and manage quotations'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-3">
                  {[
                    locale === 'tr' ? 'RFQ Oluşturma' : 'Create RFQs',
                    locale === 'tr' ? 'Teklif Karşılaştırma' : 'Compare Quotations',
                    locale === 'tr' ? 'Sipariş Yönetimi' : 'Order Management',
                    locale === 'tr' ? 'Tedarikçi Arama' : 'Supplier Search'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-maritime-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 bg-maritime-600 hover:bg-maritime-700">
                  {locale === 'tr' ? 'Gemi Sahibi Olarak Devam Et' : 'Continue as Shipowner'}
                </Button>
              </CardContent>
            </Card>

            {/* Supplier Card */}
            <Card 
              className="cursor-pointer border-2 border-gray-200 hover:border-emerald-600 hover:shadow-2xl transition-all duration-300 card-hover"
              onClick={() => handleTypeSelect('supplier')}
            >
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-emerald-700" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">
                  {locale === 'tr' ? 'Tedarikçi' : 'Supplier'}
                </CardTitle>
                <CardDescription className="text-base">
                  {locale === 'tr'
                    ? 'RFQ\'lara teklif verin ve siparişleri yönetin'
                    : 'Bid on RFQs and manage your orders'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-3">
                  {[
                    locale === 'tr' ? 'RFQ Fırsatları' : 'RFQ Opportunities',
                    locale === 'tr' ? 'Teklif Gönderme' : 'Submit Quotations',
                    locale === 'tr' ? 'Sipariş Takibi' : 'Order Tracking',
                    locale === 'tr' ? 'Gelir Yönetimi' : 'Revenue Management'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 bg-emerald-700 hover:bg-emerald-800">
                  {locale === 'tr' ? 'Tedarikçi Olarak Devam Et' : 'Continue as Supplier'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 1.5: Supplier Type Selection */}
        {step === 'supplier-type' && (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Regular Supplier Card */}
            <Card 
              className="cursor-pointer border-2 border-gray-200 hover:border-blue-600 hover:shadow-2xl transition-all duration-300 card-hover"
              onClick={() => handleSupplierTypeSelect('supplier')}
            >
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">
                  {locale === 'tr' ? 'Ürün Tedarikçisi' : 'Product Supplier'}
                </CardTitle>
                <CardDescription className="text-base">
                  {locale === 'tr'
                    ? 'Gemi malzemeleri ve yedek parçalar satın'
                    : 'Sell ship supplies and spare parts'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-3">
                  {[
                    locale === 'tr' ? '11 Ürün Kategorisi' : '11 Product Categories',
                    locale === 'tr' ? 'Global Market' : 'Global Market',
                    locale === 'tr' ? 'Hızlı Teslimat' : 'Fast Delivery',
                    locale === 'tr' ? 'Kalite Güvencesi' : 'Quality Assurance'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                  {locale === 'tr' ? 'Devam Et' : 'Continue'}
                </Button>
              </CardContent>
            </Card>

            {/* Service Provider Card */}
            <Card 
              className="cursor-pointer border-2 border-gray-200 hover:border-purple-600 hover:shadow-2xl transition-all duration-300 card-hover"
              onClick={() => handleSupplierTypeSelect('service-provider')}
            >
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">
                  {locale === 'tr' ? 'Servis Sağlayıcı' : 'Service Provider'}
                </CardTitle>
                <CardDescription className="text-base">
                  {locale === 'tr'
                    ? 'Teknik hizmetler ve danışmanlık sunun'
                    : 'Provide technical services and consulting'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-3">
                  {[
                    locale === 'tr' ? '9 Servis Kategorisi' : '9 Service Categories',
                    locale === 'tr' ? 'Uzman Ekip' : 'Expert Team',
                    locale === 'tr' ? 'Sertifikalar' : 'Certifications',
                    locale === 'tr' ? 'Müşteri Desteği' : 'Customer Support'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                  {locale === 'tr' ? 'Devam Et' : 'Continue'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 1.7: Category Selection */}
        {step === 'categories' && (
          <Card className="max-w-5xl mx-auto shadow-2xl border-2">
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {locale === 'tr' ? 'Kategoriler Seçin' : 'Select Categories'}
                  </CardTitle>
                  <CardDescription>
                    {supplierType === 'supplier' 
                      ? (locale === 'tr' ? 'Satış yaptığınız ürün kategorilerini seçin' : 'Select product categories you sell')
                      : (locale === 'tr' ? 'Sağladığınız hizmet kategorilerini seçin' : 'Select services you provide')}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedCategories([]);
                  setSelectedSubcategories([]);
                  setStep('supplier-type');
                }}>
                  {locale === 'tr' ? 'Geri' : 'Back'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Main Categories Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {locale === 'tr' ? 'Ana Kategoriler' : 'Main Categories'}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getDisplayCategories().map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedCategories.includes(category.id)
                            ? 'border-maritime-600 bg-maritime-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {locale === 'tr' ? category.labelTr : category.labelEn}
                        </div>
                        <div className={`text-sm mt-1 ${selectedCategories.includes(category.id) ? 'text-maritime-700' : 'text-gray-500'}`}>
                          {selectedCategories.includes(category.id) ? '✓ ' : ''}{locale === 'tr' ? 'Seçildi' : 'Selected'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategories for selected categories */}
                {selectedCategories.some(id => hasSubcategories(id)) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {locale === 'tr' ? 'Alt Kategoriler' : 'Subcategories'}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedCategories
                        .filter(id => hasSubcategories(id))
                        .flatMap(id => getSubcategories(id))
                        .map((subcategory) => (
                          <button
                            key={subcategory.id}
                            onClick={() => handleSubcategoryToggle(subcategory.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left text-sm ${
                              selectedSubcategories.includes(subcategory.id)
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-gray-900">
                              {locale === 'tr' ? subcategory.labelTr : subcategory.labelEn}
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-between pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedSubcategories([]);
                      setStep('supplier-type');
                    }}
                  >
                    {locale === 'tr' ? 'Geri' : 'Back'}
                  </Button>
                  <Button 
                    onClick={() => setStep('details')}
                    disabled={selectedCategories.length === 0}
                    className="bg-maritime-600 hover:bg-maritime-700"
                  >
                    {locale === 'tr' ? 'Sonraki Adıma Geç' : 'Continue to Details'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Registration Form */}
        {step === 'details' && (
          <Card className="max-w-3xl mx-auto shadow-2xl border-2">
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {userType === 'shipowner' ? (
                    <div className="w-12 h-12 bg-maritime-100 rounded-lg flex items-center justify-center">
                      <Ship className="h-6 w-6 text-maritime-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-emerald-700" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      {locale === 'tr' ? 'Hesap Bilgileri' : 'Account Information'}
                    </CardTitle>
                    <CardDescription>
                      {userType === 'shipowner' 
                        ? (locale === 'tr' ? 'Gemi Sahibi Hesabı' : 'Shipowner Account')
                        : (locale === 'tr' ? 'Tedarikçi Hesabı' : 'Supplier Account')}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep('type')}>
                  {locale === 'tr' ? 'Değiştir' : 'Change'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-maritime-600" />
                    {locale === 'tr' ? 'Kişisel Bilgiler' : 'Personal Information'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">{locale === 'tr' ? 'Ad Soyad' : 'Full Name'} *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder={locale === 'tr' ? 'Adınız Soyadınız' : 'Your Full Name'}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{locale === 'tr' ? 'Telefon' : 'Phone'} *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+90 555 123 4567"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-maritime-600" />
                    {locale === 'tr' ? 'Şirket Bilgileri' : 'Company Information'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="companyName">{locale === 'tr' ? 'Şirket Adı' : 'Company Name'} *</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder={locale === 'tr' ? 'Şirket Adınız' : 'Your Company Name'}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">{locale === 'tr' ? 'Ülke' : 'Country'} *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder={locale === 'tr' ? 'Türkiye' : 'Turkey'}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">{locale === 'tr' ? 'Şehir' : 'City'} *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder={locale === 'tr' ? 'İstanbul' : 'Istanbul'}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">{locale === 'tr' ? 'Adres' : 'Address'}</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder={locale === 'tr' ? 'Şirket adresi' : 'Company address'}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="companyWebsite">{locale === 'tr' ? 'Website' : 'Website'}</Label>
                      <Input
                        id="companyWebsite"
                        name="companyWebsite"
                        type="url"
                        value={formData.companyWebsite}
                        onChange={handleInputChange}
                        placeholder="https://company.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Credentials */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-maritime-600" />
                    {locale === 'tr' ? 'Giriş Bilgileri' : 'Login Credentials'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="email">{locale === 'tr' ? 'E-posta' : 'Email'} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@company.com"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">{locale === 'tr' ? 'Şifre' : 'Password'} *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">{locale === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'} *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                    <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer">
                      {locale === 'tr' ? (
                        <>
                          <Link href={`/${locale}/terms`} className="text-maritime-600 hover:underline">
                            Hizmet Şartlarını
                          </Link>
                          {' '}okudum ve kabul ediyorum
                        </>
                      ) : (
                        <>
                          I have read and accept the{' '}
                          <Link href={`/${locale}/terms`} className="text-maritime-600 hover:underline">
                            Terms of Service
                          </Link>
                        </>
                      )}
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="acceptPrivacy"
                      name="acceptPrivacy"
                      checked={formData.acceptPrivacy}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                    <Label htmlFor="acceptPrivacy" className="text-sm font-normal cursor-pointer">
                      {locale === 'tr' ? (
                        <>
                          <Link href={`/${locale}/privacy`} className="text-maritime-600 hover:underline">
                            Gizlilik Politikasını
                          </Link>
                          {' '}okudum ve kabul ediyorum
                        </>
                      ) : (
                        <>
                          I have read and accept the{' '}
                          <Link href={`/${locale}/privacy`} className="text-maritime-600 hover:underline">
                            Privacy Policy
                          </Link>
                        </>
                      )}
                    </Label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-6 text-lg ${
                    userType === 'shipowner' 
                      ? 'bg-maritime-600 hover:bg-maritime-700' 
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  {loading 
                    ? (locale === 'tr' ? 'Hesap Oluşturuluyor...' : 'Creating Account...')
                    : (locale === 'tr' ? 'Hesabı Oluştur' : 'Create Account')}
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center text-sm text-gray-600">
                {locale === 'tr' ? 'Zaten hesabınız var mı?' : 'Already have an account?'}{' '}
                <Link href={`/${locale}/login?type=${userType}`} className="text-maritime-600 hover:underline font-semibold">
                  {locale === 'tr' ? 'Giriş Yap' : 'Login'}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

