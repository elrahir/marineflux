// Supplier Type
export type SupplierType = 'supplier' | 'service-provider';

// SUPPLIERS CATEGORIES (Tedarikçiler)
export const SUPPLIER_MAIN_CATEGORIES = [
  { id: 'chandler', labelTr: 'Kaptanlık Malzemeleri', labelEn: 'Chandler' },
  { id: 'spares', labelTr: 'Yedek Parçalar', labelEn: 'Spares' },
  { id: 'fire-safety', labelTr: 'İtfaiye & Güvenlik', labelEn: 'Fire & Safety' },
  { id: 'electrical', labelTr: 'Elektrik & Otomasyon', labelEn: 'Electrical & Automation' },
  { id: 'paints', labelTr: 'Boyalar', labelEn: 'Paints' },
  { id: 'lubricants-oil', labelTr: 'Yağlayıcılar/Yağ', labelEn: 'Lubricants/Oil' },
  { id: 'chemicals', labelTr: 'Kimyasallar', labelEn: 'Chemicals' },
  { id: 'ropes-anchors', labelTr: 'Halatlar & Zincirler', labelEn: 'Ropes & Anchors' },
  { id: 'nautical-charts', labelTr: 'Deniz Haritaları & Yayınlar', labelEn: 'Nautical Charts & Publications' },
  { id: 'medical', labelTr: 'Tıbbi Malzeme', labelEn: 'Medical' },
  { id: 'it-stationery', labelTr: 'BT / Kırtasiye', labelEn: 'IT / Stationery' },
] as const;

// SERVICE PROVIDER MAIN CATEGORIES (Servis Sağlayıcılar)
export const SERVICE_PROVIDER_MAIN_CATEGORIES = [
  { id: 'lsa', labelTr: 'Hayat Kurtarma Cihazları (LSA)', labelEn: 'Life Saving Appliances (LSA)' },
  { id: 'maintenance', labelTr: 'Bakım, Onarım & Elden Geçirme Hizmetleri', labelEn: 'Maintenance, Repair & Recondition Services' },
  { id: 'hydraulic-cranes', labelTr: 'Hidrolik / Vinçler & Kapak Kapalı', labelEn: 'Hydraulic / Cranes & Hatch Covers' },
  { id: 'radio-navigation', labelTr: 'Radyo & Navigasyon', labelEn: 'Radio & Navigation' },
  { id: 'underwater-diving', labelTr: 'Su Altı & Dalış', labelEn: 'Underwater & Diving' },
  { id: 'surveys-analyses', labelTr: 'MLC / MARPOL Analizleri & Surveyler', labelEn: 'MLC / MARPOL Analyses & Surveys' },
  { id: 'utm', labelTr: 'Ultrasonik Kalınlık Ölçümü (UTM)', labelEn: 'Ultrasonic Thickness Measurement (UTM)' },
  { id: 'salvage', labelTr: 'Kurtarma Hizmetleri', labelEn: 'Salvage' },
  { id: 'consultant', labelTr: 'Danışmanlık Hizmetleri', labelEn: 'Consultant Services' },
] as const;

// LSA SUBCATEGORIES
export const LSA_SUBCATEGORIES = [
  { id: 'lsa-launching', labelTr: 'Fırlatma Cihazları & Serbest Bırakma Donanımı', labelEn: 'Launching Appliances & Release Gear' },
  { id: 'lsa-lifeboats', labelTr: 'Cankurtaran Tekneleri / Kurtarma Tekneleri / Vinçler', labelEn: 'Lifeboats / Rescue Boats / Davits' },
  { id: 'lsa-ppe', labelTr: 'Kişisel Hayat Kurtarma & Koruma (PPE)', labelEn: 'Personal Life Saving & Protection (PPE)' },
  { id: 'lsa-liferafts', labelTr: 'Hayat Salları', labelEn: 'Liferafts' },
  { id: 'lsa-ffe', labelTr: 'İtfaiye Donanımı (FFE)', labelEn: 'Fire Fighting Equipment (FFE)' },
] as const;

