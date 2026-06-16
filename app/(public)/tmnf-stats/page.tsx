"use client"

// import Image from "next/image";
import { useMemo, useState } from "react";
import { Category } from "@/utils/typing";
import { CATEGORIES, CATEGORY_FILTERS } from "@/utils/constants";
import { useTasRecords } from "@/lib/TasRecords";
import { useAuthors } from "@/lib/Authors";
import { DropSelect } from "@/components/DropSelect";
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
    <div>
      {/* Video Background */}
      <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/tmnf-stats-bg.webm" type="video/webm" />
        </video>
      </div>

      {/* TMNF side panel */}
      {/* <div className="hidden xl:block fixed left-0 top-0 bottom-50 w-full -z-5 overflow-hidden opacity-30">
        <Image
          src="/wallpapers/tmnf-stats-side.webp"
          alt=""
          fill
          className="object-contain object-left"
          priority
        />
      </div> */}
        
      <div className="flex flex-col justify-center items-center pt-20 pb-5 xl:flex-row xl:items-start">
        
        <CategoryTable
          bestRtaByTrack={bestRtaByTrack} 
          tasRecords={tasRecords}
        />

        <div className="flex flex-col flex-1 items-center gap-3 px-2 max-w-180 py-3">

          <div className="flex w-full justify-end">
            <DropSelect
              initialValue={category}
              options={CATEGORIES.filter((r) => (r != "Low Input")).map((category) => ({
                value: category,
                label: category,
              }))}
              onChange={(value) => setCategory(value as Category)}
            />
          </div>
          
          {authors.length > 0 && bestRtaByTrack.size > 0 && filteredTasRecords.length > 0 && (
            <div className="items-start w-full">
              <AuthorLeaderboard 
                bestRtaByTrack={bestRtaByTrack} 
                filteredTasRecords={filteredTasRecords}
                authors={authors}
              />
            </div>
          )}

          <div className="items-start w-full">
            {bestRtaByTrack.size > 0 && filteredTasRecords.length > 0 && (
              <TotalTimeSaved
                bestRtaByTrack={bestRtaByTrack} 
                filteredTasRecords={filteredTasRecords}
              />
            )}
          </div>
          
          <div className="w-full justify-center flex">
            <PercentSavedTmnf 
                bestRtaByTrack={bestRtaByTrack} 
                filteredTasRecords={filteredTasRecords}
                category={category}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
