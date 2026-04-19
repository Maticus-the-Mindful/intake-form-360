import Image from "next/image";

/* Timeline (2.4s total):
   0.00s  MM360 mark pops in (0.55s)
   0.65s  Automaticus wordmark wipes in (0.75s)
   1.45s  hold (~0.55s)
   2.05s  overlay fades out (0.35s) and releases the form */
const styles = `
@property --brand-intro-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.brand-intro {
  animation: brand-intro-out 2.4s ease-in-out forwards;
}
.brand-intro__border {
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from var(--brand-intro-angle),
    #fcba58 0%,
    #ffffff 25%,
    #017e7e 50%,
    #ffffff 75%,
    #fcba58 100%
  );
  animation: brand-intro-border-spin 4s linear infinite;
}
.brand-intro__border-inner {
  position: absolute;
  inset: 1rem;
  background: #18181b;
  border-radius: 1.25rem;
}
.brand-intro__mark {
  animation: brand-intro-mark-in 0.55s cubic-bezier(0.34, 1.35, 0.64, 1) both;
}
.brand-intro__wordmark {
  animation: brand-intro-wordmark-in 0.75s cubic-bezier(0.22, 0.61, 0.36, 1) 0.65s both;
}
@keyframes brand-intro-border-spin {
  to { --brand-intro-angle: 360deg; }
}
@keyframes brand-intro-out {
  0%, 85% { opacity: 1; visibility: visible; }
  100% { opacity: 0; visibility: hidden; }
}
@keyframes brand-intro-mark-in {
  0% { opacity: 0; transform: scale(0.82); }
  60% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes brand-intro-wordmark-in {
  0% {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
    transform: translateY(6px);
    filter: blur(3px);
  }
  40% { opacity: 1; filter: blur(0); }
  100% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
    filter: blur(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .brand-intro { animation: brand-intro-out 1s linear 0.4s forwards; }
  .brand-intro__mark,
  .brand-intro__wordmark,
  .brand-intro__border { animation: none; }
}
`;

export function BrandIntro() {
  return (
    <>
      <style href="brand-intro" precedence="high">
        {styles}
      </style>
      <div
        aria-hidden
        className="brand-intro pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-zinc-900 sm:gap-9"
      >
        <div className="brand-intro__border" aria-hidden />
        <div className="brand-intro__border-inner" aria-hidden />
        <div className="brand-intro__mark">
          <Image
            src="/brand/mm360_logo_mobile.webp"
            alt=""
            width={300}
            height={300}
            loading="eager"
            fetchPriority="high"
            className="h-48 w-48 sm:h-64 sm:w-64"
          />
        </div>
        <div className="brand-intro__wordmark">
          <Image
            src="/brand/automaticus_logo_mobile.webp"
            alt=""
            width={525}
            height={300}
            loading="eager"
            fetchPriority="high"
            className="h-auto w-72 sm:w-[28rem]"
          />
        </div>
      </div>
    </>
  );
}
