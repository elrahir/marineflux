# 📋 Satıcı Paneli - Teklifler (Quotations) Sayfası Güncellemeleri

## 🎯 Yapılan Değişiklikler

Satıcı panelindeki **Tekliflerim** sayfasında, listeleme tablosuna 3 yeni sütun eklenmiştir:

1. ✅ **Gemi (Vessel)** - Hangi gemiye ait olduğu
2. ✅ **Kategori (Category)** - RFQ kategorisi
3. ✅ **Tahmini Teslimat Tarihi (Est. Delivery)** - Tahmini teslimat tarihi

---

## 📊 Yeni Tablo Yapısı

### Öncesi (Before)
```
| RFQ Başlığı | Armatör | Fiyat | Teslimat Süresi | Durum | Gönderim Tarihi | İşlem |
```

### Sonrası (After)
```
| RFQ Başlığı | Armatör | Gemi | Kategori | Fiyat | Tahmini Teslimat | Durum | İşlem |
```

---

## 📝 Değiştirilen Dosyalar

### 1. **`app/[locale]/supplier/quotations/page.tsx`**

#### Interface Güncellemesi
```typescript
interface Quotation {
  // ... existing fields ...
  vesselName?: string; // Ship name from RFQ
  rfqCategory?: string; // RFQ category
  expectedDeliveryDate?: string; // Expected delivery date
}
```

#### Tablo Sütunları
- **Gemi (Vessel)** sütunu eklendi
- **Kategori (Category)** sütunu eklendi
- **Tahmini Teslimat Tarihi** sütunu eklendi (Teslimat Süresi yerine)

#### Arama Filtresi
Arama şu alanları da kapsar:
- Gemi ismi
- Kategori

#### Sıralama
Yeni sütunlar sıralanabilir:
- `vessel` - Gemi adına göre
- `category` - Kategoriye göre
- `expectedDeliveryDate` - Tahmini teslimat tarihine göre

### 2. **`app/api/quotation/list/route.ts`**

RFQ verilerinden `vesselName` ve `rfqCategory` bilgileri alınıyor:

```typescript
// RFQ'dan gemi ve kategori bilgilerini al
vesselName = rfqData.vessel?.name || '';
rfqCategory = rfqData.mainCategory || rfqData.category || '';

// Quotation response'una ekle
quotations.push({
  // ... other fields ...
  vesselName,
  rfqCategory,
  expectedDeliveryDate: data.expectedDeliveryDate?.toDate?.()?.toISOString(),
});
```

### 3. **`types/quotation.ts`**

```typescript
export interface Quotation {
  // ... existing fields ...
  rfqCategory?: string; // RFQ main category for calendar display
  vesselName?: string; // Ship name from RFQ
  vesselType?: string; // Ship type from RFQ
  expectedDeliveryDate?: Timestamp; // Estimated delivery date
}
```

### 4. **`scripts/seed-mock-data.ts`**

Seed script güncellenmiş - quotation oluştururken yeni alanlar ekleniyor:

```typescript
expectedDeliveryDate: admin.firestore.Timestamp.fromDate(
  new Date(Date.now() + (5 + Math.random() * 30) * 24 * 60 * 60 * 1000)
), // 5-35 gün sonrası
```

---

## 🔄 Veri Akışı

```
RFQ
├── vessel.name → Quotation.vesselName
├── mainCategory/category → Quotation.rfqCategory
└── (Oluşturulan zaman) → Quotation.expectedDeliveryDate

Quotations Sayfası
└── API /api/quotation/list
    └── Tablo'da görüntüleniyor
```

---

## 💾 Veritabanı Şeması

Firestore `quotations` collection:

```json
{
  "id": "quot-123",
  "rfqId": "rfq-456",
  "supplierUid": "supplier-789",
  "price": 5000,
  "currency": "USD",
  "deliveryTime": "10 days",
  
  // Yeni alanlar
  "rfqCategory": "lubricants-oil",
  "vesselName": "MT FATIH",
  "vesselType": "Tanker",
  "expectedDeliveryDate": Timestamp,
  
  "status": "pending",
  "createdAt": Timestamp
}
```

---

## 🧪 Test Etme

### 1. Mock Data ile
```bash
npm run seed-data
```

### 2. Dashboard'da Kontrol
1. `/supplier/quotations` sayfasını aç
2. Teklifler listesinde yeni sütunları gözlemle:
   - Gemi isimler gösterilyor mu?
   - Kategoriler gösterilyor mu?
   - Tahmini teslimat tarihleri gösterildiği mu?

### 3. Arama ve Sıralama
1. Gemi ismiyle ara
2. Kategoriye göre filtrele
3. Tahmini teslimat tarihine göre sırala

### 4. Dil Değiştirme
- Türkçe ↔ İngilizce dil değiştir
- Tüm başlıklar doğru dilde görünüyor mu?

---

## 📊 Özet Tablo

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Gemi sütunu | ✅ | RFQ'dan alınıyor |
| Kategori sütunu | ✅ | RFQ mainCategory'den alınıyor |
| Tahmini Teslimat sütunu | ✅ | expectedDeliveryDate gösteriliyor |
| Arama | ✅ | Gemi ve kategori dahil |
| Sıralama | ✅ | Tüm sütunlara uygulanabilir |
| Lokalizasyon | ✅ | TR/EN destekli |
| Responsive | ✅ | Scroll ile uyumlu |

---

## 🔗 İlişkili Dosyalar

- Calendar improvements: `CALENDAR-IMPROVEMENTS.md`
- Changes summary: `CHANGES-SUMMARY.md`
- Type definitions: `types/quotation.ts`, `types/order.ts`

---

## 📌 Notlar

- **expectedDeliveryDate**: Quotation oluşturulurken manuel olarak set edilebilir veya seed script ile random tarih atanır
- **Backward Compatibility**: Eski quotation'larda yeni alanlar olmayabilir, `||` operatörleri ile fallback kullanılıyor
- **Performance**: API çağrısı RFQ'dan gemi ve kategori bilgisini çekerek, her quotation için ayrıca sorgu yapmıyor (verimli)
