
import { formatDate } from "@/utils/formatting";
import { formatAuthors, formatTrack } from "../FormatLinks";
import { Category } from "@/utils/typing";

type LegendItem = {
  track: string,
  authors: string[],
  date: string,
  category: Category,
  saved: string,
}
const LEGENDS: LegendItem[] = [
  { track: "B04-Acrobatic", authors: ["Vogtek"], date: "21-May-24", category: "No Uber", saved: "-0.90" },
  { track: "D03-Acrobatic", authors: ["Don Johnson", "Virtuoso"], date: "23-Mar-25", category: "NOseboost", saved: "-0.21" },
  { track: "A12-Speed", authors: ["Meable"], date: "19-Feb-26", category: "NOseboost", saved: "-0.01" },
  { track: "B02-Race", authors: ["faiby", "igntuL"], date: "18-Jul-26", category: "No Uber", saved: "-1.04" },
];

export function Unnoseboosters() {
  return (
    <section className="rounded-3xl border border-red-500/15 bg-gradient-to-br from-red-500/10 via-slate-900/80 to-slate-900/80 p-6 backdrop-blur-md space-y-5">
    
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-red-300">
          Un-noseboosters
        </span>
      </div>
      
      <div className="relative space-y-1">
        {LEGENDS.map(({ track, authors, date, category, saved }) => (
          <div
            key={track}
            className="group relative rounded-xl overflow-hidden border border-slate-800/70 bg-slate-900/30 px-3 py-1.5 transition hover:border-red-500/30 hover:bg-red-500/15 bg-gradient-to-tl from-red-500/10 via-slate-900/80 to-slate-900/80"
          >
            {/* Accent line */}
            <div className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-red-400 via-red-400 to-transparent opacity-70 transition group-hover:opacity-100" />

            <div className="flex flex-row gap-2 pl-2 py-1 sm:items-center justify-between">
              {/* Main info */}
              <div>
                <div className="flex flex-row gap-2 items-center">
                  {formatTrack(track, "text-xs sm:text-[15px] text-violet-100 transition hover:text-red-400")}
                  <div className="mt-1 text-[10px] sm:text-xs text-slate-400 font-vga tracking-[0.1em]">
                    {`(${saved})`}
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-400">
                  {formatAuthors(authors, 3, true, "text-slate-300 italic hover:text-red-400")}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-1.5 flex-col sm:items-end">
                <span className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-[9px] sm:text-[11px] tracking-wider text-red-200">
                  {category}
                </span>

                <span className="font-mono text-[10px] sm:text-xs text-slate-500">
                  {formatDate(date)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
