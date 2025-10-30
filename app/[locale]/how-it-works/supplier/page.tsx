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

export default function SupplierProofOfWork({ params }: { params: Promise<{ locale: string }> }) {
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
            <Link href={locale === 'tr' ? '/en/how-it-works/supplier' : '/tr/how-it-works/supplier'}>
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
            <Link href={locale === 'tr' ? '/en/how-it-works/supplier' : '/tr/how-it-works/supplier'} className="block">
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
    <section className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {locale === 'tr' ? 'Tedarikçiler İçin Proof of Work' : 'Proof of Work for Suppliers'}
          </h1>
          <p className="text-xl text-teal-100">
            {locale === 'tr'
              ? 'İşinizi nasıl büyütürsünüz? MarineFlux\'da yeni müşteriler bulmanın ve pazar payınızı artırmanın yolunu keşfedin.'
              : 'How do you grow your business? Discover how to find new customers and expand your market share on MarineFlux.'}
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
      title: locale === 'tr' ? 'Yeni Müşteri Akışı' : 'Constant Customer Flow',
      description: locale === 'tr'
        ? 'Binlerce potansiyel müşteri (gemi sahipleri ve operatörler) sürekli olarak platform üzerinden arama yapıyor. Hiç hiçbir satış çabasıyla binlerce uygun müşteriye ulaşın.'
        : 'Thousands of potential customers (shipowners and operators) are continuously searching on the platform. Reach thousands of qualified customers without extensive sales efforts.',
      features: [
        locale === 'tr' ? '• Doğrudan müşteri taleplerini alın' : '• Receive direct customer requests',
        locale === 'tr' ? '• Nitelikli müşterilerle çalışın' : '• Work with qualified customers',
        locale === 'tr' ? '• Aktif alıcıların bulunduğu ortam' : '• Active buyer environment',
      ],
      icon: Users,
      align: 'left',
    },
    {
      id: 2,
      title: locale === 'tr' ? 'Teklifleriniz Görülüyor' : 'Maximum Visibility',
      description: locale === 'tr'
        ? 'Teklifleriniz binlerce potansiyel müşteri tarafından değerlendirilir. Yüksek profil görünürlüğü = daha fazla fırsatlar ve siparişler.'
        : 'Your quotations are evaluated by thousands of potential customers. High profile visibility = more opportunities and orders.',
      features: [
        locale === 'tr' ? '• 360° müşteri görünürlüğü' : '• 360° customer visibility',
        locale === 'tr' ? '• Rekabetçi teklif analizi' : '• Competitive quote analysis',
        locale === 'tr' ? '• Müşteri geri bildirimi' : '• Customer feedback',
      ],
      icon: Zap,
      align: 'right',
    },
    {
      id: 3,
      title: locale === 'tr' ? 'Düşük Pazarlama Maliyeti' : 'Low Marketing Costs',
      description: locale === 'tr'
        ? 'Geleneksel pazarlama ve satış çok pahalıdır. MarineFlux\'ta, müşteri başına pazarlama gideri minimum - sonuçlar konuşur.'
        : 'Traditional marketing and sales are expensive. On MarineFlux, marketing cost per customer is minimal - results speak for themselves.',
      features: [
        locale === 'tr' ? '• Pay-per-result modeli' : '• Pay-per-result model',
        locale === 'tr' ? '• Düşük giriş ücretleri' : '• Low entry fees',
        locale === 'tr' ? '• Yüksek ROI' : '• High ROI',
      ],
      icon: TrendingUp,
      align: 'left',
    },
    {
      id: 4,
      title: locale === 'tr' ? 'Güvenli Ödemeler' : 'Guaranteed Payments',
      description: locale === 'tr'
        ? 'Platform\'un finans ortakları ödeme işlemlerini yönetir. Ödeme riskini ortadan kaldırın, güvenle büyüyün.'
        : 'Platform\'s financial partners manage payments. Eliminate payment risk, grow with confidence.',
      features: [
        locale === 'tr' ? '• Bankacı tarafından garanti' : '• Bank-guaranteed',
        locale === 'tr' ? '• Hızlı ödeme işlemleri' : '• Fast payment processing',
        locale === 'tr' ? '• Ödeme koruması' : '• Payment protection',
      ],
      icon: ShieldIcon,
      align: 'right',
    },
    {
      id: 5,
      title: locale === 'tr' ? 'Küresel Pazar Erişimi' : 'Global Market Access',
      description: locale === 'tr'
        ? 'Sadece yerel pazarla değil, dünya çapında gemi sahipleriyle iş yapma fırsatı. Uluslararası ticaret basitleştirilmiş.'
        : 'Opportunity to do business not just in local markets but with shipowners worldwide. International trade made simple.',
      features: [
        locale === 'tr' ? '• Çok dilli platform' : '• Multilingual platform',
        locale === 'tr' ? '• 100+ ülke erişimi' : '• 100+ country access',
        locale === 'tr' ? '• Uluslararası lojistik' : '• International logistics',
      ],
      icon: Lightbulb,
      align: 'left',
    },
    {
      id: 6,
      title: locale === 'tr' ? 'Şüphe & Itibar İnşa' : 'Build Trust & Reputation',
      description: locale === 'tr'
        ? 'Her başarılı siparişte, müşteri yorumları ve puanlarınız artar. Yüksek puanlar = daha fazla müşteri = daha fazla siparişler.'
        : 'With every successful order, customer reviews and ratings increase. Higher ratings = more customers = more orders.',
      features: [
        locale === 'tr' ? '• Tedarikçi puanlama sistemi' : '• Supplier rating system',
        locale === 'tr' ? '• Gerçek müşteri incelemesi' : '• Real customer reviews',
        locale === 'tr' ? '• İtibar yönetimi' : '• Reputation management',
      ],
      icon: Layers,
      align: 'right',
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
                        <CheckCircleIcon className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="#" className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-2 transition-colors">
                    {locale === 'tr' ? 'Daha Fazla Bilgi' : 'Learn More'}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>

                {/* Visual Icon/Card */}
                <div className={isLeftText ? 'md:col-span-1 md:order-2' : 'md:col-span-1'}>
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-12 md:p-16 flex items-center justify-center min-h-64 md:min-h-80">
                    <IconComponent className="h-24 md:h-32 w-24 md:w-32 text-teal-600 opacity-80" />
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
    <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-16 md:py-24">
      <div className="container mx-auto px-6 sm:px-9 lg:px-14">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'tr' ? 'İşinizi Büyütün' : 'Grow Your Business'}
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            {locale === 'tr'
              ? 'Şimdi kaydolun ve binlerce potansiyel müşteriye ulaşmaya başlayın. İlk teklif göndermek tamamen ücretsiz!'
              : 'Register now and start reaching thousands of potential customers. Sending your first quotation is completely free!'}
          </p>
          <Link href={`/${locale}/login`}>
            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 text-base font-semibold px-8">
              {locale === 'tr' ? 'Tedarikçi Olarak Kaydol' : 'Register as Supplier'}
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
