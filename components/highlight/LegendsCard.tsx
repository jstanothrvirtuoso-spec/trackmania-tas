
import Link from "next/link";
import { formatDate } from "@/utils/formatting";

const LEGENDS = [
  ["TMO RaceC6", "fabi", "27-Aug-25"],
  ["D15-Endurance [Beta]", "fabi", "06-Sep-25"],
  ["TMS Undulate Line", "Kimura", "26-Apr-26"],
  ["TMO DemoStuntsRace1", "Kimura", "10-May-26"],
  ["TMS TrialTime", "fabi", "10-May-26"],
  ["TMO Survival16", "fabi", "16-May-26"],
  ["TMS ClimbTheHill","fabi", "17-May-26"]
];

const AUTHOR_COLOUR: Record<string, string> = {
  "fabi": "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  "Kimura": "text-violet-300 bg-violet-500/10 border-violet-500/20",
} as const;

export function LegendsCard() {
  return (
    <section className="rounded-3xl border border-sky-500/15 bg-gradient-to-br from-sky-500/10 via-slate-900/80 to-slate-900/80 p-6 backdrop-blur-md">
    
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-sky-500" />
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-sky-300">
          Legends of Undone TASes
        </span>
      </div>

      <div className="mt-6 overflow-auto rounded-2xl border border-sky-500/20 bg-slate-950/40">
        <table className="w-full table-fixed xl:table-auto border-collapse">
          <colgroup>
            <col style={{ width: "calc(100% - 240px)" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "90px" }} />
          </colgroup>
          <thead className="bg-gradient-to-r from-sky-500/15 via-cyan-500/10 to-transparent">
            <tr>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-[0.25em] text-sky-300">
                Track
              </th>
              <th className="text-left px-2 py-3 text-[11px] font-medium uppercase tracking-[0.25em] text-sky-300 w-[140px]">
                Author
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-[0.25em] text-sky-300 w-[100px]">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {LEGENDS.map(([track, author, date]) => (
              <tr
                key={track}
                className="group relative border-t border-slate-800/70 transition hover:bg-sky-500/10"
              >
                <td className="px-2 py-2 sm:px-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                    <Link
                      href={`/tracks?track=${encodeURIComponent(track)}`}
                      className="truncate hover:text-sky-500 transition text-slate-300 text-xs sm:text-sm"
                    >
                      {track}
                    </Link>
                  </div>
                </td>

                <td className="px-2 py-1 sm:px-3 sm:py-2">
                  <Link
                    href={`/authors?author=${encodeURIComponent(author)}`}
                    className={`inline-flex rounded-full border border-sky-500/20 px-2.5 py-1 text-xs font-medium text-sky-300 hover:text-sky-500 ${
                      AUTHOR_COLOUR[author] ?? "bg-sky-500/10"
                    }`}
                  >
                    {author}
                  </Link>
                </td>

                <td className="px-2 py-2 font-mono text-xs text-slate-400 whitespace-nowrap sm:px-3">
                  {formatDate(date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
