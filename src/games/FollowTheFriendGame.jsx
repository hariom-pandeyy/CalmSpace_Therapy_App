import React, { useEffect, useRef, useState } from 'react';
export default function FollowTheFriendGame(){
  const [state,setState]=useState('start');
  const [positions,setPositions]=useState({ friend:0, other:1 });
  const [score,setScore]=useState(0);
  const timer = useRef(null);
  const grid = ['10% 20%','80% 20%','10% 50%','80% 50%','10% 80%','80% 80%','50% 20%','50% 80%'];

  const nextRound = ()=>{
    let a = Math.floor(Math.random()*grid.length), b=Math.floor(Math.random()*grid.length);
    while(a===b) b=Math.floor(Math.random()*grid.length);
    setPositions({ friend:a, other:b });
    setState('showing');
    timer.current = setTimeout(()=>{ setState('faded'); timer.current = setTimeout(()=> setState('tapping'), 300); }, 1000);
  };

  useEffect(()=> ()=> clearTimeout(timer.current), []);

  const handleTap = (isFriend)=>{
    if(state!=='tapping') return;
    if(isFriend){ setScore(s=>s+1); }
    setTimeout(nextRound, 600);
  };

  return (
    <div className="card" style={{ padding:16, marginBottom:12 }}>
      <h3>Follow the Friend</h3>
      <div style={{ height:200, position:'relative', background:'#f3f4f6', borderRadius:8 }}>
        {state==='start' && <button onClick={nextRound} style={{ position:'absolute', inset:0, margin:'auto', width:120, height:40 }}>Start</button>}
        {(state==='showing' || state==='faded' || state==='tapping') && (
          <>
            <div style={{ position:'absolute', left: grid[positions.friend].split(' ')[0], top: grid[positions.friend].split(' ')[1], transform:'translate(-50%,-50%)' }}>{state==='faded' ? '': '🙂'}</div>
            <div style={{ position:'absolute', left: grid[positions.other].split(' ')[0], top: grid[positions.other].split(' ')[1], transform:'translate(-50%,-50%)' }}>{state==='faded' ? '': '😐'}</div>
          </>
        )}
        {state==='tapping' && (
          <>
            <button onClick={()=>handleTap(true)} style={{ position:'absolute', left: grid[positions.friend].split(' ')[0], top: grid[positions.friend].split(' ')[1], transform:'translate(-50%,-50%)' }}>✓</button>
            <button onClick={()=>handleTap(false)} style={{ position:'absolute', left: grid[positions.other].split(' ')[0], top: grid[positions.other].split(' ')[1], transform:'translate(-50%,-50%)' }}>✕</button>
          </>
        )}
      </div>
      <div style={{ marginTop:8, fontWeight:700 }}>Score: {score}</div>
    </div>
  )
}
