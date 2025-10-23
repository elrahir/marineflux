# Kullanıcı Silme Script'i

Bu script, Firebase projenizden tüm kullanıcıları (admin hariç) silmenizi sağlar.

## ⚠️ UYARI

**Bu işlem geri alınamaz!** Tüm kullanıcı verileri kalıcı olarak silinecektir.

## 📋 Gereksinimler

1. **Firebase Admin SDK Service Account Key**
   - Firebase Console → Project Settings → Service Accounts
   - "Generate new private key" butonuna tıklayın
   - İndirilen JSON dosyasını `serviceAccountKey.json` olarak proje root'una kaydedin

2. **Node.js Paketleri**
   ```bash
   npm install firebase-admin
   npm install --save-dev @types/node
   ```

## 🚀 Kullanım

### 1. Service Account Key'i Hazırlayın

```bash
# Firebase Console'dan indirdiğiniz dosyayı kopyalayın
cp ~/Downloads/marineflux-xxxxx-firebase-adminsdk-xxxxx.json serviceAccountKey.json
```

### 2. Script'i Çalıştırın

```bash
npx ts-node scripts/delete-all-users.ts
```

### 3. Onaylayın

Script size şu bilgileri gösterecek:
- Toplam kullanıcı sayısı
- Admin kullanıcılar (korunacak)
- Silinecek kullanıcılar
- İki aşamalı onay isteyecek

## 🔍 Script Ne Yapar?

1. **Firestore'dan** kullanıcıları alır
2. **Admin rolündeki** kullanıcıları filtreler (korur)
3. Her kullanıcı için:
   - ✅ Firestore'dan siler (`users`, `shipowners`, `suppliers` koleksiyonları)
   - ✅ Firebase Authentication'dan siler

## 🛡️ Güvenlik Özellikleri

- ✅ Admin kullanıcıları korunur
- ✅ İki aşamalı onay mekanizması
- ✅ Detaylı log çıktısı
- ✅ Hata yönetimi
- ✅ Rate limiting

## 📊 Örnek Çıktı

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

## 🔧 Özelleştirme

### Sadece Belirli Rolleri Silmek

`filterNonAdmins` fonksiyonunu düzenleyin:

```typescript
function filterNonAdmins(users: UserRecord[]): UserRecord[] {
  // Sadece shipowner'ları sil
  return users.filter(user => user.role === 'shipowner');
  
  // Veya sadece supplier'ları sil
  return users.filter(user => user.role === 'supplier');
}
```

### Ek Koleksiyonları Silmek

`deleteUserFromFirestore` fonksiyonuna ekleyin:

```typescript
await db.collection('rfqs').where('shipownerUid', '==', uid).get()
  .then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
  });
```

## 🚨 Sorun Giderme

### "Service account key not found"
```bash
# Dosyanın doğru yerde olduğundan emin olun
ls serviceAccountKey.json

# Veya script içinde path'i güncelleyin
const serviceAccount = require('../path/to/serviceAccountKey.json');
```

### "Permission denied"
- Firebase Console'da Service Account'un doğru yetkilere sahip olduğunu kontrol edin
- Firestore Rules'ın admin erişimine izin verdiğinden emin olun

### Rate Limiting Hataları
- Script'te gecikme değerini artırın:
```typescript
await new Promise(resolve => setTimeout(resolve, 200)); // 100'den 200'e
```

## 📝 Notlar

- Script çalıştırılmadan önce **mutlaka yedek alın**
- Test ortamında önce deneyin
- Admin kullanıcı bilgilerinizi bir yere kaydedin
- `.gitignore` dosyasında `serviceAccountKey.json` olduğundan emin olun

## 🔗 İlgili Scriptler

- `seed-mock-users.ts` - Yeni kullanıcılar oluşturur
- `create-test-users.md` - Manuel kullanıcı oluşturma kılavuzu


