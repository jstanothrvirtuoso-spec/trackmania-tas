
import { useMemo } from "react";
import { trackList } from "@/lib/TrackList";
import { useTasRecords } from "@/lib/TasRecords";

export default function CompletionTable() {

  const { data: tasRecords = [] } = useTasRecords();

  const progressData = useMemo(() => {
    const totalByGame = new Map<string, number>();
    const completedTracks = new Set<string>();

    for (const track of Object.values(trackList)) {
      totalByGame.set(
        track.game,
        (totalByGame.get(track.game) ?? 0) + 1
      );
    }

    for (const tas of tasRecords) {
      completedTracks.add(tas.track);
    }

    const completedByGame = new Map<string, number>();

    for (const trackName of completedTracks) {
      const game = trackList[trackName]?.game;

      if (!game) continue;

      completedByGame.set(
        game,
        (completedByGame.get(game) ?? 0) + 1
      );
    }

    let totalCompleted = 0;
    let totalTracks = 0;

    const rows = Array.from(totalByGame, ([game, total]) => {
      const completed =
        completedByGame.get(game) ?? 0;

      totalCompleted += completed;
      totalTracks += total;

      return {
        game,
        completed,
        total,
      };
    });

    rows.push({
      game: "Overall",
      completed: totalCompleted,
      total: totalTracks,
    });

    return rows;
  }, [tasRecords]);

  const percentComplete = (progressData[progressData.length - 1].completed / 
    progressData[progressData.length - 1].total * 100).toPrecision(4)
  
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.85)] backdrop-blur-md">
      <table className="w-full">

        <thead className="border-b text-slate-300 uppercase text-center text-sm bg-slate-950/30">
          <tr>
            <th className="py-1.5">Game</th>
            <th className="px-6 py-1.5">Progress</th>
            <th className="py-1.5">Tracks</th>
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

          <tr className="border-t border-slate-800 text-center bg-gradient-to-bl from-red-800/90 to-blue-800/90">
            <td></td>
            <td className="pb-1.5 text-2xl [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] font-bold italic" style={{ fontFamily: "OktaNeue" }}>
              {`Completion: ${percentComplete}%`}
            </td>
            <td></td>
          </tr>

        </tbody>
      </table>
    </div>
  )
};