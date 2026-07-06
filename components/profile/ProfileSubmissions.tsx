
import { useMemo, useState } from "react";
import { ProfilePrivate } from "@/lib/Profiles";
import { formatDate, formatTime, timeAgo } from "@/utils/formatting";
import { useFetchUserSubmissions } from "@/lib/TasSubmissions";
import { formatAuthors, formatTrack } from "../FormatLinks";
import { DropSelect } from "../DropSelect";
import { STATUS_COLOUR, SUBMISSION_STATUS, TIMESPAN } from "@/utils/constants";

export default function ProfileSubmission({ profilePrivate }: { profilePrivate: ProfilePrivate }) {
  
  const { data: tasSubmissions } = useFetchUserSubmissions(profilePrivate?.id ?? "");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTimespan, setSelectedTimespan] = useState("Past month");

  const recentSubmissions = useMemo(() => {
    if (!tasSubmissions) return [];

    let filtered = [...tasSubmissions];

    // Status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter(
        tas => tas.status === selectedStatus.toLowerCase()
      );
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

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
  }, [tasSubmissions, selectedStatus, selectedTimespan]);
  
  if (!tasSubmissions || tasSubmissions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col px-2 mb-4">
      <div className=" rounded-2xl border border-slate-500 bg-slate-900/80 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">

        {/* Banner */}
        <div className="flex items-center rounded-t-2xl justify-between gap-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 to-slate-800 px-3 py-1.5">
          <h3 className="font-kiwi tracking-[0.15em] text-xs sm:text-sm font-bold uppercase text-sky-200">
            Recent TAS Submissions
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <DropSelect
              initialValue={"Past month"}
              options={TIMESPAN.map((timespan) => ({
                value: timespan,
                label: timespan,
              }))}
              onChange={(value) => setSelectedTimespan(value)}
            />

            <DropSelect
              initialValue={"All"}
              options={SUBMISSION_STATUS.map((status) => ({
                value: status,
                label: status,
              }))}
              onChange={(value) => setSelectedStatus(value)}
            />
          </div>
        </div>
    
        <div className="overflow-x-auto bg-slate-900/80 rounded-b-2xl max-h-108 overflow-y-auto">
          <table className="overflow-hidden text-center text-[11px] sm:text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-300 uppercase tracking-[0.18em]">
                <th className="px-2 py-1.5 font-normal">Submitted</th>
                <th className="px-3 py-1.5 font-normal whitespace-nowrap hidden sm:table-cell">TAS Date</th>
                <th className="px-3 py-1.5 font-normal w-full sm:w-auto">Track</th>
                <th className="px-3 py-1.5 font-normal">Time</th>
                <th className="px-3 py-1.5 font-normal hidden sm:table-cell">Cat.</th>
                <th className="px-3 py-1.5 font-normal w-full sm:w-auto">Authors</th>
                <th className="px-3 py-1.5 font-normal hidden sm:table-cell">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-400 italic"
                  >
                    No submissions match the selected filters.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((row, index) => {
                  const status = row.status === "pending" ? `Submitted ${timeAgo(row.created_at)} ago (pending)`
                    : row.status === "approved" ? "Approved"
                    : row.admin_notes ? `Submission rejected with note: ${row.admin_notes}`
                    : "Submission rejected :("
                  
                  const colourIndex = index % 2 == 0 ? 1 : 0
                  const rowColour = STATUS_COLOUR[row.status]?.[colourIndex] ?? "bg-slate-500/10"
                  
                  return (
                    <tr
                      key={index}
                      className={`border-b border-slate-800 text-slate-200 ${rowColour}`}
                    >
                      <td className="px-2 py-1 whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>

                      <td className="px-2 py-1 whitespace-nowrap hidden sm:table-cell">
                        {formatDate(row.date)}
                      </td>

                      <td className="px-2 py-1 lg:whitespace-nowrap">
                        {formatTrack(row.track ?? "")}
                      </td>

                      <td className="px-2 py-1">
                        {formatTime(row.time_ms ?? 0)}
                      </td>

                      <td className="px-2 py-1 hidden sm:table-cell">
                        {row.category}
                      </td>

                      <td className="px-2 py-1 max-w-60">
                        {formatAuthors(row.authors, 6)}
                      </td>

                      <td className="px-2 py-1 hidden sm:table-cell max-w-60">
                        { status }
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
