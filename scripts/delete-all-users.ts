/**
 * Delete All Users Script (Except Admins)
 * 
 * Bu script Firebase Authentication ve Firestore'daki tüm kullanıcıları
 * (admin rolü hariç) siler.
 * 
 * UYARI: Bu işlem geri alınamaz!
 * 
 * Kullanım:
 * npx ts-node --project scripts/tsconfig.json scripts/delete-all-users.ts
 */

import admin from 'firebase-admin';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

// Firebase Admin SDK yapılandırması
// Service account key dosyanızı proje root'una koyun
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('\n❌ HATA: serviceAccountKey.json dosyası bulunamadı!');
  console.error('   Dosya konumu:', serviceAccountPath);
  console.error('\n📖 Lütfen KULLANICI-SILME-REHBERI.md dosyasını okuyun.\n');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

interface UserRecord {
  uid: string;
  email?: string;
  role?: string;
}

/**
 * Firestore'dan tüm kullanıcıları al
 */
async function getAllUsersFromFirestore(): Promise<UserRecord[]> {
  const usersSnapshot = await db.collection('users').get();
  const users: UserRecord[] = [];
  
  usersSnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      uid: doc.id,
      email: data.email,
      role: data.role
    });
  });
  
  return users;
}

/**
 * Authentication'dan tüm kullanıcıları al
 */
async function getAllUsersFromAuth(): Promise<UserRecord[]> {
  const users: UserRecord[] = [];
  let pageToken: string | undefined;
  
  do {
    const listUsersResult = await auth.listUsers(1000, pageToken);
    listUsersResult.users.forEach((userRecord) => {
      users.push({
        uid: userRecord.uid,
        email: userRecord.email
      });
    });
    pageToken = listUsersResult.pageToken;
  } while (pageToken);
  
  return users;
}

/**
 * Admin kullanıcıları filtrele
 */
function filterNonAdmins(users: UserRecord[]): UserRecord[] {
  return users.filter(user => user.role !== 'admin');
}

/**
 * Firestore'dan kullanıcı sil
 */
async function deleteUserFromFirestore(uid: string): Promise<boolean> {
  try {
    await db.collection('users').doc(uid).delete();
    
    // İlgili koleksiyonlardan da sil
    await db.collection('shipowners').doc(uid).delete().catch(() => {});
    await db.collection('suppliers').doc(uid).delete().catch(() => {});
    
    return true;
  } catch (error) {
    console.error(`❌ Firestore'dan silme hatası (${uid}):`, error);
    return false;
  }
}

/**
 * Authentication'dan kullanıcı sil
 */
async function deleteUserFromAuth(uid: string): Promise<boolean> {
  try {
    await auth.deleteUser(uid);
    return true;
  } catch (error) {
    console.error(`❌ Auth'dan silme hatası (${uid}):`, error);
    return false;
  }
}

/**
 * Kullanıcıdan onay al
 */
function askForConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'evet' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Ana silme işlemi
 */
