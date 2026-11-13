import { getStore } from '@netlify/blobs';

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function getThirtyDayExpiry() {
  const now = new Date();
  now.setDate(now.getDate() + 30);
  return now.toISOString();
}

export default async (req) => {
  if (req.method !== 'POST') {
    return json(405, { message: 'Method not allowed.' });
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const email = String(payload.email || '').trim();

    if (!email || !email.includes('@')) {
      return json(400, { message: 'A valid email address is required.' });
    }

    const record = {
      id: `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email,
      mode: payload.mode === 'voice' ? 'voice' : 'chat',
      answers: payload.answers && typeof payload.answers === 'object' ? payload.answers : {},
      createdAt: new Date().toISOString(),
      expiresAt: getThirtyDayExpiry(),
      retention: '30 days',
    };

    const store = getStore({ name: 'feedback-submissions', consistency: 'strong' });
    await store.setJSON(record.id, record);

    return json(200, { success: true, item: record });
  } catch (error) {
    console.error('Failed to save feedback', error);
    return json(500, { message: 'Unable to save your feedback.' });
  }
};
