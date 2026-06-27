"use client"

// import Image from "next/image";
import { useMemo, useState } from "react";
import { Category } from "@/utils/typing";
import { CATEGORIES, CATEGORY_FILTERS } from "@/utils/constants";
import { useTasRecords } from "@/lib/TasRecords";
import { useAuthors } from "@/lib/Authors";
import { DropSelect } from "@/components/DropSelect";
import { useBestRtaRecords } from "@/lib/RtaRecords";
import TotalTimeSaved from "@/components/tmnf-stats/TotalTimeSaved"
import PercentSavedTmnf from "@/components/tmnf-stats/PercentSavedTmnf";
import CategoryTable from "@/components/tmnf-stats/CategoryTable";
import AuthorLeaderboard from "@/components/tmnf-stats/AuthorLeaderboard";

export default function TmnfHistory() {

  const { data: bestRtaByTrack } = useBestRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const { data: authorData = [] } = useAuthors();
  const [category, setCategory] = useState<Category>("Open");

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
      <div className="fixed inset-0 -z-10 bg-slate-950/20 pointer-events-none" />

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
        
      <div className="flex flex-col justify-center items-center pt-20 pb-2 xl:flex-row xl:items-start z-99">
        
        <CategoryTable
          bestRtaByTrack={bestRtaByTrack} 
          tasRecords={tasRecords}
        />

        <div className="flex flex-col flex-1 items-center px-2 max-w-180">

          <div className="flex w-full justify-end mb-2">
            <DropSelect
              initialValue={category}
              options={CATEGORIES.filter((r) => (r != "Low Input")).map((category) => ({
                value: category,
                label: category,
              }))}
              onChange={(value) => setCategory(value as Category)}
            />
          </div>
          
          {authors.length > 0 && bestRtaByTrack && filteredTasRecords.length > 0 && (
            <div className="items-start w-full mb-4">
              <AuthorLeaderboard 
                bestRtaByTrack={bestRtaByTrack} 
                filteredTasRecords={filteredTasRecords}
                authors={authors}
              />
            </div>
          )}

          <div className="items-start w-full mb-4">
            {bestRtaByTrack && filteredTasRecords.length > 0 && (
              <TotalTimeSaved
                bestRtaByTrack={bestRtaByTrack} 
                filteredTasRecords={filteredTasRecords}
              />
            )}
          </div>
          
          <div className="w-full justify-center flex mb-3">
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
