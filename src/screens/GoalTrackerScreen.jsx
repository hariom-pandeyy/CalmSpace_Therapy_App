import React, { useContext, useEffect, useMemo, useState } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FirebaseContext } from '../context/FirebaseContext';

const styles = {
  page: {
    minHeight: '100vh',
    padding: '48px 24px 96px',
    background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #e0f2fe 100%)',
  },
  content: {
    maxWidth: 1120,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
  },
  hero: {
    borderRadius: 28,
    padding: 36,
    background: 'rgba(255,255,255,0.82)',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
    backdropFilter: 'blur(22px)',
    display: 'grid',
    gap: 24,
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    alignItems: 'center',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  heroTitle: {
    margin: 0,
    fontSize: 34,
    fontWeight: 700,
    color: '#1e1b4b',
  },
  heroSubtitle: {
    margin: 0,
    fontSize: 18,
    color: '#475569',
  },
  progressPanel: {
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(59,130,246,0.14) 100%)',
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    color: '#1e1b4b',
  },
  progressBar: {
    height: 14,
    borderRadius: 999,
    background: 'rgba(148, 163, 184, 0.3)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(110deg,#6366f1 0%,#8b5cf6 50%,#38bdf8 100%)',
    transition: 'width 0.3s ease',
  },
  metricRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
  },
  metric: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.48)',
    borderRadius: 16,
    minWidth: 120,
  },
  metricLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.08,
    color: '#6366f1',
    fontWeight: 700,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1e1b4b',
  },
  layout: {
    display: 'grid',
    gap: 24,
    gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
    alignItems: 'flex-start',
  },
  card: {
    borderRadius: 24,
    background: '#fff',
    padding: 28,
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  form: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 16,
    border: '1px solid rgba(148,163,184,0.35)',
    padding: '14px 18px',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  submitButton: disabled => ({
    border: 'none',
    borderRadius: 16,
    padding: '14px 22px',
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? 'rgba(148, 163, 184, 0.25)' : 'linear-gradient(110deg,#6366f1 0%,#8b5cf6 100%)',
    color: '#fff',
    boxShadow: disabled ? 'none' : '0 12px 28px rgba(99, 102, 241, 0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }),
  goalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  goalItem: completed => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    borderRadius: 18,
    background: completed ? 'rgba(241,245,249,0.7)' : '#f8fafc',
    border: completed ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(99,102,241,0.18)',
    boxShadow: completed ? 'none' : '0 8px 24px rgba(15, 23, 42, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }),
  goalLabel: completed => ({
    fontSize: 15,
    color: completed ? '#94a3b8' : '#0f172a',
    textDecoration: completed ? 'line-through' : 'none',
    cursor: 'pointer',
    flex: 1,
    lineHeight: 1.5,
  }),
  removeButton: {
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 18,
    padding: '4px 8px',
    borderRadius: 8,
  },
  categoryPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    border: 'none',
    borderRadius: 999,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease, transform 0.2s ease',
  },
  emptyState: {
    padding: 24,
    textAlign: 'center',
    borderRadius: 20,
    border: '1px dashed rgba(148,163,184,0.4)',
    background: '#f8fafc',
    color: '#475569',
  },
  sectionTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#1e1b4b',
  },
  sectionSubtitle: {
    margin: '6px 0 0',
    fontSize: 15,
    color: '#475569',
  },
};