// MAINTENANCE SUBCATEGORIES
export const MAINTENANCE_SUBCATEGORIES = [
  { id: 'maint-electrical', labelTr: 'Elektrik / Otomasyon', labelEn: 'Electrical / Automation' },
  { id: 'maint-ballast', labelTr: 'Balast / Su Arıtma / Scrubber', labelEn: 'Ballast / Water Treatment / Scrubber' },
  { id: 'maint-tank', labelTr: 'Tank Temizliği', labelEn: 'Tank Cleaning' },
  { id: 'maint-steel', labelTr: 'Çelik / Bağlantılar / Valfler / Borular vb.', labelEn: 'Steel / Couplings / Valves / Pipes etc.' },
  { id: 'maint-engine', labelTr: 'Motor Dairesi', labelEn: 'Engine Room' },
  { id: 'maint-steering', labelTr: 'Direksiyon & Şaft Ekipmanı', labelEn: 'Steering & Shafting Equipment' },
  { id: 'maint-anchors', labelTr: 'Zincirler / Çapalar', labelEn: 'Anchors / Chains' },
  { id: 'maint-hvac', labelTr: 'HVAC ve Soğutma', labelEn: 'HVAC and Refrigeration' },
  { id: 'maint-iccp', labelTr: 'ICCP ve MGPs', labelEn: 'ICCP and MGPs' },
] as const;

// SURVEYS SUBCATEGORIES
export const SURVEYS_SUBCATEGORIES = [
  { id: 'survey-water', labelTr: 'Gri Su, Bilge / Yağlı & Balast Su Analizi', labelEn: 'Graywater, Blidge / Oily & Ballast water Analysis' },
  { id: 'survey-fuel', labelTr: 'Fuel Oil Analizi', labelEn: 'Fuel Oil Analysis' },
  { id: 'survey-lub', labelTr: 'Yağlama Yağı Analizi', labelEn: 'Lub Oil Analysis' },
  { id: 'survey-air', labelTr: 'Hava Kalitesi (İç) Testi', labelEn: 'Air-Quality (Indoor) Testing' },
  { id: 'survey-potable', labelTr: 'İçme Suyu Testi', labelEn: 'Potable Water Testing' },
  { id: 'survey-scrubber', labelTr: 'Scrubber Yıkama Suyu Örnekleme & Testi', labelEn: 'Sampling & Testing of Scrubber Washwater' },
  { id: 'survey-cargo-residues', labelTr: 'Katı Yük Kargo Kalıntıları Testi', labelEn: 'Solid Bulk Cargo Residues Testing' },
  { id: 'survey-hatch-seal', labelTr: 'Kapak Sızdırmazlığı', labelEn: 'Hatch Sealing' },
  { id: 'survey-hold-inspect', labelTr: 'Tutamak Muayenesi', labelEn: 'Hold Inspection' },
  { id: 'survey-cargo-analysis', labelTr: 'Kargo Analizi', labelEn: 'Cargo Analysis' },
  { id: 'survey-vetting', labelTr: 'Vetting Surveyler', labelEn: 'Vetting Surveys' },
  { id: 'survey-bunker', labelTr: 'Bunker Surveyler', labelEn: 'Bunker Surveys' },
  { id: 'survey-condition', labelTr: 'Durum Surveyler', labelEn: 'Condition Surveys' },
  { id: 'survey-draft', labelTr: 'Taslak Surveyler', labelEn: 'Draft Survey' },
  { id: 'survey-newbuilding', labelTr: 'Yeni İnşaat Surveyler', labelEn: 'New-Building Surveys' },
  { id: 'survey-cargo-quality', labelTr: 'Kargo Kalitesi Surveyler', labelEn: 'Cargo Quality Survey' },
  { id: 'survey-stowage', labelTr: 'Disleme, Lashing & Güvenlik Surveyler', labelEn: 'Stowage, Lashing & Securing Surveys' },
] as const;

// Type definitions
export interface Category {
  id: string;
  labelTr: string;
  labelEn: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories?: Category[];
}

// Helper function to get category label
export const getCategoryLabel = (categoryId: string, locale: 'tr' | 'en' = 'en'): string => {
  const allCategories = [
    ...SUPPLIER_MAIN_CATEGORIES,
    ...SERVICE_PROVIDER_MAIN_CATEGORIES,
    ...LSA_SUBCATEGORIES,
    ...MAINTENANCE_SUBCATEGORIES,
    ...SURVEYS_SUBCATEGORIES,
  ];
  
  const category = allCategories.find(cat => cat.id === categoryId);
  return category ? category[locale === 'tr' ? 'labelTr' : 'labelEn'] : categoryId;
};

// Function to get subcategories for a main category
export const getSubcategories = (mainCategoryId: string): Category[] => {
  switch (mainCategoryId) {
    case 'lsa':
      return LSA_SUBCATEGORIES;
    case 'maintenance':
      return MAINTENANCE_SUBCATEGORIES;
    case 'surveys-analyses':
      return SURVEYS_SUBCATEGORIES;
    default:
      return [];
  }
};

// Function to check if category has subcategories
export const hasSubcategories = (categoryId: string): boolean => {
  return ['lsa', 'maintenance', 'surveys-analyses'].includes(categoryId);
};
