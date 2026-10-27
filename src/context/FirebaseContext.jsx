import React, { createContext, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// firebase config should be injected into the environment or window as __firebase_config
const rawConf = typeof __firebase_config !== 'undefined' ? __firebase_config : (window.__firebase_config || '{}');
let parsedConf = {};
try { parsedConf = JSON.parse(rawConf || '{}'); } catch(e) { parsedConf = {}; }

// Build config from Vite env as a fallback (import.meta.env is available in Vite dev/build)
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
// remove undefined keys
const filteredEnvConfig = Object.fromEntries(Object.entries(envConfig).filter(([,v])=>v));

let firebaseConfig = {};
if (Object.keys(parsedConf).length) {
  firebaseConfig = parsedConf;
} else if (Object.keys(filteredEnvConfig).length) {
  firebaseConfig = filteredEnvConfig;
}

let app = null;
let auth = null;
let db = null;

if (firebaseConfig && firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn('Firebase not initialized: no config found. Provide window.__firebase_config in index.html or set VITE_ env vars.');
}

export const FirebaseContext = createContext({ app, auth, db });

export const FirebaseProvider = ({ children }) => {
  const value = useMemo(() => ({ app, auth, db }), []);
  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}
