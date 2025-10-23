'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Mail,
  FileText,
  Shield,
  ArrowRight,
  Menu,
  X,
  Clock,
} from 'lucide-react';
import { useState, useEffect, use } from 'react';

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
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-xl md:text-2xl font-bold text-gray-900">MARINEFLUX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" disabled className="text-gray-600">
              {locale === 'tr' ? 'Kategoriler' : 'Categories'}
            </Button>
            
            {/* Search Bar */}
            <div className="relative hidden lg:block">
              <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 w-80 bg-gray-50">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder={locale === 'tr' ? 'Ürünleri, hizmetleri ara...' : 'Search products, services...'}
                  className="outline-none text-sm w-full bg-transparent"
                  disabled
                />
              </div>
            </div>

            {/* Language Switcher */}
            <Link href={locale === 'tr' ? '/en' : '/tr'}>
              <Button variant="ghost" size="sm">
                {locale === 'tr' ? '🇹🇷' : '🇬🇧'}
              </Button>
            </Link>

            {/* Login Button */}
            <Link href={`/${locale}/login`}>
              <Button variant="default">
                {t('common.login')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link href={locale === 'tr' ? '/en' : '/tr'} className="block">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                {locale === 'tr' ? '🇬🇧 English' : '🇹🇷 Türkçe'}
              </Button>
            </Link>
            <Link href={`/${locale}/login`} className="block">
              <Button className="w-full">
                {t('common.login')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section with Animated Text
function HeroSection({ locale }: { locale: string }) {
  const [currentWord, setCurrentWord] = useState(0);
  const words = locale === 'tr' 
    ? ['DENİZCİLİKLE', 'GEMİYLE', 'FİLOYLA', 'TEDARİKLE', 'EL ALETLERİ', 'SÖRVEY HİZMETLERİ', 'IGÜ', 'BOYA', 'MAKINE YAĞLARI']
    : ['MARITIME', 'VESSEL', 'FLEET', 'SUPPLY', 'HAND TOOLS', 'SURVEY SERVICES', 'IGÜ', 'PAINT', 'ENGINE OILS'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Heading */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-700 mb-10 md:mb-12">
            {locale === 'tr' 
              ? "Türkiye'nin ilk ve tek denizcilik sektörü b2b platformu"
              : "Turkey's first and only maritime sector b2b platform"}
          </h2>

          {/* Animated Text */}
          <div className="mb-10 md:mb-12 min-h-[140px] md:min-h-[180px] flex items-center justify-center">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-2">
                <span>{locale === 'tr' ? 'İHTİYACIN' : 'YOUR NEED'}</span>
                <span className="text-blue-600 min-w-[180px] sm:min-w-[250px] md:min-w-[350px] lg:min-w-[450px] inline-block transition-all duration-300 text-center">
                  {words[currentWord]}
                </span>
                <span>{locale === 'tr' ? 'İSE' : 'IS'}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
                <span className="text-blue-600">MARINEFLUX</span>
                <span>{locale === 'tr' ? 'KULLAN' : 'USE'}</span>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'tr'
              ? 'Denizcilik tedarik zincirinin güvenilir dijital platformunda yerinizi alın'
              : 'Take your place in the trusted digital platform of the maritime supply chain'}
          </p>
        </div>
      </div>
    </section>
  );
}

// Portal Cards Section
function PortalCardsSection({ locale }: { locale: string }) {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Buyer Portal */}
          <Card className="border border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg rounded-xl">
            <CardHeader className="space-y-3 p-6">
              <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900">
                {locale === 'tr' ? 'Alıcı Portalı' : 'Buyer Portal'}
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-gray-600 leading-relaxed">
                {locale === 'tr'
                  ? 'Kapsamlı arama ve filtreleme ile binlerce kaliteli gemi malzemesine erişin. Filonuzun ihtiyaçlarını, nerede olursanız olun tam olarak bulun.'
                  : 'Access thousands of quality ship materials with comprehensive search and filtering. Find exactly what your fleet needs, wherever you are.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Button variant="outline" disabled className="w-full rounded-lg border-gray-300 text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                <span>{locale === 'tr' ? 'Yakında' : 'Coming Soon'}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Seller Portal */}
          <Card className="border border-gray-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg rounded-xl">
            <CardHeader className="space-y-3 p-6">
              <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900">
                {locale === 'tr' ? 'Satıcı Portalı' : 'Seller Portal'}
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-gray-600 leading-relaxed">
                {locale === 'tr'
                  ? 'Denizcilik sektöründe binlerce potansiyel alıcıyla bağlantı kurun. Ürünlerinizi küresel bir denizcilik şirketleri ağına tanıtın.'
                  : 'Connect with thousands of potential buyers in the maritime sector. Introduce your products to a global network of maritime companies.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Link href={`/${locale}/login?type=supplier`}>
                <Button className="w-full bg-green-600 hover:bg-green-700 rounded-lg">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>{locale === 'tr' ? 'Ürün Sat' : 'Sell Products'}</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// Why MarineFlux Section
function WhyMarineFluxSection({ locale }: { locale: string }) {
  const features = [
    {
      title: locale === 'tr' ? 'Küresel Ağ' : 'Global Network',
      description: locale === 'tr'
        ? 'Denizcilik sektöründe dünya çapındaki tedarikçiler ve alıcılarla bağlantı kurun.'
        : 'Connect with suppliers and buyers worldwide in the maritime sector.',
    },
    {
      title: locale === 'tr' ? 'Özel Katalog' : 'Specialized Catalog',
      description: locale === 'tr'
        ? 'Motor parçalarından navigasyon ekipmanlarına kadar binlerce denizcilik ürününe ve hizmetine göz atın.'
        : 'Browse thousands of maritime products and services, from engine parts to navigation equipment.',
    },
    {
      title: locale === 'tr' ? 'Hızlı İletişim' : 'Fast Communication',
      description: locale === 'tr'
        ? 'Teklif istemek, şartları görüşmek ve teknik özellikleri tartışmak için tedarikçilerle hızlı ve doğrudan iletişim kurun.'
        : 'Communicate quickly and directly with suppliers to request quotes, discuss terms and technical specifications.',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              {locale === 'tr' ? 'Neden MarineFlux?' : 'Why MarineFlux?'}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              {locale === 'tr'
                ? 'Denizcilik sektöründe tedarikçileri ve alıcıları doğrudan buluşturan en kapsamlı pazar yeri'
                : 'The most comprehensive marketplace directly connecting suppliers and buyers in the maritime sector'}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer({ locale }: { locale: string }) {
  return (
    <footer className="bg-[#042c52] text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="text-xl font-bold text-white mb-4">MARINEFLUX</div>
            <p className="text-sm text-gray-300">
              {locale === 'tr'
                ? 'Filonuzun tüm ihtiyaçlarını tek bir platformda alın ve satın.'
                : 'Buy and sell all your fleet needs on one platform.'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {locale === 'tr' ? 'İletişim' : 'Contact'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>info@marineflux.com</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <Link href={`/${locale}/about`} className="text-gray-300 hover:text-white">
                  {locale === 'tr' ? 'Hakkımızda' : 'About Us'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {locale === 'tr' ? 'Yasal' : 'Legal'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Link href={`/${locale}/terms`} className="text-gray-300 hover:text-white">
                  {locale === 'tr' ? 'Hizmet Şartları' : 'Terms of Service'}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Link href={`/${locale}/privacy`} className="text-gray-300 hover:text-white">
                  {locale === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
          <p>© 2025 MarineFlux. {locale === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
