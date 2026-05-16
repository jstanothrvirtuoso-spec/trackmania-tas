"use client";

import GlobalLeaderboard from "@/components/home/GlobalLeaderboard";
import VideoBackground from "@/components/home/VideoBackground";
import PercentSavedLeaderboard from "@/components/home/PercentSavedLeaderboard";

export default function Home() {
  return (
    <>
      {/* Video Background */}
      <div className="fixed inset-0 -z-10 h-full w-full">
        <VideoBackground />
      </div>

      <div className="flex justify-center">
        <div className="flex flex-row items-start gap-3">
          
          <div className="relative z-10 w-full max-w-xl">
            <GlobalLeaderboard />
          </div>

          <div className="relative z-10 w-full max-w-xl">
            <PercentSavedLeaderboard />
          </div>

        </div>
      </div>
    </>
  );
}