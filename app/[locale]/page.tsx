'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Clock,
  TrendingUp,
  CheckCircle,
  Users,
} from 'lucide-react';
import { useState, useEffect, use } from 'react';
import {
  SearchIcon,
  GlobeIcon,
  PackageIcon,
  CheckCircleIcon,
  ShieldIcon,
  MailIcon,
  ArrowRightIcon,
  MenuIcon,
  CloseIcon,
} from '@/components/icons/CustomIcons';
import Image from 'next/image';

export default function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation locale={locale} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection locale={locale} />

        {/* Portal Cards Section */}
        <PortalCardsSection locale={locale} />

        {/* Why MarineFlux Section */}
        <WhyMarineFluxSection locale={locale} />
      </main>

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  );
}

// Navigation Component
function Navigation({ locale }: { locale: string }) {
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient-maritime">MARINEFLUX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden lg:block">
              <div className="flex items-center border-2 border-gray-200 rounded-lg px-4 py-2.5 w-80 bg-gray-50 hover:border-maritime-300 transition-colors">
                <SearchIcon className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder={locale === 'tr' ? 'Ürün veya hizmet ara...' : 'Search products or services...'}
                  className="outline-none text-sm w-full bg-transparent placeholder-gray-400"
                  disabled
                />
              </div>
            </div>

            {/* Language Switcher */}
            <Link href={locale === 'tr' ? '/en' : '/tr'}>
              <Button variant="ghost" size="lg" className="text-gray-600 hover:text-maritime-700">
                <GlobeIcon className="h-4 w-4 mr-2" />
                {locale === 'tr' ? 'EN' : 'TR'}
              </Button>
            </Link>

            {/* Login Button */}
            <Link href={`/${locale}/login`}>
              <Button className="bg-maritime-600 hover:bg-maritime-700 shadow-md px-6">
                {t('common.login')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon className="h-6 w-6 text-gray-700" /> : <MenuIcon className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            <Link href={locale === 'tr' ? '/en' : '/tr'} className="block">
              <Button variant="ghost" size="lg" className="w-full justify-start">
                <GlobeIcon className="h-4 w-4 mr-2" />
                {locale === 'tr' ? 'English' : 'Türkçe'}
              </Button>
            </Link>
            <Link href={`/${locale}/login`} className="block">
              <Button className="w-full bg-maritime-600 hover:bg-maritime-700">
                {t('common.login')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section Component
function HeroSection({ locale }: { locale: string }) {
  const t = useTranslations();
  const [currentWord, setCurrentWord] = useState(0);
  
  // Updated words - maritime-specific Turkish terms
  const words = locale === 'tr' 
    ? ['yedek parça', 'kimyasal', 'el aletleri', 'kumanya', 'ekipman', 'sörvey hizmetleri', 'sarf malzemeleri', 'yağ', 'teknik servis', 'güvenlik ekipmanları']
    : ['spare parts', 'chemicals', 'hand tools', 'provisions', 'equipment', 'survey services', 'consumables', 'oil', 'technical service', 'safety equipment'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-banner.png"
          alt={locale === 'tr' ? 'MarineFlux - Denizcilik Tedarik Zinciri' : 'MarineFlux - Maritime Supply Chain'}
          fill
          priority
          className="object-cover object-center"
          quality={95}
        />
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        {/* Additional Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8 py-12 md:py-16 lg:py-20">
          {/* Platform Tagline */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-maritime-400 to-maritime-600 rounded-full"></div>
            <p className="text-sm md:text-base text-maritime-300 font-semibold uppercase tracking-wider">
              {locale === 'tr' ? 'Denizcilik Platformu' : 'Maritime Platform'}
            </p>
            <div className="h-1 w-12 bg-gradient-to-r from-maritime-600 to-maritime-400 rounded-full"></div>
          </div>

          {/* Main Heading */}
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-lg">
              {locale === 'tr' ? 'İHTİYACIN' : 'YOUR NEED'}
            </h1>
            <div className="h-16 md:h-20 lg:h-24 flex items-center justify-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-gradient-to-r from-maritime-300 via-maritime-400 to-maritime-500 bg-clip-text transition-all duration-500 line-clamp-1 drop-shadow-lg">
                {words[currentWord].toUpperCase()}
              </h2>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-lg">
              {locale === 'tr' ? 'İSE MARINEFLUX KULLAN' : 'IS MARINEFLUX USE'}
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {locale === 'tr'
              ? 'Denizcilik tedarik zincirinin güvenilir dijital platformunda yerinizi alın. Tedarikçiler ve alıcıları bir araya getiriyor, işlemleri hızlandırıyoruz.'
              : 'Take your place in the trusted digital platform of the maritime supply chain. We bring suppliers and buyers together and accelerate processes.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
            <Link href={`/${locale}/login`}>
              <Button size="lg" className="bg-maritime-600 hover:bg-maritime-700 text-white px-6 sm:px-8 py-5 md:py-6 text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                {locale === 'tr' ? 'Hemen Başla' : 'Get Started'}
                <ArrowRightIcon className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <Button size="lg" className="border-2 border-white text-white hover:bg-white/10 px-6 sm:px-8 py-5 md:py-6 text-base md:text-lg font-semibold transition-all duration-300">
              {locale === 'tr' ? 'Nasıl Çalışır?' : 'How It Works'}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 pt-6 md:pt-8 border-t border-white/30">
            <div className="flex flex-col space-y-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-maritime-300">500+</div>
              <div className="text-xs sm:text-sm text-gray-200">
                {locale === 'tr' ? 'Tedarikçi' : 'Suppliers'}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-maritime-300">1,000+</div>
              <div className="text-xs sm:text-sm text-gray-200">
                {locale === 'tr' ? 'Ürün' : 'Products'}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-maritime-300">24/7</div>
              <div className="text-xs sm:text-sm text-gray-200">
                {locale === 'tr' ? 'Destek' : 'Support'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Portal Cards Section - Modern B2B Design
function PortalCardsSection({ locale }: { locale: string }) {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {locale === 'tr' ? 'Hangi Roldesiniz?' : 'What\'s Your Role?'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'tr'
              ? 'Size özel çözümlerle denizcilik tedarik zincirinizi dijitalleştirin'
              : 'Digitalize your maritime supply chain with tailored solutions'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Shipowner Portal */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-maritime-600 to-maritime-700 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <Card className="relative border-2 border-gray-200 hover:border-maritime-600 transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden card-hover">
              <div className="absolute top-0 right-0 w-32 h-32 bg-maritime-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <CardHeader className="space-y-4 p-8 relative">
                <div className="w-16 h-16 bg-maritime-50 rounded-xl flex items-center justify-center group-hover:bg-maritime-100 transition-colors">
                  <PackageIcon className="h-8 w-8 text-maritime-600" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                  {locale === 'tr' ? 'Gemi Sahipleri' : 'Shipowners'}
                </CardTitle>
                <CardDescription className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {locale === 'tr'
                    ? 'Filonuzun tüm ihtiyaçları için RFQ oluşturun, teklifleri karşılaştırın ve en iyi tedarikçileri bulun. Sipariş sürecinizi tek platformdan yönetin.'
                    : 'Create RFQs for all your fleet needs, compare quotations, and find the best suppliers. Manage your order process from a single platform.'}
                </CardDescription>
                
                <ul className="space-y-3 pt-4">
                  {[
                    locale === 'tr' ? 'RFQ Oluştur ve Yönet' : 'Create & Manage RFQs',
                    locale === 'tr' ? 'Teklifleri Karşılaştır' : 'Compare Quotations',
                    locale === 'tr' ? 'Doğrudan İletişim' : 'Direct Communication'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-maritime-600 flex-shrink-0" />
                      <span className="text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-3">
                  <Link href={`/${locale}/register`}>
                    <Button size="lg" className="w-full bg-maritime-600 hover:bg-maritime-700 text-white shadow-md">
                      {locale === 'tr' ? 'Gemi Sahibi Olarak Başla' : 'Start as Shipowner'}
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href={`/${locale}/login?type=shipowner`}>
                    <Button size="lg" variant="outline" className="w-full border-maritime-600 text-maritime-600 hover:bg-maritime-50">
                      {locale === 'tr' ? 'Zaten hesabım var' : 'I have an account'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supplier Portal */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <Card className="relative border-2 border-gray-200 hover:border-emerald-600 transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden card-hover">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <CardHeader className="space-y-4 p-8 relative">
                <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <PackageIcon className="h-8 w-8 text-emerald-700" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                  {locale === 'tr' ? 'Tedarikçiler' : 'Suppliers'}
                </CardTitle>
                <CardDescription className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {locale === 'tr'
                    ? 'Açık RFQ\'lara teklif verin, siparişleri yönetin ve global denizcilik pazarında yerinizi alın. Müşteri portföyünüzü genişletin.'
                    : 'Bid on open RFQs, manage orders, and take your place in the global maritime market. Expand your customer portfolio.'}
                </CardDescription>

                <ul className="space-y-3 pt-4">
                  {[
                    locale === 'tr' ? 'RFQ\'lara Teklif Ver' : 'Bid on RFQs',
                    locale === 'tr' ? 'Sipariş Yönetimi' : 'Order Management',
                    locale === 'tr' ? 'Global Pazar Erişimi' : 'Global Market Access'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-700 flex-shrink-0" />
                      <span className="text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-3">
                  <Link href={`/${locale}/register`}>
                    <Button size="lg" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-md">
                      {locale === 'tr' ? 'Tedarikçi Olarak Başla' : 'Start as Supplier'}
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href={`/${locale}/login?type=supplier`}>
                    <Button size="lg" variant="outline" className="w-full border-emerald-700 text-emerald-700 hover:bg-emerald-50">
                      {locale === 'tr' ? 'Zaten hesabım var' : 'I have an account'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// Why MarineFlux Section - Modern Feature Grid
function WhyMarineFluxSection({ locale }: { locale: string }) {
  const features = [
    {
      icon: GlobeIcon,
      title: locale === 'tr' ? 'Küresel Ağ' : 'Global Network',
      description: locale === 'tr'
        ? 'Denizcilik sektöründe dünya çapındaki tedarikçiler ve alıcılarla anında bağlantı kurun.'
        : 'Instantly connect with suppliers and buyers worldwide in the maritime sector.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Clock,
      title: locale === 'tr' ? 'Hızlı Süreçler' : 'Fast Processes',
      description: locale === 'tr'
        ? 'RFQ oluşturmadan teklif almaya, sipariş sürecine kadar her şey dijital ve hızlı.'
        : 'Everything from RFQ creation to quotation and order process is digital and fast.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: ShieldIcon,
      title: locale === 'tr' ? 'Güvenli Platform' : 'Secure Platform',
      description: locale === 'tr'
        ? 'Verileriniz ve işlemleriniz en üst düzey güvenlik standartlarıyla korunur.'
        : 'Your data and transactions are protected with the highest security standards.',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      icon: TrendingUp,
      title: locale === 'tr' ? 'Büyüme Fırsatı' : 'Growth Opportunity',
      description: locale === 'tr'
        ? 'Tedarikçiler için yeni müşteriler, alıcılar için rekabetçi fiyatlar ve geniş ürün yelpazesi.'
        : 'New customers for suppliers, competitive prices and wide product range for buyers.',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      icon: Users,
      title: locale === 'tr' ? '7/24 Destek' : '24/7 Support',
      description: locale === 'tr'
        ? 'Uzman ekibimiz her zaman yanınızda. Sorunlarınızı hızlıca çözüme kavuşturuyoruz.'
        : 'Our expert team is always with you. We quickly resolve your issues.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: PackageIcon,
      title: locale === 'tr' ? 'Geniş Ürün Yelpazesi' : 'Wide Product Range',
      description: locale === 'tr'
        ? 'Yedek parçadan ekipmana, hizmetten kimyasallara kadar her kategoride binlerce ürün.'
        : 'Thousands of products in every category from spare parts to equipment, services to chemicals.',
      color: 'text-maritime-600',
      bgColor: 'bg-maritime-50',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {locale === 'tr' ? 'Neden MarineFlux?' : 'Why MarineFlux?'}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === 'tr'
                ? 'Denizcilik sektöründe tedarik zincirini dijitalleştiren lider B2B platform'
                : 'The leading B2B platform digitalizing the supply chain in the maritime sector'}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-maritime-300 transition-all duration-300 hover:shadow-lg card-hover"
                >
                  <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Component - Modern Maritime Gradient
function Footer({ locale }: { locale: string }) {
  return (
    <footer className="bg-gradient-maritime text-white py-16 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-ocean-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <PackageIcon className="h-8 w-8 text-white" />
              <div className="text-2xl font-bold text-white">MARINEFLUX</div>
            </div>
            <p className="text-base text-gray-200 mb-6 max-w-md leading-relaxed">
              {locale === 'tr'
                ? 'Denizcilik sektörünün dijital tedarik zinciri platformu. Tedarikçiler ve gemi sahiplerini bir araya getiriyor, süreçleri hızlandırıyoruz.'
                : 'The digital supply chain platform of the maritime sector. We bring suppliers and shipowners together and accelerate processes.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-sm font-bold">Li</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-sm font-bold">X</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-sm font-bold">Fb</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">
              {locale === 'tr' ? 'Hızlı Bağlantılar' : 'Quick Links'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="text-gray-200 hover:text-white transition-colors flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" />
                  {locale === 'tr' ? 'Hakkımızda' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/login`} className="text-gray-200 hover:text-white transition-colors flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" />
                  {locale === 'tr' ? 'Giriş Yap' : 'Login'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-gray-200 hover:text-white transition-colors flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" />
                  {locale === 'tr' ? 'İletişim' : 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">
              {locale === 'tr' ? 'İletişim' : 'Contact'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-200">
                <MailIcon className="h-4 w-4 flex-shrink-0" />
                <span>info@marineflux.com</span>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-gray-200 hover:text-white transition-colors flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4 flex-shrink-0" />
                  {locale === 'tr' ? 'Hizmet Şartları' : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-gray-200 hover:text-white transition-colors flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4 flex-shrink-0" />
                  {locale === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-sm text-gray-200">
            © 2025 MarineFlux. {locale === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
          </p>
          <p className="text-xs text-gray-300 mt-2">
            {locale === 'tr' 
              ? 'Denizcilik sektörü için güvenilir B2B tedarik platformu'
              : 'Trusted B2B supply platform for the maritime sector'}
          </p>
        </div>
      </div>
    </footer>
  );
}
