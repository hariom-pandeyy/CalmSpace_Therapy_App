import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FirebaseContext } from '../context/FirebaseContext';
import { fetchWithRetry } from '../utils/apiHelpers';

const styles = {
  page: {
    minHeight: '100vh',
    padding: '48px 24px 96px',
    background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #e0f2fe 100%)',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 960,
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
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
  chatShell: {
    borderRadius: 28,
    background: '#fff',
    padding: 0,
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.10)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 540,
  },
  chatHeader: {
    padding: '26px 32px',
    borderBottom: '1px solid rgba(148,163,184,0.25)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  statusPill: {
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(34,197,94,0.12)',
    color: '#047857',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  chatBody: {
    flex: 1,
    padding: '32px 32px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    overflowY: 'auto',
    background: 'linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(224,242,254,0.35) 40%, rgba(255,255,255,1) 100%)',
  },
  footer: {
    padding: '20px 24px 24px',
    borderTop: '1px solid rgba(148,163,184,0.25)',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 16,
    background: '#f8fafc',
    borderRadius: '0 0 28px 28px',
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  textArea: {
    width: '100%',
    minHeight: 64,
    maxHeight: 140,
    borderRadius: 18,
    border: '1px solid rgba(148,163,184,0.45)',
    padding: '14px 18px',
    fontSize: 15,
    lineHeight: 1.5,
    resize: 'vertical',
    background: '#fff',
    color: '#0f172a',
    boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.05)',
  },
  sendButton: disabled => ({
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? 'rgba(148,163,184,0.3)' : 'linear-gradient(110deg,#6366f1 0%,#a855f7 100%)',
    color: '#fff',
    boxShadow: disabled ? 'none' : '0 12px 30px rgba(99, 102, 241, 0.32)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }),
  helperText: {
    fontSize: 13,
    color: '#64748b',
  },
  messageRow: align => ({
    display: 'flex',
    justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
  }),
  bubble: role => ({
    maxWidth: '72%',
    padding: '14px 18px',
    borderRadius: role === 'model' ? '18px 18px 18px 6px' : '18px 18px 6px 18px',
    background:
      role === 'model'
        ? 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(129,140,248,0.35) 100%)'
        : 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(45,212,191,0.24) 100%)',
    color: '#0f172a',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.10)',
    lineHeight: 1.6,
    fontSize: 15,
    whiteSpace: 'pre-wrap',
  }),
  suggestedPrompts: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    padding: '0 32px 24px',
  },
  promptPill: {
    border: '1px solid rgba(99,102,241,0.18)',
    borderRadius: 999,
    padding: '10px 16px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    color: '#4338ca',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
};

const suggestedPrompts = [
  'Guide me through a calming breathing exercise.',
  'Help me reframe a stressful thought.',
  'Suggest a gentle evening wind-down routine.',
  'Share an affirmation for self-compassion.',
];

const extractTextFromResponse = data => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (data.candidates && data.candidates.length) {
    const candidate = data.candidates[0];
    if (candidate.output) return candidate.output;
    if (Array.isArray(candidate.content)) {
      const text = candidate.content.map(item => item.text || item.output || '').join('').trim();
      if (text) return text;
    }
    if (candidate.content?.parts?.length) {
      const combined = candidate.content.parts.map(part => part.text || part.output || '').join('').trim();
      if (combined) return combined;
    }
    if (candidate.text) return candidate.text;
  }
  if (data.output && data.output.length) {
    return data.output.map(o => (o.content || []).map(c => c.text || '').join('')).join('\n') || null;
  }
  if (data.result && data.result.output) {
    return JSON.stringify(data.result.output);
  }
  if (data.text) return data.text;
  return JSON.stringify(data);
};

export default function ChatbotScreen() {
  const { auth } = useContext(FirebaseContext);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hello! I'm CalmBot, your calm assistant. How can I support you today?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const isGuest = auth?.currentUser?.isAnonymous;
  const displayName = auth?.currentUser?.displayName?.split(' ')[0] || (isGuest ? 'Guest' : 'Friend');

  const handleSend = async (promptOverride) => {
    const outbound = typeof promptOverride === 'string' ? promptOverride : input;
    if (!outbound.trim() || loading) return;

    const userMessage = { role: 'user', text: outbound.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const useProxy = import.meta.env.VITE_USE_PROXY === 'true';
      let data;

      if (useProxy) {
        const res = await fetchWithRetry('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: outbound }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Proxy error response:', errorData);
          setMessages(prev => [...prev, { role: 'model', text: `Proxy error: ${errorData.error || 'Unknown error'}` }]);
          setLoading(false);
          return;
        }
        data = await res.json();
      } else {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        if (!apiKey) {
          setMessages(prev => [
            ...prev,
            { role: 'model', text: 'API key missing. Set VITE_GEMINI_API_KEY or enable proxy.' },
          ]);
          setLoading(false);
          return;
        }

        const url = `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText?key=${apiKey}`;
        const payload = { prompt: { text: outbound } };
        const res = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error('API error response:', errorData);
          setMessages(prev => [...prev, { role: 'model', text: `API error: ${errorData.error || 'Unknown error'}` }]);
          setLoading(false);
          return;
        }

        data = await res.json();
      }

      const botText = extractTextFromResponse(data) || "Sorry, I couldn't parse that response.";
      setMessages(prev => [...prev, { role: 'model', text: botText }]);
    } catch (e) {
      console.error('Chatbot error', e);
      setMessages(prev => [...prev, { role: 'model', text: 'Error: failed to get response. Please try again soon.' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const promptList = useMemo(() => suggestedPrompts, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>CalmBot Companion</h1>
          <p style={styles.heroSubtitle}>
            Hi {displayName}, I’m here to offer grounding exercises, reframes, and supportive reflections whenever you need them.
          </p>
        </section>

        <section style={styles.chatShell}>
          <header style={styles.chatHeader}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, color: '#312e81' }}>Live conversation</h2>
              <span style={{ fontSize: 13, color: '#64748b' }}>Responses are confidential and tailored to your prompt.</span>
            </div>
            <span style={styles.statusPill}>Available</span>
          </header>

          <div style={styles.chatBody}>
            {messages.map((message, index) => (
              <div key={index} style={styles.messageRow(message.role === 'user' ? 'right' : 'left')}>
                <div style={styles.bubble(message.role)}>{message.text}</div>
              </div>
            ))}
            {loading ? (
              <div style={styles.messageRow('left')}>
                <div style={{ ...styles.bubble('model'), display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', opacity: 0.6 }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', opacity: 0.8 }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', opacity: 1 }} />
                  <span>CalmBot is reflecting…</span>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div style={styles.suggestedPrompts}>
            {promptList.map(prompt => (
              <button
                key={prompt}
                type="button"
                style={styles.promptPill}
                onClick={() => {
                  setInput(prompt);
                  textareaRef.current?.focus();
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(99,102,241,0.24)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          <footer style={styles.footer}>
            <div style={styles.inputWrapper}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={styles.textArea}
                placeholder="Type your question, reflection, or request for support…"
              />
              <span style={styles.helperText}>Press Enter to send • Shift + Enter for a new line</span>
            </div>
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={styles.sendButton(loading || !input.trim())}
              onMouseEnter={e => {
                if (loading || !input.trim()) return;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 18px 40px rgba(99, 102, 241, 0.36)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = styles.sendButton(false).boxShadow;
              }}
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}
