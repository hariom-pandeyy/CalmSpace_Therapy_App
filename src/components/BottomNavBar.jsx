import React from 'react';
import { PAGES } from '../utils/constants';

const items = [
  { page: PAGES.HOME, label:'Home' },
  { page: PAGES.JOURNAL, label:'Journal' },
  { page: PAGES.GOALS, label:'Goals' },
  { page: PAGES.GAMES, label:'Games' },
  { page: PAGES.COMMUNITY, label:'Community' },
  { page: PAGES.CHAT, label:'Chat' }
];

export default function BottomNavBar({ currentPage, setCurrentPage }){
  return (
    <nav style={{ position:'fixed', bottom:12, left:12, right:12, height:64, display:'flex', justifyContent:'space-around', alignItems:'center' }}>
      {items.map(it=>(
        <button key={it.label} onClick={()=>setCurrentPage(it.page)} style={{ background:'white', padding:8, borderRadius:8 }}>
          <div style={{ fontSize:12, fontWeight: currentPage===it.page ? 700:500 }}>{it.label}</div>
        </button>
      ))}
    </nav>
  )
}
