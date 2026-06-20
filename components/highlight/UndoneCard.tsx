
import { getYouTubeId } from "@/utils/common";
import { RtaEntry } from "@/utils/typing";
import Link from "next/link";

export function UndoneCard({ undoneTasOfTheDay, bestRtaByTrack }: { undoneTasOfTheDay: string,  bestRtaByTrack: Map<string, RtaEntry> }) {
  
  const videoId = getYouTubeId(bestRtaByTrack.get(undoneTasOfTheDay)?.video);

  return (
    <section className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-900/80 p-6 backdrop-blur-md">

      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-amber-500" />
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-amber-300">
          Undone TAS of the Day
        </span>
      </div>

      <h2 className="mt-2 sm:mt-4 text-2xl sm:text-3xl font-semibold text-white w-fit">
        <Link
          key={undoneTasOfTheDay}
          href={`/tracks?track=${encodeURIComponent(undoneTasOfTheDay)}`}
          className="hover:text-amber-200 transition"
        >
          {undoneTasOfTheDay}
        </Link>
      </h2>

      <div className="mt-3 h-px bg-gradient-to-r from-amber-500/30 via-slate-700 to-transparent" />

      <p className="mt-2 text-[12px] text-slate-400 italic">
        No TAS currently exists on this track. Submit a TAS on this track by the 
        end of the day to be immortilised as a Legend of Undone TASes!
      </p>

      {videoId && (
        <div className="mt-6 rounded-xl shadow-[0_0_15px_rgba(255,191,0,0.25)]">
          <div className="aspect-video overflow-hidden rounded-xl border border-amber-500/50">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Undone TAS"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  )
}
