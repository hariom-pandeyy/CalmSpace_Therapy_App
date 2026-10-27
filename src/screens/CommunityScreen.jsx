import React, { useContext, useEffect, useState } from 'react';
import { FirebaseContext } from '../context/FirebaseContext';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';

export default function CommunityScreen(){
  const { db, auth } = useContext(FirebaseContext);
  const [posts,setPosts]=useState([]);
  const [newPost,setNewPost]=useState('');
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!db) return;
    const q = query(collection(db, `artifacts/default-calmspace-app/public/data/communityPosts`));
    const unsub = onSnapshot(q, snap=> setPosts(snap.docs.map(d=>({ id:d.id, ...d.data() }))));
    return unsub;
  },[db]);

  const add = async ()=>{
    if(!newPost.trim()) return;
    setLoading(true);
    try{
      await addDoc(collection(db, `artifacts/default-calmspace-app/public/data/communityPosts`), {
        text:newPost, authorName: auth?.currentUser?.isAnonymous ? 'Anonymous Guest' : 'Anonymous User', authorId: auth?.currentUser?.uid, createdAt: new Date(), likes:0
      });
      setNewPost('');
    }catch(e){ console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ padding:24 }}>
      <h1>Community</h1>
      <div className="card" style={{ padding:16, marginBottom:12 }}>
        <h3>Share something...</h3>
        <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} style={{ width:'100%', height:100 }} placeholder="What's on your mind?" />
        <button onClick={add} className="button" disabled={loading} style={{ marginTop:8 }}>{loading? 'Posting...':'Post Anonymously'}</button>
      </div>

      <h3>Recent Posts</h3>
      <div style={{ display:'grid', gap:12 }}>
        {posts.length ? posts.map(p=>(
          <div key={p.id} className="card" style={{ padding:12 }}>
            <div style={{ fontSize:12, color:'#8b5cf6', fontWeight:700 }}>{p.authorName}</div>
            <div style={{ marginTop:8, fontSize:16 }}>{p.text}</div>
            <div style={{ marginTop:8, fontSize:12, color:'#6b7280' }}>{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : (new Date(p.createdAt)).toLocaleString()}</div>
          </div>
        )): <div style={{ color:'#6b7280' }}>The community is quiet... Be the first to share!</div>}
      </div>
    </div>
  )
}
