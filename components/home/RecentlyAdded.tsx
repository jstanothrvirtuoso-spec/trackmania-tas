
import Link from "next/link";
import { useMemo } from "react";
import { useTasRecords } from "@/lib/TasRecords";
import { formatDate, formatTime } from "@/utils/formatting";
import { CATEGORY_COLOURS } from "@/utils/constants";


export default function RecentlyAdded() {

  const { data: tasRecords = [] } = useTasRecords();

  const records = useMemo(() => {
    
    return tasRecords
      .toSorted((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

  }, [tasRecords]);
  

  return (
    <div className="flex flex-col gap-3">
      <div className="mt-2 flex w-full justify-center">
        <h1 className="text-sm font-semibold tracking-[0.25em] text-slate-300 uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
          Recently Added
        </h1>
      </div>

      {records.map((record) => (
        <div
          key={record.id}
          className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.85)]"
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
              <Link
                key={record.track}
                href={`/tracks?track=${encodeURIComponent(record.track)}`}
                className="text-lg font-bold text-white hover:text-emerald-300 whitespace-nowrap"
              >
                {record.track}
              </Link>

              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">
                {record.category}
              </div>

              <div className="text-sm text-slate-400 min-w-30">
                {record.authors.join(", ")}
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
      ))}
    </div>
  )
}
