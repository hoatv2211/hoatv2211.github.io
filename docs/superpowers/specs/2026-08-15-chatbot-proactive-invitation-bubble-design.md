# Chatbot Proactive Invitation Bubble Design

**Date:** 2026-08-15  
**Status:** Approved direction, pending written-spec review

## Goal

Make the portfolio chatbot act like a lightweight host by showing short invitation messages beside the pet every five seconds, without automatically opening the chat panel or covering the portfolio experience.

## Experience

- The first invitation appears five seconds after the chatbot initializes.
- Later invitations appear at five-second intervals.
- Only one invitation bubble is visible at a time and it dismisses after approximately four seconds.
- A maximum of four invitations appears in one page session.
- Messages do not repeat during the same session.
- Clicking the invitation bubble or pet opens the existing chatbot panel.
- Opening the panel, typing, submitting a prompt, or explicitly dismissing an invitation permanently stops proactive invitations for the current session.
- Invitations pause while the document is hidden and resume from a fresh interval when the tab becomes visible.
- Missed invitations are never replayed in a burst.
- Proactive invitations are presentation-only and are not stored in chatbot conversation history.

## Message Pool

### General

1. `Hi! Looking for a Game developer?`
2. `Need a Unity developer who can take a game from prototype to release?`
3. `Have a game idea that needs a playable prototype?`
4. `Looking for someone who can lead Unity production?`
5. `Building a mobile, WebGL, GameFi, or Telegram game?`
6. `Need help with gameplay, optimization, ads, IAP, or publishing?`

### Contextual

- About: `Want a quick summary of Hoa's strongest experience?`
- Resume: `Want me to highlight the experience most relevant to your team?`
- Portfolio: `Need help choosing which projects to review first?`
- Project detail: `Planning something similar? Ask me how Hoa can help.`
- GitShare: `Looking for public code samples or playable demos?`
- Hiring fallback: `Have a project in mind? I can help you contact Hoa on Telegram.`

The current active section supplies the preferred contextual message. Remaining slots are selected from the general pool without repetition. Selection does not need cryptographic randomness; a shuffled per-session queue is sufficient.

## Visual Design

- Render a compact speech bubble adjacent to and above the existing pet button.
- Keep the bubble separate from the chat panel and message history.
- Use the chatbot theme variables so clean, console, and studio modes remain compatible.
- Desktop maximum width: approximately 280px.
- Mobile maximum width: approximately 220px.
- Bubble placement must remain above the fixed navbar and inside the viewport.
- Use a short opacity/translate entrance and exit only when reduced motion is not requested.
- Provide an explicit close control with an accessible name.
- The entire message body is clickable and opens the chatbot.

## Accessibility

- Use `role="status"` and `aria-live="polite"` so invitations do not interrupt current speech.
- The close control and message action must be keyboard reachable.
- Visible focus styles must use existing chatbot accent variables.
- Respect `prefers-reduced-motion: reduce` by removing bubble transitions.
- Do not steal focus when an invitation appears.

## Configuration

Add optional chatbot configuration fields with safe defaults:

- `proactiveEnabled: true`
- `proactiveDelayMs: 5000`
- `proactiveVisibleMs: 4000`
- `proactiveMaxPerSession: 4`
- `proactiveMessages`: general message array
- `proactiveContextMessages`: section-to-message map

Invalid or empty custom message collections fall back to the built-in defaults. Timing values are clamped to reasonable minimums so custom configuration cannot create a rapid message loop.

## State And Cleanup

- Store only the stopped/count/used-message state in `sessionStorage`; do not add proactive messages to the existing persistent chat messages.
- Use one scheduling timer and one dismissal timer.
- Clear both timers when the user interacts, the feature stops, or the page unloads.
- Do not schedule when the page is hidden, the maximum count has been reached, or no unused messages remain.
- Existing drag, expand, new-chat, API request, storage, and Telegram fallback behavior must remain unchanged.

## Testing

- Add a focused static/runtime contract for default timing, maximum count, message pool, session-only state, visibility handling, and interaction stop behavior.
- Keep the existing chatbot security contract green.
- Browser QA at desktop and 390px must verify positioning, non-overlap with navbar, click-to-open, close-to-stop, no focus theft, and reduced-motion CSS.

## Out Of Scope

- Automatically opening the chat panel.
- Sending proactive text to the remote chatbot endpoint.
- Recording invitation messages as conversation history.
- Personalizing invitations using tracking, analytics, cookies, or visitor identity.
- Infinite invitations or restarting invitations after the user dismisses them.
