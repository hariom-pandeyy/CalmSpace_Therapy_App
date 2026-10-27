import React, { useEffect, useState, useContext } from 'react';
import { FirebaseContext } from '../context/FirebaseContext';
import HomeLogo from '../components/HomeLogo';
import AnimatedMoodChart from '../components/AnimatedMoodChart';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function HomeScreen({ setCurrentPage }){
  const { db, auth } = useContext(FirebaseContext);
  const [moods, setMoods] = useState([]);
  const [goals, setGoals] = useState([]);
  const [goalProgress, setGoalProgress] = useState(0);

  useEffect(()=>{
    if(!auth?.currentUser || !db) return;
    const userId = auth.currentUser.uid;
    const journalQ = query(collection(db, `artifacts/default-calmspace-app/users/${userId}/journalEntries`), orderBy('date','desc'), limit(7));
    const unsubJournal = onSnapshot(journalQ, snap=>{
      const entries = snap.docs.map(d=>({ id:d.id, ...d.data() }));
      const moodsArr = entries.map(e=>e.mood).reverse();
      setMoods(moodsArr);
    }, e=>console.error(e));

    const goalsQ = query(collection(db, `artifacts/default-calmspace-app/users/${userId}/goals`), orderBy('createdAt','desc'));
    const unsubGoals = onSnapshot(goalsQ, snap=>{
      const gs = snap.docs.map(d=>({ id:d.id, ...d.data() }));
      setGoals(gs);
      const completed = gs.filter(g=>g.completed).length;
      setGoalProgress(gs.length ? (completed / gs.length)*100 : 0);
    }, e=>console.error(e));

    return ()=>{ unsubJournal(); unsubGoals(); }
  }, [db, auth]);

  const getNextGoal = ()=>{
    const uncompleted = goals.filter(g=>!g.completed);
    return uncompleted.length ? uncompleted[0].text : 'Set a new goal!';
  };

  const displayName = auth?.currentUser?.isAnonymous ? 'Guest' : auth?.currentUser?.displayName?.split(' ')[0] || 'User';

  return (
    <div style={{ padding:24 }}>
      <header style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ width:128, height:128, margin:'0 auto' }}><HomeLogo/></div>
        <h1 style={{ fontSize:32, color:'#3730a3' }}>CalmSpace</h1>
        <h2 style={{ fontSize:22 }}>Hello, {displayName}</h2>
        <p>How are you feeling today? 🙂</p>
      </header>

      <div className="card" style={{ padding:18, marginBottom:18 }}>
        <h3>Your Week in Moods</h3>
        <AnimatedMoodChart moods={moods} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <button onClick={()=>setCurrentPage('JOURNAL')} className="card" style={{ padding:18, textAlign:'left' }}>
          <h3>Journal</h3>
          <p>How do you feel today?</p>
        </button>
        <button onClick={()=>setCurrentPage('GOALS')} className="card" style={{ padding:18 }}>
          <h3>Goal Progress</h3>
          <p>Next: {getNextGoal()}</p>
          <div style={{ marginTop:12, height:12, background:'#eee', borderRadius:6 }}>
            <div style={{ height:12, borderRadius:6, width:`${goalProgress}%`, background:'linear-gradient(90deg,#8b5cf6,#3b82f6)' }} />
          </div>
          <div style={{ marginTop:6, fontWeight:700 }}>{Math.round(goalProgress)}%</div>
        </button>
      </div>
    </div>
  )
}
