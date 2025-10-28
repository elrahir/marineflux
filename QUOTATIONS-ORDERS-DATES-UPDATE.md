# 🚀 Satıcı Paneli - Quotations ve Orders Tarih Ayrımı

## 📋 Özet

İki yeni "tarih" alanı eklenerek, satıcının hazırlık ve teslimat zamanlarını daha iyi yönetebilmesi sağlandı:

### ✅ Quotations Sayfasında
- **Tahmini Hazır Tarihi** (estimatedReadyDate) gösterilir
- Satıcı, quotation oluştururken bu tarihi girer
- "5 gün içinde ürünü hazırlayabilirim" anlamına gelir

### ✅ Orders Sayfasında
- **Tahmini Teslimat Tarihi** (expectedDeliveryDate) gösterilir
- Satıcı, sipariş onaylandıktan sonra kargo detayı girerken bu tarihi set eder
- "10 gün içinde müşteriye teslim edebilirim" anlamına gelir

---

## 📊 Değiştirilen Dosyalar (7 dosya)

### 1. **types/quotation.ts**
```typescript
+ estimatedReadyDate?: Timestamp; // Quotation'da girildi
+ expectedDeliveryDate?: Timestamp; // Order update'de girildi
```

### 2. **app/api/quotation/create/route.ts**
- estimatedReadyDate parametresi eklendi
- Timestamp'e dönüştürülüyor

### 3. **app/api/quotation/list/route.ts**
- estimatedReadyDate return ediliyor

### 4. **app/[locale]/supplier/quotations/page.tsx**
- Quotation interface güncellenmiş
- "Tahmini Hazırık" sütunu eklendi
- Sıralama ve arama desteği

### 5. **app/[locale]/supplier/orders/page.tsx**
- Order interface güncellenmiş
- "Tahmini Teslimat" sütunu eklendi
- Sıralama desteği

### 6. **app/api/order/list/route.ts**
- expectedDeliveryDate ISO string'e dönüştürülüyor

### 7. **scripts/seed-mock-data.ts**
- Quotation'lara estimatedReadyDate eklendi (3-18 gün)
- Order'lara expectedDeliveryDate eklendi (shipped+ durumlarda)

---

## 📱 Sayfalar

### Quotations (Tekliflerim)
```
┌──────────────┬────────────┬───────────┬────────┬──────────────┬────────┐
│ RFQ Başlığı  │ Armatör    │ Gemi      │ Fiyat  │ Tahmini Haz. │ Durum  │
├──────────────┼────────────┼───────────┼────────┼──────────────┼────────┤
│ Yağ Ikmali   │ ÖZCAN TAŞI  │ MT FATIH  │ 5000 $ │ Nov 5        │ Pend.  │
│ Bakım Serv.  │ ADIR TAŞI   │ CARGO     │ 12000$ │ Nov 8        │ Kabul  │
└──────────────┴────────────┴───────────┴────────┴──────────────┴────────┘
```

### Orders (Siparişler)
```
┌──────────┬────────────┬────────┬──────────────┬────────┬────────┐
│ Başlık   │ Armatör    │ Tutar  │ Tat.Teslimat │ Ödeme  │ Durum  │
├──────────┼────────────┼────────┼──────────────┼────────┼────────┤
│ Yağ      │ ÖZCAN TAŞI │ 5000 $ │ Nov 12       │ Ödendi │ Hazırl.│
│ Bakım    │ ADIR TAŞI  │ 12000$ │ Nov 18       │ Pend.  │ Onaylı │
└──────────┴────────────┴────────┴──────────────┴────────┴────────┘
```

---

## 🔄 Akış

```
QUOTATION AKIŞI
───────────────
1. RFQ Alındı
2. Quotation Oluştur (estimatedReadyDate gir: 5 gün)
3. API: /api/quotation/create
4. Quotations sayfasında "Nov 5" gösterilir

ORDER AKIŞI  
───────────
1. Quotation Kabul → Order Oluştur
2. Sipariş İşleme (in_progress status)
3. Kargo Detayı: expectedDeliveryDate gir (10 gün)
4. API: /api/order/update-status
5. Orders sayfasında "Nov 12" gösterilir
```

---

## 🧪 Test

```bash
npm run seed-data

# Checks:
1. /supplier/quotations → "Tahmini Hazırık" sütununu gör
2. /supplier/orders → "Tahmini Teslimat" sütununu gör
3. Dil değiştir ve kontrol et (TR/EN)
4. Sütunlara tıkla ve sırala
```

---

## 📌 Notlar

- **Backward Compatibility**: Eski veriler için fallback kullanılıyor
- **Lokalizasyon**: TR/EN tam destekli
- **Performans**: Verimli sorgulama, fazladan fetch yok
- **Calendar Integration**: Takvim her iki tarihi de kullanabiliyor

---

## ✨ Örnek Senaryo

**Gemi Sahibi (Shipowner)**:
- "Yağ ikmali için RFQ açtı"

**Satıcı (Supplier)**:
- "Bu ürünü 5 gün içinde hazırlayabilirim" → Quotation oluştur
- Quotations sayfasında: "Tahmini Hazırık: Nov 5" görünür
- Teklife yanıt bekleniyor...

**Gemi Sahibi**:
- "Teklifini kabul ettim" → Order oluştur

**Satıcı**:
- "Bu siparişi 10 gün içinde müşteriye teslim edebilirim"
- Kargo detayı: expectedDeliveryDate = Nov 12
- Orders sayfasında: "Tahmini Teslimat: Nov 12" görünür

---

## 📚 İlişkili Dokümantasyon

- Detaylı: `DATES-SEPARATION.md`
- Önceki güncellemeler: `CALENDAR-IMPROVEMENTS.md`, `QUOTATIONS-PAGE-UPDATE.md`
