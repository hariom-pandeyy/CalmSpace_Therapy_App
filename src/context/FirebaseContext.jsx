import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Named export required by your screens:
export const FirebaseContext = createContext({
  auth: null,
  db: null,
  user: null,
  setUser: () => {},
  loading: true,
  loginDemoGuest: () => {},
  loginDemoGoogle: () => {},
  logoutDemo: () => {}
});

// Primary direct config with Vite env fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCq_l8XBBIIezC-jFH5K_icw64rkM4DnAo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "calmspace-therapy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "calmspace-therapy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "calmspace-therapy.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "130104206465",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:130104206465:web:90a221d8f7729e6ed0d980",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E0MD2QPVPM"
};

let app = null;
if (getApps().length > 0) {
  app = getApps()[0];
} else {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.warn('Firebase init error', e);
  }
}

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export function FirebaseProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('calmspace_demo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        try {
          const saved = localStorage.getItem('calmspace_demo_user');
          setUser(saved ? JSON.parse(saved) : null);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginDemoGuest = () => {
    const guestUser = {
      uid: 'guest-' + Date.now(),
      displayName: 'Guest User',
      email: 'guest@calmspace.app',
      isAnonymous: true,
      photoURL: null
    };
    try {
      localStorage.setItem('calmspace_demo_user', JSON.stringify(guestUser));
    } catch (e) {
      console.warn('Storage error', e);
    }
    setUser(guestUser);
    return guestUser;
  };

  const loginDemoGoogle = () => {
    const demoGoogleUser = {
      uid: 'user-hariom-' + Date.now(),
      displayName: 'Hariom Pandey',
      email: 'hariompande824@gmail.com',
      isAnonymous: false,
      photoURL: 'https://avatars.githubusercontent.com/u/192677578?v=4'
    };
    try {
      localStorage.setItem('calmspace_demo_user', JSON.stringify(demoGoogleUser));
    } catch (e) {
      console.warn('Storage error', e);
    }
    setUser(demoGoogleUser);
    return demoGoogleUser;
  };

  const logoutDemo = () => {
    try {
      localStorage.removeItem('calmspace_demo_user');
    } catch (e) {
      console.warn('Storage error', e);
    }
    setUser(null);
  };

  return (
    <FirebaseContext.Provider value={{ auth, db, user, setUser, loading, loginDemoGuest, loginDemoGoogle, logoutDemo }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}
