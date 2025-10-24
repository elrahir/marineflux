# Firestore Indexes

Bu dokümant, MarineFlux uygulaması için gerekli olan Firestore composite index'lerini listeler.

## Notifications Collection

### Index 1: userId + createdAt (DESC)
- **Collection**: `notifications`
- **Fields**:
  - `userId` (Ascending)
  - `createdAt` (Descending)
- **Purpose**: Kullanıcının notifikasyonlarını son tarihten başlayarak sıralamak
- **Status**: ⚠️ GEREKLI

### Index 2: userId + read + createdAt (DESC)
- **Collection**: `notifications`
- **Fields**:
  - `userId` (Ascending)
  - `read` (Ascending)
  - `createdAt` (Descending)
- **Purpose**: Okunmamış notifikasyonları filtreleyip sıralamak
- **Status**: ⚠️ İSTEĞE BAĞLI

## Oluşturma Adımları

### Yöntem 1: Firebase Console (Otomatik)
1. Uygulamayı çalıştır (`npm run dev`)
2. Notification query çalıştığında Firebase hata verecek
3. Hata mesajındaki linke tıkla
4. Firebase Console otomatik olarak index oluşturmayı önerecek
5. "Create" butonuna tıkla
6. Index oluşturulması 5-10 dakika sürer

### Yöntem 2: Firebase CLI
```bash
firebase firestore:indexes
```

## Index Faydaları

✅ **Performance**: Queryler hızlanır  
✅ **Sorting**: `createdAt` DESC ile son notifikasyonlar öne çıkar  
✅ **Filtering**: `read` alanı ile okunmuş/okunmamış ayrımı yapılabilir  
✅ **Scalability**: Milyonlarca notifikasyonda bile hızlı çalışır

## Mevcut Queries

### Notifications Listener (DashboardLayout.tsx)
```typescript
query(
  collection(db, 'notifications'),
  where('userId', '==', user.uid),
  orderBy('createdAt', 'desc'),
  limit(50)
)
```
**Index Gereksinimi**: userId + createdAt (DESC) ✅

### Reviews Listener (Supplier Profile)
```typescript
query(
  collection(db, 'reviews'),
  where('supplierUid', '==', user.uid),
  orderBy('createdAt', 'desc'),
  limit(50)
)
```
**Index Gereksinimi**: supplierUid + createdAt (DESC) ⚠️

## Monitoring

Firebase Console → Firestore → Indexes → Performance sayfasından index kullanımını izleyebilirsin.
