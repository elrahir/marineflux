# 🗑️ Tüm Kullanıcıları Silme Rehberi

Bu rehber, Firebase projenizden tüm kullanıcıları (admin hariç) nasıl sileceğinizi adım adım açıklar.

## ⚠️ ÖNEMLİ UYARILAR

- **Bu işlem geri alınamaz!** Tüm veriler kalıcı olarak silinir.
- Mutlaka önce yedek alın.
- İlk önce test ortamında deneyin.
- Admin kullanıcı bilgilerinizi kaydedin.

---

## 📋 Adım 1: Firebase Service Account Key'i İndirin

### 1.1. Firebase Console'a Gidin
```
https://console.firebase.google.com/
```

### 1.2. Projenizi Seçin
- MarineFlux projenize tıklayın

### 1.3. Service Account Key'i İndirin
1. Sol menüden **Project Settings** ⚙️ (Proje Ayarları)
2. Üstteki sekmelerden **Service Accounts**
3. **"Generate new private key"** (Yeni özel anahtar oluştur) butonuna tıklayın
4. Uyarıyı okuyun ve **"Generate key"** butonuna tıklayın
5. JSON dosyası indirilecek (örn: `marineflux-xxxxx-firebase-adminsdk-xxxxx.json`)

### 1.4. Dosyayı Projeye Taşıyın
```bash
# İndirilen dosyayı proje root'una kopyalayın ve yeniden adlandırın
cd C:\Users\chart\OneDrive\Desktop\Marineflux
copy "Downloads\marineflux-xxxxx-firebase-adminsdk-xxxxx.json" serviceAccountKey.json
```

---

## 📦 Adım 2: Gerekli Paketleri Yükleyin

```bash
npm install
```

Bu komut `firebase-admin` ve `ts-node` paketlerini otomatik olarak yükleyecek.

---

## 🚀 Adım 3: Script'i Çalıştırın

### Yöntem 1: NPM Script ile (Önerilen)
```bash
npm run delete-users
```

### Yöntem 2: Doğrudan
```bash
npx ts-node scripts/delete-all-users.ts
```

---

## 📊 Adım 4: Onaylayın

Script çalıştığında şunları göreceksiniz:

```
======================================================================
🗑️  TÜM KULLANICILARI SİLME ARACI (ADMIN HARİÇ)
======================================================================

📊 Firestore'dan kullanıcılar alınıyor...
   Toplam 25 kullanıcı bulundu.

🔐 Authentication'dan kullanıcılar alınıyor...
   Toplam 25 kullanıcı bulundu.

📋 Kullanıcı İstatistikleri:
   • Firestore: 25 toplam, 1 admin, 24 admin olmayan
   • Auth: 25 toplam

👑 Korunacak Admin Kullanıcılar:
   • admin@marineflux.com (abc123...)

🗑️  Silinecek Kullanıcılar (örnek):
   • shipowner1@marineflux.com (shipowner) - def456...
   • supplier1@marineflux.com (supplier) - ghi789...
   ... ve 22 kullanıcı daha

⚠️  UYARI: Bu işlem GERİ ALINAMAZ!

24 kullanıcıyı ve 25 auth kaydını silmek istediğinizden emin misiniz? (evet/hayır):
```

### İlk Onay
Devam etmek için **`evet`** yazın ve Enter'a basın.

### İkinci Onay
```
⚠️  SON UYARI: Tüm veriler kalıcı olarak silinecek. Devam edilsin mi? (evet/hayır):
```

Tekrar **`evet`** yazın ve Enter'a basın.

---

## ✅ Adım 5: Sonuçları Kontrol Edin

İşlem tamamlandığında göreceğiniz sonuç:

```
======================================================================
✨ İşlem Tamamlandı!
======================================================================

📊 Sonuçlar:
   Firestore:
   • ✅ Başarılı: 24 kullanıcı
   • ❌ Başarısız: 0 kullanıcı

   Authentication:
   • ✅ Başarılı: 24 kullanıcı
   • ❌ Başarısız: 0 kullanıcı

   🛡️  Korunan: 1 admin kullanıcı
======================================================================
```

---

## 🔍 Adım 6: Firebase Console'dan Doğrulayın

### 6.1. Authentication'ı Kontrol Edin
```
Firebase Console → Authentication → Users
```
Sadece admin kullanıcının kaldığını görmelisiniz.

### 6.2. Firestore'u Kontrol Edin
```
Firebase Console → Firestore Database → users
```
Sadece admin kullanıcının belgesinin olduğunu görmelisiniz.

---

## 🚨 Sorun Giderme

### Hata: "Service account key not found"

**Çözüm:**
```bash
# Dosyanın doğru yerde olduğunu kontrol edin
dir serviceAccountKey.json

# Eğer yoksa, tekrar indirip kopyalayın
```

### Hata: "Permission denied"

**Çözüm:**
1. Firebase Console → Firestore Database → Rules
2. Kuralları geçici olarak güncelleyin:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // SADECE SCRIPT İÇİN - SONRA GERİ ALIN!
    }
  }
}
```
3. Script'i çalıştırın
4. Kuralları eski haline getirin

### Hata: "ECONNREFUSED" veya Network Error

**Çözüm:**
- İnternet bağlantınızı kontrol edin
- VPN kullanıyorsanız kapatın
- Firewall ayarlarını kontrol edin

### Script Çok Yavaş Çalışıyor

**Çözüm:**
Script'te gecikme sürelerini azaltın (dikkatli olun, rate limit hatası alabilirsiniz):

`scripts/delete-all-users.ts` dosyasında:
```typescript
// 100ms'den 50ms'ye düşürün (DİKKAT: Rate limit riski)
await new Promise(resolve => setTimeout(resolve, 50));
```

---

## 🔄 İşlemi İptal Etmek

Script çalışırken:
- **İlk onayda "hayır" yazın** → İşlem iptal edilir
- **İkinci onayda "hayır" yazın** → İşlem iptal edilir
- **Ctrl+C tuşlarına basın** → Script durur (ancak kısmi silme yapılmış olabilir)

---

## 📝 İşlem Sonrası

### Yeni Kullanıcılar Oluşturmak İçin:

**Yöntem 1: Seed Script** (Toplu kullanıcılar için)
```bash
npm run seed-users
```

**Yöntem 2: Admin Panel** (Tek tek)
```
http://localhost:3000/tr/admin/users/create
```

**Yöntem 3: Manuel** (Firebase Console'dan)
- Authentication → Add User
- Firestore → users → Add Document

---

## 🔒 Güvenlik Notları

1. **serviceAccountKey.json dosyasını asla Git'e eklemeyin**
   - `.gitignore` dosyasında zaten ekli
   
2. **Script'i sadece yerel ortamda çalıştırın**
   - Production'da çalıştırmayın
   
3. **Admin şifrenizi güvenli tutun**
   - İşlemden önce kaydedin
   
4. **Service Account Key'i sildikten sonra silin**
   ```bash
   del serviceAccountKey.json
   ```

---

## 📞 Yardım

Sorun yaşarsanız:
1. Script çıktısını kaydedin
2. Hata mesajını okuyun
3. Yukarıdaki sorun giderme adımlarını deneyin
4. Gerekirse Firebase Console loglarını kontrol edin

---

## ✨ Tamamlandı!

Artık veritabanınız temiz ve sadece admin kullanıcısı var. Yeni kullanıcılar oluşturarak devam edebilirsiniz.


