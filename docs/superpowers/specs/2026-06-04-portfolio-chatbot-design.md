# Portfolio Chatbot Design

Date: 2026-06-04

## Goal

Add a floating AI chatbox to the portfolio that acts like a small Codex-style robot pet. It should answer visitor questions about Hoa's profile, projects, Unity/GameFi/Telegram bot/automation work, and convert relevant conversations into Telegram lead notifications.

## Scope

- Add one shared chat widget to the main portfolio and all three backup portfolio styles.
- Add a Cloudflare Worker template for the chat API and Telegram hook.
- Use 9Router through an OpenAI-compatible chat completions API.
- Keep all API keys and Telegram tokens out of the static GitHub Pages site.
- Keep the first implementation focused: text chat, lead capture, Telegram notification, graceful fallback.

Out of scope for v1:
- Voice chat.
- File upload.
- Full CRM dashboard.
- Streaming responses.

## Architecture

The portfolio remains a static GitHub Pages site. A shared frontend script renders the chatbot UI and calls a Cloudflare Worker endpoint. The Worker owns all server-side concerns: model API calls, lead detection, Telegram notifications, CORS, and rate limits.

Main components:

- `assets/js/portfolio-chatbot.js`: shared browser widget logic.
- `assets/css/style.css` or a small shared CSS block: robot pet, chat panel, mobile layout, animation states.
- `cloudflare/portfolio-chat-worker.js`: Worker reference implementation.
- `index.html`: loads the widget.
- `backup/recruiter-clean/index.html`, `backup/dev-console/index.html`, `backup/game-studio/index.html`: load the same widget.

## UI Design

The widget appears as a floating pixel/dev robot mascot. It uses a compact robot button with blinking eyes, subtle antenna glow, and typing dots while waiting for responses. The button is draggable and stores position in `localStorage`, matching the existing movable theme and backup style buttons.

Clicking the robot opens a mini dev-console chat panel:

- Header: robot identity and close button.
- Transcript: user and assistant bubbles.
- Quick prompts: Unity projects, Telegram bots, GameFi, hiring availability.
- Input row: text field and send icon button.
- Mobile: bottom sheet layout with safe width and fixed input row.

The widget should not use large marketing text. It should feel like a useful assistant embedded in the portfolio, not a separate landing-page section.

## Chat Behavior

The assistant should answer in the visitor's language. If the visitor writes Vietnamese, answer Vietnamese. If English, answer English. If unclear, default to English.

The assistant persona:

- Concise, technical, and helpful.
- Knows Hoa's public portfolio content and project categories.
- Can explain services: Unity development, WebGL, Telegram mini apps/bots, GameFi, automation, agentic systems.
- Does not invent private availability, pricing, or confidential client details.

Lead flow:

1. Visitor asks general questions: answer normally.
2. Visitor shows hiring/collaboration/interview intent: ask for contact if missing.
3. Visitor provides contact plus relevant intent: say clearly that the conversation will be passed to Hoa on Telegram.
4. Worker sends a compact Telegram lead summary.

## Worker API

Endpoint:

```text
POST /chat
```

Request body:

```json
{
  "sessionId": "uuid",
  "messages": [{ "role": "user", "content": "Hello" }],
  "pageUrl": "https://hoatv2211.github.io/",
  "visitorMeta": { "language": "auto" }
}
```

Response body:

```json
{
  "reply": "Hi, I can help with Hoa's Unity and automation work.",
  "leadSent": false,
  "leadReason": ""
}
```

Required Worker environment variables:

- `NINEROUTER_URL`: base URL for 9Router.
- `NINEROUTER_KEY`: bearer token for 9Router.
- `NINEROUTER_MODEL`: model id to use.
- `TELEGRAM_BOT_TOKEN`: Telegram bot token.
- `TELEGRAM_CHAT_ID`: Telegram chat id receiving leads.
- `ALLOWED_ORIGINS`: comma-separated allowed origins for CORS.

9Router request shape:

```text
POST {NINEROUTER_URL}/v1/chat/completions
Authorization: Bearer {NINEROUTER_KEY}
Content-Type: application/json
```

## Telegram Notification

Send only qualified leads, not every message. A lead is qualified when the conversation contains contact information and hiring/collaboration/interview intent.

Telegram summary fields:

- Visitor contact.
- Need or project type.
- Budget or timeline if provided.
- Page URL.
- Session id.
- Short conversation summary.

If Telegram sending fails, the chat reply should still work. The response can set `leadSent: false` and include a neutral fallback in the assistant reply.

## Security And Privacy

- No secret values in static files.
- CORS allow only portfolio domain and localhost during development.
- Limit request body size and message length.
- Rate limit by session/IP where practical inside Worker storage constraints.
- Do not send Telegram notifications without clear lead intent and contact.
- Tell the visitor when their contact/request is being passed to Hoa.
- Store only local chat history in the browser for v1, with a small limit.

## Error Handling

Frontend fallback states:

- Worker unavailable: show a short message and Telegram profile link.
- Model unavailable: show a short retry/fallback message.
- Empty input: no request.
- Long input: trim or show max-length validation.

Worker fallback states:

- Invalid origin: reject with CORS-safe error.
- Invalid body: return `400`.
- 9Router failure: return `502` with safe public message.
- Telegram failure: log minimally if possible, but do not expose token or internal error details.

## Backup Sync

The same chat widget should load in:

- `index.html`
- `backup/recruiter-clean/index.html`
- `backup/dev-console/index.html`
- `backup/game-studio/index.html`

Backup variants should not duplicate chat logic. If visual theme overrides are needed, they should be small CSS custom properties or page-level classes.

## Validation

Implementation should verify:

- JavaScript syntax checks for new and changed scripts.
- Portfolio data validation still passes.
- Main route loads with robot button.
- Three backup routes load with robot button.
- Chat panel opens/closes.
- Robot button can drag and persist position.
- Worker template parses valid requests and rejects invalid ones.
- No secret values are committed.
