"use client";

import { useEffect, useRef } from "react";

const styles = `
.dyk-card {
  position: relative;
}
.dyk-eyebrow-dot {
  display: inline-block;
  width: 3px;
  height: 3px;
  background: #fcba58d9;
  box-shadow: 0 0 6px rgba(252, 186, 88, 0.55);
  transform: rotate(45deg);
  animation: dyk-dot 2.4s ease-in-out infinite;
}
@keyframes dyk-dot {
  0%, 100% { opacity: 0.7; transform: rotate(45deg) scale(1); }
  50%      { opacity: 1;   transform: rotate(45deg) scale(1.2); }
}
.dyk-skel-line {
  display: block;
  height: 0.75rem;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 0%,
    rgba(0, 0, 0, 0.12) 50%,
    rgba(0, 0, 0, 0.06) 100%
  );
  background-size: 200% 100%;
  animation: dyk-shimmer 1.4s linear infinite;
}
@media (prefers-color-scheme: dark) {
  .dyk-skel-line {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.14) 50%,
      rgba(255, 255, 255, 0.06) 100%
    );
    background-size: 200% 100%;
  }
}
@keyframes dyk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .dyk-eyebrow-dot { animation: none; }
  .dyk-skel-line   { animation: none; }
}
`;

function Eyebrow({ forYou }: { forYou?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 font-mono text-[10px] uppercase">
      <span className="tracking-[0.32em] text-amber-500 dark:text-amber-300">
        Did you know
      </span>
      <span className="dyk-eyebrow-dot" aria-hidden />
      {forYou && (
        <span className="tracking-[0.32em] text-teal-600 dark:text-teal-300">
          For you
        </span>
      )}
    </div>
  );
}

function CardShell({
  children,
  forYou,
  continueLabel,
  onContinue,
  onBack,
  canBack,
  headlineRef,
}: {
  children: React.ReactNode;
  forYou?: boolean;
  continueLabel: string;
  onContinue: () => void;
  onBack?: () => void;
  canBack?: boolean;
  headlineRef?: React.RefObject<HTMLHeadingElement | null>;
}) {
  const ringClass = forYou
    ? "ring-1 ring-teal-500/20 dark:ring-teal-300/20"
    : "";

  return (
    <div
      className={`dyk-card rounded-xl border border-zinc-200 bg-white px-5 py-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-8 sm:py-10 ${ringClass}`}
    >
      <style href="wizard-dyk" precedence="high">
        {styles}
      </style>
      <Eyebrow forYou={forYou} />
      <div className="mt-5 text-center">{children}</div>
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="min-h-12 w-full rounded-lg bg-zinc-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-white dark:text-zinc-900 dark:focus-visible:outline-white"
        >
          {continueLabel}
        </button>
        {canBack && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 w-full rounded-lg px-4 py-2 text-sm text-zinc-600 transition hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back
          </button>
        )}
      </div>
      <h2 ref={headlineRef} tabIndex={-1} className="sr-only">
        Did you know
      </h2>
    </div>
  );
}

export function StaticDyk({
  headline,
  body,
  onContinue,
  onBack,
  canBack,
}: {
  headline: string;
  body: string;
  onContinue: () => void;
  onBack?: () => void;
  canBack?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <CardShell
      continueLabel="Got it"
      onContinue={onContinue}
      onBack={onBack}
      canBack={canBack}
      headlineRef={ref}
    >
      <p className="font-serif text-2xl leading-tight text-zinc-900 sm:text-3xl dark:text-white">
        {headline}
      </p>
      <p className="mt-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        {body}
      </p>
    </CardShell>
  );
}

type DynamicState =
  | { status: "loading" }
  | { status: "ready"; fact: string }
  | { status: "failed"; fallback: string };

export function DynamicDyk({
  state,
  onContinue,
  onBack,
  canBack,
}: {
  state: DynamicState;
  onContinue: () => void;
  onBack?: () => void;
  canBack?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  const isLoading = state.status === "loading";
  const text =
    state.status === "ready"
      ? state.fact
      : state.status === "failed"
        ? state.fallback
        : "";

  return (
    <CardShell
      forYou
      continueLabel="Keep going"
      onContinue={onContinue}
      onBack={onBack}
      canBack={canBack}
      headlineRef={ref}
    >
      <div
        aria-live="polite"
        aria-busy={isLoading}
        aria-label="A fact about your industry"
      >
        {isLoading ? (
          <div className="space-y-3 px-2 text-left">
            <span className="dyk-skel-line w-11/12" />
            <span className="dyk-skel-line w-10/12" />
            <span className="dyk-skel-line w-9/12" />
            <span className="dyk-skel-line w-7/12" />
            <span className="sr-only">
              Generating a fact about your industry…
            </span>
          </div>
        ) : (
          <p className="font-serif text-xl leading-snug text-zinc-900 sm:text-2xl dark:text-white">
            {text}
          </p>
        )}
      </div>
    </CardShell>
  );
}
