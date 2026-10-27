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

  const extractTextFromResponse = (data) => {
    if (!data) return null;
    if (typeof data === 'string') return data;
    if (data.candidates && data.candidates.length) {
      const c = data.candidates[0];
      if (c.output) return c.output;
      if (Array.isArray(c.content)) {
        return c.content.map(i => i.text || i.output || '').join('') || null;
      }
      if (c.content?.parts?.length) {
        const combined = c.content.parts.map(part => part.text || part.output || '').join('').trim();
        if (combined) return combined;
      }
      if (c.text) return c.text;
    }
    if (data.output && data.output.length) {
      return data.output.map(o=> (o.content||[]).map(c=>c.text||'').join('')).join('\n') || null;
    }
    if (data.result && data.result.output) {
      return JSON.stringify(data.result.output);
    }
    if (data.text) return data.text;
    return JSON.stringify(data);
  };

  const handleSend = async ()=>{
    if(!input.trim() || loading) return;
    const userMsg = { role:'user', text: input };
    setMessages(m=>[...m, userMsg]);
    setInput(''); setLoading(true);

    try{
      const useProxy = import.meta.env.VITE_USE_PROXY === 'true';
      let data;

      if (useProxy) {
        const res = await fetchWithRetry('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input })
        });

        // Check if response is OK
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Proxy error response:', errorData);
          setMessages(m=>[...m, { role:'model', text: `Proxy error: ${errorData.error || 'Unknown error'}` }]);
          setLoading(false);
          return;
        }

        data = await res.json();
      } else {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        if (!apiKey) {
          setMessages(m=>[...m, { role:'model', text: "API key missing. Set VITE_GEMINI_API_KEY or enable proxy." }]);
          setLoading(false);
          return;
        }
        const url = `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText?key=${apiKey}`;
        const payload = { prompt: { text: input } };
        const res = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Check if response is OK
        if (!res.ok) {
          const errorData = await res.json();
          console.error('API error response:', errorData);
          setMessages(m=>[...m, { role:'model', text: `API error: ${errorData.error || 'Unknown error'}` }]);
          setLoading(false);
          return;
        }

        data = await res.json();
      }

      const botText = extractTextFromResponse(data) || "Sorry, couldn't parse assistant response.";
      setMessages(m=>[...m, { role:'model', text: botText }]);
    }catch(e){
      console.error('Chatbot error', e);
      setMessages(m=>[...m, { role:'model', text: 'Error: failed to get response. See console.' }]);
    }
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
