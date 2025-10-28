# 📅 Tahmini Hazır Tarihi vs Tahmini Teslimat Tarihi

## 🎯 Mantık

Satıcı panelinde iki farklı tarih bulunuyor:

### 1. **Tahmini Hazır Tarihi (estimatedReadyDate)** 📦
- **Nerede girilir**: Quotation oluşturulurken
- **Kimlere göre**: Satıcı tarafından
- **Nedir**: Satıcının ürün/hizmeti hazırlayabileceği tahmini tarih
- **Görüntülendiği yer**: **Quotations** sayfası (Tekliflerim)

```
Quotation Oluşturma
    ↓
Satıcı: "Bu ürünü 5 gün içinde hazırlayabilirim"
    ↓
estimatedReadyDate = 5 gün sonrası
    ↓
Quotations Sayfasında Gösterilir
```

### 2. **Tahmini Teslimat Tarihi (expectedDeliveryDate)** 🚚
- **Nerede girilir**: Order oluştuktan sonra, kargo detayı girilirken
- **Kimlere göre**: Satıcı tarafından (order update API'sinde)
- **Nedir**: Ürün/hizmetin müşteriye ulaşacağı tahmini tarih
- **Görüntülendiği yer**: **Orders** sayfası (Siparişler)

```
Order Oluşturma → Kargo Detayı Girişi
    ↓
Satıcı: "Bu siparişi 10 gün içinde teslim edebilirim"
    ↓
expectedDeliveryDate = 10 gün sonrası
    ↓
Orders Sayfasında Gösterilir
```

---

## 🔄 Veri Akışı

```
┌─────────────────────────────────────────────────────────────┐
│                    QUOTATION AKIŞI                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RFQ Alındı                                                 │
│    ↓                                                        │
│  Quotation Oluştur                                          │
│  ├─ price: 5000 USD                                         │
│  ├─ deliveryTime: "10 days" (text)                         │
│  └─ estimatedReadyDate: 2025-11-05 ← [YENİ]              │
│    ↓                                                        │
│  API: /api/quotation/create                                │
│    ↓                                                        │
│  Quotations Sayfası                                         │
│  │ Gemi │ Kategori │ Fiyat │ Tahmini Hazırık │ Durum │   │
│  │ MT FATIH │ Yağ │ 5000 USD │ Nov 5 │ Beklemede │      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     ORDER AKIŞI                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Quotation Kabul Edildi                                     │
│    ↓                                                        │
│  Order Oluştur                                              │
│    ↓                                                        │
│  Sipariş İşleme Başla                                       │
│    ↓                                                        │
│  Kargo Detayı Gir (Order Update)                           │
│  ├─ status: "in_progress"                                   │
│  └─ expectedDeliveryDate: 2025-11-12 ← [YENİ SET]        │
│    ↓                                                        │
│  API: /api/order/update-status                             │
│    ↓                                                        │
│  Orders Sayfası                                             │
│  │ Başlık │ Armatör │ Tutar │ Tahmini Teslimat │ Durum │  │
│  │ Yağ │ ÖZCAN ... │ 5000 USD │ Nov 12 │ Hazırlanıyor │   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Veritabanı Şeması

### Quotations Collection
```json
{
  "id": "quot-123",
  "rfqId": "rfq-456",
  "price": 5000,
  "currency": "USD",
  "deliveryTime": "10 days",
  "estimatedReadyDate": Timestamp,  // ← Quotation'da girildi
  "status": "pending",
  "createdAt": Timestamp
}
```

### Orders Collection
```json
{
  "id": "order-789",
  "rfqId": "rfq-456",
  "quotationId": "quot-123",
  "amount": 5000,
  "status": "in_progress",
  "expectedDeliveryDate": Timestamp,  // ← Order update'de set edildi
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

## 📊 Sayfalar

### Quotations Sayfası (Tekliflerim)
```
Armatör | Gemi | Kategori | Fiyat | Tahmini Hazırık | Durum
ÖZCAN... | MT FATIH | Yağ | 5000 USD | Nov 5 | Beklemede
ADIR... | GENERAL | Bakım | 12000 USD | Nov 8 | Kabul
```

**Amacı**: Satıcının verdiği teklifleri yönetmek, ne zaman ürünü hazırlayabileceğini görmek

### Orders Sayfası (Siparişler)
```
Başlık | Armatör | Tutar | Tahmini Teslimat | Ödeme | Durum
Yağ | ÖZCAN... | 5000 USD | Nov 12 | Ödendi | Hazırlanıyor
Bakım | ADIR... | 12000 USD | Nov 18 | Beklemede | Onaylı
```

**Amacı**: Satıcının aldığı siparişleri yönetmek, tahmini teslimat tarihini izlemek

---

## 🔧 API Endpoints

### Quotation Create
```bash
POST /api/quotation/create
Body: {
  rfqId: "...",
  supplierUid: "...",
  price: 5000,
  currency: "USD",
  deliveryTime: "10 days",
  estimatedReadyDate: "2025-11-05T00:00:00Z"  ← [Girilir]
}
```

### Order Update Status (Kargo Detayı Girişi)
```bash
POST /api/order/update-status
Body: {
  orderId: "...",
  status: "in_progress",
  expectedDeliveryDate: "2025-11-12T00:00:00Z"  ← [Girilir]
}
```

---

## ✅ Özet

| Özellik | estimatedReadyDate | expectedDeliveryDate |
|---------|------------------|---------------------|
| **Nedir** | Ürün hazırlığı | Teslimat |
| **Nerede girilir** | Quotation oluştur. | Order update |
| **Kimlere göre** | Satıcı | Satıcı |
| **Görüntülenen yer** | Quotations | Orders |
| **Amaç** | Hazırlık süresini göster | Teslimat süresini takip et |
| **Örnek** | "5 gün içinde hazırım" | "10 gün içinde teslim" |

---

## 🧪 Test Etme

```bash
# Mock data oluştur
npm run seed-data

# Kontroller:
1. /supplier/quotations sayfasında
   → "Tahmini Hazırık" sütununu gör (tarihler 3-18 gün aralığında)

2. /supplier/orders sayfasında
   → "Tahmini Teslimat" sütununu gör (tarihler random)
   
3. Dashboard takviminde
   → Quotation event'lerinde estimatedReadyDate kullanılması
   → Order event'lerinde expectedDeliveryDate kullanılması
```

---

## 📝 Dosya Değişiklikleri

```
✅ types/quotation.ts - estimatedReadyDate eklendi
✅ app/api/quotation/create/route.ts - estimatedReadyDate parametresi
✅ app/api/quotation/list/route.ts - estimatedReadyDate return
✅ app/[locale]/supplier/quotations/page.tsx - estimatedReadyDate gösterilme
✅ app/api/order/list/route.ts - expectedDeliveryDate return
✅ app/[locale]/supplier/orders/page.tsx - expectedDeliveryDate gösterilme
✅ scripts/seed-mock-data.ts - Her iki tarih da seed'de eklendi
```
