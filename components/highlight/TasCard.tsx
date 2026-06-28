
import { formatDate, formatTime, formatPercentSaved, timeAgo, formatGame } from "@/utils/formatting";
import { RtaEntry, TasEntry } from "@/utils/typing";
import { getYouTubeId } from "@/utils/common";
import { formatAuthors, formatTrack } from "../FormatLinks";

export function TasCard({ tasOfTheDay, bestRtaByTrack }: { tasOfTheDay: TasEntry,  bestRtaByTrack: Map<string, RtaEntry> }) {
  
  const videoId = getYouTubeId(tasOfTheDay.video);
  const rta = bestRtaByTrack.get(tasOfTheDay.track);

  return (
    <section className="rounded-3xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 via-slate-900/80 to-slate-900/80 p-6 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-indigo-400" />

        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-indigo-300">
          TAS OF THE DAY
        </span>
      </div>

      <h2 className="mt-2 sm:mt-4 text-2xl sm:text-3xl font-semibold text-white w-fit">
        {formatTrack(tasOfTheDay.track, "hover:text-indigo-300 text-white")}
      </h2>

      <div className="mt-3 h-px bg-gradient-to-r from-indigo-500/30 via-slate-700 to-transparent" />

      <div className="mt-2 flex w-full gap-3 text-sm flex-col justify-between sm:flex-row items-start sm:items-center">
        <div className="flex flex-col mb-2">
          <div className="font-mono text-2xl font-semibold text-indigo-400 mr-15 whitespace-nowrap">
            {formatTime(tasOfTheDay.time_ms, false, tasOfTheDay.game === "TM2")}
            <span className="text-xs text-blue-300">
              {` (-${rta ? formatPercentSaved(tasOfTheDay.time_ms, rta.time_ms, 3) : ""}% RTA)`}
            </span>
          </div>
          
          <div className="mt-1 font-medium">
            {formatAuthors(tasOfTheDay.authors ?? [""], 0, true, "hover:text-indigo-400")}
          </div>
        </div>

        <div className="flex gap-5 px-0 sm:px-2 justify-start sm:justify-end">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
              Date
            </div>

            <div className="mt-1 text-sm text-slate-200 whitespace-nowrap">
              {formatDate(tasOfTheDay.date ?? "")}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
              Reign
            </div>

            <div className="mt-1 text-sm text-slate-200">
              {timeAgo(tasOfTheDay.date)}
            </div>
          </div>
          
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
              Category
            </div>

            <div className="mt-1 text-sm text-slate-200">
              {tasOfTheDay.category}
            </div>
          </div>
          
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
              Game
            </div>

            <div className="mt-1 text-sm text-slate-200">
              {formatGame(tasOfTheDay.game)}
            </div>
          </div>
        </div>
      </div>
      
      {videoId && (
        <div className="mt-4 rounded-2xl shadow-[0_0_25px_rgba(75,0,130,0.35)]">
          <div className="aspect-video overflow-hidden rounded-2xl border border-indigo-500/50">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="TAS of the Day"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </section>
  )
}
