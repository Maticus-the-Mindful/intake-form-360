<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:mobile-first -->
# Mobile-first is the priority, not an afterthought

This app is distributed via a **QR code at a physical booth**. The overwhelming majority of users will be on a phone, one-handed, possibly in bright sunlight, and filling this out in under two minutes before they walk away. Desktop needs to look decent, but **every design and code decision must be evaluated on mobile first**.

Hard rules for any UI change:

1. **Test / reason about mobile viewports first** — 375px wide (iPhone SE) is the floor. Never ship a layout whose mobile version is an afterthought of the desktop layout.
2. **Touch targets ≥ 44×44px** (Apple HIG) / 48×48px (Material). Make the entire label clickable for checkboxes/radios, never just the tiny input box.
3. **Input font-size ≥ 16px** on all text inputs/textareas — anything smaller triggers iOS Safari's auto-zoom on focus, which is jarring. Tailwind `text-base` is 16px.
4. **Right keyboard on first tap.** Every input needs an appropriate `type`, `inputMode`, `autoComplete`, `autoCapitalize`, `spellCheck`, and `enterKeyHint` so the mobile keyboard comes up correct — no capitalized email addresses, no alpha keyboard for phone numbers.
5. **Stack over side-by-side.** Default to single-column layouts on mobile; only use multi-column at `sm:` (≥640px) or wider when it actually helps.
6. **No hover-only affordances.** Anything a user needs to see must be visible without hover. Use `:focus-visible` and `:active` states, not `:hover` alone.
7. **Tap response must be instant.** Disable buttons during submit, show inline loading state, never leave the user wondering if their tap registered.
8. **Respect safe areas.** On notched/dynamic-island phones, honor `env(safe-area-inset-*)` for any fixed/sticky UI.
9. **Light DOM, light JS.** Minimize client-side JS; avoid heavy UI libraries when a plain input will do. The booth's WiFi may be bad or nonexistent — users may be on slow 4G.
10. **Viewport meta is non-negotiable.** The root layout must export a `viewport` config with `width: 'device-width', initialScale: 1`. Never disable user zoom.

When in doubt, optimize for the thumb, not the cursor.
<!-- END:mobile-first -->
