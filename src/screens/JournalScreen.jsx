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
    borderRadius: 18,
    padding: '16px 14px',
    border: active ? '2px solid #6366f1' : '1px solid rgba(148, 163, 184, 0.35)',
    background: active ? 'rgba(99, 102, 241, 0.08)' : '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  }),
  moodEmoji: {
    fontSize: 28,
  },
  moodTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e1b4b',
  },
  moodDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.4,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  textarea: {
    borderRadius: 18,
    border: '1px solid rgba(148,163,184,0.35)',
    padding: '18px 20px',
    fontSize: 15,
    minHeight: 160,
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  saveButton: disabled => ({
    border: 'none',
    borderRadius: 18,
    padding: '16px 24px',
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
  if (!value) return 'Just now';
  const date = value.toDate ? value.toDate() : new Date(value);
  const options = withTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }
    : { month: 'long', day: 'numeric', year: 'numeric' };
  return isNaN(date.getTime()) ? 'Just now' : date.toLocaleString(undefined, options);
};

export default function JournalScreen() {
  const { db, auth } = useContext(FirebaseContext);
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('calmspace_journals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newEntry, setNewEntry] = useState('');
  const [mood, setMood] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth?.currentUser || !db) return;
    try {
      const journalRef = collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/journalEntries`);
      const q = query(journalRef);
      const unsub = onSnapshot(q, snap => {
        if (!snap.empty) {
          const fetched = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          setEntries(fetched);
          localStorage.setItem('calmspace_journals', JSON.stringify(fetched));
        }
      }, err => console.warn('Firestore journal listener warning:', err));
      return unsub;
    } catch (e) {
      console.warn('Firestore journal setup error:', e);
    }
  }, [db, auth]);

  const selectedMood = useMemo(() => moodOptions.find(option => option.value === mood), [mood]);

  const save = async () => {
    const text = newEntry.trim();
    if (!text) return;
    setLoading(true);

    const newJournal = {
      id: 'journal-' + Date.now(),
      text,
      mood,
      date: new Date().toISOString()
    };

    setEntries(prev => {
      const updated = [newJournal, ...prev];
      try {
        localStorage.setItem('calmspace_journals', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage journal save error', e);
      }
      return updated;
    });
    setNewEntry('');
    setMood(3);

    if (auth?.currentUser && db) {
      try {
        const journalRef = collection(db, `artifacts/default-calmspace-app/users/${auth.currentUser.uid}/journalEntries`);
        await addDoc(journalRef, {
          text,
          mood,
          date: new Date(),
        });
      } catch (e) {
        console.warn('Firestore journal save error:', e);
      }
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Mindful Reflection Journal</h1>
          <p style={styles.heroSubtitle}>
            Capture what’s on your heart without filter or expectation. Expressing yourself builds calm and clarity.
          </p>
        </section>

        <section style={styles.layout}>
          <div style={styles.card}>
            <div>
              <h2 style={styles.sectionTitle}>Check in with yourself</h2>
              <p style={styles.sectionSubtitle}>
                Select the emotion that feels closest right now.
              </p>
            </div>

            <div style={styles.moodGrid}>
              {moodOptions.map(option => {
                const active = option.value === mood;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    style={styles.moodButton(active)}
                  >
                    <span style={styles.moodEmoji}>{['🌧️', '⛅', '🌿', '🌤️', '✨'][option.value - 1]}</span>
                    <span style={styles.moodTitle}>{option.title}</span>
                    <span style={styles.moodDesc}>{option.description}</span>
                  </button>
                );
              })}
            </div>

            <div style={styles.form}>
              <textarea
                value={newEntry}
                onChange={e => setNewEntry(e.target.value)}
                placeholder="What is present for you today? What thoughts or feelings would benefit from a gentle release?"
                style={styles.textarea}
              />
              <button
                type="button"
                onClick={save}
                disabled={loading || !newEntry.trim()}
                style={styles.saveButton(loading || !newEntry.trim())}
              >
                {loading ? 'Saving...' : 'Save reflection'}
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div>
              <h2 style={styles.sectionTitle}>Past reflections</h2>
              <p style={styles.sectionSubtitle}>
                Notice your shifts, gentle patterns, and progress across time.
              </p>
            </div>

            {entries.length === 0 ? (
              <div style={styles.emptyState}>
                Your reflections will gather here. Write your first thought to begin.
              </div>
            ) : (
              <div style={styles.entriesWrapper}>
                {entries.map(entry => (
                  <div key={entry.id} style={styles.entryCard}>
                    <div style={styles.entryHeader}>
                      <span style={styles.entryMeta}>
                        {formatDate(entry.date, true)}
                      </span>
                      <span style={{ fontSize: 13, color: '#4338ca', fontWeight: 600 }}>
                        {moodOptions.find(m => m.value === entry.mood)?.title || 'Steady'}
                      </span>
                    </div>
                    <p style={styles.entryText}>{entry.text}</p>
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
