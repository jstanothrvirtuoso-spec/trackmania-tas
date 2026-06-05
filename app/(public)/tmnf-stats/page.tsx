"use client"

import { useMemo } from "react";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import TmnfHistoryGraph from "@/components/tmnf-stats/TmnfHistoryGraph"
import PercentSavedTmnf from "@/components/tmnf-stats/PercentSavedTmnf";
import CategoryTable from "@/components/tmnf-stats/CategoryTable";
import AuthorLeaderboard from "@/components/tmnf-stats/AuthorLeaderboard";

export default function TmnfHistory() {

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();

  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords);
  }, [rtaRecords]);

  return (
    <div className="flex gap-4 justify-center pt-20 pb-5">

      <CategoryTable
        bestRtaByTrack={bestRtaByTrack} 
        tasRecords={tasRecords}
      />

      <div className="flex flex-col items-start gap-4">
        <div className="w-auto">
            <TmnfHistoryGraph
              bestRtaByTrack={bestRtaByTrack} 
              tasRecords={tasRecords}
            />
        </div>
        
        <div className="w-184">
            <AuthorLeaderboard tasRecords={tasRecords}/>
        </div>

        <div className="w-184">
            <PercentSavedTmnf />
        </div>
      </div>
    </div>
  );
}
