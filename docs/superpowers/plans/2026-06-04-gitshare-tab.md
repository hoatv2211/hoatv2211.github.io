# GitShare Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Mad Hub nav entry with a GitShare tab that shows public repositories from `hoatv2211` and `mad-agentic`.

**Architecture:** Keep the existing static portfolio shell and `data-nav-link` article switching. Add a focused GitShare renderer that fetches GitHub public repos at runtime, normalizes repo fields, and falls back to a small static list if GitHub API is unavailable.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, GitHub REST API.

---

### Task 1: Add GitShare Shell

**Files:**
- Modify: `index.html`

- [x] **Step 1: Replace Mad Hub nav with GitShare**

Change the Mad Hub button into a normal `data-nav-link` button labeled `GitShare`.

- [x] **Step 2: Add GitShare article before Contact**

Add `article.gitshare[data-page="gitshare"]` with status text, filter buttons, and an empty repo grid using `data-gitshare-*` hooks.

- [x] **Step 3: Load renderer script**

Add `assets/js/github-share.js` before `assets/js/script.js` so the GitShare UI can initialize on DOM ready.

### Task 2: Add GitShare Renderer

**Files:**
- Create: `assets/js/github-share.js`

- [x] **Step 1: Define GitHub sources and fallback repos**

Use owners `hoatv2211` and `mad-agentic`. Fallback repos include `hoatv2211/hoatv2211.github.io` and `mad-agentic/ProxyAPI.MAD`.

- [x] **Step 2: Fetch and normalize repos**

Fetch `https://api.github.com/users/{owner}/repos?per_page=100&sort=updated`, remove forks, sort by stars then updated date, and map fields for cards.

- [x] **Step 3: Render cards and states**

Render cards with OG image, owner/name, description, language, stars, forks, issues, updated date, topics, and source link. Show loading, error/fallback, empty state.

- [x] **Step 4: Add owner filters**

Support All, hoatv2211, and mad-agentic filter buttons.

### Task 3: Style GitShare

**Files:**
- Modify: `assets/css/style.css`

- [x] **Step 1: Add GitShare layout CSS**

Add toolbar and responsive repo grid styles that match the existing dark portfolio shell.

- [x] **Step 2: Add card visual polish**

Use real GitHub OG images, compact metadata rows, accessible contrast, hover states, and mobile-safe text wrapping.

### Task 4: Verify

**Files:**
- Check: `index.html`, `assets/js/github-share.js`, `assets/css/style.css`

- [x] **Step 1: Run syntax and portfolio validation**

Run `node --check assets/js/github-share.js` and `npm.cmd run validate:portfolio`.

- [x] **Step 2: Smoke test local route**

Start a local static server and confirm `index.html` returns HTTP 200.

- [ ] **Step 3: Capture GitShare screenshots**

Use Playwright screenshot on desktop and mobile, inspect that nav, cards, and fallback/loading states do not overlap.