async function deleteAllNonAdminUsers() {
  console.log('\n' + '='.repeat(70));
  console.log('🗑️  TÜM KULLANICILARI SİLME ARACI (ADMIN HARİÇ)');
  console.log('='.repeat(70) + '\n');

  try {
    // Firestore'dan kullanıcıları al
    console.log('📊 Firestore\'dan kullanıcılar alınıyor...');
    const firestoreUsers = await getAllUsersFromFirestore();
    console.log(`   Toplam ${firestoreUsers.length} kullanıcı bulundu.\n`);

    // Auth'dan kullanıcıları al
    console.log('🔐 Authentication\'dan kullanıcılar alınıyor...');
    const authUsers = await getAllUsersFromAuth();
    console.log(`   Toplam ${authUsers.length} kullanıcı bulundu.\n`);

    // Admin olmayanları filtrele
    const nonAdminFirestoreUsers = filterNonAdmins(firestoreUsers);
    const adminCount = firestoreUsers.length - nonAdminFirestoreUsers.length;

    console.log('📋 Kullanıcı İstatistikleri:');
    console.log(`   • Firestore: ${firestoreUsers.length} toplam, ${adminCount} admin, ${nonAdminFirestoreUsers.length} admin olmayan`);
    console.log(`   • Auth: ${authUsers.length} toplam\n`);

    if (nonAdminFirestoreUsers.length === 0 && authUsers.length === 0) {
      console.log('✅ Silinecek kullanıcı bulunamadı.\n');
      return;
    }

    // Admin kullanıcıları listele
    if (adminCount > 0) {
      console.log('👑 Korunacak Admin Kullanıcılar:');
      firestoreUsers
        .filter(u => u.role === 'admin')
        .forEach(u => console.log(`   • ${u.email} (${u.uid})`));
      console.log('');
    }

    // Silinecek kullanıcıları listele (ilk 10)
    if (nonAdminFirestoreUsers.length > 0) {
      console.log('🗑️  Silinecek Kullanıcılar (örnek):');
      nonAdminFirestoreUsers.slice(0, 10).forEach(u => {
        console.log(`   • ${u.email || 'Email yok'} (${u.role || 'Rol yok'}) - ${u.uid}`);
      });
      if (nonAdminFirestoreUsers.length > 10) {
        console.log(`   ... ve ${nonAdminFirestoreUsers.length - 10} kullanıcı daha\n`);
      } else {
        console.log('');
      }
    }

    // Onay al
    console.log('⚠️  UYARI: Bu işlem GERİ ALINAMAZ!\n');
    const confirmed = await askForConfirmation(
      `${nonAdminFirestoreUsers.length} kullanıcıyı ve ${authUsers.length} auth kaydını silmek istediğinizden emin misiniz? (evet/hayır): `
    );

    if (!confirmed) {
      console.log('\n❌ İşlem iptal edildi.\n');
      return;
    }

    // İkinci onay
    const doubleConfirmed = await askForConfirmation(
      '\n⚠️  SON UYARI: Tüm veriler kalıcı olarak silinecek. Devam edilsin mi? (evet/hayır): '
    );

    if (!doubleConfirmed) {
      console.log('\n❌ İşlem iptal edildi.\n');
      return;
    }

    console.log('\n🗑️  Silme işlemi başlıyor...\n');

    let firestoreDeletedCount = 0;
    let firestoreFailedCount = 0;
    let authDeletedCount = 0;
    let authFailedCount = 0;

    // Firestore'dan sil
    console.log('📁 Firestore\'dan kullanıcılar siliniyor...');
    for (const user of nonAdminFirestoreUsers) {
      const success = await deleteUserFromFirestore(user.uid);
      if (success) {
        firestoreDeletedCount++;
        console.log(`   ✅ Silindi: ${user.email || user.uid}`);
      } else {
        firestoreFailedCount++;
      }
      
      // Rate limiting için küçük gecikme
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Auth'dan sil (tüm kullanıcılar - admin kontrolü auth'da yok)
    console.log('\n🔐 Authentication\'dan kullanıcılar siliniyor...');
    for (const user of authUsers) {
      // Admin email'lerini korumak için ek kontrol
      const firestoreUser = firestoreUsers.find(u => u.uid === user.uid);
      if (firestoreUser?.role === 'admin') {
        console.log(`   ⏭️  Atlandı (admin): ${user.email || user.uid}`);
        continue;
      }

      const success = await deleteUserFromAuth(user.uid);
      if (success) {
        authDeletedCount++;
        console.log(`   ✅ Silindi: ${user.email || user.uid}`);
      } else {
        authFailedCount++;
      }
      
      // Rate limiting için küçük gecikme
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Sonuçları göster
    console.log('\n' + '='.repeat(70));
    console.log('✨ İşlem Tamamlandı!');
    console.log('='.repeat(70));
    console.log('\n📊 Sonuçlar:');
    console.log(`   Firestore:`);
    console.log(`   • ✅ Başarılı: ${firestoreDeletedCount} kullanıcı`);
    console.log(`   • ❌ Başarısız: ${firestoreFailedCount} kullanıcı`);
    console.log(`\n   Authentication:`);
    console.log(`   • ✅ Başarılı: ${authDeletedCount} kullanıcı`);
    console.log(`   • ❌ Başarısız: ${authFailedCount} kullanıcı`);
    console.log(`\n   🛡️  Korunan: ${adminCount} admin kullanıcı`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Kritik hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
deleteAllNonAdminUsers()
  .then(() => {
    console.log('✅ Script başarıyla tamamlandı.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script hatası:', error);
    process.exit(1);
  });

