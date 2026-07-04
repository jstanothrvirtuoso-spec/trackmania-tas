
import { formatDate, formatPercentSaved, formatTime } from "@/utils/formatting";
import { RtaEntry, TasEntry } from "@/utils/typing";
import { formatAuthors } from "../FormatLinks";

interface TracksTitlesProps {
  tmxLink: string;
  tas: TasEntry | null;
  rta: RtaEntry | null;
  isTM2: boolean;
  track: string;
}

export function TracksTitles({track, tmxLink, tas, rta, isTM2}: TracksTitlesProps) {
  return(
    <div className="mb-4 mt-6 text-center">

      {/* Track title */}
      <div className="flex flex-col items-center">
        <button className="text-4xl font-black tracking-tight text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.6)]"> 
          {tmxLink ? (
            <a href={tmxLink} target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition">
              {track}
            </a>
          ) : (
            track
          )}
        </button>
        <div className="mt-2 h-1 w-34 rounded-full bg-emerald-400/70 shadow-[0_5px_20px_rgba(0,0,0,0.6)]" />
      </div>

      <div className="flex flex-col gap-1 items-center sm:flex-row sm:gap-4">
        
        {/* Tas WR */}
        <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 backdrop-blur-md shadow-[0_5px_20px_rgba(0,0,0,0.6)]">
          <div className="text-left translate-y-[2px]">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
              TAS Record
            </div>

            <div className="font-mono text-lg font-semibold text-emerald-400 whitespace-nowrap">
              {tas ? formatTime(tas.time_ms, isTM2) : "-"}
              {tas && rta && (<span className="text-xs text-blue-300">{` (${formatPercentSaved(tas.time_ms, rta.time_ms, 3, true)}%)`}</span>)}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="text-left">
            <div className="text-slate-200 italic text-sm sm:text-lg">
              {tas ? formatAuthors(tas.authors, 2) : "None"}
            </div>

            <div className="text-xs text-slate-400">
              {tas ? formatDate(tas.date) : ""}
            </div>
          </div>
        </div>

        {/* Rta WR */}
        <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 backdrop-blur-md shadow-[0_5px_20px_rgba(0,0,0,0.6)]">
          <div className="text-left translate-y-[2px]">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
              RTA Record
            </div>

            <div className="font-mono text-lg font-semibold text-emerald-400">
              {rta ? formatTime(rta.time_ms, isTM2) : "-"}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="text-left">
            <div className="text-slate-200 italic text-sm sm:text-lg">
              {rta ? rta.player : "None"}
            </div>

            <div className="text-xs text-slate-400">
              {rta ? formatDate(rta.date) : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
