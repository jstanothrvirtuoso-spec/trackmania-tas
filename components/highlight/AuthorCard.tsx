
import Link from "next/link";
import { useMemo } from "react";
import { Category, Environment, Game, RtaEntry, TasEntry } from "@/utils/typing";
import { formatDate, formatGame, formatTime } from "@/utils/formatting";
import { TRACKS } from "@/lib/TrackList";
import { OVERRIDE_TIME_SAVED } from "@/utils/constants";
import { formatAuthors } from "../FormatLinks";

export function AuthorCard({ authorOfTheDay, tasRecords, bestRtaByTrack }: { 
  authorOfTheDay: string,  
  tasRecords: TasEntry[],
  bestRtaByTrack: Map<string, RtaEntry>,
}) {

  const { records, numTASes, numWRs, contributions, timeSaved, firstTas, lastTas, favEnvironment, favCategory, favGame } = useMemo(() => {

    const bestTasByTrack = new Map<string, TasEntry>();

    Object.values(tasRecords).forEach((entry) => {
      const existing = bestTasByTrack.get(entry.track);

      if (
        !existing ||
        entry.time_ms < existing.time_ms ||
        (entry.time_ms === existing.time_ms &&
          entry.date < existing.date)
      ) {
        bestTasByTrack.set(entry.track, entry);
      }
    });

    const records = [...tasRecords]
      .filter((record) => record.authors.includes(authorOfTheDay))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.time_ms - b.time_ms)

    const recordsBest = [...records].filter((record) => bestTasByTrack.get(record.track)?.time_ms === record.time_ms)

    const envCount = new Map<Environment, number>();
    const categoryCount = new Map<Category, number>();
    const gameCount = new Map<Game, number>();
    for (const record of recordsBest) {
      const env = TRACKS[record.track].environment
      envCount.set(env, (envCount.get(env) ?? 0) + 1);
      categoryCount.set(record.category, (categoryCount.get(record.category) ?? 0) + 1);
      gameCount.set(record.game, (gameCount.get(record.game) ?? 0) + 1);
    }

    let favEnvironment: Environment | undefined;
    let maxEnv = 0;
    for (const [env, count] of envCount) { if (count > maxEnv) { maxEnv = count; favEnvironment = env } }

    let favCategory: Category = "Open";
    let maxCategory = 0;
    for (const [category, count] of categoryCount) { if (count > maxCategory) { maxCategory = count; favCategory = category } }
    
    let favGame: Game = "TMNF";
    let maxGame = 0;
    for (const [game, count] of gameCount) { if (count > maxGame) { maxGame = count; favGame = game } }
    
    let contributions = 0;
    let timeSaved = 0;
    recordsBest.forEach((entry) => {
      const rta = bestRtaByTrack.get(entry.track);
      const override = OVERRIDE_TIME_SAVED[entry.track]?.[entry.time_ms];
      let savedMs = 0;
      if (override) {
        savedMs = override * 1000;
      } else if (rta) {
        savedMs = Math.max(0, rta.time_ms - entry.time_ms);
      }
      contributions += 1 / entry.authors.length;
      timeSaved += savedMs / entry.authors.length;
    });

    return {
      records: [...records].slice(0, 10),
      numTASes: records.length,
      numWRs: recordsBest.length,
      contributions: contributions.toFixed(2),
      timeSaved: timeSaved,
      firstTas: records[records.length - 1].date,
      lastTas: records[0].date,
      favEnvironment: favEnvironment,
      favCategory: favCategory,
      favGame: favGame,
    }
  }, [tasRecords, authorOfTheDay, bestRtaByTrack]);
  
  return (
    <section className="rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-slate-900/80 p-6 backdrop-blur-md">

      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-400">
          TASer of the Day
        </span>
      </div>

      <h2 className="mt-2 sm:mt-4 text-2xl sm:text-3xl font-semibold text-white w-fit">
        {formatAuthors([authorOfTheDay])}
      </h2>

      <div className="mt-3 h-px bg-gradient-to-r from-emerald-500/30 via-slate-700 to-transparent" />

      <div className="mt-2 flex flex-wrap w-full items-center gap-2 sm:gap-5 text-xs sm:text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Submissions
          </div>

          <div className="mt-1 text-slate-200">
            {numTASes}
          </div>
        </div>
        
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            WRs
          </div>

          <div className="mt-1 text-slate-200">
            {numWRs}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Cont.
          </div>

          <div className="mt-1 text-slate-200">
            {contributions}
          </div>
        </div>
        
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Saved
          </div>

          <div className="mt-1 text-slate-200">
            {formatTime(timeSaved)}
          </div>
        </div>
        
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Fav. Game
          </div>

          <div className="mt-1 text-slate-200">
            {formatGame(favGame)}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Fav. Cat.
          </div>

          <div className="mt-1 text-slate-200">
            {favCategory}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Fav. Env.
          </div>

          <div className="mt-1 text-slate-200">
            {favEnvironment}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            First TAS
          </div>

          <div className="mt-1 text-slate-200">
            {formatDate(firstTas ?? "")}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Last TAS
          </div>

          <div className="mt-1 text-slate-200">
            {formatDate(lastTas ?? "")}
          </div>
        </div>
        
      </div>

      <div className="mt-5">
        <div className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-500">
          Most Recent Submissions
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 max-w-full scroll-smooth">
          {records.map((record) => {
            const rta = bestRtaByTrack.get(record.track);
            const saved = rta ? Math.max(0, rta.time_ms - record.time_ms) : 0;

            return (
              <Link
                key={record.id}
                href={`/tracks?track=${encodeURIComponent(record.track)}`}
                className="
                  snap-start flex-shrink-0 w-[120px] group relative overflow-hidden rounded-xl
                  border border-emerald-500/10 p-3 transition
                  bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-slate-950/60
                  hover:border-emerald-400/40 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_0_18px_rgba(16,185,129,0.15)]
                "
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-100 truncate group-hover:text-emerald-500 transition">
                        {record.track}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500 font-mono">
                        {formatDate(record.date)}
                      </div>
                    </div>

                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] mt-1" />
                  </div>

                  <div className="mt-3 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>TAS</span>
                      <span className="text-slate-100">{formatTime(record.time_ms)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>vs. RTA</span>
                      <span className="text-emerald-300">
                        {saved > 0 ? `-${formatTime(saved)}` : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/10">
                      {record.category}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  )
}
