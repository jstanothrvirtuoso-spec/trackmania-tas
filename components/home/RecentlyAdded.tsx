
import { useMemo } from "react";
import { TasEntry } from "@/utils/typing";
import { formatDate, formatTime } from "@/utils/formatting";
import { CATEGORY_COLOURS } from "@/utils/constants";
import { formatAuthors, formatTrack } from "../FormatLinks";

export default function RecentlyAdded({ tasRecords }: {tasRecords: TasEntry[]}) {

  const records = useMemo(() => {
    return tasRecords
      .toSorted((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [tasRecords]);

  const loadingCards = Array.from({ length: 10 });
  
  return (
    <div className="rounded-xl border border-sky-600 bg-sky-900/80 backdrop-blur-md p-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-2">
        <div className="flex justify-center">
          <div className="relative overflow-hidden rounded-xl border border-indigo-500/40 bg-slate-900 px-8 py-3 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-transparent to-indigo-500/30" />
            <div className="absolute left-0 top-0 h-full w-1 bg-indigo-400" />
            <div className="absolute right-0 top-0 h-full w-1 bg-indigo-400" />

            <h1 className="relative text-sm font-bold uppercase tracking-[0.4em] text-white whitespace-nowrap backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.85)]">
              Recently Added
            </h1>
          </div>
        </div>

        {records.length === 0 ?
          loadingCards.map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
            >
              <div className="absolute inset-0 animate-pulse bg-slate-800/10" />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 py-1">
                  <div className="h-6 w-35 rounded bg-slate-800 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-slate-800 animate-pulse" />
                  <div className="h-4 w-32 rounded bg-slate-800 animate-pulse" />
                </div>

                <div className="space-y-2 pt-4">
                  <div className="h-7 w-24 rounded bg-slate-800 animate-pulse" />
                  <div className="ml-auto h-3 w-16 rounded bg-slate-800 animate-pulse" />
                </div>
              </div>
            </div>
          ))
          :
          records.map((record) => (
            <div
              key={record.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundColor: CATEGORY_COLOURS[record.category][0] }}
              />

              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: CATEGORY_COLOURS[record.category][0] }}
              />

              <div className="relative flex items-start justify-between gap-4">
                <div className="py-1">
                  {formatTrack(record.track, "text-lg font-bold text-white hover:text-emerald-500 whitespace-nowrap")}

                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">
                    {record.category}
                  </div>

                  <div className="text-sm text-slate-400 min-w-30">
                    {formatAuthors(record.authors, 0, false, "text-slate-300 hover:text-emerald-500")}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-emerald-400 mt-4 whitespace-nowrap">
                    {record.category === "Low Input" ? `${record.num_inputs} inputs` : formatTime(record.time_ms)}
                  </div>

                  <div className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(record.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
