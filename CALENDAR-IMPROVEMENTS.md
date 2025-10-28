# 📅 Satıcı Paneli Takvim Iyileştirmeleri

## 🎯 Yapılan Değişiklikler

Bu güncelleme, satıcı panelindeki takvim widget'ında üç önemli iyileştirme yapılmıştır:

### 1️⃣ Lokalizasyon Sorunlarının Düzeltilmesi
- **Sorun**: Takvim başlıklarında İngilizce ve Türkçe karışık görünüyordu
- **Çözüm**: Tüm metin, kullanıcının seçtiği dile (locale) göre doğru şekilde görüntüleniyor
- **Dosya**: `components/supplier/TimelineSchedule.tsx`

### 2️⃣ Event Başlıklarında Anlamlı Bilgiler
- **Sorun**: Takvimde RFQ, Teklif ve Siparişlerde sadece isteğin adı yazılıyordu
- **Çözüm**: Artık takvim event'lerinde **Gemi İsmi - Kategori** biçiminde bilgi gösteriliyor
  - Örnek: `"MT Tanker - Yağlayıcılar/Yağ"`
  - Örnek: `"General Cargo - Bakım, Onarım & Elden Geçirme"`
  
**Güncellenen Dosyalar:**
- `app/[locale]/supplier/dashboard/page.tsx` - Event oluşturma mantığı
- `types/order.ts` - Order type'ı (shipName, category alanları eklendi)
- `types/quotation.ts` - Quotation type'ı (rfqCategory, vesselName alanları eklendi)
- `app/api/order/create/route.ts` - Order API'si
- `app/api/quotation/create/route.ts` - Quotation API'si

### 3️⃣ Tahmini Teslimat Tarihi (Estimated Delivery Date)
- **Sorun**: Kargo oluşturulurken "delivery time" (metin) kaydediliyordu, takvimde kullanılamıyordu
- **Çözüm**: Artık `expectedDeliveryDate` olarak tarih kaydediliyor ve takvimde gösteriliyebiliyor
  - Sipariş onaylanırken tahmini teslimat tarihi set edilebiliyor
  - Takvimde "Beklenen Teslimat" event'i gösteriliyor

**Güncellenen Dosyalar:**
- `types/order.ts` - expectedDeliveryDate alanı eklendi
- `app/api/order/create/route.ts` - İlk oluşturmada null olarak set ediliyor
- `app/api/order/update-status/route.ts` - Durum güncelleştirirken expectedDeliveryDate set edilebiliyor
- `app/[locale]/supplier/dashboard/page.tsx` - expectedDeliveryDate takvimde kullanılıyor

## 🔄 Entegrasyon Detayları

### Kategoriler (Categories)
Tüm kategoriler `types/categories.ts` dosyasından otomatik olarak alınıyor:
- **Tedarikçi Kategorileri**: Chandler, Spares, Fire & Safety, vb.
- **Servis Sağlayıcı Kategorileri**: LSA, Maintenance, Surveys, vb.
- **Alt Kategoriler**: LSA Sub, Maintenance Sub, Survey Sub kategorileri

### Event Başlığı Oluşturma
```typescript
// Dashboard'da event başlığı şu şekilde oluşturuluyor:
const eventTitle = `${vesselName} - ${categoryLabel}`;
// Örnek: "MAVI ATLAS - Yağlayıcılar/Yağ"
```

### Beklenen Teslimat Tarihi Akışı
1. **Sipariş Oluşturma**: `expectedDeliveryDate` null olarak başlıyor
2. **Sipariş Onaylanırken**: Tedarikçi/Gemi Sahibi expectedDeliveryDate set edebiliyor
3. **Takvimde Görünüm**: "Beklenen Teslimat" event'i olarak gösteriliyor

```
API: /api/order/update-status
Body: {
  orderId: "...",
  status: "confirmed",
  expectedDeliveryDate: "2025-11-15T00:00:00Z", // ISO 8601 format
  userUid: "..."
}
```

## 📊 Takvim Event Türleri (Güncellenmiş)

| Event Türü | İkon | Renk | Türkçe | İngilizce |
|-----------|------|------|--------|-----------|
| RFQ Deadline | 📄 | Maritime Blue | Teklif Verme Deadline | Bidding Deadline |
| Quotation | 💬 | Amber | Gemi - Kategori | Vessel - Category |
| Order Created | 📦 | Slate | Gemi - Kategori | Vessel - Category |
| Payment | 💳 | Green | Ödeme ... | Payment ... |
| In Progress | 🔧 | Purple | Hazırlanıyor | In Progress |
| Shipped | 🚚 | Blue | Kargoya Verildi | Shipped |
| Expected Delivery | 📅 | Slate | Beklenen Teslimat | Expected Delivery |
| Completed | ✅ | Emerald | Tamamlandı | Completed |

## 🧪 Test Etme

### Mock Data Seeding
```bash
npm run seed-data
```

Bu komut otomatik olarak:
- RFQ'ları mainCategory ile oluşturuyor
- Quotation'ları rfqCategory, vesselName ile oluşturuyor
- Order'ları shipName, category, expectedDeliveryDate ile oluşturuyor

### Manuel Test
1. Satıcı Dashboard'a git: `/supplier/dashboard`
2. "Aylık Zaman Çizelgesi" bölümünü kontrol et
3. Event'lerin başlıklarında "Gemi İsmi - Kategori" görünüyor mu?
4. İngilizce/Türkçe dili değiştirerek kontrol et

## 📝 Notlar

- **Backward Compatibility**: Eski data'da category bilgisi olmayabilir, bu durumda "Gemi" ve boş kategori gösterilir
- **Localization**: Tüm metin multilingual support ile uyumlu
- **Performance**: Event oluşturma 1 hafta öncesi + 3 hafta sonrası aralığında sınırlı

