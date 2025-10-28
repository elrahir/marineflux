# Windows Kurulum Rehberi

## PowerShell Script Hatası Çözümü

Windows PowerShell'de `npm` komutları çalışmıyorsa şu hatayı alırsınız:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled
```

### Hızlı Çözüm: Command Prompt Kullanın

1. **Windows tuşuna** basın
2. `cmd` yazın
3. **Command Prompt**'u açın
4. Proje dizinine gidin:

```cmd
cd C:\Users\chart\OneDrive\Desktop\Marineflux
```

5. Bağımlılıkları yükleyin:

```cmd
npm install
```

6. Development server'ı başlatın:

```cmd
npm run dev
```

7. Tarayıcınızda açın: http://localhost:3000

### Alternatif: PowerShell Ayarlarını Değiştirin

**Not**: Bu yöntem sistem güvenlik ayarlarını değiştirir.

1. **PowerShell'i Administrator olarak açın**
   - Windows tuşuna basın
   - `PowerShell` yazın
   - Sağ tıklayın ve "Run as Administrator" seçin

2. Execution policy'yi değiştirin:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. Onaylamak için `Y` yazın ve Enter'a basın

4. Normal PowerShell açın ve komutu çalıştırın:

```powershell
cd C:\Users\chart\OneDrive\Desktop\Marineflux
npm install
npm run dev
```

### VS Code Kullanıyorsanız

1. **Ctrl + `** ile terminal açın
2. Terminal tipini değiştirin:
   - Terminal sağ üstteki `+` yanındaki ok işaretine tıklayın
   - "Command Prompt" veya "Git Bash" seçin
3. Komutları çalıştırın:

```bash
npm install
npm run dev
```

## Kurulum Adımları

### 1. Node.js Kontrolü

```cmd
node --version
npm --version
```

Node.js 18 veya üzeri olmalı. Değilse [nodejs.org](https://nodejs.org) adresinden indirin.

### 2. Bağımlılıkları Yükleyin

```cmd
npm install
```

Bu komut şunları yükleyecek:
- Next.js 15
- React 18
- Firebase SDK
- Tailwind CSS
- TypeScript
- Diğer tüm bağımlılıklar

**Beklenen süre**: 2-5 dakika (internet hızınıza bağlı)

### 3. Environment Variables Oluşturun

1. `.env.local` dosyası oluşturun (proje kök dizininde)
2. Şu içeriği ekleyin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Not**: Firebase kurulumu için `FIREBASE-SETUP.md` dosyasına bakın.

### 4. Development Server'ı Başlatın

```cmd
npm run dev
```

Başarılı olursa şunu göreceksiniz:
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Ready in XXXms
```

### 5. Tarayıcıda Açın

http://localhost:3000 adresine gidin.

Ana sayfayı göreceksiniz! 🎉

## Sık Karşılaşılan Sorunlar

### "Cannot find module" Hatası

```cmd
# node_modules klasörünü silin ve tekrar yükleyin
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Port Zaten Kullanımda

```cmd
# Farklı bir port kullanın
npm run dev -- -p 3001
```

### Firebase Hataları

- `.env.local` dosyasının olduğundan emin olun
- Firebase değerlerinin doğru olduğunu kontrol edin
- Firebase projesinin oluşturulduğundan emin olun

### TypeScript Hataları

```cmd
# .next klasörünü temizleyin
rmdir /s /q .next
npm run dev
```

## Sonraki Adımlar

1. ✅ npm install tamamlandı
2. ✅ npm run dev çalışıyor
3. ✅ http://localhost:3000 açık
4. 📋 Firebase kurulumu (FIREBASE-SETUP.md)
5. 🔐 Admin kullanıcısı oluştur
6. 🚀 Platformu test et

## Yardımcı Komutlar

```cmd
# Bağımlılıkları yükle
npm install

# Development server
npm run dev

# Production build
npm run build

# Production server
npm start

# Kod kontrolü
npm run lint

# Cache temizle
rmdir /s /q .next
rmdir /s /q node_modules
```

## Destek

Sorun yaşıyorsanız:

1. Hata mesajını dikkatlice okuyun
2. `node --version` ve `npm --version` kontrol edin
3. `.env.local` dosyasını kontrol edin
4. `node_modules` silip tekrar yükleyin
5. Dokümantasyon dosyalarına bakın:
   - INSTALLATION.md
   - FIREBASE-SETUP.md
   - README.md

Başarılar! 🚀




