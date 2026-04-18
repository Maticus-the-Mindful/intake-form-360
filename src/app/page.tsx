export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-lg dark:bg-zinc-900">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Maticus Media 360
        </h1>
        <p className="mb-8 text-lg text-zinc-500 dark:text-zinc-400">
          Intake Form — Coming Soon
        </p>
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-zinc-400 dark:text-zinc-500">
            This intake form is currently being built. Check back shortly!
          </p>
        </div>
      </main>
    </div>
  );
}
