# Project Detail Chat Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-time, project-aware chatbot invitation to every rendered portfolio detail.

**Architecture:** The shared detail renderer exposes canonical project context through data attributes, and the detail controller announces activation through a custom event. The existing chatbot controller derives family-specific invitation copy, schedules it by time or scroll depth, persists per-project state in `sessionStorage`, and pre-fills an editable question when selected.

**Tech Stack:** Static HTML, vanilla JavaScript, CSS, Node.js contract tests.

---

### Task 1: Lock the project-aware contract

**Files:**
- Modify: `scripts/test-chatbot-proactive-contract.js`

- [ ] Add assertions for renderer context attributes, the detail-opened event, eight-second detail timing, 30% scroll depth, per-project session tracking, family copy, and input prefill.
- [ ] Run `node scripts/test-chatbot-proactive-contract.js` and confirm it fails because project-aware behavior is absent.

### Task 2: Expose active project context

**Files:**
- Modify: `assets/js/portfolio-detail-renderer.js`
- Modify: `assets/js/script.js`

- [ ] Add escaped `data-project-title`, `data-project-role`, and `data-showcase-family` attributes to the rendered detail root.
- [ ] Dispatch `portfolio:detail-opened` with the active detail key after the project becomes active.
- [ ] Run `node scripts/test-chatbot-proactive-contract.js` and confirm only chatbot behavior assertions remain failing.

### Task 3: Implement the detail invitation controller

**Files:**
- Modify: `assets/js/portfolio-chatbot.js`

- [ ] Add an eight-second detail delay and 30% scroll threshold to the default configuration.
- [ ] Derive short invitation text and editable input prompts from the active detail's family, title, and role.
- [ ] Persist seen detail keys in the existing proactive session state.
- [ ] Reschedule on `portfolio:detail-opened`, trigger once by timer or scroll depth, and preserve the global interaction stop behavior.
- [ ] Open chat and pre-fill the input without submitting or mutating stored messages.
- [ ] Run `node scripts/test-chatbot-proactive-contract.js` and confirm it passes.

### Task 4: Verify integrations

**Files:**
- Verify: `assets/js/portfolio-chatbot.js`
- Verify: `assets/js/portfolio-detail-renderer.js`
- Verify: `assets/js/script.js`

- [ ] Run `node --check` on all three modified JavaScript files.
- [ ] Run `npm test` and confirm all portfolio contracts pass.
- [ ] Run `git diff --check` and confirm there are no whitespace errors.
- [ ] Browser-check one desktop and one 390px detail: timer/scroll trigger, project-specific copy, editable prefill, no repeated invitation, and no overlap with bottom navigation.
