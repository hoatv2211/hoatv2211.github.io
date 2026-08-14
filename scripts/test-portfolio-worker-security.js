const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function loadWorker() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'cloudflare', 'portfolio-chat-worker.js'), 'utf8');
  return (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${Date.now()}`)).default;
}

const origin = 'https://hoatv2211.github.io';
function request(route, body = {}, headers = {}, method = 'POST') {
  return new Request(`https://worker.example${route}`, {
    method,
    headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.42', ...headers },
    body: method === 'POST' ? JSON.stringify(body) : undefined
  });
}
function limiter(result = { allowed: true, retryAfter: 0 }) {
  const calls = [];
  return { calls, async limit(input) { calls.push(input); return result; } };
}
const baseEnv = () => ({
  ENVIRONMENT: 'production', TURNSTILE_SECRET: 'turnstile-secret',
  RATE_LIMITER: limiter(), TELEGRAM_TOKEN: 'telegram-secret', TELEGRAM_CHAT_ID: '123',
  NINEROUTER_URL: 'https://router.example', NINEROUTER_KEY: 'router-secret', NINEROUTER_MODEL: 'model'
});
const chatBody = { sessionId: 's1', turnstileToken: 'valid-token', messages: [{ role: 'user', content: 'hello' }] };
const visitBody = { turnstileToken: 'valid-token', pageUrl: 'https://hoatv2211.github.io/projects/test' };

(async () => {
  const worker = await loadWorker();
  const realFetch = global.fetch;
  let calls = [];
  global.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).includes('siteverify')) return Response.json({ success: true });
    if (String(url).includes('router.example')) return Response.json({ choices: [{ message: { content: 'ok' } }] });
    if (String(url).includes('raw.githubusercontent.com')) return new Response('reference');
    if (String(url).includes('api.telegram.org')) return Response.json({ ok: true });
    throw new Error('unexpected fetch ' + url);
  };
  try {
    for (const route of ['/chat', '/visit']) {
      assert.equal((await worker.fetch(request(route, route === '/chat' ? chatBody : visitBody, { Origin: '' }), baseEnv())).status, 403, `${route} rejects missing Origin`);
      assert.equal((await worker.fetch(request(route, route === '/chat' ? chatBody : visitBody, { Origin: 'https://evil.example' }), baseEnv())).status, 403, `${route} rejects disallowed Origin`);
    }
    const preflight = await worker.fetch(request('/chat', {}, { Origin: 'https://evil.example' }, 'OPTIONS'), baseEnv());
    assert.equal(preflight.status, 403);
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), null, 'disallowed preflight is never reflected or replaced');
    assert.equal((await worker.fetch(request('/anything', visitBody), baseEnv())).status, 404, 'unknown route is not treated as visit');
    assert.equal((await worker.fetch(request('/visit/extra', visitBody), baseEnv())).status, 404, 'route allowlist is exact');

    assert.equal((await worker.fetch(request('/chat', { ...chatBody, turnstileToken: undefined }), baseEnv())).status, 400);
    assert.equal((await worker.fetch(request('/visit', { ...visitBody, turnstileToken: undefined }), baseEnv())).status, 400);
    assert.equal((await worker.fetch(request('/chat', chatBody), { ...baseEnv(), TURNSTILE_SECRET: undefined })).status, 503, 'production fails closed without Turnstile config');
    assert.equal((await worker.fetch(request('/chat', chatBody), { ...baseEnv(), RATE_LIMITER: undefined })).status, 503, 'production fails closed without stateful limiter');

    const denied = baseEnv(); denied.RATE_LIMITER = limiter({ allowed: false, retryAfter: 17 });
    const limited = await worker.fetch(request('/chat', chatBody), denied);
    assert.equal(limited.status, 429); assert.equal(limited.headers.get('Retry-After'), '17');
    assert.deepEqual(denied.RATE_LIMITER.calls[0], { version: 1, key: 'chat:203.0.113.42', limit: 20, windowSeconds: 300 });
    const visitEnv = baseEnv();
    assert.equal((await worker.fetch(request('/visit', visitBody), visitEnv)).status, 200);
    assert.deepEqual(visitEnv.RATE_LIMITER.calls[0], { version: 1, key: 'visit:203.0.113.0', limit: 1, windowSeconds: 300 });

    assert.equal((await worker.fetch(request('/chat', chatBody, { 'Content-Type': 'text/plain' }), baseEnv())).status, 415);
    const huge = { ...chatBody, messages: [{ role: 'user', content: 'x'.repeat(1001) }] };
    assert.equal((await worker.fetch(request('/chat', huge), baseEnv())).status, 413);
    const noisyVisit = { ...visitBody, referrer: 'secret', userAgent: 'fingerprint', text: 'inject' };
    calls = []; assert.equal((await worker.fetch(request('/visit', noisyVisit), baseEnv())).status, 400, 'visit only accepts minimal fields');
    assert.equal(calls.some(x => x.includes('api.telegram.org')), false);

    global.fetch = async (url) => {
      if (String(url).includes('siteverify')) return Response.json({ success: true });
      if (String(url).includes('router.example')) return new Response('upstream secret details', { status: 500 });
      if (String(url).includes('raw.githubusercontent.com')) return new Response('reference');
      throw new Error('unexpected fetch');
    };
    const debugResponse = await worker.fetch(request('/chat', { ...chatBody, debug: true }), baseEnv());
    assert.equal(debugResponse.status, 502);
    assert.equal(Object.hasOwn(await debugResponse.json(), 'debug'), false, 'production never leaks debug details');
    console.log('PASS portfolio worker security contract');
  } finally { global.fetch = realFetch; }
})().catch(error => { console.error(error); process.exitCode = 1; });
