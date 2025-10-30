'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { use } from 'react';
import {
  SearchIcon,
  GlobeIcon,
  ArrowRightIcon,
  MenuIcon,
  CloseIcon,
  CheckCircleIcon,
  ShieldIcon,
  MailIcon,
  PackageIcon,
} from '@/components/icons/CustomIcons';
import { Clock, TrendingUp, Users, BarChart3, Zap, Lock, Lightbulb, Layers } from 'lucide-react';
import { useState } from 'react';

export default function ShipownerProofOfWork({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation locale={locale} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection locale={locale} />

        {/* Alternating Sections */}
        <AlternatingContent locale={locale} />

        {/* CTA Section */}
        <CTASection locale={locale} />
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
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient-maritime">MARINEFLUX</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link href={locale === 'tr' ? '/en/how-it-works/shipowner' : '/tr/how-it-works/shipowner'}>
              <Button variant="ghost" size="lg" className="text-gray-600 hover:text-maritime-700">
                <GlobeIcon className="h-4 w-4 mr-2" />
                {locale === 'tr' ? 'EN' : 'TR'}
              </Button>
            </Link>

            <Link href={`/${locale}/login`}>
              <Button className="bg-maritime-600 hover:bg-maritime-700 shadow-md px-6">
                {t('common.login')}
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon className="h-6 w-6 text-gray-700" /> : <MenuIcon className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            <Link href={locale === 'tr' ? '/en/how-it-works/shipowner' : '/tr/how-it-works/shipowner'} className="block">
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

// Hero Section
function HeroSection({ locale }: { locale: string }) {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {locale === 'tr' ? 'Gemi Sahipleri İçin Proof of Work' : 'Proof of Work for Shipowners'}
          </h1>
          <p className="text-xl text-blue-100">
            {locale === 'tr'
              ? 'Denizcilik tedarik zincirinde verimlilik nasıl artar? MarineFlux\'da armatörlerin başarılarını keşfedin.'
              : 'How efficiency increases in maritime supply chain? Discover shipowner successes on MarineFlux.'}
          </p>
        </div>
      </div>
    </section>
  );
}

// Alternating Content Sections
function AlternatingContent({ locale }: { locale: string }) {
  const sections = [
    {
      id: 1,
      title: locale === 'tr' ? 'RFQ\'den Sipariş\'e' : 'From RFQ to Order',
      description: locale === 'tr'
        ? 'Filonuzun ihtiyaçlarını tanımlayın, binlerce tedarikçiden teklif alın ve en iyi seçeneği seçin. Tüm süreç dijital, hızlı ve şeffaf.'
        : 'Define your fleet needs, get quotes from thousands of suppliers, and select the best option. The entire process is digital, fast and transparent.',
      features: [
        locale === 'tr' ? '• Dakikalar içinde RFQ oluşturun' : '• Create RFQ in minutes',
        locale === 'tr' ? '• Fiyat karşılaştırması yapın' : '• Compare prices easily',
        locale === 'tr' ? '• Onaylı tedarikçilerle çalışın' : '• Work with verified suppliers',
      ],
      icon: Lightbulb,
      align: 'left',
    },
    {
      id: 2,
      title: locale === 'tr' ? 'Operasyonel Verimlilik' : 'Operational Efficiency',
      description: locale === 'tr'
        ? 'Satın alma işlemlerinizi ortalama %70 daha hızlı gerçekleştirin. Geleneksel yöntemlerle 3-4 hafta süren prosesler, artık 5-7 gün içinde tamamlanıyor.'
        : 'Complete your procurement 70% faster on average. Processes that used to take 3-4 weeks now complete in 5-7 days.',
      features: [
        locale === 'tr' ? '• Aylık maliyet tasarrufu %15' : '• 15% monthly cost savings',
        locale === 'tr' ? '• Yönetim yükü %80 azalttı' : '• 80% reduction in admin burden',
        locale === 'tr' ? '• Daha az kişi harcısı' : '• Fewer manual touches',
      ],
      icon: Clock,
      align: 'right',
    },
    {
      id: 3,
      title: locale === 'tr' ? 'Güvenli İşlemler & Ödeme' : 'Secure Transactions & Payments',
      description: locale === 'tr'
        ? 'Platform\'un finans ortakları tüm ödeme işlemlerini yönetir ve garanti altına alır. Dolandırıcılık riski neredeyse sıfır.'
        : 'Platform\'s financial partners manage and guarantee all payments. Fraud risk is virtually eliminated.',
      features: [
        locale === 'tr' ? '• Bankacı tarafından korunan ödeme' : '• Bank-protected payments',
        locale === 'tr' ? '• Anlaşmaya uyan teslimler' : '• Compliant deliveries',
        locale === 'tr' ? '• Tam muhasebe entegrasyonu' : '• Full accounting integration',
      ],
      icon: ShieldIcon,
      align: 'left',
    },
    {
      id: 4,
      title: locale === 'tr' ? 'Şeffaf & Güvenilir Tedarikçiler' : 'Transparent & Trustworthy Suppliers',
      description: locale === 'tr'
        ? 'Her tedarikçinin puan, yorum ve işlem geçmişi görünür. Bilinçli kararlar verin, hiçbir gizli maliyet yok.'
        : 'Every supplier has ratings, reviews and transaction history visible. Make informed decisions with no hidden costs.',
      features: [
        locale === 'tr' ? '• Tedarikçi puanlaması sistemi' : '• Supplier rating system',
        locale === 'tr' ? '• Gerçek müşteri yorumları' : '• Real customer reviews',
        locale === 'tr' ? '• İşlem geçmişi takibi' : '• Transaction history tracking',
      ],
      icon: TrendingUp,
      align: 'right',
    },
    {
      id: 5,
      title: locale === 'tr' ? 'Entegre Platform' : 'Integrated Platform',
      description: locale === 'tr'
        ? 'RFQ oluşturmadan sipariş yönetimine, ödemelerden takibine kadar - tüm ihtiyaçlarınız tek platformda. Çok sayıda araç kullanmaya gerek yok.'
        : 'From RFQ creation to order management, payments to tracking - all your needs in one platform. No need for multiple tools.',
      features: [
        locale === 'tr' ? '• Merkezi sipariş yönetimi' : '• Centralized order management',
        locale === 'tr' ? '• Gerçek zamanlı takip' : '• Real-time tracking',
        locale === 'tr' ? '• Raporlama & analytics' : '• Reporting & analytics',
      ],
      icon: Layers,
      align: 'left',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 sm:px-9 lg:px-14">
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          const isLeftText = section.align === 'left';

          return (
            <div key={section.id} className={`mb-20 md:mb-32 ${index !== sections.length - 1 ? 'pb-12 md:pb-20 border-b border-gray-200' : ''}`}>
              <div className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${isLeftText ? '' : 'md:auto-cols-reverse'}`}>
                {/* Text Content */}
                <div className={isLeftText ? 'md:col-span-1' : 'md:col-span-1 md:order-2'}>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {section.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {section.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {section.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <CheckCircleIcon className="h-5 w-5 text-maritime-600 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="#" className="text-maritime-600 hover:text-maritime-700 font-semibold flex items-center gap-2 transition-colors">
                    {locale === 'tr' ? 'Daha Fazla Bilgi' : 'Learn More'}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>

                {/* Visual Icon/Card */}
                <div className={isLeftText ? 'md:col-span-1 md:order-2' : 'md:col-span-1'}>
                  <div className="bg-gradient-to-br from-maritime-50 to-blue-50 rounded-2xl p-12 md:p-16 flex items-center justify-center min-h-64 md:min-h-80">
                    <IconComponent className="h-24 md:h-32 w-24 md:w-32 text-maritime-600 opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ locale }: { locale: string }) {
  return (
    <section className="bg-gradient-to-br from-maritime-600 to-maritime-800 text-white py-16 md:py-24">
      <div className="container mx-auto px-6 sm:px-9 lg:px-14">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'tr' ? 'Hemen Başlayın' : 'Get Started Today'}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {locale === 'tr'
              ? 'MarineFlux\'un tüm avantajlarından yararlanmaya başlayın. İlk RFQ\'nuz ücretsiz!'
              : 'Start enjoying all the benefits of MarineFlux. Your first RFQ is free!'}
          </p>
          <Link href={`/${locale}/login`}>
            <Button size="lg" className="bg-white text-maritime-700 hover:bg-blue-50 text-base font-semibold px-8">
              {locale === 'tr' ? 'Gemi Sahibi Olarak Kaydol' : 'Register as Shipowner'}
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer({ locale }: { locale: string }) {
  return (
    <footer className="bg-gradient-maritime text-white py-16 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-ocean-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <PackageIcon className="h-8 w-8 text-white" />
              <div className="text-2xl font-bold text-white">MARINEFLUX</div>
            </div>
            <p className="text-base text-gray-200 mb-6 max-w-md leading-relaxed">
              {locale === 'tr'
                ? 'Denizcilik sektörünün dijital tedarik zinciri platformu.'
                : 'The digital supply chain platform of the maritime sector.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-lg">
              {locale === 'tr' ? 'Hızlı Bağlantılar' : 'Quick Links'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}`} className="text-gray-200 hover:text-white transition-colors flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" />
                  {locale === 'tr' ? 'Ana Sayfa' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/login`} className="text-gray-200 hover:text-white transition-colors flex items-center gap-2">
                  <ArrowRightIcon className="h-3 w-3" />
                  {locale === 'tr' ? 'Giriş Yap' : 'Login'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-lg">
              {locale === 'tr' ? 'İletişim' : 'Contact'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-200">
                <MailIcon className="h-4 w-4 flex-shrink-0" />
                <span>info@marineflux.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-sm text-gray-200">
            © 2025 MarineFlux. {locale === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}


