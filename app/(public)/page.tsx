"use client";

import { useTasRecords } from "@/lib/TasRecords";
import { useBestRtaRecords } from "@/lib/RtaRecords";
import VideoBackground from "@/components/home/VideoBackground";
import CompletionTable from "@/components/home/CompletionTable";
import GlobalLeaderboard from "@/components/home/GlobalLeaderboard";
import PercentSavedLeaderboard from "@/components/home/PercentSavedLeaderboard";
import RecentlyAdded from "@/components/home/RecentlyAdded";

export default function Home() {

  const { data: bestRtaByTrack } = useBestRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();

  return (
    <>
      {/* Video Background */}
      <div className="-z-10 h-full w-full">
        <VideoBackground />
      </div>

      {/* Leaderboards */}
      <div className="pt-20 pb-6 flex justify-center w-full">
        <div className="w-full max-w-7xl px-2 flex flex-col gap-4 items-center lg:flex-row lg:items-start">

          <div className="lg:w-fit">
            <GlobalLeaderboard
              tasRecords={tasRecords}
              bestRtaByTrack={bestRtaByTrack}
            />
          </div>

          <div className="w-fit flex flex-col gap-4 items-center">
            <CompletionTable
              tasRecords={tasRecords}
            />
            <PercentSavedLeaderboard
              tasRecords={tasRecords}
              bestRtaByTrack={bestRtaByTrack}
            />
          </div>
          
          <div className="w-fit">
            <RecentlyAdded
              tasRecords={tasRecords}
            />
          </div>

        </div>
      </div>
    </>
  );
}
