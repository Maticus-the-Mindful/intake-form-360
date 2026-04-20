import Image from "next/image";

const styles = `
.hero-stage {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(ellipse 65% 45% at 50% 48%, rgba(252, 186, 88, 0.14), transparent 70%),
    radial-gradient(ellipse 120% 80% at 50% 115%, rgba(1, 126, 126, 0.22), transparent 72%),
    linear-gradient(180deg, #081114 0%, #0a1519 60%, #07131a 100%);
}

.hero-stage::before {
  content: "";
  position: absolute;
  inset: -1px;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.22 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  opacity: 0.55;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 1;
}

.hero-stage::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, transparent 22%, transparent 78%, rgba(0, 0, 0, 0.55) 100%),
    radial-gradient(ellipse 100% 60% at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.35) 100%);
  pointer-events: none;
  z-index: 2;
}

.hero-spotlight {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 48% 32% at 50% 52%, rgba(252, 186, 88, 0.22), transparent 72%);
  pointer-events: none;
  z-index: 1;
  animation: hero-breathe 7s ease-in-out infinite;
}

@keyframes hero-breathe {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.05); }
}

.hero-crop {
  position: absolute;
  width: 9px;
  height: 9px;
  border-color: rgba(252, 186, 88, 0.85);
  border-style: solid;
  z-index: 3;
  opacity: 0;
  animation: hero-fade 0.45s ease-out var(--hero-delay, 2.1s) forwards;
}
.hero-crop--tl { top: 7px;    left: 7px;    border-width: 1px 0 0 1px; border-top-left-radius: 3px;     }
.hero-crop--tr { top: 7px;    right: 7px;   border-width: 1px 1px 0 0; border-top-right-radius: 3px;    }
.hero-crop--bl { bottom: 7px; left: 7px;    border-width: 0 0 1px 1px; border-bottom-left-radius: 3px;  }
.hero-crop--br { bottom: 7px; right: 7px;   border-width: 0 1px 1px 0; border-bottom-right-radius: 3px; }

.hero-kicker {
  opacity: 0;
  animation: hero-wipe 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) calc(var(--hero-delay, 2.1s) + 0.4s) forwards;
}

.hero-rule {
  opacity: 0;
  animation: hero-rule-draw 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) calc(var(--hero-delay, 2.1s) + 0.2s) forwards;
}

.hero-services {
  opacity: 0;
  animation: hero-services-unfurl 0.85s cubic-bezier(0.22, 0.61, 0.36, 1) calc(var(--hero-delay, 2.1s) + 0.55s) forwards;
}
.hero-services-custom {
  opacity: 0;
  animation: hero-fade 0.5s ease-out calc(var(--hero-delay, 2.1s) + 0.5s) forwards;
}
.hero-service-dot {
  opacity: 0;
  animation: hero-service-dot 0.5s ease-out forwards;
}
.hero-service-dot--1 { animation-delay: calc(var(--hero-delay, 2.1s) + 0.78s); }
.hero-service-dot--2 { animation-delay: calc(var(--hero-delay, 2.1s) + 0.88s); }

@keyframes hero-services-unfurl {
  0%   { opacity: 0; clip-path: inset(0 50% 0 50%); }
  60%  { opacity: 1; }
  100% { opacity: 1; clip-path: inset(0 0 0 0); }
}
@keyframes hero-service-dot {
  0%   { opacity: 0; transform: rotate(45deg) scale(0.4); }
  60%  { opacity: 1; transform: rotate(45deg) scale(1.15); }
  100% { opacity: 1; transform: rotate(45deg) scale(1); }
}

.hero-logo {
  opacity: 0;
  animation: hero-logo-in 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) calc(var(--hero-delay, 2.1s) + 0.15s) forwards;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.45));
}

.hero-lede,
.hero-footline {
  opacity: 0;
  animation: hero-fade 0.5s ease-out forwards;
}
.hero-lede     { animation-delay: calc(var(--hero-delay, 2.1s) + 1.05s); }
.hero-footline { animation-delay: calc(var(--hero-delay, 2.1s) + 1.2s); }

@keyframes hero-wipe {
  0%   { opacity: 0; clip-path: inset(0 100% 0 0); filter: blur(2px); }
  55%  { opacity: 1; filter: blur(0); }
  100% { opacity: 1; clip-path: inset(0 0 0 0); filter: blur(0); }
}
@keyframes hero-rule-draw {
  0%   { opacity: 0; transform: scaleX(0.35); }
  100% { opacity: 1; transform: scaleX(1); }
}
@keyframes hero-logo-in {
  0%   { opacity: 0; transform: scale(1.045); filter: blur(6px) drop-shadow(0 6px 24px rgba(0,0,0,0.45)); }
  60%  { opacity: 1; filter: blur(0) drop-shadow(0 6px 24px rgba(0,0,0,0.45)); }
  100% { opacity: 1; transform: scale(1); filter: blur(0) drop-shadow(0 6px 24px rgba(0,0,0,0.45)); }
}
@keyframes hero-fade {
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-spotlight { animation: none; }
  .hero-crop,
  .hero-kicker,
  .hero-rule,
  .hero-logo,
  .hero-services,
  .hero-services-custom,
  .hero-service-dot,
  .hero-lede,
  .hero-footline {
    animation: none;
    opacity: 1;
    clip-path: none;
    transform: none;
    filter: none;
  }
  .hero-logo { filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.45)); }
}
`;

