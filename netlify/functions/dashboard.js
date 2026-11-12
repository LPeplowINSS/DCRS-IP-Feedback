import { getStore } from '@netlify/blobs';

const store = getStore({ name: 'feedback-submissions' });

function getThirtyDayExpiry() {
  const now = new Date();
  now.setDate(now.getDate() + 30);
  return now.toISOString();
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const email = String(payload.email || '').trim();

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'A valid email address is required.' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const record = {
      id: `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email,
      mode: payload.mode || 'chat',
      answers: payload.answers || {},
      createdAt: new Date().toISOString(),
      expiresAt: getThirtyDayExpiry(),
      retention: '30 days',
    };

    await store.setJSON(record.id, record);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, item: record }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Unable to save your feedback.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}
