
export default function IdeasZonePage() {
  return ( 
    <main className="min-h-screen bg-slate-950 text-slate-100"> 
      <section className="relative overflow-hidden"> 
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent" /> 
        <div className="absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 pt-32 pb-24">
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Ideas Zone
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
            A place for unfinished TASes and experimental ideas.
          </p>

          <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur">
            <h2 className="text-xl font-semibold">Under Construction</h2>

            <p className="mt-3 text-slate-400">
              This section will eventually contain a collection of incomplete
              tasks and works in progress. For now, there is nothing to browse
              yet.
            </p>

          </div>
        </div>
      </section>
    </main>
  );
}
