"use client";

import VideoBackground from "@/components/home/VideoBackground";
import CompletionTable from "@/components/home/CompletionTable";
import GlobalLeaderboard from "@/components/home/GlobalLeaderboard";
import PercentSavedLeaderboard from "@/components/home/PercentSavedLeaderboard";

export default function Home() {
  return (
    <>
      {/* Video Background */}
      <div className="-z-10 h-full w-full">
        <VideoBackground />
      </div>

      {/* Leaderboards */}
      <div className="pt-20 pb-6 flex justify-center w-full">
        <div className="w-full max-w-5xl px-4 flex flex-row gap-4 items-start">

          <div className="w-fit">
            <GlobalLeaderboard />
          </div>

          <div className="w-fit flex flex-col gap-4">
            <div className="">
              <CompletionTable />
            </div>

            <div className="w-full">
              <PercentSavedLeaderboard />
            </div>
          </div>

        </div>
      </div>

    </>
  );
}