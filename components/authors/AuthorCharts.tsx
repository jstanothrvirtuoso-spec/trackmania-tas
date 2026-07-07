
import { useMemo } from "react";
import { RecordRow, Environment } from "@/utils/typing";
import { ENVIRONMENT } from "@/utils/constants";
import { Campaign, CAMPAIGNS } from "@/app/(public)/authors/AuthorsPage";

const SHORT_GAMES = {
  "TMNF": "TMNF",
  "ESWC": "ESWC",
  "TMN Remakes": "TMN R.",
  "TMUF": "TMUF",
  "StarTrack": "Star",
  "TMS": "TMS",
  "TMO": "TMO",
  "Demo/Beta": "Demo",
  "No Cut": "No Cut",
  "TM2": "TM²",
};

const SHORT_ENVIRONMENTS = {
  "Stadium": "Stadium", 
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

export function AuthorYearChart({ rows, selectedYear, onSelectYear }: {
  rows: RecordRow[]; 
  selectedYear: number | null; 
  onSelectYear: (year: number | null) => void 
}) {

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
    <div className="min-w-[220px] rounded-lg border border-slate-800 bg-gradient-to-br from-violet-500/10 via-slate-900/60 to-violet-500/10 p-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Year
      </h2>

      <div
        className="mx-auto h-40 max-w-80 w-fit gap-1.5"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${yearlyCounts.length}, minmax(0, 1fr))`,
        }}
      >
        {yearlyCounts.map(([year, count]) => {
          const height = (count / maxCount) * 120;
          const isSelected = selectedYear === year;

          return (
            <div
              key={year}
              className="flex flex-col items-center justify-end gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <button
                type="button"
                disabled={count === 0}
                onClick={() => onSelectYear(isSelected ? null : year)}
                className={`w-full max-w-10 rounded-t transition focus:outline-none ${count > 0 ? "hover:bg-violet-300 cursor-pointer" : ""} ${isSelected ? "bg-violet-300 ring-2 ring-violet-400" : "bg-violet-400/70"}`}
                style={{
                  height: `${height}px`,
                  minHeight: "3px",
                }}
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

export function AuthorGameChart({ rows, selectedGame, onSelectGame }: {
  rows: RecordRow[]; 
  selectedGame: Campaign | null; 
  onSelectGame: (game: Campaign | null) => void 
}) {

  const gameCounts = useMemo(() => {
    const counts = new Map<string, number>();

    rows.forEach((row) => {
      if (!row.tas) return;

      const game = row.tas.game === "TMNF No Cut" || row.tas.game === "TMUF No Cut" ? "No Cut" : row.tas.game;

      counts.set(game, (counts.get(game) || 0) + 1);
    });

    return CAMPAIGNS
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
    <div className="min-w-[220px] rounded-lg border border-slate-800 bg-gradient-to-br from-cyan-500/10 via-slate-900/60 to-cyan-500/10 p-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Game
      </h2>

      <div
        className="mx-auto h-40 w-fit max-w-80 gap-1.5"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gameCounts.length}, minmax(0, 1fr))`,
        }}
      >
        {gameCounts.map(([game, count]) => {
          const height = (count / maxCount) * 120;
          const isSelected = selectedGame === game;

          return (
            <div
              key={game}
              className="flex flex-col items-center justify-end gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <button
                type="button"
                onClick={() => onSelectGame(isSelected ? null : game)}
                className={`w-full max-w-8 rounded-t transition focus:outline-none cursor-pointer ${isSelected ? "bg-cyan-300 ring-2 hover:bg-cyan-400" : "bg-cyan-400/70 hover:bg-cyan-300"}`}
                style={{
                  height: `${height}px`,
                  minHeight: "3px",
                }}
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

export function AuthorEnvironmentChart({ rows, selectedEnvironment, onSelectEnvironment }: {
  rows: RecordRow[]; 
  selectedEnvironment: Environment | null; 
  onSelectEnvironment: (environment: Environment | null) => void 
}) {

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
    <div className="min-w-[220px] rounded-lg border border-slate-800 bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-emerald-500/10 items-center p-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Environment
      </h2>

      <div
        className="mx-auto h-40 w-fit max-w-80 gap-1.5"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${environmentCounts.length}, minmax(0, 1fr))`,
        }}
      >
        {environmentCounts.map(([environment, count]) => {
          const height = (count / maxCount) * 120;
          const isSelected = selectedEnvironment === environment;

          return (
            <div
              key={environment}
              className="flex flex-col items-center justify-end gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <button
                type="button"
                onClick={() => onSelectEnvironment(isSelected ? null : environment)}
                className={`w-full max-w-8 rounded-t transition focus:outline-none cursor-pointer ${
                  isSelected ? "bg-emerald-300 ring-2 hover:bg-emerald-400" : "bg-emerald-400/70 hover:bg-emerald-300"}`}
                style={{
                  height: `${height}px`,
                  minHeight: "3px",
                }}
              />
              
              <div className="text-[9px] text-slate-400">
                {SHORT_ENVIRONMENTS[environment]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
