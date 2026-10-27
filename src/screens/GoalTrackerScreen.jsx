import React, { useContext, useEffect, useState } from 'react';
import { FirebaseContext } from '../context/FirebaseContext';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function GoalTrackerScreen(){
  const { db, auth } = useContext(FirebaseContext);
  const [goals,setGoals]=useState([]);
  const [newGoal,setNewGoal]=useState('');
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!auth?.currentUser || !db) return;
    const q = query(collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`));
    const unsub = onSnapshot(q, snap=> setGoals(snap.docs.map(d=>({ id:d.id, ...d.data() }))));
    return unsub;
  },[db,auth]);

  const add = async ()=>{
    if(!newGoal.trim()) return;
    setLoading(true);
    try{ await addDoc(collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`), { text:newGoal, completed:false, createdAt: new Date() }); setNewGoal(''); }
    catch(e){ console.error(e); }
    setLoading(false);
  };

  const toggle = async (g)=>{
    try{ await updateDoc(doc(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`, g.id), { completed: !g.completed }); } catch(e){ console.error(e); }
  };

  const del = async (id)=>{ try{ await deleteDoc(doc(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`, id)); }catch(e){console.error(e);} };

  const completed = goals.filter(g=>g.completed).length;
  const progress = goals.length ? (completed/goals.length)*100 : 0;

  return (
    <div style={{ padding:24 }}>
      <h1>Goals</h1>
      <div className="card" style={{ padding:16, marginBottom:12 }}>
        <h3>Your Progress</h3>
        <div style={{ height:12, background:'#eee', borderRadius:6 }}>
          <div style={{ height:12, borderRadius:6, width:`${progress}%`, background:'linear-gradient(90deg,#60a5fa,#8b5cf6)' }} />
        </div>
        <div style={{ textAlign:'center', marginTop:8 }}>{completed} of {goals.length} goals completed</div>
      </div>

      <div className="card" style={{ padding:16, marginBottom:12 }}>
        <h3>Set a new goal</h3>
        <div style={{ display:'flex', gap:8 }}>
          <input value={newGoal} onChange={e=>setNewGoal(e.target.value)} style={{ flex:1, padding:8 }} placeholder="e.g., Meditate for 5 minutes" />
          <button onClick={add} className="button" disabled={loading}>Add</button>
        </div>
      </div>

      <h3>Your Goals</h3>
      <div style={{ display:'grid', gap:8 }}>
        {goals.length? goals.map(g=>(
          <div key={g.id} className="card" style={{ padding:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={g.completed} onChange={()=>toggle(g)} />
              <div style={{ textDecoration: g.completed ? 'line-through' : 'none' }}>{g.text}</div>
            </div>
            <button onClick={()=>del(g.id)}>Delete</button>
          </div>
        )) : <div style={{ color:'#6b7280' }}>No goals set yet. Add one to get started!</div>}
      </div>
    </div>
  )
}