export function IntakeHero() {
  return (
    <header className="relative -mx-5 -mt-5 mb-5 sm:-mx-10 sm:-mt-10 sm:mb-7">
      <style href="intake-hero" precedence="high">
        {styles}
      </style>

      <h1 className="sr-only">Maticus Media 360 — Project Intake</h1>

      <div className="hero-stage rounded-t-2xl px-5 pt-5 pb-4 sm:px-10 sm:pt-6 sm:pb-5">
        <div className="hero-spotlight" aria-hidden />
        <div className="hero-crop hero-crop--tl" aria-hidden />
        <div className="hero-crop hero-crop--tr" aria-hidden />
        <div className="hero-crop hero-crop--bl" aria-hidden />
        <div className="hero-crop hero-crop--br" aria-hidden />

        <div className="hero-logo relative z-10 mx-auto flex items-center justify-center gap-2 sm:gap-4">
          <Image
            src="/brand/Maticus Media 360_Logo_White.webp"
            alt=""
            aria-hidden
            width={2149}
            height={1028}
            priority
            sizes="(max-width: 640px) 135px, 170px"
            className="h-16 w-auto sm:h-20"
          />
          <span
            aria-hidden
            className="relative flex h-12 items-center justify-center sm:h-14"
          >
            <span className="h-full w-px bg-gradient-to-b from-transparent via-amber-400/55 to-transparent" />
            <span className="absolute h-[3px] w-[3px] rotate-45 bg-amber-300/85 shadow-[0_0_6px_rgba(252,186,88,0.6)]" />
          </span>
          <Image
            src="/brand/automaticus_logo_mobile.webp"
            alt=""
            aria-hidden
            width={525}
            height={300}
            priority
            sizes="(max-width: 640px) 130px, 160px"
            className="h-[72px] w-auto sm:h-[92px]"
          />
        </div>

        <div
          className="hero-rule relative z-10 mx-auto mt-3 flex items-center gap-2 sm:mt-4"
          aria-hidden
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/55 to-transparent" />
          <span className="h-1 w-1 rotate-45 bg-amber-400/85 shadow-[0_0_8px_rgba(252,186,88,0.6)]" />
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/55 to-transparent" />
        </div>

        <p className="hero-kicker relative z-10 mt-2 text-center font-mono text-[9.5px] font-medium uppercase tracking-[0.42em] text-amber-200/95 sm:mt-3 sm:text-[10.5px]">
          Project
          <span aria-hidden className="mx-2 inline-block h-[2.5px] w-[2.5px] -translate-y-[2px] rotate-45 bg-amber-300/80 align-middle" />
          Intake
        </p>

        <div
          className="relative z-10 mt-3 sm:mt-4"
          aria-label="Services: custom software, custom websites, custom AI workers"
        >
          <span className="sr-only">
            We build custom software, custom websites, and custom AI workers.
          </span>
          <p
            aria-hidden
            className="hero-services-custom mb-1 text-center font-mono text-[8px] font-medium uppercase tracking-[0.48em] text-amber-200/55 sm:hidden"
          >
            Custom
          </p>
          <div
            aria-hidden
            className="hero-services flex items-center justify-center gap-2 font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-amber-100/85 sm:gap-3 sm:text-[10.5px] sm:tracking-[0.28em]"
          >
            <span>
              <span className="hidden sm:inline">Custom&nbsp;</span>Software
            </span>
            <span className="hero-service-dot hero-service-dot--1 inline-block h-[3px] w-[3px] bg-amber-300/85 shadow-[0_0_6px_rgba(252,186,88,0.55)]" />
            <span>
              <span className="hidden sm:inline">Custom&nbsp;</span>Websites
            </span>
            <span className="hero-service-dot hero-service-dot--2 inline-block h-[3px] w-[3px] bg-amber-300/85 shadow-[0_0_6px_rgba(252,186,88,0.55)]" />
            <span>
              <span className="hidden sm:inline">Custom&nbsp;</span>AI&nbsp;Workers
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 sm:px-10 sm:pt-6">
        <p className="hero-lede font-serif text-[0.98rem] leading-[1.55] text-zinc-700 sm:text-base dark:text-zinc-200">
          <span className="font-medium italic text-zinc-900 dark:text-white">
            Good to meet you at The Big Table 2026.
          </span>{" "}
          A few quick details and we&apos;re ready to build — I&apos;ll reach out personally.
        </p>
        <p className="hero-footline mt-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:mt-4 dark:text-zinc-500">
          <span>~2&nbsp;min</span>
          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-r from-zinc-300/70 via-zinc-300/40 to-transparent dark:from-zinc-700/70 dark:via-zinc-700/40"
          />
          <span>reply within 48&nbsp;h</span>
        </p>
      </div>
    </header>
  );
}
