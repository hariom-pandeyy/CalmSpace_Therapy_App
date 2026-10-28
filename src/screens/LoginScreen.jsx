import React, { useState, useContext } from 'react';
import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FirebaseContext } from '../context/FirebaseContext';
import HomeLogo from '../components/HomeLogo';
import { PAGES } from '../utils/constants';

export default function LoginScreen({ setAuthPage, setCurrentPage }){
  const { auth, loginDemoGuest, loginDemoGoogle } = useContext(FirebaseContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const closeAndGoHome = () => {
    if (typeof setAuthPage === 'function') setAuthPage(null); // hide login card
    if (typeof setCurrentPage === 'function') setCurrentPage(PAGES.HOME); // go to home
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);

    if (auth) {
      try {
        const cred = await signInAnonymously(auth);
        console.log('Firebase anonymous signin success:', cred.user.uid);
        closeAndGoHome();
        return;
      } catch (e) {
        console.warn('Firebase anonymous error, falling back to guest mode:', e);
      }
    }

    // Seamless fallback
    loginDemoGuest?.();
    closeAndGoHome();
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);

    if (auth) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        console.log('Google popup signin success:', result.user.uid);
        closeAndGoHome();
        return;
      } catch (e) {
        console.error('Google popup signin error:', e.code, e.message);
        // If user actively cancelled popup, show clean message
        if (e.code === 'auth/popup-closed-by-user') {
          setError('Google sign-in was cancelled.');
          setLoading(false);
          return;
        }
        // If domain not authorized or popup blocked, inform or use fallback
        if (e.code === 'auth/unauthorized-domain') {
          setError('Vercel domain not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.');
          // Still allow demo login so presentation does not break
          setTimeout(() => {
            loginDemoGoogle?.();
            closeAndGoHome();
          }, 1200);
          return;
        }
      }
    }

    loginDemoGoogle?.();
    closeAndGoHome();
    setLoading(false);
  };

  return (
    <div className="auth-modal">
      <div className="auth-card">
        <button
          type="button"
          className="auth-close"
          onClick={() => setAuthPage?.(null)}
          aria-label="Close sign-in dialog"
        >
          ✕
        </button>
        <div className="auth-card__header">
          <div className="auth-card__logo">
            <HomeLogo/>
          </div>
          <div>
            <p className="auth-card__eyebrow">Welcome</p>
            <h2 className="auth-card__title">Sign in to CalmSpace</h2>
            <p className="auth-card__sub">Continue where you left off and keep your journey in sync.</p>
          </div>
        </div>
        {error && <div className="auth-card__error">{error}</div>}
        <div className="auth-card__actions">
          <button
            className="auth-card__button auth-card__button--outline"
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Sign in with Google'}
          </button>
          <button
            className="auth-card__button auth-card__button--primary"
            onClick={handleGuest}
            disabled={loading}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
