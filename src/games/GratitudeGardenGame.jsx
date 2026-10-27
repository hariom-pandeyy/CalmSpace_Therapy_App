import React, { useState } from 'react';
export default function GratitudeGardenGame(){
  const [items,setItems]=useState([]);
  const [input,setInput]=useState('');
  const [error,setError]=useState('');

  const plant = ()=>{
    if(!input.trim()){ setError('Please write something first!'); return; }
    setError('');
    const it = { id: Date.now(), text: input, x: Math.random()*80+10, y: Math.random()*50+20, color: ['#ec4899','#8b5cf6','#f59e0b','#3b82f6'][Math.floor(Math.random()*4)], rotation: Math.random()*30-15 };
    setItems(prev=>[...prev,it]);
    setInput('');
  };

  return (
    <div className="card" style={{ padding:16, marginBottom:12 }}>
      <h3>Gratitude Garden</h3>
      <div style={{ height:200, position:'relative', borderRadius:8, background:'linear-gradient(to top,#c1dfc4,#f0f7f2)' }}>
        {items.map(it=>( <div key={it.id} style={{ position:'absolute', left:it.x+'%', top:it.y+'%', transform:`rotate(${it.rotation}deg)` }}>{it.text}</div> ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} style={{ flex:1 }} placeholder="I'm grateful for..." />
        <button onClick={plant} className="button">Plant</button>
      </div>
      {error && <div style={{ color:'red' }}>{error}</div>}
    </div>
  )
}
