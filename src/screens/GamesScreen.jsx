import React, { useMemo } from 'react';
import ThoughtMatchGame from '../games/ThoughtMatchGame';
import FollowTheFriendGame from '../games/FollowTheFriendGame';
import GratitudeGardenGame from '../games/GratitudeGardenGame';
import BreathingGame from '../games/BreathingGame';

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
  grid: {
    display: 'grid',
    gap: 24,
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
  },
  card: {
    borderRadius: 24,
    background: '#fff',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    padding: '26px 28px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  cardTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: '#312e81',
  },
  cardSubtitle: {
    margin: 0,
    fontSize: 15,
    color: '#475569',
    minHeight: 44,
  },
  cardBody: {
    padding: '12px 28px 28px',
    background: 'linear-gradient(180deg, rgba(248,250,252,0.8) 0%, rgba(224,242,254,0.65) 45%, rgba(255,255,255,1) 100%)',
    borderRadius: '0 0 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(99,102,241,0.12)',
    color: '#4338ca',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.04,
  },
};

const gameLibrary = [
  {
    title: 'Thought Match',
    description: 'Reframe repeating thoughts by matching them with uplifting perspectives.',
    tags: ['Cognitive reset', '5 min'],
    component: ThoughtMatchGame,
  },
  {
    title: 'Follow The Friend',
    description: 'A grounding experience that gently guides your focus and breath.',
    tags: ['Mindful focus', 'Visual tracking'],
    component: FollowTheFriendGame,
  },
  {
    title: 'Gratitude Garden',
    description: 'Plant small notes of gratitude and watch your garden flourish.',
    tags: ['Positive shift', 'Daily ritual'],
    component: GratitudeGardenGame,
  },
  {
    title: 'Rhythmic Breathing',
    description: 'Sync with animated cues to soothe your nervous system.',
    tags: ['Breathwork', '3 min reset'],
    component: BreathingGame,
  },
];

export default function GamesScreen() {
  const games = useMemo(() => gameLibrary, []);

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Mindful Mini Games</h1>
          <p style={styles.heroSubtitle}>
            Choose a guided experience to help regulate your thoughts, focus, and breath. Each activity is designed to be short, grounding, and shareable.
          </p>
        </section>

        <section style={styles.grid}>
          {games.map(({ title, description, component: Component, tags }) => (
            <article key={title} style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>{title}</h2>
                <p style={styles.cardSubtitle}>{description}</p>
                <div style={styles.tagList}>
                  {tags.map(tag => (
                    <span key={tag} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div style={styles.cardBody}>
                <Component />
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
