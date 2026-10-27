import React from 'react';
export default function HomeLogo(){
  return (
    <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%' }}>
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      <g>
        <path d="M50 90 V55" stroke="url(#lg1)" strokeWidth="6" strokeLinecap="round" />
        <path d="M50,20 C40,20 30,25 30,38 C30,45 35,50 42,52 C38,53 35,58 38,62 C40,65 45,64 50,60 C55,64 60,65 62,62 C65,58 62,53 58,52 C65,50 70,45 70,38 C70,25 60,20 50,20 Z" fill="url(#lg1)" stroke="url(#lg1)" strokeWidth="2" />
      </g>
    </svg>
  )
}
