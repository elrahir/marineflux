# 🚀 Mock Data Seeding - Hızlı Başlangıç

> Firestore veritabanınızı gerçekçi denizcilik verileriyle doldurun!

## ⚡ Hızlı Kurulum (2 Dakika)

### Adım 1: Bağlantıyı Kontrol Et
```bash
cd C:\Marineflux
```

### Adım 2: Seed Scriptini Çalıştır
```bash
npm run seed-data
```

### Adım 3: Bekle ve Tamamlandığını Gözlemle
```
============================================================
🌱 MARINEFLUX MOCK DATA SEEDING
============================================================

🚢 Creating Shipowner Users...
  ✅ Created shipowner: Akdeniz Denizcilik A.Ş.
  ...
  
✨ SEEDING COMPLETED SUCCESSFULLY!
```

---

## 📊 Ne Oluşturuldu?

| Veri Türü | Miktar | Örnek |
|-----------|--------|--------|
| 🚢 Gemi Sahipleri | 20 | Akdeniz Denizcilik, Ege Gemi İşletmeleri |
| 📦 Tedarikçiler | 20 | Deniz Tedarik, Gemi Makina, Marin Ekipman |
| 📝 RFQ | 30-40 | Urgent Engine Oil Supply, Ship Painting |
| 💰 Teklif | ~200 | $5,000 - $55,000 |
| 📦 Sipariş | 100 | Pending, Confirmed, In Progress, Completed |
| 💬 Sohbet | 50+ | Professional maritime conversations |
| ⭐ Yorum | 50+ | 4-5 yıldız, gerçekçi metinler |

---

## 🧪 Test Et!

### 1. Uygulamayı Başlat
```bash
npm run dev
```

### 2. Tarayıcıda Aç
```
http://localhost:3000/tr/login
```

### 3. Gemi Sahibi Olarak Giriş Yap
```
Email: shipowner1@marineflux.com
Password: test123
```

### 4. Ne Görebilirsin?
- ✅ RFQ listesi (30-40 adet)
- ✅ Tedarikçi arama (20 tedarikçi)
- ✅ Sorunsuz mesajlaşma (50+ sohbet)
- ✅ Sipariş takibi (100 sipariş)

### 5. Tedarikçi Olarak Teste

```
Email: supplier1@marineflux.com
Password: test123
```

- ✅ Açık RFQ'lar (30-40 adet)
- ✅ Teklif gönderme
- ✅ Siparişleri yönetme
- ✅ Rating'ler (3.5-5 yıldız)

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Tam İş Akışı Testi
1. Gemi sahibi olarak giriş yap → RFQ oluştur
2. Tedarikçi olarak giriş yap → Teklife cevap ver
3. Gemi sahibi → Siparişi onayla
4. İzleme ve mesajlaşmayı test et

### Senaryo 2: Arama ve Filtreleme
1. Tedarikçi kategorileri filtrele
2. Fiyat aralıklarını kontrol et
3. Rating'e göre sırala

### Senaryo 3: Raporlar ve Analizler
1. Admin paneline git
2. İstatistikleri gözlemle
3. Kullanıcı aktivitesini kontrol et

---

## 🔄 Yeniden Başlat (Temiz Kurulum)

### Tüm Verileri Sil
1. **Firebase Console'a git**
   ```
   https://console.firebase.google.com/
   ```

2. **Her koleksiyonu sil**
   - Firestore Database → users → tüm dokümanları sil
   - Firestore Database → suppliers → tüm dokümanları sil
   - Firestore Database → shipowners → tüm dokümanları sil
   - (Diğer koleksiyonlar için de aynı işlemi tekrarla)

3. **Yeniden seed'le**
   ```bash
   npm run seed-data
   ```

---

## 🛠️ Sorun Giderme

### ❌ "firebase-admin not found"
```bash
npm install firebase-admin --save-dev
```

### ❌ "Permission denied"
- Firebase Console'da security rules'u kontrol et
- Service account key'in doğru olduğundan emin ol

### ❌ "serviceAccountKey.json not found"
- Firebase Console → Settings → Service Accounts
- Private key JSON'u indir
- Proje root'una koy

### ❌ Script çok yavaş
- Normal davranış (2-5 dakika)
- Firestore API rate limiting
- Tamamlanması için bekle

---

## 📁 Veriler Nereye Gidiyor?

```
Firestore Database
├── users/ (65 belge)
│   ├── shipowner-1 to shipowner-15
│   ├── supplier-1 to supplier-50
│   └── admin data
├── shipowners/ (15 belge)
├── suppliers/ (50 belge)
├── rfqs/ (30-40 belge)
├── quotations/ (100+ belge)
├── orders/ (20 belge)
├── chats/ (25+ belge)
├── messages/ (125-375 belge)
└── reviews/ (30 belge)
```

---

## 📚 Detaylı Dokümantasyon

Daha fazla bilgi için: `scripts/README-SEED-DATA.md`

---

## ⚠️ Önemli Notlar

- **Gizlilik:** Bu sadece test amacılıdır, production'da kullanmayın
- **Gerçekçi Veriler:** Tüm veriler tamamen uydurmadır
- **Tekrar Kurulum:** İstediğin zaman tekrarla - veri kaybı yok
- **Değiştirme:** Script'i özelleştirebilirsin (bkz. README)

---

## 🎉 Başarı!

Artık tam bir test ortamın var! İşimize başlayabiliriz.

### Sonraki Adımlar:
- [ ] Uygulamayı test et
- [ ] Özellikler geliştir
- [ ] Kullanıcı feed'ini kontrol et
- [ ] Mesajlaşma sistemini test et
- [ ] Raporları ve analitiği incele

**Sorulara?** Lütfen soru sor! 🚀
