
import { Category, TasEntry } from "@/utils/typing";
import { formatTime, formatDate } from "@/utils/formatting";
import { InputsIcon, ReplayIcon, VideoIcon } from "@/components/Icons";
import { useProfilePublicMe } from "@/lib/Profiles";
import { getReplayURL } from "@/utils/common";
import { DropSelect } from "@/components/DropSelect";
import { CATEGORIES } from "@/utils/constants";
import { createClient } from "@/utils/supabase/client";
import { useAlert } from "@/components/providers/AlertProvider";
import { TRACKS } from "@/lib/TrackList";

type TrackRecordsProps = {
  track: string;
  category: Category;
  isStunt: boolean;
  records: TasEntry[];
  selectedCopiedTas: TasEntry | null;
  setLoading: (loading: boolean) => void;
  copyTasToForm: (t: TasEntry) => void;
  deleteTas: (t: TasEntry) => Promise<void>;
};

const supabase = createClient();

export default function TrackRecords({ 
  track, category, isStunt, records, selectedCopiedTas,
  setLoading, copyTasToForm, deleteTas 
}: TrackRecordsProps) {

  const { data: profilePublicMe, isLoading } = useProfilePublicMe();
  const { showAlert } = useAlert();

  async function updateCategory(tas: TasEntry, category: Category) {
    
    setLoading(true);
    try {

      const { error: tasError } = await supabase
        .from("tas_records")
        .update({category: category})
        .eq("id", tas.id);

      if (tasError) {
        setLoading(false);
        showAlert(`Changing category failed with message "${tasError.message}". 
          Either the internet died, or there is already a TAS with this exact time/category!
          You will need to reset the form...`);
        copyTasToForm(tas);
      };

    } finally {
      setLoading(false);
    };
  }

  if (isLoading) return null;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-xl p-4 sm:p-6">
      <h2 className="mb-4 text-xl font-semibold">
        {track ? `Existing Records for ${track}` : "Choose a track"}
      </h2>

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
            records.map((tas) => {
              const isMatch = tas.category === category;
              const replayURL = getReplayURL(tas.game, tas.track, tas.time_ms, tas.replay_path)
              const preciseTime = tas.game === "TM2" || (TRACKS[tas.track].preciseTime ?? false)

              return (
                <tr
                  key={`${tas.track}-${tas.category}-${tas.time_ms}`}
                  className={`border-b border-slate-800 ${
                    tas.id == selectedCopiedTas?.id ? "bg-sky-500/40"
                      : isMatch ? "bg-emerald-800/20 italic" : ""
                  }`}
                >
                  <td className="px-1 hidden sm:table-cell">
                    {selectedCopiedTas ? (
                      <span>{tas.category}</span>
                    ) : (
                      <DropSelect
                        initialValue={tas.category}
                        options={CATEGORIES.map((category) => ({
                          value: category,
                          label: category,
                        }))}
                        onChange={(value) => updateCategory(tas, value)}
                        small={true}
                      />
                    )}
                  </td>

                  <td className="py-2 px-2">
                    {formatTime(tas.time_ms, preciseTime)}
                  </td>

                  <td className="py-1 px-1 max-w-80">
                    {tas.authors.join(", ")}
                  </td>

                  <td className="py-2 px-2 whitespace-nowrap hidden sm:table-cell">
                    {formatDate(tas.date)}
                  </td>
                  
                  <td className="py-2 px-2 text-center align-middle hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-5 h-5 flex items-center justify-center"><VideoIcon videoURL={tas.video}/></div>
                      <div className="w-5 h-5 flex items-center justify-center"><ReplayIcon replayURL={replayURL}/></div>
                      <div className="w-5 h-5 flex items-center justify-center">{replayURL && <InputsIcon replayID={tas.id} replayType="tas"/>}</div>
                    </div>
                  </td>

                  <td className="px-1 py-1 text-center">
                    <button
                      onClick={() => copyTasToForm(tas)}
                      title="Copy to form"
                      className="rounded bg-slate-800 px-2 py-0.5 hover:bg-slate-700 cursor-pointer"
                    >
                      Copy
                    </button>
                  </td>

                  {profilePublicMe && profilePublicMe.role === "admin" && (
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => deleteTas(tas)}
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
  );
}
