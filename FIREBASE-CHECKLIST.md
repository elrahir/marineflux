# ✅ Firebase Kurulum Checklist

Tüm adımları tamamladığınızda işaretleyin!

## 📋 Ön Hazırlık
- [ ] Google hesabınız var
- [ ] Firebase Console'a erişebiliyorsunuz
- [ ] Node.js ve npm yüklü
- [ ] MarineFlux projesi bilgisayarınızda

## 🔥 Firebase Console İşlemleri

### Proje Oluşturma
- [ ] Firebase Console'a gittim (console.firebase.google.com)
- [ ] "Add Project" tıkladım
- [ ] Proje adı: `marineflux` yazdım
- [ ] Google Analytics'i devre dışı bıraktım
- [ ] Proje oluşturuldu

### Web App Ekleme
- [ ] Web ikonu (`</>`) tıkladım
- [ ] App nickname: "MarineFlux Web" yazdım
- [ ] Firebase config değerlerini kopyaladım
- [ ] Config değerleri not defterime yapıştırdım

### Authentication
- [ ] Authentication menüsüne gittim
- [ ] "Get started" tıkladım
- [ ] Email/Password yöntemini etkinleştirdim
- [ ] "Save" tıkladım

### Firestore Database
- [ ] Firestore Database menüsüne gittim
- [ ] "Create database" tıkladım
- [ ] "Production mode" seçtim
- [ ] Location: "eur3 (europe-west)" seçtim
- [ ] Database oluşturuldu

### Storage
- [ ] Storage menüsüne gittim
- [ ] "Get started" tıkladım
- [ ] "Production mode" seçtim
- [ ] Aynı location'ı seçtim
- [ ] Storage aktifleştirildi

## 💻 Yerel Kurulum İşlemleri

### Environment Variables
- [ ] CMD açtım
- [ ] Proje klasörüne gittim
- [ ] `.env.local` dosyası oluşturdum
- [ ] Firebase config değerlerini yapıştırdım
- [ ] Dosyayı kaydettim

### Firebase CLI
- [ ] `npm install -g firebase-tools` çalıştırdım
- [ ] `firebase login` çalıştırdım
- [ ] Tarayıcıda Google hesabımla giriş yaptım
- [ ] Terminal'de "Success" mesajını gördüm

### Firebase Init
- [ ] `firebase init` çalıştırdım
- [ ] Firestore ve Storage'ı seçtim
- [ ] Mevcut projeyi seçtim
- [ ] Varsayılan ayarlarla devam ettim
- [ ] Init tamamlandı

### Security Rules Deploy
- [ ] `firebase deploy --only firestore:rules,storage` çalıştırdım
- [ ] "Deploy complete!" mesajını gördüm
- [ ] Hata almadım

## 👤 Admin Kullanıcısı

### Authentication'da Oluşturma
- [ ] Firebase Console > Authentication > Users
- [ ] "Add user" tıkladım
- [ ] Email: admin@marineflux.com
- [ ] Güçlü bir şifre girdim
- [ ] Kullanıcı oluşturuldu
- [ ] UID'yi kopyaladım

### Firestore'da Kayıt
- [ ] Firestore Database menüsüne gittim
- [ ] "Start collection" tıkladım
- [ ] Collection ID: "users"
- [ ] Document ID: (UID yapıştırdım)
- [ ] Gerekli alanları ekledim:
  - [ ] uid (string)
  - [ ] email (string)
  - [ ] role: "admin" (string)
  - [ ] companyName (string)
  - [ ] createdAt (timestamp)
- [ ] Document'i kaydettim

## 🧪 Test

### Development Server
- [ ] CMD açtım
- [ ] `npm run dev` çalıştırdım
- [ ] "Local: http://localhost:3000" gördüm
- [ ] Hata almadım

### Login Testi
- [ ] Tarayıcıda http://localhost:3000/tr/login açtım
- [ ] Admin email ve şifremi girdim
- [ ] "Giriş Yap" tıkladım
- [ ] Admin Dashboard'a yönlendirildim
- [ ] Hata almadım

## 🎉 Tamamlandı!

Tüm checkboxlar işaretli mi?

- ✅ **EVET** → Firebase kurulumu başarılı! 🎉
- ❌ **HAYIR** → Hangi adımda takıldınız? `FIREBASE-QUICK-SETUP.md`'ye bakın.

## 📞 Yardım

Sorun yaşıyorsanız:

1. **`.env.local` kontrolü**
   ```cmd
   type .env.local
   ```
   Tüm değerler dolu mu?

2. **Firebase login kontrolü**
   ```cmd
   firebase projects:list
   ```
   Projenizi görüyor musunuz?

3. **Console hatalarına bakın**
   - Tarayıcıda F12 > Console
   - Terminal'deki hata mesajları

4. **Server'ı yeniden başlatın**
   - Ctrl+C
   - `npm run dev`

---

**Son güncelleme**: 22 Ocak 2025
**Tahmini süre**: 5-10 dakika
**Zorluk**: ⭐⭐☆☆☆ (Kolay)



