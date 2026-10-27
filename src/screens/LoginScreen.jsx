import React, { useState, useContext } from 'react';
import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FirebaseContext } from '../context/FirebaseContext';
import HomeLogo from '../components/HomeLogo';
import { PAGES } from '../utils/constants';

export default function LoginScreen({ setAuthPage, setCurrentPage }){
  const { auth } = useContext(FirebaseContext);
  const [error,setError]=useState('');

  const closeAndGoHome = () => {
    if (typeof setAuthPage === 'function') setAuthPage(null); // hide login card
    if (typeof setCurrentPage === 'function') setCurrentPage(PAGES.HOME); // go to home
  };

  const handleGuest = async () => {
    setError(null);
    if (!auth) {
      setError('Firebase not configured. Check .env or FirebaseContext.');
      console.error('Firebase auth is null. import.meta.env:', {
        API_KEY: import.meta.env.VITE_FIREBASE_API_KEY
      });
      return;
    }

    try {
      const cred = await signInAnonymously(auth);
      console.log('Signed in anonymously:', cred.user.uid);
      closeAndGoHome();
    } catch (e) {
      console.error('Guest login error:', e.code, e.message);
      if (e.code === 'auth/configuration-not-found' || e.code === 'auth/internal-error') {
        setError('Guest login failed: enable Anonymous sign-in in Firebase console and verify .env keys.');
      } else {
        setError(`Guest login failed: ${e.message}`);
      }
    }
  };

  const handleGoogle = async ()=>{
    setError(null);
    if (!auth) {
      setError('Firebase not configured. Check .env or FirebaseContext.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in success:', result.user.uid);
      closeAndGoHome();
    } catch(e){
      console.error(e);
      // If popup blocked or CORS, fallback to redirect
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/web-storage-unsupported' || e.code === 'auth/cancelled-popup-request') {
        setError('Popup blocked — try allowing popups or use a different browser. Falling back to redirect...');
        try {
          // fallback: redirect flow (avoids some popup issues)
          await import('firebase/auth').then(({ signInWithRedirect }) => signInWithRedirect(auth, new GoogleAuthProvider()));
        } catch (redirErr) {
          console.error('Redirect fallback failed', redirErr);
          setError('Google login failed');
        }
      } else {
        setError('Google login failed');
      }
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ width:420, padding:18 }} className="card">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:64, height:64 }}><HomeLogo/></div>
          <h2>Welcome to CalmSpace</h2>
        </div>
        {error && <div style={{ color:'red' }}>{error}</div>}
        <div style={{ marginTop:12 }}>
          <button className="button" onClick={handleGoogle} style={{ background:'#fff', color:'#333', marginBottom:8 }}>Sign in with Google</button>
          <button className="button" onClick={handleGuest}>Continue as Guest</button>
        </div>
        <div style={{ marginTop:8 }}>
          <button onClick={()=>setAuthPage('landing')}>← Back to Home</button>
        </div>
      </div>
    </div>
  )
}
