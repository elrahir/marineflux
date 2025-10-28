# ShipSupplier1 Test Data Guide

> Database'de supplier1 hesabı için 10 quotation ve 20 order oluştur

## ⚡ Hızlı Başlangıç

### ⚠️ Ön Koşul: Firebase Auth'da Hesapları Oluştur

Script çalışmadan önce Firebase Auth'da bu iki hesabı oluşturman gerekir:

1. **Firebase Console'a git:**
   ```
   https://console.firebase.google.com/
   ```

2. **Authentication → Users → Add User:**
   
   **User 1:**
   - Email: `supplier1@marineflux.com`
   - Password: `test123`
   - ✅ Create

   **User 2:**
   - Email: `shipowner1@marineflux.com`
   - Password: `test123`
   - ✅ Create

3. **Tamam! Hesaplar hazır, şimdi script'i çalıştırabilirsin**

### Adım 1: Script'i Çalıştır

```bash
npm run create-supplier-data
```

### Adım 2: Sonucu Gözlemle

```
======================================================================
🌱 CREATING TEST DATA FOR SUPPLIER1
======================================================================

🔍 Finding user UIDs from Firebase Auth...
✅ Found Supplier UID: a1b2c3d4e5f6...
✅ Found Shipowner UID: x9y8z7w6v5u4...

👥 Setting up test accounts...
✅ Created shipowner: Test Shipping Company

📝 Creating RFQs for quotations...
  ✅ Created RFQ: Urgent Engine Oil Supply
  ✅ Created RFQ: Ship Painting Required
  ... (10 total)

💰 Creating 10 Quotations with different statuses...
  ✅ Quotation 1/10: Status=pending
  ✅ Quotation 2/10: Status=pending
  ... (10 total)

📦 Creating 20 Orders at different stages...
  ✅ Order 1/20: Status=pending, Payment=pending
  ✅ Order 2/20: Status=pending, Payment=pending
  ... (20 total)

======================================================================
✨ TEST DATA CREATION COMPLETED SUCCESSFULLY!
======================================================================
```

### Adım 3: Supplier'ı Test Et

1. **Uygulamayı başlat:**
   ```bash
   npm run dev
   ```

2. **Giriş yap:**
   - Email: `supplier1@marineflux.com`
   - Password: `test123`

3. **Supplier dashboard'a git:**
   ```
   http://localhost:3000/tr/supplier/dashboard
   ```

4. **Test et:**
   - Quotations page: 10 teklif görmeli
   - Orders page: 20 sipariş görmeli (farklı statuses)

---

## 📊 Oluşturulan Veriler

### Hesaplar

**Supplier:**
- UID: `supplier-1`
- Email: `supplier1@marineflux.com`
- Company: Ship Supplier 1
- Rating: 4.7/5

**Shipowner:**
- UID: `shipowner-1`
- Email: `shipowner1@marineflux.com`
- Company: Test Shipping Company
- Vessel: MV Test Star (Container Ship)

### Quotations (10 adet)

| Durum | Miktar |
|-------|--------|
| 🟡 Pending | 5 |
| ✅ Accepted | 3 |
| ❌ Rejected | 2 |

Tüm teklifler:
- Fiyat: $5,000 - $50,000
- Teslimat: 3-10 gün
- Para: USD

### Orders (20 adet)

| Durum | Ödeme | Miktar |
|-------|-------|--------|
| 🟡 Pending | Pending | 3 |
| 🔵 Confirmed | Pending | 3 |
| 🔵 Confirmed | Paid | 2 |
| ⚙️ In Progress | Paid | 6 |
| ✅ Completed | Paid | 4 |
| ❌ Cancelled | Pending | 2 |

Her order:
- Timeline'ı var (pending → confirmed → in_progress → completed)
- RFQ'ya bağlı
- Gerçekçi tarihler (geçmiş 60 gün)

---

## 🧪 Test Senaryoları

### Scenario 1: Quotation Filtering
1. Supplier dashboard → Quotations
2. Beklemede, Kabul Edildi, Reddedildi statüslerini görüntüle
3. Search ve sorting'i test et

### Scenario 2: Order Status Tracking
1. Supplier dashboard → Orders
2. Farklı statuses'leri filtrele
3. Timeline'ları gözlemle

### Scenario 3: Payment Status
1. Orders page'de
2. "Ödeme" sütununu kontrol et
3. Paid vs Pending'i görmeli

### Scenario 4: Sortable Columns
1. Herhangi bir sütun başlığına tıkla
2. ⬆️⬇️ Sorting ikonunu gözlemle
3. Data'nın sıralandığını doğrula

---

## 🔄 Tekrar Çalıştırma

Eğer tekrar çalıştırırsan:
- **Yeni veriler eklenir** (duplicate olmaz çünkü her çalıştırmada yeni document'ler oluşur)
- **Existing hesapları korur** (shipowner-1 ve supplier-1 zaten varsa güncelleme yapmaz)

Temiz başlamak istersen:
1. Firebase Console → Firestore Database
2. rfqs, quotations, orders koleksiyonlarını sil
3. Script'i tekrar çalıştır

---

## 📝 Account Bilgileri

Hesaplar Firebase Auth'da zaten oluşturmalsın (bkz. Ön Koşul).

Script bu hesapları otomatik olarak bulup doğru UID'lerini kullanır.

**Giriş Bilgileri:**
```
📧 Email:    supplier1@marineflux.com
🔐 Password: test123

📧 Email:    shipowner1@marineflux.com
🔐 Password: test123
```

---

## 🎯 Kontrol Listesi

- [ ] Script başarıyla çalıştı
- [ ] Supplier dashboard'a giriş yapabildin
- [ ] Quotations page: 10 teklif görünüyor
- [ ] Orders page: 20 sipariş görünüyor
- [ ] Sorting çalışıyor
- [ ] Search çalışıyor
- [ ] Status filtering çalışıyor
- [ ] Timeline'lar görünüyor

---

## ❓ FAQ

**Q: Veriler nereye kaydediliyor?**
A: Firestore Database'e:
- `suppliers/supplier-1`
- `shipowners/shipowner-1`
- `rfqs/*` (10 dokuman)
- `quotations/*` (10 dokuman)
- `orders/*` (20 dokuman)

**Q: Script'i tekrar çalıştırsam ne olur?**
A: Yeni RFQ, quotations ve orders eklenecek. Existing hesapları korur.

**Q: Account şifresi nedir?**
A: `test123` - Bunu Firebase Auth'da kendi ayarlamalısın

**Q: Tarihleri değiştirebilir miyim?**
A: Evet, script'te `Date.now()` hesaplamalarını değiştirebilirsin

---

**Başarıyla test etmeyi diliyorum!** 🚀
