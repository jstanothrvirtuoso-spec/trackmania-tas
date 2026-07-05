
import Image from "next/image";
import { SubmitForm } from "@/utils/typing";
import { formatTime, formatDate, timeAgo } from "@/utils/formatting";
import { VideoIcon } from "@/components/Icons";
import { useMemo, useState } from "react";
import { useAllSubmissions } from "@/lib/TasSubmissions";
import { DropSelect } from "@/components/DropSelect";
import { STATUS_COLOUR, SUBMISSION_STATUS, TIMESPAN } from "@/utils/constants";
import { formatAuthors } from "@/components/FormatLinks";
import { createClient } from "@/utils/supabase/client";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

type PendingRecordsProps = {
  selectedSubmission: SubmitForm | null;
  copySubmissionToForm: (s: SubmitForm) => void;
  setLoading: (loading: boolean) => void;
};

const supabase = createClient();

export default function TasSubmissions({
  selectedSubmission, 
  copySubmissionToForm, 
  setLoading,
}: PendingRecordsProps) {

  const { data: tasSubmissions } = useAllSubmissions();
  const queryClient = useQueryClient();
  const isRefreshing = useIsFetching({
    queryKey: ["tas_submissions"],
  }) > 0;

  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [selectedTimespan, setSelectedTimespan] = useState("Past month");

  const recentSubmissions = useMemo(() => {
    if (!tasSubmissions) return [];

    let filtered = [...tasSubmissions];

    // Status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter( tas => tas.status === selectedStatus.toLowerCase());
    }

    // Timespan filter
    if (selectedTimespan !== "All") {
      const cutoff = new Date();

      if (selectedTimespan === "Past month") {
        cutoff.setMonth(cutoff.getMonth() - 1);
      } else if (selectedTimespan === "Past year") {
        cutoff.setFullYear(cutoff.getFullYear() - 1);
      }

      filtered = filtered.filter(
        tas => new Date(tas.created_at) >= cutoff
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tasSubmissions, selectedStatus, selectedTimespan]);
  
  async function downloadReplay(replayPath: string, fileName: string) {

    if (!replayPath) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .storage
        .from("replays")
        .createSignedUrl(replayPath, 60 * 5);

      if (error || !data?.signedUrl) return;

      const res = await fetch(data.signedUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = fileName || "replay.gbx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className=" rounded-2xl border border-slate-700 bg-slate-900/80">

        {/* Banner */}
        <div className="flex items-center rounded-t-2xl justify-between gap-15 border-b border-slate-800 bg-gradient-to-r from-slate-950 to-slate-800 px-3 py-1.5">
          <h3 className="font-kiwi tracking-[0.15em] text-xs sm:text-sm font-bold uppercase text-sky-200">
            TAS Submissions
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["tas_submissions"],
                })
              }
              disabled={isRefreshing}
              className="
                flex h-8 w-8 items-center justify-center
                rounded-lg border border-slate-700
                bg-slate-800/80
                transition
                hover:border-cyan-500/40
                hover:bg-slate-700
                disabled:opacity-50
                cursor-pointer
              "
              title="Refresh submissions"
            >
              <svg
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
            </button>

            <DropSelect
              initialValue={"Past month"}
              options={TIMESPAN.map((timespan) => ({
                value: timespan,
                label: timespan,
              }))}
              onChange={(value) => setSelectedTimespan(value)}
            />

            <DropSelect
              initialValue={"Pending"}
              options={SUBMISSION_STATUS.map((status) => ({
                value: status,
                label: status,
              }))}
              onChange={(value) => setSelectedStatus(value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto bg-slate-900/80 rounded-b-2xl max-h-120 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr className="border-b border-slate-700">
                <th className="px-2 py-2">Action</th>
                <th className="px-2 py-2">Submitted</th>
                <th className="px-2 py-2">Track</th>
                <th className="px-2 py-2">Time</th>
                <th className="px-2 py-2 hidden sm:table-cell">Authors</th>
                <th className="px-2 py-2 hidden sm:table-cell">Date</th>
                <th className="px-2 py-2 hidden sm:table-cell">Category</th>
                <th className="px-2 py-2 hidden sm:table-cell">Links</th>
                <th className="px-2 py-2 hidden sm:table-cell">Notes</th>
              </tr>
            </thead>

            <tbody>
              {recentSubmissions.length === 0 || isRefreshing ? (
                <tr>
                  <td 
                    colSpan={9} 
                    className="py-6 text-center text-slate-500"
                  >
                    <div className="min-h-12 flex items-center justify-center gap-2 text-slate-500">
                      {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
                      <span>{isRefreshing ? "Loading..." : "No pending submissions"}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((submission, index) => {

                  const colourIndex = index % 2 == 0 ? 1 : 0
                  const rowColour = STATUS_COLOUR[submission.status]?.[colourIndex] ?? "bg-slate-500/10"

                  return (
                    <tr
                      key={submission.id}
                      className={`border-b border-slate-800 transition text-xs ${rowColour}
                        ${submission.id == selectedSubmission?.id ? "bg-sky-500/40" : ""}
                      `}
                    >
                      <td className="px-2 py-0.5 text-center">
                        {submission.status === "pending" ? (
                          <button
                            onClick={() => copySubmissionToForm(submission)}
                            className="rounded bg-slate-800 px-2 py-0.5 hover:bg-slate-700 cursor-pointer"
                          >
                            Copy
                          </button>
                        ) : "-"}
                      </td>

                      <td className="px-2 py-1 whitespace-nowrap text-slate-300">
                        {timeAgo(submission.created_at)}{"-"}
                        <span>
                          {submission.submitted_by_name ?? "Unknown"}
                        </span>
                      </td>

                      <td className="px-2 py-1 max-w-40">
                        {submission.track ?? "-"}
                      </td>

                      <td className="px-2 py-1">
                        {submission.time_ms ? formatTime(submission.time_ms, submission.game === "TM2") : "-"}
                      </td>

                      <td className="px-2 py-1 max-w-50 hidden sm:table-cell">
                        {Array.isArray(submission.authors) ? formatAuthors(submission.authors, 3) : ""}
                      </td>

                      <td className="px-2 py-1 hidden sm:table-cell whitespace-nowrap">
                        {formatDate(submission.date)}
                      </td>

                      <td className="px-2 py-1 whitespace-nowrap hidden sm:table-cell">
                        {submission.category}
                      </td>

                      <td className="px-2 py-1 text-center hidden sm:table-cell">
                        
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {submission.video && (<VideoIcon videoURL={submission.video}/>)}
                          </div>

                          <div className="w-5 h-5 flex items-center justify-center">
                            {submission.replay_path && (
                              <button
                                type="button"
                                onClick={() => downloadReplay(submission.replay_path, submission.file_name)}
                                className="hover:opacity-80 transition cursor-pointer"
                                title={`Download: ${submission.file_name}`}
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

                      <td className="px-2 py-1 max-w-[15rem] break-words whitespace-pre-wrap hidden sm:table-cell">
                        {submission.user_notes ?? "-"}
                      </td>
                    </tr>
                  )}
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
