import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const QUESTIONS = [
  {
    id: 'overall',
    label: 'Overall, how satisfied are you with the new DCRS service?',
    type: 'choice',
    options: ['Very satisfied', 'Satisfied', 'Dissatisfied', 'Very dissatisfied'],
  },
  {
    id: 'ease',
    label: 'How easy was it to complete your task using DCRS?',
    type: 'choice',
    options: ['Very easy', 'Easy', 'Difficult', 'Very difficult'],
  },
  {
    id: 'worked',
    label: 'What worked well for you?',
    type: 'text',
  },
  {
    id: 'improve',
    label: 'What could we improve?',
    type: 'text',
  },
];

const emptyAnswers = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, '']));

function QrPanel() {
  const [qr, setQr] = useState('');

  useEffect(() => {
    QRCode.toDataURL(window.location.origin, { width: 480, margin: 1, color: { dark: '#092b53' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, []);

  return (
    <section className="panel hero-panel">
      <div className="hero-copy">
        <span className="tag">Insolvency Practitioners</span>
        <h2 style={{ marginTop: 16 }}>Tell us how the new DCRS service is working for you</h2>
        <p>
          Your feedback helps us improve the service. It takes around two minutes, and you can type
          your answers or talk them through with Sophie, our voice assistant.
        </p>
      </div>
      <div className="qr-box">
        <div className="qr-card">
          {qr ? <img src={qr} alt="QR code linking to this feedback page" /> : <div className="qr-placeholder">QR</div>}
        </div>
        <p style={{ marginTop: 12, color: 'var(--muted)' }}>Scan to open this page on your phone</p>
      </div>
    </section>
  );
}

function FeedbackPanel() {
  const [mode, setMode] = useState('chat');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState(emptyAnswers);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode, answers: mode === 'chat' ? answers : {} }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to save your feedback.');

      setStatus({
        type: 'success',
        text:
          mode === 'chat'
            ? 'Thank you, your feedback has been submitted.'
            : 'Thank you. Your email is recorded, so you can now talk to Sophie using the voice button.',
      });
      if (mode === 'chat') {
        setAnswers(emptyAnswers());
        setEmail('');
      }
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel form-panel">
      <h3>Share your feedback</h3>
      <div className="mode-switch" role="tablist" aria-label="Feedback mode">
        <button type="button" className={mode === 'chat' ? 'active' : ''} onClick={() => setMode('chat')}>
          Chat
        </button>
        <button type="button" className={mode === 'voice' ? 'active' : ''} onClick={() => setMode('voice')}>
          Voice
        </button>
      </div>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <label>
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@firm.co.uk"
          />
        </label>

        {mode === 'chat' ? (
          QUESTIONS.map((q) =>
            q.type === 'choice' ? (
              <fieldset key={q.id} className="question-block" style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 600, color: 'var(--primary-strong)' }}>{q.label}</legend>
                <div className="option-grid">
                  {q.options.map((option) => (
                    <label key={option} className="radio-option" style={{ flexDirection: 'row' }}>
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={() => setAnswer(q.id, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <label key={q.id}>
                {q.label}
                <textarea value={answers[q.id]} onChange={(e) => setAnswer(q.id, e.target.value)} />
              </label>
            )
          )
        ) : (
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Enter your email and select continue, then start a conversation with Sophie using the voice
            button at the bottom of the screen. Sophie asks you the same questions as the chat form.
          </p>
        )}

        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Submitting…' : mode === 'chat' ? 'Submit feedback' : 'Continue to voice'}
        </button>
        {status.text && (
          <p className="status-message" role="status" style={status.type === 'error' ? { color: '#b42318' } : undefined}>
            {status.text}
          </p>
        )}
      </form>
    </section>
  );
}

function AdminPanel() {
  const [token, setToken] = useState('');
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(event) {
    event?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to load submissions.');
      setItems(data.items || []);
    } catch (err) {
      setItems(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel admin-panel">
      <h3>Admin dashboard</h3>
      <form className="feedback-form" onSubmit={load}>
        <label>
          Admin token
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} required />
        </label>
        <button type="submit" className="secondary-button" disabled={loading}>
          {loading ? 'Loading…' : 'View submissions'}
        </button>
      </form>
      {error && <p className="status-message" style={{ color: '#b42318', marginTop: 12 }}>{error}</p>}
      {items && (
        <div className="dashboard-list">
          {items.length === 0 && <p style={{ color: 'var(--muted)' }}>No submissions yet.</p>}
          {items.map((item) => (
            <div key={item.id} className="dashboard-item">
              <strong>{item.email}</strong>
              <span>
                {item.mode === 'voice' ? 'Voice' : 'Chat'} · {new Date(item.createdAt).toLocaleString()}
              </span>
              {Object.entries(item.answers || {})
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <p key={key} style={{ margin: 0 }}>
                    {QUESTIONS.find((q) => q.id === key)?.label || key}: {String(value)}
                  </p>
                ))}
              <small>Deleted after {new Date(item.expiresAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">The Insolvency Service</p>
          <h1>DCRS IP Feedback</h1>
        </div>
      </header>
      <main className="layout">
        <QrPanel />
        <FeedbackPanel />
        <AdminPanel />
      </main>
    </div>
  );
}
