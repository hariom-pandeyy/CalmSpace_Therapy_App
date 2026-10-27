import React, { useEffect, useState } from 'react';
const pairs = [
  { un:'I\'ll never get this done.', ref:'I can take this one step at a time.' },
  { un:'Everyone thinks I\'m a failure.', ref:'I can\'t know what others think. I\'m trying my best.' },
  { un:'This is all my fault.', ref:'There were many factors; I can learn from this.' },
  { un:'I\'m just not good enough.', ref:'I have strengths and weaknesses like everyone.' }
];

const shuffle = (arr)=> arr.sort(()=>Math.random()-0.5);

export default function ThoughtMatchGame(){
  const [left,setLeft]=useState([]);
  const [right,setRight]=useState([]);
  const [selectedL,setSelectedL]=useState(null);
  const [selectedR,setSelectedR]=useState(null);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    const s = shuffle([...pairs]);
    setLeft(s.map(p=>({ id:p.un, text:p.un })));
    setRight(shuffle(s.map(p=>({ id:p.un, text:p.ref }))));
  },[]);

  useEffect(()=>{
    if(!selectedL || !selectedR) return;
    if(selectedL.id === selectedR.id){
      setMessage("Great match!");
      setLeft(prev=>prev.filter(x=>x.id!==selectedL.id));
      setRight(prev=>prev.filter(x=>x.id!==selectedL.id));
    } else setMessage('Not quite a match.');
    setTimeout(()=>{ setSelectedL(null); setSelectedR(null); setMessage(''); }, 1200);
  },[selectedL, selectedR]);

  return (
    <div className="card" style={{ padding:16, marginBottom:12 }}>
      <h3>Thought Match</h3>
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1 }}>{left.map(l=>( <button key={l.id} onClick={()=>setSelectedL(l)} style={{ display:'block', marginBottom:8, background: selectedL?.id===l.id? '#bfdbfe':'#f3f4f6' }}>{l.text}</button> ))}</div>
        <div style={{ flex:1 }}>{right.map(r=>( <button key={r.id} onClick={()=>setSelectedR(r)} style={{ display:'block', marginBottom:8, background: selectedR?.id===r.id? '#bbf7d0':'#f3f4f6' }}>{r.text}</button> ))}</div>
      </div>
      {message && <div style={{ marginTop:8 }}>{message}</div>}
    </div>
  )
}
