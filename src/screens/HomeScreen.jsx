import React, { useEffect, useState, useContext, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { FirebaseContext } from '../context/FirebaseContext';
import HomeLogo from '../components/HomeLogo';
import AnimatedMoodChart from '../components/AnimatedMoodChart';

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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 32,
    padding: 36,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(22px)',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
  },
  heroText: {
    flex: 1,
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  heroActions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  ctaButton: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  primaryCta: {
    background: 'linear-gradient(110deg, #6366f1 0%, #a855f7 100%)',
    color: '#fff',
    boxShadow: '0 12px 30px rgba(99, 102, 241, 0.35)',
  },
  secondaryCta: {
    background: 'rgba(79, 70, 229, 0.1)',
    color: '#4f46e5',
    boxShadow: '0 0 0 rgba(0,0,0,0)',
  },
  sectionGrid: {
    display: 'grid',
    gap: 24,
    gridTemplateColumns: '1.15fr 0.85fr',
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
  quickActions: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
  quickActionBtn: {
    border: '1px solid rgba(99, 102, 241, 0.08)',
    borderRadius: 20,
    padding: '20px 22px',
    textAlign: 'left',
    background: '#f8fafc',
    cursor: 'pointer',
    color: '#1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 15,
    fontWeight: 500,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 0 0 rgba(0,0,0,0)',
  },
  metricGroup: {
    display: 'flex',
    gap: 18,
    flexWrap: 'wrap',
  },
  metric: {
    padding: '14px 18px',
    borderRadius: 18,
    background: 'rgba(99,102,241,0.08)',
    color: '#312e81',
    minWidth: 140,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: 600,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.04,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 700,
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  goalProgress: {
    height: 12,
    borderRadius: 999,
    background: '#e2e8f0',
    overflow: 'hidden',
  },
  goalProgressBar: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(110deg,#8b5cf6,#3b82f6)',
    transition: 'width 0.3s ease',
  },
  secondaryCard: {
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(139,92,246,0.14) 100%)',
    padding: 28,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
};

export default function HomeScreen({ setCurrentPage }) {
  const { db, auth } = useContext(FirebaseContext);
  const [moods, setMoods] = useState([]);
  const [goals, setGoals] = useState([]);
  const [goalProgress, setGoalProgress] = useState(0);

  useEffect(() => {
    if (!auth?.currentUser || !db) return;
    const userId = auth.currentUser.uid;

    const journalQ = query(
      collection(db, `artifacts/default-calmspace-app/users/${userId}/journalEntries`),
      orderBy('date', 'desc'),
      limit(7)
    );
    const unsubJournal = onSnapshot(
      journalQ,
      snap => {
        const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const moodsArr = entries.map(e => e.mood).reverse();
        setMoods(moodsArr);
      },
      e => console.error(e)
    );

    const goalsQ = query(
      collection(db, `artifacts/default-calmspace-app/users/${userId}/goals`),
      orderBy('createdAt', 'desc')
    );
    const unsubGoals = onSnapshot(
      goalsQ,
      snap => {
        const gs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setGoals(gs);
        const completed = gs.filter(g => g.completed).length;
        setGoalProgress(gs.length ? (completed / gs.length) * 100 : 0);
      },
      e => console.error(e)
    );

    return () => {
      unsubJournal();
      unsubGoals();
    };
  }, [db, auth]);

  const displayName = useMemo(() => {
    if (auth?.currentUser?.isAnonymous) return 'Guest';
    const name = auth?.currentUser?.displayName?.split(' ')[0];
    return name || 'Member';
  }, [auth]);

  const nextGoal = useMemo(() => {
    const uncompleted = goals.filter(g => !g.completed);
    return uncompleted.length ? uncompleted[0].text : 'Set a new intention for the week';
  }, [goals]);

  const goalSummary = useMemo(() => {
    const completed = goals.filter(g => g.completed).length;
    return {
      completed,
      total: goals.length,
    };
  }, [goals]);

  const latestMood = moods[moods.length - 1] || '—';
  const moodTrend =
    moods.length >= 2 && moods[moods.length - 1] !== moods[moods.length - 2]
      ? `${moods[moods.length - 2]} → ${moods[moods.length - 1]}`
      : moods.length
      ? latestMood
      : 'Track your moods to see trends';

  const liftButton = (target, shadow) => {
    target.style.transform = 'translateY(-2px)';
    target.style.boxShadow = shadow;
  };

  const resetButton = (target, shadow) => {
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = shadow;
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <section style={styles.hero}>
          <div
            style={{
              width: 140,
              height: 140,
              flexShrink: 0,
              background: '#eef2ff',
              borderRadius: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HomeLogo />
          </div>
          <div style={styles.heroText}>
            <h1 style={{ fontSize: 36, margin: 0, fontWeight: 700 }}>Welcome back, {displayName}</h1>
            <p style={{ fontSize: 18, margin: 0, color: '#475569' }}>
              You&#39;re doing great. Take a moment to check in, reflect, and stay aligned with your calm journey.
            </p>
            <div style={styles.heroActions}>
              <button
                onClick={() => setCurrentPage('JOURNAL')}
                style={{ ...styles.ctaButton, ...styles.primaryCta }}
                onMouseEnter={e => liftButton(e.currentTarget, '0 18px 40px rgba(99, 102, 241, 0.36)')}
                onMouseLeave={e => resetButton(e.currentTarget, styles.primaryCta.boxShadow)}
              >
                Start a Reflection
              </button>
              <button
                onClick={() => setCurrentPage('GOALS')}
                style={{ ...styles.ctaButton, ...styles.secondaryCta }}
                onMouseEnter={e => liftButton(e.currentTarget, '0 12px 28px rgba(79, 70, 229, 0.24)')}
                onMouseLeave={e => resetButton(e.currentTarget, '0 0 0 rgba(0,0,0,0)')}
              >
                Review Goals
              </button>
            </div>
          </div>
        </section>

        <section style={styles.sectionGrid}>
          <article style={styles.card}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, color: '#1e1b4b' }}>Mood Insights</h2>
                <p style={{ margin: '6px 0 0', color: '#475569' }}>Your emotional landscape over the last 7 days</p>
              </div>
              <div style={styles.metric}>
                <div style={styles.metricLabel}>Latest mood</div>
                <div style={styles.metricValue}>{latestMood}</div>
              </div>
            </header>
            <AnimatedMoodChart moods={moods} />
            <footer
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#475569',
              }}
            >
              <span>Trend: {moodTrend}</span>
              <span style={{ fontSize: 14 }}>Keep logging to unlock deeper insights</span>
            </footer>
          </article>

          <aside style={styles.secondaryCard}>
            <div>
              <h3 style={{ margin: 0, fontSize: 22, color: '#1e1b4b' }}>Goal Progress</h3>
              <p style={{ margin: '6px 0 0', color: '#334155' }}>Next up: {nextGoal}</p>
            </div>
            <div>
              <div style={styles.goalProgress}>
                <div style={{ ...styles.goalProgressBar, width: `${goalProgress}%` }} />
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#312e81',
                  fontWeight: 600,
                }}
              >
                <span>{Math.round(goalProgress)}%</span>
                <span>{goalSummary.total ? `${goalSummary.completed}/${goalSummary.total} completed` : 'No goals yet'}</span>
              </div>
            </div>
            <div style={styles.metricGroup}>
              <div style={styles.metric}>
                <div style={styles.metricLabel}>Active goals</div>
                <div style={styles.metricValue}>{goalSummary.total || 0}</div>
              </div>
              <div style={styles.metric}>
                <div style={styles.metricLabel}>Wins logged</div>
                <div style={styles.metricValue}>{goalSummary.completed}</div>
              </div>
            </div>
          </aside>
        </section>

        <section style={{ ...styles.card, gap: 18 }}>
          <header>
            <h3 style={{ margin: 0, fontSize: 22, color: '#1e1b4b' }}>Quick actions</h3>
            <p style={{ margin: '6px 0 0', color: '#475569' }}>Stay consistent with mindful routines</p>
          </header>
          <div style={styles.quickActions}>
            <button
              onClick={() => setCurrentPage('JOURNAL')}
              style={styles.quickActionBtn}
              onMouseEnter={e => liftButton(e.currentTarget, '0 16px 30px rgba(99, 102, 241, 0.18)')}
              onMouseLeave={e => resetButton(e.currentTarget, '0 0 0 rgba(0,0,0,0)')}
            >
              <span style={{ fontSize: 18, fontWeight: 600, color: '#312e81' }}>Daily Journal</span>
              <span>Capture today&#39;s reflections in a guided check-in.</span>
            </button>
            <button
              onClick={() => setCurrentPage('GOALS')}
              style={styles.quickActionBtn}
              onMouseEnter={e => liftButton(e.currentTarget, '0 16px 30px rgba(99, 102, 241, 0.18)')}
              onMouseLeave={e => resetButton(e.currentTarget, '0 0 0 rgba(0,0,0,0)')}
            >
              <span style={{ fontSize: 18, fontWeight: 600, color: '#312e81' }}>Goal Planning</span>
              <span>Define a new intention or celebrate a milestone.</span>
            </button>
            <button
              onClick={() => setCurrentPage('RESOURCES')}
              style={styles.quickActionBtn}
              onMouseEnter={e => liftButton(e.currentTarget, '0 16px 30px rgba(99, 102, 241, 0.18)')}
              onMouseLeave={e => resetButton(e.currentTarget, '0 0 0 rgba(0,0,0,0)')}
            >
              <span style={{ fontSize: 18, fontWeight: 600, color: '#312e81' }}>Calming Tools</span>
              <span>Explore breathing exercises and guided meditations.</span>
            </button>
            <button
              onClick={() => setCurrentPage('COMMUNITY')}
              style={styles.quickActionBtn}
              onMouseEnter={e => liftButton(e.currentTarget, '0 16px 30px rgba(99, 102, 241, 0.18)')}
              onMouseLeave={e => resetButton(e.currentTarget, '0 0 0 rgba(0,0,0,0)')}
            >
              <span style={{ fontSize: 18, fontWeight: 600, color: '#312e81' }}>Community Check-in</span>
              <span>Share encouragement and see how others are doing.</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
