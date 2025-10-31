'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  FileText, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface RFQ {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  deadline: string;
  quotationCount: number;
  mainCategory?: string;
  category?: string;
}

interface Quotation {
  id: string;
  rfqId: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
  rfqCategory?: string;
}

interface Order {
  id: string;
  rfqId: string;
  quotationId: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  category?: string;
}

// Dashboard renk paleti
const COLORS = {
  rfq: ['#1e3a8a', '#0891b2'], // blue-900, cyan-600
  quotation: ['#581c87', '#6366f1'], // purple-900, indigo-500
  order: ['#134e4a', '#0891b2'], // teal-900, cyan-600
  urgent: ['#9a3412', '#991b1b'], // orange-800, red-800
  slate: ['#1e293b', '#0f172a'], // slate-800, slate-900
  success: '#14b8a6', // teal-500
  pending: '#06b6d4', // cyan-500
  rejected: '#ea580c', // orange-600
};

const CHART_COLORS = [
  '#1e40af', // blue-800
  '#7c3aed', // purple-600
  '#0d9488', // teal-600
  '#0891b2', // cyan-600
  '#ea580c', // orange-600
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
];

export default function ShipownerAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchAnalyticsData();
    }
  }, [user?.uid]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch RFQs
      const rfqResponse = await fetch(`/api/rfq/list?uid=${user?.uid}&role=shipowner&limit=1000`);
      const rfqData = await rfqResponse.json();
      if (rfqData.success) {
        setRfqs(rfqData.rfqs);
      }

      // Fetch Quotations
      const quotResponse = await fetch(`/api/quotation/list?shipownerUid=${user?.uid}`);
      const quotData = await quotResponse.json();
      if (quotData.success) {
        setQuotations(quotData.quotations);
      }

      // Fetch Orders
      const orderResponse = await fetch(`/api/order/list?shipownerUid=${user?.uid}`);
      const orderData = await orderResponse.json();
      if (orderData.success) {
        setOrders(orderData.orders);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive statistics
  const calculateStats = () => {
    const totalRFQs = rfqs.length;
    const openRFQs = rfqs.filter(r => r.status === 'open').length;
    const awardedRFQs = rfqs.filter(r => r.status === 'awarded').length;
    const closedRFQs = rfqs.filter(r => r.status === 'closed').length;

    const totalQuotations = quotations.length;
    const pendingQuotations = quotations.filter(q => q.status === 'pending').length;
    const acceptedQuotationsList = quotations.filter(q => q.status === 'accepted');
    const acceptedQuotations = acceptedQuotationsList.length;
    const rejectedQuotations = quotations.filter(q => q.status === 'rejected').length;

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
    const activeOrders = orders.filter(o => ['in_progress', 'confirmed', 'ready', 'shipped'].includes(o.status)).length;
    const pendingOrders = orders.filter(o => ['pending', 'pending_payment'].includes(o.status)).length;

    // Financial metrics
    const totalSpent = orders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, o) => sum + (o.amount || 0), 0);
    
    const pendingAmount = orders
      .filter(o => ['pending', 'pending_payment', 'in_progress', 'confirmed'].includes(o.status))
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const avgOrderValue = completedOrders > 0 ? totalSpent / completedOrders : 0;

    // Time-based statistics
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const rfqsLast30Days = rfqs.filter(r => new Date(r.createdAt) >= last30Days).length;
    const ordersLast30Days = orders.filter(o => new Date(o.createdAt) >= last30Days).length;
    const spendingLast30Days = orders
      .filter(o => new Date(o.createdAt) >= last30Days && (o.status === 'completed' || o.status === 'delivered'))
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    // Average quotation response time
    let avgResponseTime = 0;
    const responseTimes: number[] = [];
    acceptedQuotationsList.forEach(q => {
      const rfq = rfqs.find(r => r.id === q.rfqId);
      if (rfq) {
        const rfqDate = new Date(rfq.createdAt);
        const quotDate = new Date(q.createdAt);
        const days = (quotDate.getTime() - rfqDate.getTime()) / (1000 * 60 * 60 * 24);
        if (days > 0) responseTimes.push(days);
      }
    });
    if (responseTimes.length > 0) {
      avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }

    // Award rate and acceptance rate
    const awardRate = totalRFQs > 0 ? (awardedRFQs / totalRFQs) * 100 : 0;
    const acceptanceRate = totalQuotations > 0 ? (acceptedQuotations / totalQuotations) * 100 : 0;

    return {
      rfqs: {
        total: totalRFQs,
        open: openRFQs,
        awarded: awardedRFQs,
        closed: closedRFQs,
        last30Days: rfqsLast30Days,
      },
      quotations: {
        total: totalQuotations,
        pending: pendingQuotations,
        accepted: acceptedQuotations,
        rejected: rejectedQuotations,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        active: activeOrders,
        pending: pendingOrders,
        last30Days: ordersLast30Days,
      },
      financial: {
        totalSpent,
        pendingAmount,
        avgOrderValue,
        spendingLast30Days,
      },
      metrics: {
        awardRate: Math.round(awardRate * 10) / 10,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      },
    };
  };

  // Prepare chart data
  const prepareChartData = () => {
    const now = new Date();
    
    // RFQ Trend (Last 6 months)
    const rfqTrendData: { month: string; rfqs: number; awarded: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRFQs = rfqs.filter(r => {
        const created = new Date(r.createdAt);
        return created >= monthStart && created <= monthEnd;
      }).length;
      
      const monthAwarded = rfqs.filter(r => {
        const created = new Date(r.createdAt);
        return created >= monthStart && created <= monthEnd && r.status === 'awarded';
      }).length;
      
      rfqTrendData.push({
        month: date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { month: 'short' }),
        rfqs: monthRFQs,
        awarded: monthAwarded,
      });
    }

    // Order Status Distribution
    const orderStatusData = [
      { name: locale === 'tr' ? 'Tamamlanan' : 'Completed', value: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length },
      { name: locale === 'tr' ? 'Aktif' : 'Active', value: orders.filter(o => ['in_progress', 'confirmed', 'ready', 'shipped'].includes(o.status)).length },
      { name: locale === 'tr' ? 'Bekleyen' : 'Pending', value: orders.filter(o => ['pending', 'pending_payment'].includes(o.status)).length },
    ];

    // Quotation Status Distribution
    const quotationStatusData = [
      { name: locale === 'tr' ? 'Kabul Edilen' : 'Accepted', value: quotations.filter(q => q.status === 'accepted').length },
      { name: locale === 'tr' ? 'Bekleyen' : 'Pending', value: quotations.filter(q => q.status === 'pending').length },
      { name: locale === 'tr' ? 'Reddedilen' : 'Rejected', value: quotations.filter(q => q.status === 'rejected').length },
    ];

    // Spending Over Time (Last 6 months)
    const spendingData: { month: string; spent: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = orders.filter(o => {
        const created = new Date(o.createdAt);
        return created >= monthStart && created <= monthEnd && (o.status === 'completed' || o.status === 'delivered');
      });
      
      const monthSpent = monthOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      
      spendingData.push({
        month: date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { month: 'short' }),
        spent: monthSpent,
        orders: monthOrders.length,
      });
    }

    // Category Distribution
    const categoryCounts = orders.reduce((acc: Record<string, number>, order) => {
      const cat = order.category || (locale === 'tr' ? 'Diğer' : 'Other');
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 8)
      .map(([name, value]) => ({ name, value: value as number }));

    // RFQ Status Distribution
    const rfqStatusData = [
      { name: locale === 'tr' ? 'Açık' : 'Open', value: rfqs.filter(r => r.status === 'open').length },
      { name: locale === 'tr' ? 'Verildi' : 'Awarded', value: rfqs.filter(r => r.status === 'awarded').length },
      { name: locale === 'tr' ? 'Kapalı' : 'Closed', value: rfqs.filter(r => r.status === 'closed').length },
    ];

    return {
      rfqTrend: rfqTrendData,
      orderStatus: orderStatusData,
      quotationStatus: quotationStatusData,
      spending: spendingData,
      categories: categoryData,
      rfqStatus: rfqStatusData,
    };
  };

  const stats = calculateStats();
  const chartData = prepareChartData();

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
        <DashboardLayout locale={locale} userType="shipowner">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">{locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['shipowner']} locale={locale}>
      <DashboardLayout locale={locale} userType="shipowner">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'tr' ? 'Analizler' : 'Analytics'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {locale === 'tr' 
                ? 'Tedarik süreçlerinizin detaylı analizi ve istatistikleri'
                : 'Detailed analysis and statistics of your procurement processes'}
            </p>
          </div>

          {/* Key Metrics - Dashboard Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-900 to-cyan-950 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'TOPLAM RFQ' : 'TOTAL RFQs'}
                    </p>
                    <div className="text-3xl font-bold text-white">{stats.rfqs.total}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'Son 30 gün: ' : 'Last 30 days: '}
                      <span className="font-semibold">{stats.rfqs.last30Days}</span>
                    </p>
                  </div>
                  <FileText className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900 to-indigo-950 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'TOPLAM TEKLİF' : 'TOTAL QUOTATIONS'}
                    </p>
                    <div className="text-3xl font-bold text-white">{stats.quotations.total}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'Kabul Oranı: ' : 'Acceptance: '}
                      <span className="font-semibold">{stats.metrics.acceptanceRate}%</span>
                    </p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-900 to-cyan-950 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'TOPLAM SİPARİŞ' : 'TOTAL ORDERS'}
                    </p>
                    <div className="text-3xl font-bold text-white">{stats.orders.total}</div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'Tamamlanan: ' : 'Completed: '}
                      <span className="font-semibold">{stats.orders.completed}</span>
                    </p>
                  </div>
                  <Package className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      {locale === 'tr' ? 'TOPLAM HARCAMA' : 'TOTAL SPENT'}
                    </p>
                    <div className="text-3xl font-bold text-white">
                      ${stats.financial.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {locale === 'tr' ? 'Ortalama: ' : 'Average: '}
                      <span className="font-semibold">
                        ${stats.financial.avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-white opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RFQ Trend */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {locale === 'tr' ? 'RFQ Trendi (Son 6 Ay)' : 'RFQ Trend (Last 6 Months)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.rfqTrend}>
                    <defs>
                      <linearGradient id="colorRfqs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e40af" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAwarded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="rfqs" stroke="#1e40af" fillOpacity={1} fill="url(#colorRfqs)" name={locale === 'tr' ? 'RFQ Sayısı' : 'RFQ Count'} />
                    <Area type="monotone" dataKey="awarded" stroke="#14b8a6" fillOpacity={1} fill="url(#colorAwarded)" name={locale === 'tr' ? 'Verilen' : 'Awarded'} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Spending Over Time */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {locale === 'tr' ? 'Harcama Trendi (Son 6 Ay)' : 'Spending Trend (Last 6 Months)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.spending}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="spent" stroke="#0891b2" fillOpacity={1} fill="url(#colorSpent)" name={locale === 'tr' ? 'Harcama ($)' : 'Spending ($)'} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {locale === 'tr' ? 'Sipariş Durumu Dağılımı' : 'Order Status Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.orderStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.orderStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quotation Status Distribution */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {locale === 'tr' ? 'Teklif Durumu Dağılımı' : 'Quotation Status Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.quotationStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Additional Statistics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* RFQ Statistics */}
            <Card className="bg-gradient-to-br from-blue-900 to-cyan-950 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {locale === 'tr' ? 'RFQ İstatistikleri' : 'RFQ Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Açık RFQ' : 'Open RFQs'}</span>
                  <span className="text-xl font-bold text-white">{stats.rfqs.open}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Verilen RFQ' : 'Awarded RFQs'}</span>
                  <span className="text-xl font-bold text-white">{stats.rfqs.awarded}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Kapalı RFQ' : 'Closed RFQs'}</span>
                  <span className="text-xl font-bold text-white">{stats.rfqs.closed}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Verme Oranı' : 'Award Rate'}</span>
                  <span className="text-xl font-bold text-white">{stats.metrics.awardRate}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quotation Statistics */}
            <Card className="bg-gradient-to-br from-purple-900 to-indigo-950 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {locale === 'tr' ? 'Teklif İstatistikleri' : 'Quotation Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Bekleyen' : 'Pending'}</span>
                  <span className="text-xl font-bold text-white">{stats.quotations.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Kabul Edilen' : 'Accepted'}</span>
                  <span className="text-xl font-bold text-white">{stats.quotations.accepted}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Reddedilen' : 'Rejected'}</span>
                  <span className="text-xl font-bold text-white">{stats.quotations.rejected}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Ort. Cevap Süresi' : 'Avg Response'}</span>
                  <span className="text-xl font-bold text-white">{stats.quotations.avgResponseTime}g</span>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card className="bg-gradient-to-br from-teal-900 to-cyan-950 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {locale === 'tr' ? 'Finansal Özet' : 'Financial Overview'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Bekleyen Tutar' : 'Pending Amount'}</span>
                  <span className="text-xl font-bold text-white">
                    ${stats.financial.pendingAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Son 30 Gün' : 'Last 30 Days'}</span>
                  <span className="text-xl font-bold text-white">
                    ${stats.financial.spendingLast30Days.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Ort. Sipariş' : 'Avg Order'}</span>
                  <span className="text-xl font-bold text-white">
                    ${stats.financial.avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-sm text-gray-300">{locale === 'tr' ? 'Toplam Sipariş' : 'Total Orders'}</span>
                  <span className="text-xl font-bold text-white">{stats.orders.total}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution Chart */}
          {chartData.categories.length > 0 && (
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {locale === 'tr' ? 'Kategori Dağılımı' : 'Category Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData.categories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={150} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#0d9488" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
