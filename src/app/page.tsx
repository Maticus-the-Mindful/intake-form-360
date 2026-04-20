import { BrandIntro } from "./brand-intro";
import { IntakeHero } from "./intake-hero";
import { IntakeWizard } from "./intake-wizard";

export default function Home() {
  return (
    <div className="page-bg-gradient flex min-h-dvh items-start justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] font-sans sm:py-16">
      <BrandIntro />
      <main className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-5 shadow-lg sm:p-10 dark:bg-zinc-900">
        <IntakeHero />
        <IntakeWizard />
      </main>
    </div>
  );
}
