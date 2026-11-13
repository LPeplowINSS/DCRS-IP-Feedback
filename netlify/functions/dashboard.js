import { getStore } from '@netlify/blobs';

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async (req) => {
  if (req.method !== 'GET') {
    return json(405, { message: 'Method not allowed.' });
  }

  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return json(501, { message: 'Set ADMIN_TOKEN in Netlify environment variables to enable the dashboard.' });
  }

  const auth = req.headers.get('authorization') || '';
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (provided !== adminToken) {
    return json(401, { message: 'Invalid admin token.' });
  }

  try {
    const store = getStore({ name: 'feedback-submissions', consistency: 'strong' });
    const { blobs } = await store.list();
    const now = Date.now();
    const items = [];

    for (const { key } of blobs) {
      const record = await store.get(key, { type: 'json' });
      if (!record) continue;
      // Enforce the 30-day retention policy: purge anything past its expiry.
      if (record.expiresAt && new Date(record.expiresAt).getTime() < now) {
        await store.delete(key);
        continue;
      }
      items.push(record);
    }

    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return json(200, { items });
  } catch (error) {
    console.error('Failed to load dashboard', error);
    return json(500, { message: 'Unable to load feedback submissions.' });
  }
};
