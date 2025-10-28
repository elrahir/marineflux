'use client';

import { useTranslations } from 'next-intl';
import { FileText, MessageSquare, Package, CreditCard, ChevronRight } from 'lucide-react';

interface WorkflowData {
  rfqOpen: number;
  quotationPending: number;
  quotationAccepted: number;
  ordersActive: {
    pending: number;
    confirmed: number;
    inProgress: number;
    shipped: number;
    total: number;
  };
  ordersCompleted: number;
  paymentPending: number;
  paymentCompleted: number;
}

interface WorkflowVisualizationProps {
  data: WorkflowData;
  locale: string;
}

export function WorkflowVisualization({ data, locale }: WorkflowVisualizationProps) {
  const StageItem = ({
    icon: Icon,
    title,
    main,
    secondary,
    mainColor,
  }: {
    icon: any;
    title: string;
    main: string | number;
    secondary?: string;
    mainColor: string;
  }) => (
    <div className="flex items-center gap-3 flex-1">
      <div className={`flex-shrink-0 p-2.5 rounded-lg ${mainColor}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-xl font-bold text-gray-900">{main}</p>
          {secondary && <p className="text-xs text-gray-500">{secondary}</p>}
        </div>
      </div>
    </div>
  );

  const Separator = () => (
    <div className="flex items-center px-2">
      <ChevronRight className="h-5 w-5 text-gray-300" />
    </div>
  );

  return (
    <div className="w-full">
      {/* Horizontal Workflow */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {/* RFQ */}
          <StageItem
            icon={FileText}
            title={locale === 'tr' ? 'RFQ' : 'RFQ'}
            main={data.rfqOpen}
            secondary={locale === 'tr' ? 'açık' : 'open'}
            mainColor="bg-maritime-700"
          />

          <Separator />

          {/* Quotation */}
          <StageItem
            icon={MessageSquare}
            title={locale === 'tr' ? 'Teklif' : 'Quote'}
            main={data.quotationPending + data.quotationAccepted}
            secondary={`${data.quotationPending}🔄 ${data.quotationAccepted}✓`}
            mainColor="bg-ocean-600"
          />

          <Separator />

          {/* Orders */}
          <StageItem
            icon={Package}
            title={locale === 'tr' ? 'Sipariş' : 'Order'}
            main={data.ordersActive.total + data.ordersCompleted}
            secondary={
              <div className="text-xs space-y-0.5">
                {data.ordersActive.pending > 0 && (
                  <div>{locale === 'tr' ? 'Beklemede' : 'Pending'}: <span className="font-semibold">{data.ordersActive.pending}</span></div>
                )}
                {data.ordersActive.confirmed > 0 && (
                  <div>{locale === 'tr' ? 'Onaylı' : 'Confirmed'}: <span className="font-semibold">{data.ordersActive.confirmed}</span></div>
                )}
                {data.ordersActive.inProgress > 0 && (
                  <div>{locale === 'tr' ? 'Hazırlanıyor' : 'In Progress'}: <span className="font-semibold">{data.ordersActive.inProgress}</span></div>
                )}
                {data.ordersActive.shipped > 0 && (
                  <div>{locale === 'tr' ? 'Kargoda' : 'Shipped'}: <span className="font-semibold">{data.ordersActive.shipped}</span></div>
                )}
                {data.ordersCompleted > 0 && (
                  <div className="text-slate-700">{locale === 'tr' ? 'Tamamlı' : 'Completed'}: <span className="font-semibold">{data.ordersCompleted}</span></div>
                )}
              </div>
            }
            mainColor="bg-slate-700"
          />

          <Separator />

          {/* Payments */}
          <StageItem
            icon={CreditCard}
            title={locale === 'tr' ? 'Ödeme' : 'Payment'}
            main={data.paymentPending + data.paymentCompleted}
            secondary={`${data.paymentPending}⏳ ${data.paymentCompleted}✓`}
            mainColor="bg-slate-800"
          />
        </div>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        {locale === 'tr'
          ? '🔄 = Bekleme  •  ✓ = Tamamlandı'
          : '🔄 = Pending  •  ✓ = Completed'}
      </p>
    </div>
  );
}
