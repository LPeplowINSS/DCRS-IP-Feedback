const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (req) => {
  if (req.method !== 'POST') {
    return json(405, { message: 'Method not allowed.' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return json(501, {
      message:
        'Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in Netlify environment variables to enable voice feedback.',
    });
  }

  try {
    const url = new URL('https://api.elevenlabs.io/v1/convai/conversation/get-signed-url');
    url.searchParams.set('agent_id', agentId);

    const response = await fetch(url, { headers: { 'xi-api-key': apiKey } });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return json(response.status, {
        message: payload?.detail?.message || payload?.message || 'Unable to generate a signed URL for the voice agent.',
      });
    }

    return json(200, { signedUrl: payload.signed_url });
  } catch (error) {
    console.error('ElevenLabs signed URL error', error);
    return json(500, { message: 'Unexpected server error while creating the voice session.' });
  }
};
