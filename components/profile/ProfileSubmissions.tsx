
import { useMemo } from "react";
import { ProfilePrivate } from "@/lib/Profiles";
import { formatDate, formatTime, timeAgo } from "@/utils/formatting";
import { useFetchUserSubmissions } from "@/lib/TasSubmissions";

const STATUS_COLOUR = {
  "pending": ["bg-[#3230af]/30", "bg-[#3230af]/40"],
  "approved": ["bg-[#6cbe36]/30", "bg-[#6cbe36]/40"],
  "rejected": ["bg-[#9e2121]/20", "bg-[#9e2121]/30"]
};

export default function ProfileSubmission({ profilePrivate }: { profilePrivate: ProfilePrivate }) {
  
  const { data: tasSubmissions } = useFetchUserSubmissions(profilePrivate?.id ?? "");

  const recentSubmissions = useMemo(() => {
    if (!tasSubmissions) return [];

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const pending = tasSubmissions.filter(tas => tas.status === "pending");

    const recentNonPending = tasSubmissions
      .filter(tas => tas.status !== "pending" && new Date(tas.created_at) >= oneMonthAgo)
      .slice(0, Math.max(0, 50 - pending.length));

    return [...pending, ...recentNonPending].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [tasSubmissions]);

  if (!recentSubmissions) {
    return null
  }

  return (
    <div className="flex flex-col py-3 gap-2">
      <h1 className="text-lg font-semibold italic justify-center flex text-slate-300">
        Recent TAS Submissions
      </h1>

      <div className="overflow-x-auto">
        <table className="border-separate border border-slate-500 rounded-lg overflow-hidden text-center text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-300 uppercase tracking-[0.18em]">
              <th className="px-3 py-1.5 font-normal">
                Date
              </th>

              <th className="px-3 py-1.5 font-normal">
                Track
              </th>

              <th className="px-3 py-1.5 font-normal">
                Time
              </th>

              <th className="px-3 py-1.5 font-normal hidden sm:table-cell">
                Cat.
              </th>

              <th className="px-3 py-1.5 font-normal">
                Authors
              </th>

              <th className="px-3 py-1.5 font-normal hidden sm:table-cell">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {recentSubmissions.map((row, index) => {
              const status = row.status === "pending" ? `Submitted ${timeAgo(row.created_at)} ago (pending)`
                : row.status === "approved" ? "Approved"
                : row.admin_notes ? `Submission rejected with note: ${row.admin_notes}`
                : "Submission rejected :("
              
              const colourIndex = index % 2 == 0 ? 1 : 0
              const rowColour = STATUS_COLOUR[row.status]?.[colourIndex] ?? "bg-slate-500/10"
              
              return (
                <tr
                  key={ index }
                  className={`border-b border-slate-800 ${rowColour}`}
                >
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    { formatDate(row.date) }
                  </td>

                  <td className="px-3 py-1.5 lg:whitespace-nowrap">
                    {row.track}
                  </td>

                  <td className="px-3 py-1.5">
                    { formatTime(row.time_ms ?? 0) }
                  </td>

                  <td className="px-3 py-1.5 hidden sm:table-cell">
                    { row.category}
                  </td>

                  <td className="px-3 py-1.5">
                    { row.authors.join(", ") }
                  </td>

                  <td className="px-3 py-1.5 hidden sm:table-cell">
                    { status }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
