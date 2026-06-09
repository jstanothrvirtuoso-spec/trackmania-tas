
import Image from "next/image";
import { SubmitForm } from "@/utils/typing";
import { formatTime, formatDate, timeAgo } from "@/utils/formatting";
import { VideoIcon } from "@/components/Icons";

type PendingRecordsProps = {
  submissions: SubmitForm[];
  isStunt: boolean;
  selectedSubmission: SubmitForm | null;

  copySubmissionToForm: (s: SubmitForm) => void;
  downloadReplay: (
    replayPath: string,
    fileName: string
  ) => Promise<void>;
};

export default function PendingRecords({ 
  submissions, 
  isStunt,
  selectedSubmission, 
  copySubmissionToForm, 
  downloadReplay,
}: PendingRecordsProps) {

  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-slate-900 p-6">
      <h2 className="mb-4 text-xl font-semibold text-yellow-300">
        Pending Submissions
      </h2>

      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-700">
              <th className="px-2 py-2">Action</th>
              <th className="px-2 py-2">Submitted</th>
              <th className="px-2 py-2">Track</th>
              <th className="px-2 py-2">Category</th>
              <th className="px-2 py-2">Time</th>
              <th className="px-2 py-2">Authors</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Links</th>
              <th className="px-2 py-2">Notes</th>
            </tr>
          </thead>

          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-500">
                  No pending submissions
                </td>
              </tr>
            ) : (
              submissions.map((s) => (
                <tr
                  key={s.id}
                  className={`border-b border-slate-800 transition
                    ${s.id == selectedSubmission?.id ? "bg-sky-500/40" : ""}
                  `}
                >

                  <td className="px-2 py-2">
                    <button
                      onClick={() => copySubmissionToForm(s)}
                      className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700 cursor-pointer"
                    >
                      Copy
                    </button>
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap text-slate-300">
                    {timeAgo(s.created_at)}{"-"}
                    <span>
                      {s.submitted_by_name ?? "Unknown"}
                    </span>
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    {s.track ?? "-"}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    {s.category}
                  </td>

                  <td className="px-2 py-2">
                    {s.time_ms ? formatTime(s.time_ms, isStunt, s.game === "TM2") : "-"}
                  </td>
                  <td className="px-2 py-2">
                    {Array.isArray(s.authors) ? s.authors.join(", ") : ""}
                  </td>
                  <td className="px-2 py-2">{formatDate(s.date)}</td>

                  <td className="px-2 py-2 text-center">
                    
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {s.video && (<VideoIcon video_url={s.video}/>)}
                      </div>

                      <div className="w-5 h-5 flex items-center justify-center">
                        {s.replay_path && (
                          <button
                            type="button"
                            onClick={() => downloadReplay(s.replay_path, s.file_name)}
                            className="hover:opacity-80 transition cursor-pointer"
                            title={`Download: ${s.file_name}`}
                          >
                            <Image
                              src="/links/replay.webp"
                              alt="Replay"
                              width={16}
                              height={16}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2 max-w-[28rem] break-words whitespace-pre-wrap">
                    {s.user_notes ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
