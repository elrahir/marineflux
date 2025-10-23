# 🚀 Firebase Hızlı Kurulum Rehberi

MarineFlux için Firebase'i 5-10 dakikada kurun!

## Adım 1: Firebase Projesi Oluşturun (2 dakika)

### 1.1 Firebase Console'a Gidin
🔗 https://console.firebase.google.com

### 1.2 "Add Project" / "Proje Ekle" Tıklayın
- Proje adı: `marineflux` (veya istediğiniz bir isim)
- Google Analytics: **Disable** (şimdilik kapatın, sonra açabilirsiniz)
- "Create Project" tıklayın
- ✅ Proje hazır olana kadar bekleyin (30 saniye)

## Adım 2: Web App Ekleyin (1 dakika)

### 2.1 Web App İkonu Tıklayın
- Firebase Console'da yeni oluşturduğunuz projeye tıklayın
- "Get started by adding Firebase to your app" bölümünde
- **Web ikonu** (`</>`) tıklayın

### 2.2 App Bilgileri
- App nickname: `MarineFlux Web`
- Firebase Hosting: **Hayır** (şimdilik)
- "Register app" tıklayın

### 2.3 Config Değerlerini Kopyalayın

Aşağıdaki gibi bir kod göreceksiniz:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "marineflux-xxxxx.firebaseapp.com",
  projectId: "marineflux-xxxxx",
  storageBucket: "marineflux-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx",
  measurementId: "G-XXXXXXXXXX"
};
```

**Bu değerleri kopyalayın! Sonra kullanacağız.**

## Adım 3: Authentication Aktifleştirin (1 dakika)

### 3.1 Authentication Menüsüne Gidin
- Sol menüden **"Authentication"** tıklayın
- "Get started" tıklayın

### 3.2 Email/Password Aktifleştirin
- "Sign-in method" tab'ına tıklayın
- **"Email/Password"** seçeneğini bulun
- Enable (Etkinleştir) switch'ini açın
- "Email link" kısmını **kapalı** bırakın
- "Save" tıklayın

✅ Authentication hazır!

## Adım 4: Firestore Database Oluşturun (1 dakika)

### 4.1 Firestore Menüsüne Gidin
- Sol menüden **"Firestore Database"** tıklayın
- "Create database" tıklayın

### 4.2 Database Modu
- **"Start in production mode"** seçin
- "Next" tıklayın

### 4.3 Location Seçin
- Lokasyon: **"eur3 (europe-west)"** önerilir (Türkiye'ye yakın)
- "Enable" tıklayın
- ✅ Database oluşturulana kadar bekleyin (1 dakika)

## Adım 5: Storage Aktifleştirin (30 saniye)

### 5.1 Storage Menüsüne Gidin
- Sol menüden **"Storage"** tıklayın
- "Get started" tıklayın

### 5.2 Security Rules
- **"Start in production mode"** seçin
- "Next" tıklayın
- Aynı location'ı seçin
- "Done" tıklayın

✅ Storage hazır!

## Adım 6: .env.local Dosyası Oluşturun

### 6.1 Proje Klasörünüzde .env.local Oluşturun

**Windows CMD:**
```cmd
cd C:\Users\chart\OneDrive\Desktop\Marineflux
echo. > .env.local
notepad .env.local
```

### 6.2 Aşağıdaki İçeriği Yapıştırın

**Adım 2.3'te kopyaladığınız değerleri buraya yapıştırın:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=marineflux-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=marineflux-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=marineflux-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**💾 Kaydedin ve kapatın!**

## Adım 7: Security Rules Deploy Edin

### 7.1 Firebase CLI Yükleyin

**CMD'de:**
```cmd
npm install -g firebase-tools
```

### 7.2 Firebase'e Login Olun
```cmd
firebase login
```
- Tarayıcı açılacak
- Google hesabınızla giriş yapın
- İzin verin

### 7.3 Firebase Projenizi Başlatın
```cmd
firebase init
```

**Seçenekler:**
- ❓ Which Firebase features? 
  - ✅ **Firestore** (Space ile seçin)
  - ✅ **Storage** (Space ile seçin)
  - Enter basın

- ❓ Use an existing project?
  - **Yes** seçin
  - Projenizi listeden seçin

- ❓ Firestore Rules file?
  - **firestore.rules** (Enter basın, varsayılan)

- ❓ Firestore indexes file?
  - Enter basın (varsayılan)

- ❓ Storage rules file?
  - **storage.rules** (Enter basın, varsayılan)

### 7.4 Rules'ları Deploy Edin
```cmd
firebase deploy --only firestore:rules,storage
```

✅ **Rules deployed!**

## Adım 8: İlk Admin Kullanıcısı Oluşturun

### 8.1 Firebase Console'da Authentication'a Gidin
- **Users** tab'ına tıklayın
- "Add user" tıklayın

### 8.2 Admin Kullanıcısı Ekleyin
- **Email**: admin@marineflux.com (veya istediğiniz)
- **Password**: Güçlü bir şifre girin
- "Add user" tıklayın

### 8.3 UID'yi Kopyalayın
- Yeni oluşturduğunuz kullanıcının **UID**'sini kopyalayın
- Örnek: `abc123def456ghi789`

### 8.4 Firestore'a Admin Kaydı Ekleyin
- Sol menüden **"Firestore Database"** tıklayın
- "Start collection" tıklayın
- Collection ID: **users**
- "Next" tıklayın

**İlk Document:**
- Document ID: **(kopyaladığınız UID'yi yapıştırın)**
- Alanlar ekleyin:

| Field | Type | Value |
|-------|------|-------|
| uid | string | (UID değeri) |
| email | string | admin@marineflux.com |
| role | string | admin |
| companyName | string | MarineFlux Admin |
| createdAt | timestamp | (şu anki zaman - otomatik) |

- "Save" tıklayın

✅ **Admin kullanıcısı hazır!**

## Adım 9: Test Edin!

### 9.1 Development Server'ı Başlatın
```cmd
npm run dev
```

### 9.2 Login Sayfasına Gidin
🔗 http://localhost:3000/tr/login

### 9.3 Admin ile Giriş Yapın
- **Email**: admin@marineflux.com
- **Password**: (oluşturduğunuz şifre)
- "Giriş Yap" tıklayın

✅ **Admin Dashboard'a yönlendirildiniz!**

## 🎉 Tebrikler!

Firebase kurulumu tamamlandı! Artık:
- ✅ Authentication çalışıyor
- ✅ Firestore database hazır
- ✅ Storage aktif
- ✅ Security rules deploy edildi
- ✅ Admin kullanıcısı var

## 📝 Sonraki Adımlar

1. **Test kullanıcıları oluşturun** (Shipowner, Supplier)
2. **Dashboard'ları test edin**
3. **Veri girmeye başlayın**

## ❓ Sorun mu Var?

### Firebase bağlanmıyor
- `.env.local` dosyasını kontrol edin
- Development server'ı yeniden başlatın: `Ctrl+C` sonra `npm run dev`

### Login çalışmıyor
- Firebase Console > Authentication > Users kısmında kullanıcı var mı?
- Firestore > users collection'da kullanıcı var mı?
- Email ve şifre doğru mu?

### "Permission denied" hatası
- Firestore rules deploy edildi mi?
- `firebase deploy --only firestore:rules,storage`

---

**Toplam Süre**: 5-10 dakika
**Zorluk**: Kolay
**Gerekli**: Sadece Firebase hesabı (ücretsiz)

Başarılar! 🚀



