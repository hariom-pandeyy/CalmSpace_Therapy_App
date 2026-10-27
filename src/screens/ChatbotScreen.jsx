import React, { useContext, useEffect, useRef, useState } from 'react';
import { FirebaseContext } from '../context/FirebaseContext';
import { fetchWithRetry } from '../utils/apiHelpers';

export default function ChatbotScreen(){
  const { auth } = useContext(FirebaseContext);
  const [messages, setMessages] = useState([{ role:'model', text: "Hello! I'm CalmBot, your calm assistant. How can I support you today?" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);

  const handleSend = async ()=>{
    if(!input.trim() || loading) return;
    const userMsg = { role:'user', text: input };
    setMessages(m=>[...m, userMsg]);
    setInput(''); setLoading(true);
    try{
      const apiKey = typeof __GEMINI_API_KEY !== 'undefined' ? __GEMINI_API_KEY : (window.__GEMINI_API_KEY || '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const payload = { /* keep payload minimal for demo */ };
      // Use fetchWithRetry for robust calls; here we only show structure
      // const res = await fetchWithRetry(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      // const data = await res.json();
      // const botText = data.candidates?.[0]?.content?.[0]?.text || "Sorry, I couldn't reach the assistant.";

      // For safety demo (no real API call), echo:
      const botText = "This is a simulated CalmBot response (API key not provided).";

      setMessages(m=>[...m, { role:'model', text: botText }]);
    }catch(e){ console.error(e); setMessages(m=>[...m, { role:'model', text: 'Error: failed to get response.' }]); }
    setLoading(false);
  };

  return (
    <div style={{ padding:24 }}>
      <h1>CalmBot</h1>
      <div style={{ maxHeight:400, overflow:'auto', border:'1px solid #eee', padding:12, borderRadius:8 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ marginBottom:8, textAlign: m.role==='model' ? 'left':'right' }}>
            <div style={{ display:'inline-block', padding:8, borderRadius:8, background: m.role==='model' ? '#eef2ff' : '#d1fae5' }}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} style={{ flex:1, padding:8 }} placeholder="Type a message..." />
        <button onClick={handleSend} className="button" disabled={loading}>{loading? '...' : 'Send'}</button>
      </div>
    </div>
  )
}
