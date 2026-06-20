
import Link from "next/link";
import { formatDate, formatTime, formatPercentSaved, timeAgo } from "@/utils/formatting";
import { RtaEntry, TasEntry } from "@/utils/typing";
import { getYouTubeId } from "@/utils/common";

function getAuthorDisplayParts(authors: string[]) {
  const len = authors.length;

  if (len === 0) return [];

  if (len === 1) return [{ type: "text", value: "by "}, { type: "author", value: authors[0] }];

  if (len === 2) {
    return [
      { type: "text", value: "by "},
      { type: "author", value: authors[0] },
      { type: "text", value: " and " },
      { type: "author", value: authors[1] },
    ];
  }

  if (len <= 6) {
    const parts: { type: string; value: string }[] = [{ type: "text", value: "by "}];

    authors.forEach((a, i) => {
      parts.push({ type: "author", value: a });

      if (i < len - 2) parts.push({ type: "text", value: ", " });
      else if (i === len - 2) parts.push({ type: "text", value: ", and " });
    });

    return parts;
  }

  return [
    { type: "text", value: "by "},
    { type: "author", value: authors[0] },
    { type: "text", value: ` + ${len - 1} Co-authors` },
  ];
}

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
        <Link
          key={tasOfTheDay.track}
          href={`/tracks?track=${encodeURIComponent(tasOfTheDay.track)}`}
          className="hover:text-indigo-200 transition"
        >
          {tasOfTheDay.track}
        </Link>
      </h2>

      <div className="mt-3 h-px bg-gradient-to-r from-indigo-500/30 via-slate-700 to-transparent" />

      <div className="mt-2 flex w-full gap-3 text-sm flex-col sm:flex-row items-start sm:items-center">
        <div className="flex flex-col mb-2">
          <div className="font-mono text-2xl font-semibold text-indigo-400 mr-15 whitespace-nowrap">
            {formatTime(tasOfTheDay.time_ms, false, tasOfTheDay.game === "TM2")}
            <span className="text-xs text-blue-300">
              {` (-${rta ? formatPercentSaved(tasOfTheDay.time_ms, rta.time_ms, 3) : ""}% RTA)`}
            </span>
          </div>
          
          <div className="mt-1 font-medium text-slate-200">
            {getAuthorDisplayParts(tasOfTheDay.authors ?? [""]).map((part, i) => {
              if (part.type === "author") {
                return (
                  <Link
                    key={`${part.value}-${i}`}
                    href={`/authors?author=${encodeURIComponent(part.value)}`}
                    className="whitespace-nowrap text-slate-200 transition hover:text-indigo-300"
                  >
                    {part.value}
                  </Link>
                );
              }

              return (
                <span key={`text-${i}`} className="whitespace-nowrap text-slate-300">
                  {part.value}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex gap-5 w-full px-0 sm:px-2 justify-start sm:justify-end">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
              Date
            </div>

            <div className="mt-1 text-sm text-slate-200">
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
              {tasOfTheDay.game}
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
