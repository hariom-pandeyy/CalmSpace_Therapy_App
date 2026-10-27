import React from 'react';
export default function Loader({ text='Loading...' }){
  return (
    <div style={{ minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
      <div className="loader-spin"></div>
      <div style={{ marginTop: 12, color:'#3730a3' }}>{text}</div>
    </div>
  )
}
