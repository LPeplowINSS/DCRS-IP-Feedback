import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const initialAnswers = {
  satisfaction: '',
  ease: '',
  challenge: '',
  comments: '',
};

const questions = [
  {
    key: 'satisfaction',
    label: 'Overall, how satisfied are you with the DCRS experience?',
    options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'],
  },
  {
    key: 'ease',
    label: 'How easy was it to complete the task?',
    options: ['Very easy', 'Easy', 'Okay', 'Difficult', 'Very difficult'],
  },
  {
    key: 'challenge',
    label: 'Which area caused the most friction?',
    options: ['Navigation', 'Form completion', 'Information clarity', 'Speed', 'Other'],
  },
];

export default function App() {
  const [mode, setMode] = useState('chat');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState(initialAnswers);
  const [status, setStatus] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [submittedItems, setSubmittedItems] = useState([]);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const url = window.location.href;

    QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f3d79',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch(() => setQrDataUrl(''));
  }, []);

  const updateAnswer = (key, value) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Saving your feedback...');

    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          mode,
          answers,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to save feedback.');
      }

      const item = {
        email,
        mode,
        answers,
        createdAt: new Date().toLocaleString(),
      };

      setSubmittedItems((current) => [item, ...current].slice(0, 5));
      setEmail('');
      setAnswers(initialAnswers);
      setStatus('Thanks — your feedback has been saved.');
    } catch (error) {
      setStatus(error.message || 'Unable to save your feedback.');
    }
  };

  const handleVoiceAccess = async () => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || 'Voice mode is unavailable right now.');
      }

      setStatus('Voice access is active. Use the embedded voice widget below.');
    } catch (error) {
      setStatus(error.message || 'Voice access is unavailable right now.');
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">DCRS support</p>
          <h1>IP Feedback</h1>
        </div>
        <button className="secondary-button" type="button" onClick={() => {}}>
          Admin access
        </button>
      </header>

      <main className="layout">
        <section className="panel hero-panel">
          <div className="hero-copy">
            <span className="tag">Public feedback portal</span>
            <h2>Share your experience of the DCRS service.</h2>
            <p>
              Tell us what worked, where the friction was, and how the service can be improved.
            </p>
          </div>

          <div className="qr-box">
            <div className="qr-card">
              {qrDataUrl ? <img src={qrDataUrl} alt="QR code for feedback page" /> : <div className="qr-placeholder">QR</div>}
            </div>
            <p>Scan to open the feedback page on a mobile device.</p>
          </div>
        </section>

        <section className="panel form-panel">
          <h3>Give us feedback</h3>

          <div className="mode-switch" aria-label="Feedback mode switch">
            <button
              type="button"
              className={mode === 'chat' ? 'active' : ''}
              onClick={() => setMode('chat')}
            >
              Chat
            </button>
            <button
              type="button"
              className={mode === 'voice' ? 'active' : ''}
              onClick={() => {
                setMode('voice');
                handleVoiceAccess();
              }}
            >
              Voice
            </button>
          </div>

          <form className="feedback-form" onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            {questions.map((question) => (
              <div key={question.key} className="question-block">
                <label>{question.label}</label>
                <div className="option-grid">
                  {question.options.map((option) => (
                    <label key={option} className="radio-option">
                      <input
                        type="radio"
                        name={question.key}
                        value={option}
                        checked={answers[question.key] === option}
                        onChange={() => updateAnswer(question.key, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <label>
              Add anything else?
              <textarea
                value={answers.comments}
                onChange={(event) => updateAnswer('comments', event.target.value)}
                placeholder="Tell us more about your experience..."
              />
            </label>

            <button className="primary-button" type="submit">
              Submit feedback
            </button>

            {status ? <p className="status-message">{status}</p> : null}
          </form>
        </section>

        <aside className="panel admin-panel">
          <h3>Admin dashboard</h3>

          <label>
            Access token
            <input
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Enter token"
            />
          </label>

          <button
            className="secondary-button"
            type="button"
            onClick={() => setAdminToken((current) => current || 'local-demo-token')}
          >
            Unlock dashboard
          </button>

          <div className="dashboard-list">
            {submittedItems.length > 0 ? (
              submittedItems.map((item, index) => (
                <div className="dashboard-item" key={`${item.email}-${item.createdAt}-${index}`}>
                  <strong>{item.email}</strong>
                  <span>{item.mode}</span>
                  <small>{item.createdAt}</small>
                  <p>
                    {item.answers.satisfaction || 'No rating'} •{' '}
                    {item.answers.ease || 'No ease rating'}
                  </p>
                </div>
              ))
            ) : (
              <div className="dashboard-item">
                <strong>No submissions yet</strong>
                <span>Once feedback is submitted, it will appear here.</span>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
