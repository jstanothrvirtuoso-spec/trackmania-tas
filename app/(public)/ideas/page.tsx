import Image from "next/image";

const IDEAS = [
  {src: "e05.webp", description: "Faster noseboost route", track: "E05-Endurance", info: "Saves 1-2 sec/lap"}
]


export default function IdeasZonePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden">

        <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-24">
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Ideas Zone
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
            A place for unfinished TASes and experimental ideas.
          </p>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {IDEAS.map((idea) => (
              <article
                key={`/ideas/${idea.src}`}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:border-violet-500/50 hover:bg-slate-900 shadow-[0_5px_40px_rgba(120,0,180,0.2)]"
              >
                <Image
                  src={`/ideas/${idea.src}`}
                  alt={idea.description}
                  width={709}
                  height={395}
                  className="aspect-video w-full object-cover"
                />

                <div className="p-3 bg-gradient-to-l from-slate-900/50 to-amber-500/15">
                  <h2 className="text-lg font-semibold">
                    {idea.description}
                  </h2>

                  <div className="flex items-center justify-between text-sm text-slate-300/90">
                    <span>{idea.track}</span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">
                      {idea.info}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
