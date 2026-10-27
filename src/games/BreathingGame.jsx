import React, { useEffect, useRef, useState } from 'react';
export default function BreathingGame(){
  const [text, setText] = useState('Get Ready');
  const timer = useRef(null);

  useEffect(()=>{
    const cycle = [
      { text:'Breathe In...', duration:4000 },
      { text:'Hold', duration:4000 },
      { text:'Breathe Out...', duration:6000 },
      { text:'Hold', duration:2000 }
    ];
    let idx=0;
    const next = ()=>{
      const step = cycle[idx % cycle.length];
      setText(step.text);
      idx++;
      timer.current = setTimeout(next, step.duration);
    };
    timer.current = setTimeout(next, 500);
    return ()=> clearTimeout(timer.current);
  },[]);

  return (
    <div className="card" style={{ padding:16, marginBottom:12, textAlign:'center' }}>
      <h3>Breathing Circle</h3>
      <div style={{ width:160, height:160, borderRadius:'50%', background:'linear-gradient(180deg,#bfdbfe,#e9d5ff)', display:'flex', alignItems:'center', justifyContent:'center', margin:'12px auto' }}>
        <div style={{ color:'#fff', fontWeight:700 }}>{text}</div>
      </div>
    </div>
  )
}
