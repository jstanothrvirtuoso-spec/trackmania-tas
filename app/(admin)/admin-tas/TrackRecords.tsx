
import { Category, TasEntry } from "@/utils/typing";
import { formatTime, formatDate } from "@/utils/formatting";
import { InputsIcon, ReplayIcon, VideoIcon } from "@/components/Icons";
import { useProfilePublicMe } from "@/lib/Profiles";

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

  const { data: profilePublicMe, isLoading } = useProfilePublicMe();

  if (isLoading) return null

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-xl p-4 sm:p-6">
      <h2 className="mb-4 text-xl font-semibold">
        {track ? `Existing Records for ${track}` : "Choose a track"}
      </h2>

      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-700">
              <th className="py-2 px-2 hidden sm:table-cell">Category</th>
              <th className="py-2 px-2">
                {`${isStunt ? "Points" : "Time"}`}
              </th>
              <th className="py-2 px-2">Authors</th>
              <th className="py-2 px-2 hidden sm:table-cell">Date</th>
              <th className="py-2 px-2 text-center hidden sm:table-cell">Links</th>
              <th className="py-2 px-2 text-center">Copy</th>
              {profilePublicMe && profilePublicMe.role === "admin" && (
                <th className="py-2 px-2 text-center">Delete</th>
              )}
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
                    <td className="py-2 px-2 hidden sm:table-cell">
                      {t.category}
                    </td>

                    <td className="py-2 px-2">
                      {formatTime(t.time_ms, isStunt, t.game === "TM2")}
                    </td>

                    <td className="py-1 px-1 max-w-80">
                      {t.authors.join(", ")}
                    </td>

                    <td className="py-2 px-2 whitespace-nowrap hidden sm:table-cell">
                      {formatDate(t.date)}
                    </td>
                    
                    <td className="py-2 px-2 text-center align-middle hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-5 h-5 flex items-center justify-center">{t.video && <VideoIcon video_url={t.video} />}</div>
                        {/* <div className="w-5 h-5 flex items-center justify-center">{t.replay && <ReplayIcon replay_url={t.replay} />}</div> */}
                        <div className="w-5 h-5 flex items-center justify-center">{t.inputs && <InputsIcon inputs_url={t.inputs} />}</div>
                      </div>
                    </td>

                    <td className="px-1 py-1 text-center">
                      <button
                        onClick={() => copyTasToForm(t)}
                        title="Copy to form"
                        className="rounded bg-slate-800 px-2 py-0.5 hover:bg-slate-700 cursor-pointer"
                      >
                        Copy
                      </button>
                    </td>

                    {profilePublicMe && profilePublicMe.role === "admin" && (
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => deleteTas(t)}
                          title="Delete record"
                          className="rounded bg-red-900 px-2 py-0.5 hover:bg-red-700 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    )}

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

