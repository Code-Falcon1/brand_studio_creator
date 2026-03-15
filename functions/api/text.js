const POLLINATIONS_BASE = 'https://gen.pollinations.ai';

function pickParams(searchParams, allowList) {
  const out = new URLSearchParams();
  for (const key of allowList) {
    const v = searchParams.get(key);
    if (v === null || v === undefined || String(v).trim() === '') continue;
    out.set(key, v);
  }
  return out;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const prompt = String(url.searchParams.get('prompt') || '').trim();
  if (!prompt) {
    return new Response(JSON.stringify({ error: { message: 'Missing "prompt" query param.' } }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const upstream = new URL(`${POLLINATIONS_BASE}/text/${encodeURIComponent(prompt)}`);
  const params = pickParams(url.searchParams, ['model', 'seed']);
  upstream.search = params.toString();

  const apiKey = String(env.POLLINATIONS_API_KEY || '').trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: {
          message: 'Server proxy is enabled, but POLLINATIONS_API_KEY is not set in the Pages environment.',
        },
      }),
      { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' } },
    );
  }

  const upstreamResp = await fetch(upstream.toString(), {
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  });

  const contentType = upstreamResp.headers.get('content-type') || 'text/plain; charset=utf-8';
  const body = await upstreamResp.text();
  return new Response(body, { status: upstreamResp.status, headers: { 'content-type': contentType } });
}

