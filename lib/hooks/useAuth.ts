'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getUserData, UserData } from '@/lib/firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        try {
          let data = await getUserData(authUser.uid);
          
          // Eğer userData yoksa, auth bilgisinden varsayılan bir userData oluştur
          if (!data && authUser.email) {
            // Determine role from email pattern (temporary solution)
            let role: 'shipowner' | 'supplier' | 'admin' = 'supplier';
            if (authUser.email.includes('shipowner')) role = 'shipowner';
            if (authUser.email.includes('admin')) role = 'admin';
            
            data = {
              uid: authUser.uid,
              email: authUser.email,
              role,
              companyName: authUser.displayName || 'Unknown Company',
              createdAt: new Date(),
            } as unknown as UserData;
            
            console.log('ℹ️ userData Firestore\'da bulunamadı, auth bilgisinden oluşturuldu:', {
              uid: authUser.uid,
              email: authUser.email,
              role,
            });
          }
          
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback userData
          if (authUser.email) {
            let role: 'shipowner' | 'supplier' | 'admin' = 'supplier';
            if (authUser.email.includes('shipowner')) role = 'shipowner';
            if (authUser.email.includes('admin')) role = 'admin';
            
            setUserData({
              uid: authUser.uid,
              email: authUser.email,
              role,
              companyName: authUser.displayName || 'Unknown Company',
              createdAt: new Date(),
            } as unknown as UserData);
          }
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userData, loading };
}




