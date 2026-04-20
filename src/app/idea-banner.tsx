"use client";

import { useEffect, useState } from "react";

const IDEAS: string[] = [
  "A one-page site that actually books appointments",
  "An inbox assistant that drafts replies in your voice",
  "A dashboard that shows only the 3 numbers you actually watch",
  "A landing page that pre-qualifies leads before they DM you",
  "Auto-tag every new lead by industry, budget, and intent",
  "A client portal that cuts the \u201cwhat\u2019s the status?\u201d emails in half",
  "Turn your best testimonials into the homepage hero",
  "A chatbot that answers FAQs using your own docs",
  "An internal tool that replaces the spreadsheet everyone hates",
  "Replace \u201ccontact us\u201d with a guided, 60-second intake",
  "Invoices, reminders, and thank-yous \u2014 all on autopilot",
  "A booking flow tuned to your exact services, not a template",
  "A portfolio that updates itself from your work feed",
  "Turn meeting recordings into shareable summaries in minutes",
  "A CRM built around your sales motion, not the other way around",
  "A pricing page that quietly answers your top 5 objections",
  "A reporting bot that pings the team when a KPI drifts",
  "An admin panel your team won\u2019t need a training session for",
];

const DWELL_MS = 6000;
const FADE_MS = 400;

const styles = `
.idea-banner {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 40;
  background: #ffffff;
  border-top: 1px solid rgb(228 228 231);
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
}
@media (prefers-color-scheme: dark) {
  .idea-banner {
    background: rgb(24 24 27);
    border-top-color: rgb(39 39 42);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.35);
  }
}
.idea-banner-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem 0.75rem 1.25rem;
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
  max-width: 42rem;
  margin: 0 auto;
}
.idea-banner-accent {
  position: absolute;
  left: 0;
  top: 0.625rem;
  bottom: max(0.625rem, env(safe-area-inset-bottom));
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: #fcba58;
}
.idea-banner-bulb-wrap {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}
.idea-banner-bulb {
  color: #d97706;
  display: block;
  transform-origin: center;
  will-change: filter, color, transform;
  animation: idea-bulb-glow 2.6s ease-in-out infinite;
}
@media (prefers-color-scheme: dark) {
  .idea-banner-bulb { color: #fcba58; }
}
.idea-banner-sparkle {
  position: absolute;
  color: #fbbf24;
  pointer-events: none;
  opacity: 0;
  transform-origin: center;
  will-change: opacity, transform;
}
@media (prefers-color-scheme: dark) {
  .idea-banner-sparkle { color: #fde047; }
}
.idea-banner-sparkle--a {
  top: -4px;
  right: -5px;
  width: 9px;
  height: 9px;
  animation: idea-sparkle-twinkle 2.6s ease-in-out infinite;
  animation-delay: 0.2s;
}
.idea-banner-sparkle--b {
  top: 4px;
  left: -6px;
  width: 7px;
  height: 7px;
  animation: idea-sparkle-twinkle 2.6s ease-in-out infinite;
  animation-delay: 0.9s;
}
.idea-banner-sparkle--c {
  bottom: -3px;
  right: -3px;
  width: 6px;
  height: 6px;
  animation: idea-sparkle-twinkle 2.6s ease-in-out infinite;
  animation-delay: 1.4s;
}
@keyframes idea-sparkle-twinkle {
  0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
  30%      { opacity: 1; transform: scale(1)   rotate(45deg); }
  60%      { opacity: 0; transform: scale(0.3) rotate(90deg); }
}
@keyframes idea-bulb-glow {
  0%, 100% {
    color: #d97706;
    transform: scale(1);
    filter:
      drop-shadow(0 0 0 rgba(252, 186, 88, 0))
      drop-shadow(0 0 0 rgba(252, 186, 88, 0));
  }
  45% {
    color: #fbbf24;
    transform: scale(1.08);
    filter:
      drop-shadow(0 0 6px rgba(252, 186, 88, 0.85))
      drop-shadow(0 0 14px rgba(252, 186, 88, 0.55));
  }
  55% {
    color: #fde047;
    transform: scale(1.1);
    filter:
      drop-shadow(0 0 8px rgba(253, 224, 71, 0.95))
      drop-shadow(0 0 18px rgba(252, 186, 88, 0.65));
  }
}
.idea-banner-copy {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1 1 auto;
}
.idea-banner-eyebrow {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #b45309;
}
@media (prefers-color-scheme: dark) {
  .idea-banner-eyebrow { color: #fcd34d; }
}
.idea-banner-text {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.35;
  color: rgb(63 63 70);
  transition: opacity ${FADE_MS}ms ease;
  white-space: normal;
  overflow-wrap: break-word;
}
@media (min-width: 640px) {
  .idea-banner-text { font-size: 1.0625rem; }
}
@media (prefers-color-scheme: dark) {
  .idea-banner-text { color: rgb(228 228 231); }
}
.idea-banner-text[data-fading="true"] { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .idea-banner-bulb { animation: none; }
  .idea-banner-sparkle { animation: none; opacity: 0; }
  .idea-banner-text { transition: none; }
}
`;

export function IdeaBanner() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * IDEAS.length),
  );
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cycle = window.setInterval(() => {
      if (reduced) {
        setIndex((i) => (i + 1) % IDEAS.length);
        return;
      }
      setFading(true);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % IDEAS.length);
        setFading(false);
      }, FADE_MS);
    }, DWELL_MS);

    return () => window.clearInterval(cycle);
  }, []);

  return (
    <aside
      role="region"
      aria-label="Idea inspiration"
      className="idea-banner"
    >
      <style href="idea-banner" precedence="high">
        {styles}
      </style>
      <div className="idea-banner-row">
        <span className="idea-banner-accent" aria-hidden />
        <span className="idea-banner-bulb-wrap" aria-hidden>
          <svg
            className="idea-banner-bulb"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18h6" />
            <path d="M10 21h4" />
            <path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1.5 1.7 1.8 2.7.1.3.3.5.6.5h3.2c.3 0 .5-.2.6-.5.3-1 1-1.9 1.8-2.7A6 6 0 0 0 12 3z" />
          </svg>
          <svg
            className="idea-banner-sparkle idea-banner-sparkle--a"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
          </svg>
          <svg
            className="idea-banner-sparkle idea-banner-sparkle--b"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
          </svg>
          <svg
            className="idea-banner-sparkle idea-banner-sparkle--c"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
          </svg>
        </span>
        <div className="idea-banner-copy">
          <span className="idea-banner-eyebrow">Idea</span>
          <p
            className="idea-banner-text"
            data-fading={fading}
            aria-live="polite"
          >
            {IDEAS[index]}
          </p>
        </div>
      </div>
    </aside>
  );
}
