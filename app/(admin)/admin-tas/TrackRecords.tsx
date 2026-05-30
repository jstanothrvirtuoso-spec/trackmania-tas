
import { formatTime, formatDate } from "@/utils/formatting";
import { Category, TasEntry } from "@/lib/TrackList";

type TrackRecordsProps = {
  track: string;
  category: Category;
  isStunt: boolean;
  records: TasEntry[];

  copyTasToForm: (t: TasEntry) => void;
  deleteTas: (t: TasEntry) => Promise<void>;
};


export default function TrackRecords({ 
  track, 
  category, 
  isStunt, 
  records, 
  copyTasToForm, 
  deleteTas 
}: TrackRecordsProps) {

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-4 text-xl font-semibold">
        {track ? `Existing Records for ${track}` : "Choose a track"}
      </h2>

      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-700">
              <th className="py-2 px-2">Category</th>
              <th className="py-2 px-2">
                {`${isStunt ? "Points" : "Time"}`}
              </th>
              <th className="py-2 px-2">Authors</th>
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2 text-center">Video</th>
              <th className="py-2 px-2 text-center">Copy</th>
              <th className="py-2 px-2 text-center">Delete</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  Select track
                </td>
              </tr>
            ) : (
              records.map((t) => {
                const isMatch = t.category === category;

                return (
                  <tr
                    key={`${t.track}-${t.category}-${t.time_ms}`}
                    className={`border-b border-slate-800 ${
                      isMatch ? "bg-emerald-500/20 italic" : ""
                    }`}
                  >
                    <td className="py-2 px-2">
                      {t.category}
                    </td>

                    <td className="py-2 px-2">
                      {formatTime(t.time_ms, isStunt, t.game === "TM2")}
                    </td>

                    <td className="py-1 px-2 max-w-80">
                      {t.authors.join(", ")}
                    </td>

                    <td className="py-2 px-2 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    
                    <td className="py-2 px-2 text-center align-middle">
                      <div className="flex justify-center">
                        {t.video && (
                          <a
                            href={t.video}
                            target="_blank"
                            rel="noreferrer"
                            title="Watch video"
                            className="hover:opacity-80 transition"
                          >
                            { t.video.includes("discord.") 
                              ? <img src="/links/discord.webp" alt="Replay" className="w-4 h-4" />
                              : t.video.includes("streamable.com")
                                ? <img src="/links/streamable.webp" alt="Replay" className="w-4.5" />
                                : <img src="/links/youtube.webp" alt="Replay" className="w-4 h-4" />
                            }
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => copyTasToForm(t)}
                        title="Copy to form"
                        className="rounded bg-slate-800 px-2 py-0.5 hover:bg-slate-700 cursor-pointer"
                      >
                        Copy
                      </button>
                    </td>

                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => deleteTas(t)}
                        title="Delete record"
                        className="rounded bg-red-900 px-2 py-0.5 hover:bg-red-700 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

