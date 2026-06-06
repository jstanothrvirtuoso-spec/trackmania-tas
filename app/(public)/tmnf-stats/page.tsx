"use client"

import { useMemo, useState } from "react";
import { Category } from "@/utils/typing";
import { CATEGORIES, CATEGORY_FILTERS } from "@/utils/constants";
import { useTasRecords } from "@/lib/TasRecords";
import { useAuthors } from "@/lib/Authors";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import TotalTimeSaved from "@/components/tmnf-stats/TotalTimeSaved"
import PercentSavedTmnf from "@/components/tmnf-stats/PercentSavedTmnf";
import CategoryTable from "@/components/tmnf-stats/CategoryTable";
import AuthorLeaderboard from "@/components/tmnf-stats/AuthorLeaderboard";

export default function TmnfHistory() {

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const { data: authorData = [] } = useAuthors();
  const [category, setCategory] = useState<Category>("Open");

  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords);
  }, [rtaRecords]);
  
  const filteredTasRecords = useMemo(() => {
    if (category === "Open") return tasRecords;

    const allowed = CATEGORY_FILTERS[category];

    return tasRecords.filter((r) => allowed.has(r.category));
  }, [tasRecords, category]);
  
  const authors = useMemo(
    () => authorData.map((a) => a.author),
    [authorData]
  );

  return (
    <div className="flex gap-4 justify-center pt-20 pb-5">

      <CategoryTable
        bestRtaByTrack={bestRtaByTrack} 
        tasRecords={tasRecords}
      />

      <div className="flex flex-col items-start gap-4">

        <div className="flex justify-end">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded bg-slate-800 px-2 py-1 text-sm"
          >
            {CATEGORIES.filter((r) => (r != "Low Input")).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        
        {authors && filteredTasRecords && (
          <div className="w-184">
            <AuthorLeaderboard 
              filteredTasRecords={filteredTasRecords}
              authors={authors}
            />
          </div>
        )}

        <div className="w-auto">
          <TotalTimeSaved
            bestRtaByTrack={bestRtaByTrack} 
            filteredTasRecords={filteredTasRecords}
          />
        </div>
        
        <div className="w-184">
          <PercentSavedTmnf 
              bestRtaByTrack={bestRtaByTrack} 
              filteredTasRecords={filteredTasRecords}
              category={category}
          />
        </div>
      </div>
    </div>
  );
}
