import { BrandIntro } from "./brand-intro";
import { IntakeForm } from "./intake-form";

export default function Home() {
  return (
    <div className="page-bg-gradient flex min-h-dvh items-start justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] font-sans sm:py-16">
      <BrandIntro />
      <main className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg sm:p-10 dark:bg-zinc-900">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Maticus Media 360
          </p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Project Intake
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            Thanks for connecting at the conference. Drop a few quick details below and
            I&apos;ll follow up personally within 48 hours with next steps. Takes about
            two minutes.
          </p>
        </header>
        <IntakeForm />
      </main>
    </div>
  );
}
