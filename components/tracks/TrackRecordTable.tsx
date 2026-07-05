
import { getReplayURL } from "@/utils/common";
import { CATEGORY_COLOURS } from "@/utils/constants";
import { formatDate, formatTime } from "@/utils/formatting";
import { Category, Game, TasEntry } from "@/utils/typing";
import { formatAuthors } from "../FormatLinks";
import { GbxIcon, InputsIcon, ReplayIcon, VideoIcon } from "../Icons";
import { CurrentRecord } from "@/app/(public)/tracks/TracksPage";

interface TrackTableProps {
  tmxGame: Game;
  records: TasEntry[];
  isTM2: boolean;
  track: string;
  setCurrentRecord: (record: CurrentRecord | null) => void;
}

export function TrackRecordTable({tmxGame, records, isTM2, track, setCurrentRecord}: TrackTableProps) {

  return (
    <table className="min-w-full table-auto bg-slate-800/90 text-xs sm:text-sm">
      <thead>
        <tr className="border-x border-slate-800 text-slate-300 bg-slate-900/40 ">
          <th className="px-2 py-1.5 text-center whitespace-nowrap">Category</th>
          <th className="px-2 py-1.5 text-center whitespace-nowrap">Record</th>
          <th className="px-2 py-1.5 text-center whitespace-nowrap">Authors</th>
          <th className="px-2 py-1.5 text-center whitespace-nowrap">Date</th>
          <th className="px-2 py-1.5 whitespace-nowrap hidden sm:table-cell text-center">Links</th>
        </tr>
      </thead>

      <tbody>
        {records.map((entry, i) => {
          
          const colourIndex = i % 2 == 0 ? 2 : 1
          const rowColour = CATEGORY_COLOURS[entry.category]?.[colourIndex] ?? "bg-slate-500/10"
          const replayType = entry.category === "RTA" as Category ? "rta" : "tas";
          const hideInputs = replayType === "rta" && ["ESWC", "TM2"].includes(tmxGame)
          const replayURL = replayType === "rta" ? entry.replay_path : getReplayURL(entry.game, entry.track, entry.time_ms, entry.replay_path)
          
          return (
            <tr
              key={`${entry.time_ms}-${entry.date}`}
              onMouseEnter={() => setCurrentRecord({ category: entry.category, id: entry.id })}
              onMouseLeave={() => setCurrentRecord(null)}
              className={`border-x border-slate-800 transition-colors hover:bg-orange-500/60 ${rowColour}`}
            >
              <td className="px-2 py-1.5 text-center text-slate-300 whitespace-nowrap">
                {entry.category}
              </td>

              <td className="px-2 py-1.5 text-center font-medium text-slate-200 whitespace-nowrap">
                { entry.num_inputs ? `${entry.num_inputs} input${entry.num_inputs > 1 ? "s" : ""}` : formatTime(entry.time_ms, isTM2) }
              </td>

              <td className="px-2 py-1.5 text-center text-slate-200 max-w-[420px]">
                {formatAuthors(entry.authors, 6)}
              </td>

              <td className="px-2 py-1.5 text-center text-slate-300 whitespace-nowrap">
                { formatDate(entry.date) }
              </td>
              
              <td className="px-2 py-1.5 text-center text-slate-300 whitespace-nowrap hidden sm:table-cell">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <VideoIcon videoURL={entry.video}/>
                  </div>

                  <div className="w-5 h-5 flex items-center justify-center">
                    <ReplayIcon replayURL={replayURL}/>
                  </div>

                  <div className="w-5 h-5 flex items-center justify-center">
                    {replayURL && !hideInputs && <InputsIcon replayID={entry.id} replayType={replayType} />}
                  </div>

                  <div className="w-5 h-5 flex items-center justify-center">
                    <GbxIcon replayURL={replayURL} track={entry.category === "RTA" as Category ? track : ""}/>
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
