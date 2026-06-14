
import { useMemo } from "react";
import { RecordRow } from "@/utils/typing";
import { GAME_LIST, ENVIRONMENT } from "@/utils/constants";

const SHORT_GAMES = {
  "TMNF": "TMNF",
  "TMNF No Cut": "No Cut",
  "ESWC": "ESWC",
  "TMN Remakes": "TMN R.",
  "TMUF": "TMUF",
  "StarTrack": "Star",
  "TMS": "TMS",
  "TMO": "TMO",
  "Demo/Beta": "Demo",
  "TM2": "TM²",
};

const SHORT_ENVIRONMENTS = {
  "Stadium": "Stad.", 
  "Island": "Island", 
  "Desert": "Desert", 
  "Rally": "Rally", 
  "Bay": "Bay", 
  "Coast": "Coast", 
  "Snow": "Snow", 
  "Canyon": "Cany.", 
  "Stadium²": "Stad²", 
  "Valley": "Valley", 
  "Lagoon": "Lagoon"
};

export function AuthorYearChart({ rows }: { rows: RecordRow[] }) {

  const yearlyCounts = useMemo(() => {
    const counts = new Map<number, number>();

    let minYear = Infinity;

    rows.forEach((row) => {
      if (!row.tas) return;

      const year = new Date(row.tas.date).getFullYear();
      minYear = Math.min(minYear, year);

      counts.set(year, (counts.get(year) || 0) + 1);
    });

    if (minYear === Infinity) return [];

    const result: [number, number][] = [];

    for (let year = minYear; year <= 2026; year++) {
      result.push([year, counts.get(year) || 0]);
    }

    return result;
  }, [rows]);

  const maxCount = Math.max(...yearlyCounts.map(([, c]) => c), 1);

  return (
    <div className="min-w-[220px] rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Year
      </h2>

      <div className="flex items-end justify-center gap-2 h-40">
        {yearlyCounts.map(([year, count]) => {
          const height = (count / maxCount) * 120;

          return (
            <div
              key={year}
              className="flex flex-col items-center gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <div
                className="w-10 rounded-t bg-violet-400/70 hover:bg-violet-300 transition"
                style={{
                  height: `${height}px`,
                  minHeight: "3px",
                }}
                title={`${year}: ${count}`}
              />

              <div className="text-xs text-slate-400">
                {year}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AuthorGameChart({ rows }: { rows: RecordRow[] }) {

  const gameCounts = useMemo(() => {
    const counts = new Map<string, number>();

    rows.forEach((row) => {
      if (!row.tas) return;

      const game = row.tas.game;

      counts.set(game, (counts.get(game) || 0) + 1);
    });

    return GAME_LIST
      .map((game) => [
        game,
        counts.get(game) || 0,
      ] as const)
      .filter(([, count]) => count > 0);;
  }, [rows]);

  const maxCount = Math.max(
    ...gameCounts.map(([, c]) => c),
    1
  );

  return (
    <div className="min-w-[220px] rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Game
      </h2>

      <div className="flex items-end justify-center gap-1.5 h-40">
        {gameCounts.map(([game, count]) => {
          const height = (count / maxCount) * 120;

          return (
            <div
              key={game}
              className="flex flex-col items-center gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <div
                className="w-7 rounded-t bg-cyan-400/70 hover:bg-cyan-300 transition"
                style={{
                  height: `${height}px`,
                  minHeight: "3px",
                }}
                title={`${game}: ${count}`}
              />

              <div className="text-[10px] text-slate-400 whitespace-nowrap">
                {SHORT_GAMES[game]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AuthorEnvironmentChart({ rows }: { rows: RecordRow[] }) {

  const environmentCounts = useMemo(() => {
    const counts = new Map<string, number>();

    rows.forEach((row) => {
      const env = row.trackInfo.environment;
      if (!env) return;
      counts.set(env, (counts.get(env) || 0) + 1);
    });

    return ENVIRONMENT
      .map((env) => [env, counts.get(env) || 0] as const)
      .filter(([, count]) => count > 0);
  }, [rows]);

  const maxCount = Math.max(...environmentCounts.map(([, c]) => c), 1);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 items-center p-3">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Environment
      </h2>

      <div className="flex h-40 items-end justify-center gap-1.5">
        {environmentCounts.map(([env, count]) => {
          const height = (count / maxCount) * 120;

          return (
            <div
              key={env}
              className="flex flex-col items-center gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <div
                className="w-7 rounded-t bg-emerald-400/70 transition hover:bg-emerald-300"
                style={{
                  height: `${height}px`,
                  minHeight: "2px",
                }}
                title={`${env}: ${count}`}
              />

              <div className="text-[9px] text-slate-400">
                {SHORT_ENVIRONMENTS[env]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
