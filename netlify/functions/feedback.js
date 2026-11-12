export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return {
      statusCode: 501,
      body: JSON.stringify({
        message:
          'Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in Netlify environment variables to enable voice feedback.',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations/get_signed_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({ agent_id: agentId }),
    });

    const payload = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          message: payload?.message || 'Unable to generate a signed URL for the voice agent.',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Unexpected server error while creating the voice session.',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}