export default function GoalTrackerScreen() {
  const { db, auth, user } = useContext(FirebaseContext);
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('calmspace_goals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const activeUserId = auth?.currentUser?.uid || user?.uid || 'guest-user';

  useEffect(() => {
    if (!auth?.currentUser || !db) return;
    try {
      const goalsRef = collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`);
      const q = query(goalsRef);
      const unsub = onSnapshot(q, snap => {
        if (!snap.empty) {
          const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setGoals(fetched);
          localStorage.setItem('calmspace_goals', JSON.stringify(fetched));
        }
      }, err => console.warn('Firestore goals listener warning:', err));
      return unsub;
    } catch (e) {
      console.warn('Firestore goals setup error:', e);
    }
  }, [db, auth]);

  const stats = useMemo(() => {
    const completed = goals.filter(g => g.completed).length;
    return {
      completed,
      total: goals.length,
      active: goals.filter(g => !g.completed).length,
      progress: goals.length ? (completed / goals.length) * 100 : 0,
    };
  }, [goals]);

  const addGoal = async () => {
    const text = newGoal.trim();
    if (!text) return;
    setLoading(true);

    const goalItem = {
      id: 'goal-' + Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    // Instant local save for presentation safety
    setGoals(prev => {
      const updated = [goalItem, ...prev];
      try {
        localStorage.setItem('calmspace_goals', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage save error', e);
      }
      return updated;
    });
    setNewGoal('');

    // Background Firebase sync
    if (auth?.currentUser && db) {
      try {
        const goalsRef = collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`);
        await addDoc(goalsRef, { text, completed: false, createdAt: new Date() });
      } catch (e) {
        console.warn('Firebase goal add error:', e);
      }
    }
    setLoading(false);
  };

  const toggleGoal = async goal => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g);
      try {
        localStorage.setItem('calmspace_goals', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage save error', e);
      }
      return updated;
    });

    if (auth?.currentUser && db && !goal.id.startsWith('goal-')) {
      try {
        const goalRef = doc(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`, goal.id);
        await updateDoc(goalRef, { completed: !goal.completed });
      } catch (e) {
        console.warn('Firebase toggle error', e);
      }
    }
  };

  const removeGoal = async id => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      try {
        localStorage.setItem('calmspace_goals', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage save error', e);
      }
      return updated;
    });

    if (auth?.currentUser && db && !id.startsWith('goal-')) {
      try {
        const goalRef = doc(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`, id);
        await deleteDoc(goalRef);
      } catch (e) {
        console.warn('Firebase remove error', e);
      }
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <section style={styles.hero}>
          <div style={styles.heroText}>
            <h1 style={styles.heroTitle}>Goal & Habit Compass</h1>
            <p style={styles.heroSubtitle}>
              Break your intentions into clear steps, track momentum, and celebrate each micro-win along the way.
            </p>
          </div>
          <div style={styles.progressPanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Overall Progress</span>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{Math.round(stats.progress)}%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressBarFill, width: `${stats.progress}%` }} />
            </div>
            <div style={styles.metricRow}>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Completed</span>
                <div style={styles.metricValue}>{stats.completed}</div>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Active</span>
                <div style={styles.metricValue}>{stats.active}</div>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Total</span>
                <div style={styles.metricValue}>{stats.total}</div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.layout}>
          <div style={styles.card}>
            <div>
              <h2 style={styles.sectionTitle}>Set a new focus</h2>
              <p style={styles.sectionSubtitle}>
                Keep it specific and achievable. Micro-goals create steady momentum.
              </p>
            </div>
            <div style={styles.form}>
              <input
                type="text"
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addGoal()}
                placeholder="e.g. 5-minute morning stretch"
                style={styles.input}
              />
              <button
                type="button"
                onClick={addGoal}
                disabled={loading || !newGoal.trim()}
                style={styles.submitButton(loading || !newGoal.trim())}
              >
                Add goal
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div>
              <h2 style={styles.sectionTitle}>Your focus list</h2>
              <p style={styles.sectionSubtitle}>
                Tap a goal to mark it complete. Keep what matters, archive what doesn’t.
              </p>
            </div>

            {goals.length === 0 ? (
              <div style={styles.emptyState}>
                No goals yet. Start with a single, achievable action you can complete today.
              </div>
            ) : (
              <div style={styles.goalList}>
                {goals.map(g => (
                  <div key={g.id} style={styles.goalItem(g.completed)}>
                    <span
                      onClick={() => toggleGoal(g)}
                      style={styles.goalLabel(g.completed)}
                    >
                      {g.completed ? '✓ ' : '○ '} {g.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeGoal(g.id)}
                      style={styles.removeButton}
                      title="Delete goal"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
