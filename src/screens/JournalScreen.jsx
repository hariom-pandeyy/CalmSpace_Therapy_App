import React, { useContext, useEffect, useMemo, useState } from 'react';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
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
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 36,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(22px)',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
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
    lineHeight: 1.6,
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
    gap: 24,
  },
  moodGrid: {
    display: 'grid',
    gap: 14,
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  },
  moodButton: active => ({
    borderRadius: 20,
    padding: '14px 16px',
    textAlign: 'left',
    border: '1px solid rgba(99,102,241,0.12)',
    background: active ? 'linear-gradient(120deg,#c7d2fe 0%,#e0f2fe 100%)' : '#f8fafc',
    color: '#1e293b',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease',
    boxShadow: active ? '0 16px 30px rgba(99, 102, 241, 0.18)' : '0 0 0 rgba(0,0,0,0)',
  }),
  moodTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#312e81',
    marginBottom: 4,
  },
  moodDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 1.4,
  },
  textarea: {
    width: '100%',
    minHeight: 160,
    borderRadius: 20,
    border: '1px solid rgba(148,163,184,0.4)',
    padding: '18px 20px',
    fontSize: 15,
    resize: 'vertical',
    color: '#0f172a',
    background: '#f8fafc',
    boxShadow: 'inset 0 1px 3px rgba(15,23,42,0.04)',
  },
  primaryAction: disabled => ({
    border: 'none',
    borderRadius: 999,
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? 'rgba(148, 163, 184, 0.25)' : 'linear-gradient(110deg,#6366f1 0%,#a855f7 100%)',
    color: '#fff',
    boxShadow: disabled ? 'none' : '0 12px 30px rgba(99, 102, 241, 0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }),
  entriesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  entryCard: {
    borderRadius: 22,
    padding: 22,
    background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.10)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  entryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  entryMeta: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.04,
    textTransform: 'uppercase',
    color: '#4338ca',
  },
  entryText: {
    fontSize: 16,
    color: '#0f172a',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  emptyState: {
    borderRadius: 22,
    padding: 32,
    textAlign: 'center',
    background: '#f8fafc',
    border: '1px dashed rgba(148,163,184,0.4)',
    color: '#475569',
    fontSize: 15,
    lineHeight: 1.6,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: '#1e1b4b',
  },
  sectionSubtitle: {
    margin: '6px 0 0',
    color: '#475569',
    fontSize: 15,
  },
};

const moodOptions = [
  { value: 1, title: 'Drained', description: 'Feeling low energy and heavy', accent: '#f43f5e' },
  { value: 2, title: 'Reflective', description: 'Quiet, thoughtful, seeking balance', accent: '#f97316' },
  { value: 3, title: 'Steady', description: 'Centered and present', accent: '#6366f1' },
  { value: 4, title: 'Uplifted', description: 'Light and optimistic', accent: '#22c55e' },
  { value: 5, title: 'Radiant', description: 'Joyful and expansive', accent: '#14b8a6' },
];

const formatDate = (value, withTime = false) => {
  if (!value) return 'Unknown date';
  const date = value.toDate ? value.toDate() : new Date(value);
  const options = withTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }
    : { month: 'long', day: 'numeric', year: 'numeric' };
  return date.toLocaleString(undefined, options);
};

export default function JournalScreen() {
  const { db, auth } = useContext(FirebaseContext);
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [mood, setMood] = useState(3);
  const [loading, setLoading] = useState(false);

  const userName = auth?.currentUser?.isAnonymous ? 'Guest' : auth?.currentUser?.displayName?.split(' ')[0] || 'Friend';

  useEffect(() => {
    if (!auth?.currentUser || !db) return;
    const journalRef = collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/journalEntries`);
    const q = query(journalRef);
    const unsub = onSnapshot(q, snap => {
      const fetched = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.date?.toMillis?.() || 0) - (a.date?.toMillis?.() || 0));
      setEntries(fetched);
    });
    return unsub;
  }, [db, auth]);

  const selectedMood = useMemo(() => moodOptions.find(option => option.value === mood), [mood]);

  const save = async () => {
    if (!newEntry.trim() || !auth?.currentUser || !db) return;
    setLoading(true);
    try {
      const journalRef = collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/journalEntries`);
      await addDoc(journalRef, {
        text: newEntry.trim(),
        mood,
        date: new Date(),
      });
      setNewEntry('');
      setMood(3);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Daily Reflection</h1>
          <p style={styles.heroSubtitle}>
            Hi {userName}, give yourself two mindful minutes. Select a mood, capture the moment, and track how your emotional landscape evolves.
          </p>
        </section>

        <section style={styles.layout}>
          <article style={styles.card}>
            <header>
              <h2 style={styles.sectionTitle}>How are you arriving right now?</h2>
              <p style={styles.sectionSubtitle}>Choose the mood that resonates and jot down anything on your mind.</p>
            </header>

            <div style={styles.moodGrid}>
              {moodOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  style={styles.moodButton(option.value === mood)}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 16px 28px rgba(99, 102, 241, 0.18)';
                  }}
                  onMouseLeave={e => {
                    const active = option.value === mood;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = active ? '0 16px 30px rgba(99, 102, 241, 0.18)' : '0 0 0 rgba(0,0,0,0)';
                  }}
                >
                  <div style={{ ...styles.moodTitle, color: option.accent }}>{option.title}</div>
                  <div style={styles.moodDesc}>{option.description}</div>
                </button>
              ))}
            </div>

            <textarea
              value={newEntry}
              onChange={e => setNewEntry(e.target.value)}
              placeholder="Take a breath, and write what stands out for you today…"
              style={styles.textarea}
            />

            <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ color: '#475569', fontSize: 14 }}>
                {selectedMood ? `${selectedMood.title} • ${selectedMood.description}` : 'Select how you feel to personalize this entry.'}
              </div>
              <button
                type="button"
                onClick={save}
                disabled={loading || !newEntry.trim()}
                style={styles.primaryAction(loading || !newEntry.trim())}
                onMouseEnter={e => {
                  if (loading || !newEntry.trim()) return;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 18px 40px rgba(99, 102, 241, 0.36)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = styles.primaryAction(false).boxShadow;
                }}
              >
                {loading ? 'Saving...' : 'Save reflection'}
              </button>
            </footer>
          </article>

          <aside style={styles.card}>
            <header>
              <h2 style={styles.sectionTitle}>Your reflections</h2>
              <p style={styles.sectionSubtitle}>Revisit how you felt and what you noticed. Progress is quieter than we think.</p>
            </header>

            <div style={styles.entriesWrapper}>
              {entries.length ? (
                entries.map(entry => {
                  const moodMeta = moodOptions.find(option => option.value === entry.mood);
                  return (
                    <div key={entry.id} style={{ ...styles.entryCard, borderLeft: `6px solid ${moodMeta?.accent || '#6366f1'}` }}>
                      <div style={styles.entryHeader}>
                        <span style={styles.entryMeta}>{formatDate(entry.date, true)}</span>
                        {moodMeta ? (
                          <span style={{ fontSize: 13, fontWeight: 600, color: moodMeta.accent }}>{moodMeta.title}</span>
                        ) : null}
                      </div>
                      <div style={styles.entryText}>{entry.text}</div>
                    </div>
                  );
                })
              ) : (
                <div style={styles.emptyState}>
                  Your journal is still blank. Your thoughts do not need to be perfect—just honest. Start with a few words about what you notice right now.
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
