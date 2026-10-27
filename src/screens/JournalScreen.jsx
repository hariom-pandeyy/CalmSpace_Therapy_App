import React, { useContext, useEffect, useState } from 'react';
import { FirebaseContext } from '../context/FirebaseContext';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';

export default function JournalScreen(){
  const { db, auth } = useContext(FirebaseContext);
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [mood, setMood] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!auth?.currentUser || !db) return;
    const q = query(collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/journalEntries`));
    const unsub = onSnapshot(q, snap=>{
      const fetched = snap.docs.map(d=>({ id:d.id, ...d.data() }));
      fetched.sort((a,b)=>b.date?.toMillis?.() - a.date?.toMillis?.());
      setEntries(fetched);
    });
    return unsub;
  }, [db, auth]);

  const save = async ()=>{
    if(!newEntry.trim()) return;
    setLoading(true);
    try{
      await addDoc(collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/journalEntries`), {
        text: newEntry, mood, date: new Date()
      });
      setNewEntry(''); setMood(3);
    }catch(e){ console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ padding:24 }}>
      <h1>Journal</h1>
      <div className="card" style={{ padding:16, marginBottom:12 }}>
        <h3>How do you feel today?</h3>
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          {[1,2,3,4,5].map(v=>(
            <button key={v} onClick={()=>setMood(v)} style={{ padding:8, borderRadius:8, background: mood===v ? '#bfdbfe' : 'transparent' }}>{['😩','😕','😐','🙂','😄'][v-1]}</button>
          ))}
        </div>
        <textarea value={newEntry} onChange={e=>setNewEntry(e.target.value)} style={{ width:'100%', height:120, marginTop:12 }} placeholder="Start typing..." />
        <button onClick={save} className="button" disabled={loading} style={{ marginTop:8 }}>{loading? 'Saving...':'Save Reflection'}</button>
      </div>

      <h3>Past Entries</h3>
      <div style={{ display:'grid', gap:12 }}>
        {entries.length ? entries.map(en=>(
          <div key={en.id} className="card" style={{ padding:12 }}>
            <div style={{ fontSize:12, color:'#6b7280' }}>{en.date?.toDate ? en.date.toDate().toLocaleDateString() : (new Date(en.date)).toLocaleDateString()} - Mood: {['😩','😕','😐','🙂','😄'][en.mood-1]}</div>
            <div style={{ marginTop:6 }}>{en.text}</div>
          </div>
        )): <div style={{ color:'#6b7280' }}>Your journal is empty. Start by writing down your thoughts.</div>}
      </div>
    </div>
  )
}
