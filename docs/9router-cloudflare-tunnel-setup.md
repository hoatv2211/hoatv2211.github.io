# 9Router Cloudflare Tunnel Setup

Purpose: expose the VPS-hosted 9Router proxy to the portfolio Cloudflare Worker through HTTPS, because Workers cannot reliably call the raw VPS endpoint `http://187.77.149.230:20128`.

## Current Working Quick Tunnel

Quick Tunnel URL created on 2026-06-04:

```txt
https://intellectual-tactics-temp-boats.trycloudflare.com
```

Worker env should use:

```txt
NINEROUTER_URL=https://intellectual-tactics-temp-boats.trycloudflare.com
NINEROUTER_MODEL=cx/gpt-5.5
NINEROUTER_KEY=<rotate-and-store-as-secret>
```

Do not commit the real 9Router API key. The key was exposed in screenshots during setup, so rotate it after the integration is stable and store it as a Cloudflare Worker Secret.

## Why Tunnel Is Needed

Direct VPS endpoint works from local tools:

```txt
http://187.77.149.230:20128/v1
```

But Cloudflare Worker calling this endpoint returned:

```txt
403 error code: 1003
```

This means the Worker path to the raw IP/custom port is blocked by Cloudflare/proxy behavior. The HTTPS tunnel avoids direct IP/custom-port access.

## Quick Tunnel On VPS

Run this on the VPS where 9Router listens on `localhost:20128`:

```bash
docker run -d \
  --name cloudflared-9router-quick \
  --network host \
  --restart unless-stopped \
  cloudflare/cloudflared:latest \
  tunnel --url http://localhost:20128
```

Get the generated URL:

```bash
docker logs cloudflared-9router-quick | grep trycloudflare
```

Check container is still running:

```bash
docker ps | grep cloudflared-9router-quick
```

Restart if needed:

```bash
docker restart cloudflared-9router-quick
docker logs cloudflared-9router-quick | grep trycloudflare
```

Note: quick tunnel URLs have no uptime guarantee and may change. If the URL changes, update `NINEROUTER_URL` in the Cloudflare Worker env and deploy again.

## 9Router Security

Before exposing 9Router through any tunnel:

1. Enable `Require API key` in the 9Router dashboard.
2. Ensure the `mad` API key is enabled.
3. Store the key in Cloudflare Worker as a secret, not plaintext.

9Router dashboard:

```txt
http://187.77.149.230:20128/dashboard/endpoint
```

## Test Tunnel Directly

Use the current tunnel URL:

```bash
curl https://intellectual-tactics-temp-boats.trycloudflare.com/v1/models \
  -H "Authorization: Bearer <NINEROUTER_KEY>"
```

Expected: `200 OK` with models including:

```txt
cx/gpt-5.5
```

Test chat completions:

```bash
curl -X POST https://intellectual-tactics-temp-boats.trycloudflare.com/v1/chat/completions \
  -H "Authorization: Bearer <NINEROUTER_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cx/gpt-5.5","messages":[{"role":"user","content":"hello"}],"max_tokens":80,"temperature":0.3}'
```

Expected: `200 OK` with an assistant reply.

## Cloudflare Worker Env

Set these in the portfolio Worker:

```txt
ALLOWED_ORIGINS=https://hoatv2211.github.io,http://localhost:8080,http://127.0.0.1:8080,http://localhost:8790,http://127.0.0.1:8790
NINEROUTER_URL=https://intellectual-tactics-temp-boats.trycloudflare.com
NINEROUTER_MODEL=cx/gpt-5.5
NINEROUTER_KEY=<NINEROUTER_KEY_SECRET>
TELEGRAM_CHAT_ID=859267157
TELEGRAM_TOKEN=<TELEGRAM_BOT_TOKEN_SECRET>
```

Deploy Worker after changing env.

## Test Portfolio Worker

Test CORS preflight:

```bash
curl -i -X OPTIONS "https://quiet-haze-970b.tranhoa-221194.workers.dev/chat" \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

Expected header:

```txt
Access-Control-Allow-Origin: http://localhost:8080
```

Test chat through Worker:

```bash
curl -i -X POST "https://quiet-haze-970b.tranhoa-221194.workers.dev/chat" \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"debug-test","debug":true,"messages":[{"role":"user","content":"hello"}],"pageUrl":"http://localhost:8080/","visitorMeta":{"language":"en"}}'
```

Expected: `200 OK` with a JSON `reply`.

If it returns `502 model unavailable`, check the `debug` field. Common causes:

- `403 error code: 1003`: Worker is still calling raw VPS IP/custom port. Use tunnel URL.
- `401`: wrong or missing `NINEROUTER_KEY`, or API key disabled in 9Router.
- Network timeout: quick tunnel container stopped or URL changed.

## Stable Production Tunnel

For long-term use, add a real domain to Cloudflare and create a named tunnel route:

```txt
https://9router.<your-domain>
```

Route settings:

```txt
Route type: Published application
Subdomain: 9router
Domain: <your-domain>
Path: empty
Service type: HTTP
Service URL: localhost:20128
```

Then update Worker env:

```txt
NINEROUTER_URL=https://9router.<your-domain>
```

