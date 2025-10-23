# Test Kullanıcıları Oluşturma

Firebase kurulumunu tamamladıktan sonra test kullanıcıları oluşturun.

## 1. Firebase Console'dan Manuel Oluşturma

### Armatör (Shipowner) Kullanıcısı

**Authentication:**
- Email: `shipowner@test.com`
- Password: `test123456`

**Firestore (users collection):**
```
Document ID: [UID kopyala]
Fields:
- uid: [UID]
- email: "shipowner@test.com"
- role: "shipowner"
- companyName: "Mediterranean Shipping Co."
- createdAt: [timestamp]
```

### Tedarikçi (Supplier) Kullanıcısı

**Authentication:**
- Email: `supplier@test.com`
- Password: `test123456`

**Firestore (users collection):**
```
Document ID: [UID kopyala]
Fields:
- uid: [UID]
- email: "supplier@test.com"
- role: "supplier"
- companyName: "Global Marine Supplies"
- createdAt: [timestamp]
```

## 2. Test Giriş Bilgileri

| Rol | Email | Şifre |
|-----|-------|-------|
| Admin | admin@marineflux.com | (sizin belirlediğiniz) |
| Shipowner | shipowner@test.com | test123456 |
| Supplier | supplier@test.com | test123456 |

## 3. Test URL'leri

- Armatör Girişi: http://localhost:3000/tr/login?type=shipowner
- Tedarikçi Girişi: http://localhost:3000/tr/login?type=supplier
- Admin Girişi: http://localhost:3000/tr/login

## 4. Test Senaryoları

### Armatör:
1. Login yap
2. Dashboard'u görüntüle
3. RFQ sayfasına git
4. Tedarikçi ara

### Tedarikçi:
1. Login yap
2. Dashboard'u görüntüle
3. RFQ listesine bak

### Admin:
1. Login yap
2. Kullanıcı istatistiklerini gör
3. Platform genel bakış



