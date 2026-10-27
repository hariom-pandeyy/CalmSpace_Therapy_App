import React from 'react';
import HomeLogo from '../components/HomeLogo';

export default function LandingScreen({ setAuthPage }){
  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:40 }}>
      <div style={{ textAlign:'center', padding:24, background:'rgba(255,255,255,0.9)', borderRadius:12 }}>
        <div style={{ width:120, height:120, margin:'0 auto' }}><HomeLogo/></div>
        <h1 style={{ marginTop:12 }}>CalmSpace</h1>
        <p>A quiet place to reflect, grow, and connect.</p>
        <div style={{ marginTop:12 }}>
          <button className="button" onClick={()=>setAuthPage('login')}>Get Started</button>
        </div>
      </div>
    </div>
  )
}
