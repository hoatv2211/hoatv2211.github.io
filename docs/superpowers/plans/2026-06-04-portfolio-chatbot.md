# Portfolio Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared floating robot chatbox for the main portfolio and backup variants, backed by a Cloudflare Worker template that talks to 9Router and sends qualified leads to Telegram.

**Architecture:** Static pages load one shared `portfolio-chatbot.js` widget and one shared `portfolio-chatbot.css` stylesheet. The widget stores local chat state, calls a configurable Worker endpoint, and falls back to Telegram link if unavailable. The Worker keeps 9Router and Telegram secrets server-side.

**Tech Stack:** Static HTML/CSS/JavaScript, Cloudflare Workers, 9Router OpenAI-compatible chat completions API, Telegram Bot API, Node syntax checks, existing portfolio validation.

---

### Task 1: Shared Chat Widget Script

**Files:**
- Create: `assets/js/portfolio-chatbot.js`

- [x] **Step 1: Add self-contained widget bootstrap**

Create an IIFE that waits for `DOMContentLoaded`, creates a floating robot button and chat panel, and appends them to `document.body`. Use `window.PORTFOLIO_CHATBOT_CONFIG` when present, otherwise fall back to defaults.

- [x] **Step 2: Add chat state and local storage**

Store `sessionId`, panel open state, last messages, and draggable position in `localStorage` keys prefixed with `portfolioChatbot`.

- [x] **Step 3: Add message send flow**

On submit, render user message, render typing state, call `POST config.endpoint`, append assistant reply, and show fallback if request fails.

- [x] **Step 4: Add lead transparency behavior**

When Worker returns `leadSent: true`, show a small status line that says the request was sent to Hoa on Telegram.

- [x] **Step 5: Add drag behavior**

Implement pointer drag for the robot button with viewport clamp and click suppression after drag.

### Task 2: Shared Chat Widget CSS

**Files:**
- Create: `assets/css/portfolio-chatbot.css`

- [x] **Step 1: Add robot pet button styles**

Create a compact pixel/dev robot with CSS shapes: head, ears/antenna, blinking eyes, and glow. Keep it button-sized and readable above existing floating controls.

- [x] **Step 2: Add panel styles**

Style the panel as a small dev console with transcript, quick prompts, input row, and close button.

- [x] **Step 3: Add responsive states**

On mobile, make the panel a bottom sheet with safe-area padding and no text overflow.

- [x] **Step 4: Add backup theme compatibility**

Use CSS variables with defaults so the widget works on dark main, recruiter clean, dev console, and game studio backup pages.

### Task 3: Cloudflare Worker Template

**Files:**
- Create: `cloudflare/portfolio-chat-worker.js`

- [x] **Step 1: Add CORS and request validation**

Allow origins from `ALLOWED_ORIGINS`, handle `OPTIONS`, reject invalid methods and invalid JSON body.

- [x] **Step 2: Add 9Router call**

Call `{NINEROUTER_URL}/v1/chat/completions` with `NINEROUTER_KEY`, `NINEROUTER_MODEL`, a portfolio-focused system prompt, and limited recent messages.

- [x] **Step 3: Add lead extraction**

Detect hiring/collaboration/interview intent and contact information using deterministic checks plus recent conversation text.

- [x] **Step 4: Add Telegram notification**

When qualified, send a compact message through Telegram Bot API. Do not fail chat reply if Telegram fails.

- [x] **Step 5: Add safe errors**

Return public-safe messages for bad input, model failure, and server errors without exposing secrets.

### Task 4: Wire Main And Backup Pages

**Files:**
- Modify: `index.html`
- Modify: `backup/recruiter-clean/index.html`
- Modify: `backup/dev-console/index.html`
- Modify: `backup/game-studio/index.html`

- [x] **Step 1: Load shared CSS**

Add `assets/css/portfolio-chatbot.css` to main and `../../assets/css/portfolio-chatbot.css` to backups.

- [x] **Step 2: Add endpoint config**

Add a small `window.PORTFOLIO_CHATBOT_CONFIG` script with endpoint placeholder `https://YOUR_WORKER.workers.dev/chat` and Telegram fallback `https://t.me/o0_MaD_0o`.

- [x] **Step 3: Load shared JS**

Add `assets/js/portfolio-chatbot.js` to main and `../../assets/js/portfolio-chatbot.js` to backups after main page scripts.

### Task 5: Verification

**Files:**
- Modify: `docs/superpowers/plans/2026-06-04-portfolio-chatbot.md`

- [x] **Step 1: Syntax check JavaScript**

Run `node --check assets\js\portfolio-chatbot.js` and `node --check cloudflare\portfolio-chat-worker.js`. Expected: no output and exit code 0.

- [x] **Step 2: Validate portfolio data**

Run `npm.cmd run validate:portfolio`. Expected: `Portfolio validation passed for 22 projects`.

- [x] **Step 3: Check secret hygiene**

Run `rg -n "NINEROUTER_KEY|TELEGRAM_BOT_TOKEN|[0-9]{8,}:[A-Za-z0-9_-]{20,}" index.html assets backup cloudflare`. Expected: only env variable names, no real token values.

- [x] **Step 4: Inspect git diff**

Run `git diff --check`. Expected: no whitespace errors except existing CRLF warnings if Git reports them.

- [x] **Step 5: Tick completed plan items**

Update this plan so every completed checkbox is marked before final response.
