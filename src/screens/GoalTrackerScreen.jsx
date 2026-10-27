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
    fontWeight: 600,
    color: '#4338ca',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1e1b4b',
  },
  grid: {
    display: 'grid',
    gap: 24,
    gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
    alignItems: 'flex-start',
  },
  card: {
    borderRadius: 24,
    background: '#fff',
    padding: 28,
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  inputRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 220,
    borderRadius: 16,
    border: '1px solid rgba(148,163,184,0.4)',
    padding: '14px 18px',
    fontSize: 15,
    background: '#f8fafc',
    color: '#0f172a',
  },
  primaryButton: disabled => ({
    border: 'none',
    borderRadius: 999,
    padding: '12px 22px',
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: '#fff',
    background: disabled ? 'rgba(148, 163, 184, 0.25)' : 'linear-gradient(110deg,#6366f1 0%,#a855f7 100%)',
    boxShadow: disabled ? 'none' : '0 12px 30px rgba(99, 102, 241, 0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }),
  goalsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  goalItem: completed => ({
    borderRadius: 20,
    padding: '18px 20px',
    background: completed ? 'rgba(34,197,94,0.08)' : '#f8fafc',
    border: `1px solid ${completed ? 'rgba(16,185,129,0.35)' : 'rgba(148,163,184,0.25)'}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }),
  goalContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    cursor: 'pointer',
  },
  goalText: completed => ({
    fontSize: 16,
    color: completed ? '#047857' : '#1f2937',
    textDecoration: completed ? 'line-through' : 'none',
    fontWeight: 500,
  }),
  deleteButton: {
    border: 'none',
    background: 'rgba(244, 63, 94, 0.12)',
    color: '#be123c',
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
  const { db, auth } = useContext(FirebaseContext);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth?.currentUser || !db) return;
    const goalsRef = collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`);
    const q = query(goalsRef);
    const unsub = onSnapshot(q, snap => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setGoals(fetched);
    });
    return unsub;
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
    if (!newGoal.trim() || !auth?.currentUser || !db) return;
    setLoading(true);
    try {
      const goalsRef = collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`);
      await addDoc(goalsRef, { text: newGoal.trim(), completed: false, createdAt: new Date() });
      setNewGoal('');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleGoal = async goal => {
    if (!auth?.currentUser || !db) return;
    try {
      const goalRef = doc(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`, goal.id);
      await updateDoc(goalRef, { completed: !goal.completed });
    } catch (e) {
      console.error(e);
    }
  };

  const removeGoal = async id => {
    if (!auth?.currentUser || !db) return;
    try {
      const goalRef = doc(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/goals`, id);
      await deleteDoc(goalRef);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <section style={styles.hero}>
          <div style={styles.heroText}>
            <h1 style={styles.heroTitle}>Goal Blueprint</h1>
            <p style={styles.heroSubtitle}>
              Break your intentions into clear steps, track momentum, and celebrate each micro-win along the way.
            </p>
          </div>

          <div style={styles.progressPanel}>
            <div>
              <strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.08 }}>Overall progress</strong>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressBarFill, width: `${stats.progress}%` }} />
            </div>
            <div style={styles.metricRow}>
              <div style={styles.metric}>
                <div style={styles.metricLabel}>Completed</div>
                <div style={styles.metricValue}>{stats.completed}</div>
              </div>
              <div style={styles.metric}>
                <div style={styles.metricLabel}>Active</div>
                <div style={styles.metricValue}>{stats.active}</div>
              </div>
              <div style={styles.metric}>
                <div style={styles.metricLabel}>Total</div>
                <div style={styles.metricValue}>{stats.total}</div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.grid}>
          <article style={styles.card}>
            <header>
              <h2 style={styles.sectionTitle}>Set a new focus</h2>
              <p style={styles.sectionSubtitle}>Keep it specific and achievable. Micro-goals create steady momentum.</p>
            </header>

            <div style={styles.inputRow}>
              <input
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                style={styles.input}
                placeholder="Example: Step outside for 10 minutes after lunch"
              />
              <button
                type="button"
                onClick={addGoal}
                disabled={loading || !newGoal.trim()}
                style={styles.primaryButton(loading || !newGoal.trim())}
                onMouseEnter={e => {
                  if (loading || !newGoal.trim()) return;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 18px 40px rgba(99, 102, 241, 0.36)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = styles.primaryButton(false).boxShadow;
                }}
              >
                {loading ? 'Adding...' : 'Add goal'}
              </button>
            </div>
          </article>

          <article style={styles.card}>
            <header>
              <h2 style={styles.sectionTitle}>Your focus list</h2>
              <p style={styles.sectionSubtitle}>Tap a goal to mark it complete. Keep what matters, archive what doesn’t.</p>
            </header>

            <div style={styles.goalsList}>
              {goals.length ? (
                goals.map(goal => (
                  <div
                    key={goal.id}
                    style={styles.goalItem(goal.completed)}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 18px 30px rgba(15, 23, 42, 0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                    }}
                  >
                    <label style={styles.goalContent}>
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleGoal(goal)}
                        style={styles.checkbox}
                      />
                      <span style={styles.goalText(goal.completed)}>{goal.text}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeGoal(goal.id)}
                      style={styles.deleteButton}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.background = 'rgba(244, 63, 94, 0.18)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.background = styles.deleteButton.background;
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  No goals yet. Start with a single, achievable action you can complete today.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
