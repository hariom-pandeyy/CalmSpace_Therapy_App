import React, { useContext, useState } from 'react';
import { FirebaseContext } from '../context/FirebaseContext';
import HomeLogo from '../components/HomeLogo';
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginScreen({ setAuthPage }){
  const { auth } = useContext(FirebaseContext);
  const [error,setError]=useState('');

  const handleGuest = async () => {
    try {
      setError(null);
      const userCredential = await signInAnonymously(auth);
      console.log('Signed in anonymously:', userCredential.user.uid);
    } catch (error) {
      console.error('Guest login error:', error.code, error.message);
      setError(`Guest login failed: ${error.message}`);
    }
  };

  const handleGoogle = async ()=>{
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch(e){ console.error(e); setError('Google login failed'); }
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
