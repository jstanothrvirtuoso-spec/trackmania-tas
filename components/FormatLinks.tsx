
import { TRACKS } from "@/lib/TrackList";
import Link from "next/link";

export function formatTrack(track: string, custom: string = "hover:text-emerald-500 text-slate-200") {

  const game = TRACKS[track].game
  
  return (
    <Link
      href={`/tracks?game=${encodeURIComponent(game)}&track=${encodeURIComponent(track)}`}
      className={`${custom} transition`}
    >
      {track}
    </Link>
  );
}

export function formatAuthors(authors: string[], maxLength: number = 0, fullSentence: boolean = false, custom: string = "hover:text-emerald-500 text-slate-200") {

  const truncate = maxLength > 0 && authors.length > maxLength
  const shown = truncate ? authors.slice(0, maxLength - 1) : authors;
  const remaining = truncate ? authors.length - maxLength + 1 : 0;
  const totalLen = truncate ? shown.length + 1 : authors.length

  return (
    <>
      {shown.map((author, i) => (
        <span key={`${author}-${i}`} className="text-slate-300/80">
          {i === 0 && fullSentence ? "by " : ""}
          <Link
            href={`/authors?author=${encodeURIComponent(author)}`}
            className={`${custom} transition`}
          >
            {author}
          </Link>
          {i < totalLen - 1 ? (i === totalLen - 2 && fullSentence) ? i === 0 ? " and " : ", and " : ", " : ""}
        </span>
      ))}

      {remaining > 0 && (
        <span className="relative group text-slate-300 cursor-default">
          {fullSentence ? "" : "+"}{remaining} author{remaining === 1 ? "" : "s"}

          <div className="pointer-events-none absolute right-0 top-0 z-50 mt-1 hidden w-max max-w-xs rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 shadow-lg group-hover:block">
            {authors.slice(maxLength > 0 ? maxLength - 1 : authors.length).join(", ")}
          </div>
        </span>
      )}
    </>
  );
}
