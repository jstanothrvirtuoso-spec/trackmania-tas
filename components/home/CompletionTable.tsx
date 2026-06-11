
import { useMemo } from "react";
import { trackList } from "@/lib/TrackList";
import { useTasRecords } from "@/lib/TasRecords";

const TRACK_ARRAY = Object.values(trackList);
const TOTAL_BY_GAME = (() => {
  const map = new Map<string, number>();

  for (const track of TRACK_ARRAY) {
    if (track.game === "TM2") continue;
    map.set(track.game, (map.get(track.game) ?? 0) + 1);
  }

  return map;
})();

export default function CompletionTable() {

  const { data: tasRecords = [] } = useTasRecords();

  const progressData = useMemo(() => {
    
    const completedByGame = new Map<string, Set<string>>();
    for (const tas of tasRecords) {
      const game = trackList[tas.track]?.game;

      if (!game) continue;
      if (!completedByGame.has(game)) {
        completedByGame.set(game, new Set());
      }
      completedByGame.get(game)!.add(tas.track);
    }
    
    const rows = Array.from(TOTAL_BY_GAME, ([game, total]) => ({
      game,
      completed: completedByGame.get(game)?.size ?? 0,
      total,
    }));

    return [
      ...rows,
      {
        game: "Overall",
        completed: rows.reduce((s, r) => s + r.completed, 0),
        total: rows.reduce((s, r) => s + r.total, 0),
      },
    ];
  }, [tasRecords]);

  const overall = progressData.at(-1);
  const percentComplete = overall && overall.total
    ? ((overall.completed / overall.total) * 100).toPrecision(4)
    : "0";
  
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.85)] backdrop-blur-md">
      <table className="w-auto">

        <thead className="border-b text-slate-300 uppercase text-center text-sm bg-slate-950/30">
          <tr>
            <th className="py-1.5">Game</th>
            <th className="px-6 py-1.5">Progress</th>
            <th className="py-1.5 px-8">Tracks</th>
          </tr>
        </thead>

        <tbody>
          {progressData.map((row, i) => {
            const percent = (row.completed / row.total) * 100;
            const completed = percent >= 100
            const totalRow = row.game === "Overall"
            const oddRow = i % 2 == 0
            

            return (
              <tr
                key={row.game}
                className={`border-t border-slate-800 text-center ${totalRow ? "bg-blue-950/80" : oddRow ? "bg-indigo-800/30" : "bg-indigo-800/50"}`}
              >
                <td className={`px-3 whitespace-nowrap [text-shadow:0_2px_4px_rgba(0,0,0,0.4)] ${completed ? "font-bold text-red-500 italic" : "text-sm text-slate-200"} ${totalRow ? "py-1.5" : "py-1"}`}>
                  {row.game}
                </td>

                <td className="w-80 px-1">
                  <div className={`h-4 overflow-hidden rounded-full shadow-inner ${totalRow ? "bg-slate-700" : "bg-slate-800"}`}>
                    <div
                      className={`h-full transition-all ${completed ? "bg-red-400" : totalRow ? "bg-blue-500" : "bg-emerald-500"} `}
                      style={{width: `${percent}%`}}
                    />
                  </div>
                </td>

                <td className={`px-3 tracking-[0.07em] whitespace-nowrap [text-shadow:0_2px_4px_rgba(0,0,0,0.4)] ${completed ? "font-bold text-red-500 italic text-lg" : "font-semibold text-slate-150"}`}>
                  {row.completed} / {row.total}
                </td>
              </tr>
            );
          })}

          <tr className="text-center border-t border-slate-800 bg-gradient-to-bl from-red-800/90 to-blue-800/90">
            <td colSpan={3} className="py-0.5 text-xl [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] font-bold italic" style={{ fontFamily: "Sakura" }}>
              {`Completion: ${percentComplete}%`}
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  )
};