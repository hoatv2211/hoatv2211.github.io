# Project Detail Chat Guide Design

## Goal

Turn the existing proactive chatbot invitation into a project-aware guide while a portfolio detail is open, helping recruiters understand the strongest production evidence without repeating the hero copy.

## Experience

- Keep the existing chatbot and invitation component; do not add a second chat surface.
- Read the active project's canonical title, role, and showcase family from renderer-provided data attributes.
- Show one project-specific invitation after eight seconds in the detail or after the reader reaches roughly 30% of the detail, whichever happens first.
- Show each project's invitation at most once per browser session and keep the existing global maximum of four proactive invitations.
- Do not show an invitation after the visitor dismisses or interacts with the chatbot.
- Clicking the invitation opens the chatbot and pre-fills a concise project-summary question without submitting it or adding it to chat history.

## Copy Strategy

Use the showcase family to select a short recruiter-oriented prompt:

- `flagship-worlds`: production ownership
- `mobile-campaign`: mobile delivery
- `gameplay-editorial`: gameplay highlights
- `product-console`: product architecture
- `compact-proof`: concise role summary
- `production-showcase`: production story
- fallback: quick project summary

The project title is included so every invitation feels specific without adding unverified claims.

## Accessibility and Motion

- Preserve the invitation's existing `role=status` and polite live region.
- Preserve reduced-motion behavior.
- Keep the invitation non-modal and dismissible.
- Focus the chatbot input after activation, leaving the pre-filled text editable.

## Data and Architecture

- `portfolio.json` remains canonical and does not need new fields.
- `assets/js/portfolio-detail-renderer.js` exposes the already-canonical title, role, and presentation family as escaped data attributes on the detail root.
- `assets/js/script.js` emits a project-detail-opened event after activation.
- `assets/js/portfolio-chatbot.js` owns invitation timing, session state, family copy, scroll threshold, and input prefill.

## Acceptance Criteria

- General portfolio invitations retain their existing five-second timing.
- Detail invitations use an eight-second timer or 30% detail-scroll trigger.
- Reopening the same project in the same session does not show its invitation again.
- Opening a different project may show a new invitation until the global session maximum is reached.
- Clicking a detail invitation opens chat, focuses the input, and pre-fills a project-specific prompt without modifying message history.
- Existing security, mobile positioning, visibility pause, and reduced-motion contracts continue to pass.
