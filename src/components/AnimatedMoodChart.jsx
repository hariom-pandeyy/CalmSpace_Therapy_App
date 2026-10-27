import React from 'react';

const moodToColor = (mood) => ['#EF4444','#F97316','#F59E0B','#22C55E','#10B981'][mood-1] || '#F59E0B';

export default function AnimatedMoodChart({ moods=[] }){
  const dataPoints = moods.length ? moods : [3,4,2,5,4,3,3];
  const normalized = dataPoints.map(m => ((m-1)/4)*100);
  const width = 300, height=100;
  const step = width / (normalized.length -1 || 1);
  const path = normalized.length ? normalized.map((p,i)=>`${i===0? 'M' : 'L'} ${i*step} ${height - p}`).join(' ') : 'M 0 50';

  return (
    <div style={{ width:'100%', height:160 }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
        <defs>
          <linearGradient id="lgline" x1="0" x2="1"><stop offset="0%" stopColor="#a5b4fc"/><stop offset="100%" stopColor="#93c5fd"/></linearGradient>
        </defs>
        <path className="mood-path" d={path} fill="none" stroke="url(#lgline)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {normalized.map((p,i)=>(
          <circle key={i} className="mood-dot" cx={(i*step)} cy={height-p} r="5" fill="#fff" stroke={moodToColor(dataPoints[i])} strokeWidth="2" style={{ animationDelay:`${i*0.1}s`}} />
        ))}
      </svg>
    </div>
  )
}
