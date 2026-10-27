import React, { useContext, useEffect, useMemo, useState } from 'react';
import { collection, query, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
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
    gap: 14,
    borderRadius: 28,
    padding: 36,
    background: 'rgba(255,255,255,0.82)',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
    backdropFilter: 'blur(22px)',
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
  prompt: {
    borderRadius: 22,
    padding: 24,
    background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.12) 100%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)',
    fontSize: 15,
    color: '#312e81',
    lineHeight: 1.6,
  },
  textarea: {
    width: '100%',
    minHeight: 140,
    borderRadius: 20,
    border: '1px solid rgba(148,163,184,0.4)',
    background: '#f8fafc',
    padding: '18px 20px',
    fontSize: 15,
    color: '#0f172a',
    resize: 'vertical',
    boxShadow: 'inset 0 1px 3px rgba(15,23,42,0.04)',
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryAction: disabled => ({
    border: 'none',
    borderRadius: 999,
    padding: '12px 22px',
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? 'rgba(148,163,184,0.25)' : 'linear-gradient(110deg,#6366f1 0%,#a855f7 100%)',
    color: '#fff',
    boxShadow: disabled ? 'none' : '0 12px 30px rgba(99, 102, 241, 0.32)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }),
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  postCard: {
    borderRadius: 22,
    padding: 22,
    background: '#f8fafc',
    border: '1px solid rgba(148,163,184,0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: 700,
    color: '#4338ca',
  },
  postDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  postBody: {
    fontSize: 16,
    color: '#0f172a',
    lineHeight: 1.6,
  },
  emptyState: {
    padding: 28,
    textAlign: 'center',
    borderRadius: 22,
    border: '1px dashed rgba(148,163,184,0.4)',
    color: '#475569',
    background: '#f8fafc',
  },
  sidebarCard: {
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(79,70,229,0.14) 0%, rgba(129,140,248,0.14) 100%)',
    padding: 28,
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  tip: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 15,
    color: '#312e81',
  },
  sectionTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#1e1b4b',
  },
  sectionSubtitle: {
    margin: '6px 0 0',
    color: '#475569',
    fontSize: 15,
  },
};

const formatDate = value => {
  if (!value) return 'moments ago';
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

export default function CommunityScreen() {
  const { db, auth } = useContext(FirebaseContext);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db) return;
    const postsRef = collection(db, `artifacts/default-calmspace-app/public/data/communityPosts`);
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [db]);

  const handleSubmit = async () => {
    if (!newPost.trim() || !db) return;
    setLoading(true);
    try {
      const postsRef = collection(db, `artifacts/default-calmspace-app/public/data/communityPosts`);
      await addDoc(postsRef, {
        text: newPost.trim(),
        authorName: auth?.currentUser?.isAnonymous ? 'Anonymous Guest' : 'Anonymous Member',
        authorId: auth?.currentUser?.uid || 'guest',
        createdAt: new Date(),
        likes: 0,
      });
      setNewPost('');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const sortedPosts = useMemo(
    () =>
      posts.slice().sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      }),
    [posts]
  );

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Community Lounge</h1>
          <p style={styles.heroSubtitle}>
            Share a win, offer a gentle reminder, or simply say hello. Our community is a calm corner for encouragement and kindness.
          </p>
        </section>

        <section style={styles.layout}>
          <article style={styles.card}>
            <header>
              <h2 style={styles.sectionTitle}>Start a ripple</h2>
              <p style={styles.sectionSubtitle}>Your words may be exactly what someone else needs to hear today.</p>
            </header>

            <div style={styles.prompt}>
              “When we share our stories, we invite others to breathe a little easier.” – CalmSpace Community
            </div>

            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="What encouragement or reflection would you like to leave for the community?"
              style={styles.textarea}
            />

            <div style={styles.submitRow}>
              <span style={{ fontSize: 14, color: '#475569' }}>
                Posted anonymously • Keep it supportive, respectful, and encouraging.
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !newPost.trim()}
                style={styles.primaryAction(loading || !newPost.trim())}
                onMouseEnter={e => {
                  if (loading || !newPost.trim()) return;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 18px 40px rgba(99, 102, 241, 0.36)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = styles.primaryAction(false).boxShadow;
                }}
              >
                {loading ? 'Posting...' : 'Share with community'}
              </button>
            </div>
          </article>

          <aside style={styles.sidebarCard}>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, color: '#312e81' }}>Community guidelines</h3>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#4338ca' }}>
                Every message is anonymous. Keep the space gentle, inclusive, and growth-oriented.
              </p>
            </div>
            <div style={styles.tip}>
              <strong>Share appreciations</strong>
              <span>Notice something in your day that lifted you up, and invite others to see the same.</span>
            </div>
            <div style={styles.tip}>
              <strong>Offer encouragement</strong>
              <span>Short affirmations or reminders can create powerful ripples.</span>
            </div>
            <div style={styles.tip}>
              <strong>Ask reflective questions</strong>
              <span>Prompt the community with open-ended questions to spark gentle conversation.</span>
            </div>
          </aside>
        </section>

        <section style={styles.card}>
          <header>
            <h2 style={styles.sectionTitle}>Community feed</h2>
            <p style={styles.sectionSubtitle}>Newest reflections appear first. Take a moment to read and feel connected.</p>
          </header>

          <div style={styles.feed}>
            {sortedPosts.length ? (
              sortedPosts.map(post => (
                <article
                  key={post.id}
                  style={styles.postCard}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 18px 30px rgba(15, 23, 42, 0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                  }}
                >
                  <div style={styles.postHeader}>
                    <span style={styles.postAuthor}>{post.authorName || 'Community Member'}</span>
                    <span style={styles.postDate}>{formatDate(post.createdAt)}</span>
                  </div>
                  <div style={styles.postBody}>{post.text}</div>
                </article>
              ))
            ) : (
              <div style={styles.emptyState}>
                The lounge is quiet right now. Be the first to share a note of compassion or a small win worth celebrating.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
