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
            {/* Proof of Work Links */}
            <Link href={`/${locale}/how-it-works/shipowner`} className="text-gray-600 hover:text-maritime-700 font-medium transition-colors">
              {locale === 'tr' ? 'Armatörler' : 'Shipowners'}
            </Link>
            <Link href={`/${locale}/how-it-works/supplier`} className="text-gray-600 hover:text-maritime-700 font-medium transition-colors">
              {locale === 'tr' ? 'Tedarikçiler' : 'Suppliers'}
            </Link>

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
            <Link href={`/${locale}/how-it-works/shipowner`} className="block">
              <Button variant="ghost" size="lg" className="w-full justify-start">
                {locale === 'tr' ? 'Armatörler' : 'Shipowners'}
              </Button>
            </Link>
            <Link href={`/${locale}/how-it-works/supplier`} className="block">
              <Button variant="ghost" size="lg" className="w-full justify-start">
                {locale === 'tr' ? 'Tedarikçiler' : 'Suppliers'}
              </Button>
            </Link>
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

  const scrollToPortals = () => {
    const portalsSection = document.getElementById('portal-cards-section');
    if (portalsSection) {
      portalsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 py-2 md:py-3">
      <Card className="relative w-full auto border-0 rounded-2xl shadow-2xl overflow-hidden m-0">
        {/* Background Image Inside Card */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          <Image
            src="/images/hero-banner.png"
            alt={locale === 'tr' ? 'MarineFlux - Denizcilik Tedarik Zinciri' : 'MarineFlux - Maritime Supply Chain'}
            fill
            priority
            className="object-cover w-full h-full"
            quality={95}
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Additional Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/15 to-transparent"></div>
        </div>

        {/* Content */}
        <CardContent className="p-0 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 min-h-[500px] md:min-h-[650px] flex flex-col items-start justify-center">
            <div className="max-w-xl text-left w-full space-y-5 md:space-y-6">
              {/* Main Heading */}
              <div className="space-y-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white drop-shadow-lg">
                  {locale === 'tr' ? 'İHTİYACIN' : 'YOUR NEED'}
                </h1>
                <div className="min-h-12 md:min-h-16 flex items-center justify-start overflow-visible -my-0.5 md:-my-1">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white transition-all duration-500 drop-shadow-lg">
                    {locale === 'tr' ? words[currentWord].toLocaleUpperCase('tr-TR') : words[currentWord].toUpperCase()}
                  </h2>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white drop-shadow-lg -mt-1">
                  {locale === 'tr' ? 'İSE MARINEFLUX KULLAN' : 'IS MARINEFLUX USE'}
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg text-gray-100 max-w-md leading-relaxed drop-shadow-md">
                {locale === 'tr'
                  ? 'Denizcilik tedarik zincirinin güvenilir dijital platformunda yerinizi alın. Tedarikçiler ve alıcıları bir araya getiriyor, işlemleri hızlandırıyoruz.'
                  : 'Take your place in the trusted digital platform of the maritime supply chain. We bring suppliers and buyers together and accelerate processes.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start">
                <Link href={`/${locale}/login`}>
                  <Button size="lg" className="bg-maritime-600 hover:bg-maritime-700 text-white px-5 sm:px-6 py-3 md:py-4 text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                    {locale === 'tr' ? 'Hemen Başla' : 'Get Started'}
                    <ArrowRightIcon className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </Link>
                <Button size="lg" className="border-2 border-white text-white hover:bg-white/10 px-5 sm:px-6 py-3 md:py-4 text-sm md:text-base font-semibold transition-all duration-300">
                  {locale === 'tr' ? 'Nasıl Çalışır?' : 'How It Works'}
                </Button>
              </div>

              {/* Scroll Down Button */}
              <button
                onClick={scrollToPortals}
                className="relative top-4 md:top-6"
              >
                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full border-2 border-white text-white hover:border-maritime-300 hover:text-maritime-300 transition-all duration-300 animate-slow-pulse shadow-lg shadow-white/30">
                  <ArrowRightIcon className="h-5 w-5 transform rotate-90" />
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// Portal Cards Section - Modern B2B Design
function PortalCardsSection({ locale }: { locale: string }) {
  return (
    <section id="portal-cards-section" className="py-4 md:py-5 pb-6 md:pb-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Shipowner Portal */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <Card className="relative bg-gradient-to-br from-slate-900 to-blue-950 border-0 text-white shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden card-hover">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <CardHeader className="space-y-4 p-8 relative">
                <CardTitle className="text-2xl md:text-3xl font-bold text-white">
                  {locale === 'tr' ? 'Gemi Sahipleri' : 'Shipowners'}
                </CardTitle>
                <CardDescription className="text-base md:text-lg text-blue-100 leading-relaxed">
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
                    <li key={idx} className="flex items-center gap-2 text-blue-100">
                      <CheckCircleIcon className="h-5 w-5 text-blue-300 flex-shrink-0" />
                      <span className="text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardHeader>
            </Card>
          </div>

          {/* Supplier Portal */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <Card className="relative bg-gradient-to-br from-slate-900 to-blue-950 border-0 text-white shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden card-hover">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <CardHeader className="space-y-4 p-8 relative">
                <CardTitle className="text-2xl md:text-3xl font-bold text-white">
                  {locale === 'tr' ? 'Tedarikçiler' : 'Suppliers'}
                </CardTitle>
                <CardDescription className="text-base md:text-lg text-blue-100 leading-relaxed">
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
                    <li key={idx} className="flex items-center gap-2 text-blue-100">
                      <CheckCircleIcon className="h-5 w-5 text-blue-300 flex-shrink-0" />
                      <span className="text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardHeader>
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
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, index) => {
              return (
                <div 
                  key={index} 
                  className="group p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-maritime-300 transition-all duration-300 hover:shadow-lg card-hover"
                >
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
