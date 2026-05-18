
import { useMemo } from "react";
import { trackList } from "@/lib/TrackLists";
import { useTasRecords } from "@/lib/TasRecords";

export default function GlobalLeaderboard() {

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
      game: "Total",
      completed: totalCompleted,
      total: totalTracks,
    });

    return rows;
  }, [tasRecords]);
  
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80">
      <table className="w-full text-sm">

        <thead className="border-b border-slate-800 text-slate-400 uppercase text-center">
          <tr>
            <th className="py-1.5">Game</th>
            <th className="px-6 py-1.5">Progress</th>
            <th className="py-1.5">Tracks</th>
          </tr>
        </thead>

        <tbody>
          {progressData.map((row) => {
            const percent = (row.completed / row.total) * 100;
            const completed = percent >= 100

            return (
              <tr
                key={row.game}
                className={`
                  border-t border-slate-800 text-center
                  ${completed
                    ? "bg-red-500/10"
                    : ""} 
                  ${row.game === "Total" ? "bg-blue-500/30" : ""}
                `}
              >
                <td className={`
                  px-3
                  ${completed
                    ? "font-bold text-red-300"
                    : "text-slate-100"}
                  ${row.game === "Total" ? "py-1.5" : "py-1"}
                `}>
                  {row.game}
                </td>

                <td className="w-80 px-1">
                  <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`
                        h-full transition-all
                        ${completed
                          ? "bg-red-400"
                          : "bg-emerald-500"}
                      `}
                      style={{
                        width: `${percent}%`
                      }}
                    />
                  </div>
                </td>

                <td className={`
                  px-3
                  ${completed
                    ? "font-semibold text-red-300"
                    : "text-slate-300"}
                `}>
                  {row.completed}/{row.total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
};