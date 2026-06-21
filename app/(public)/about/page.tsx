"use client";

import Image from "next/image";
import Rain from "@/components/about/Rain1";
import { HallOfFame } from "@/components/about/HallOfFame";
import { BadgeTable } from "@/components/about/BadgeTable";
import { Maintainers } from "@/components/about/Maintainers";
import { CommunityRules } from "@/components/about/CommunityRules";
import { CategoryTable } from "@/components/about/CategoryTable";

export default function Page() {

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden">

      <Rain />

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="/wallpapers/about-bg.webp"
          alt=""
          fill
          className="object-cover scale-[1.01]"
          priority
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/20 via-white/5 to-black/50 backdrop-blur-sm" />
      <div className="window-reflection absolute inset-0 z-0 opacity-70" />

      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="water water-1" />
        <div className="water water-2" />
      </div>

      {/* ================= TOP LAYOUT ================= */}
      <div className="relative z-10 flex flex-col xl:flex-row mt-20 gap-5 px-6 items-center xl:items-start">

        {/* HALL OF FAME (Large screen) */}
        <div className="justify-center hidden xl:flex">
          <HallOfFame />
        </div>

        {/* CENTER BOX */}
        <div className="relative w-auto overflow-hidden rounded-xl py-4 px-3 sm:px-6 sm:py-6
          border border-white/10 bg-white/5 backdrop-blur-2xl
          shadow-[0_20px_60px_rgba(0,0,0,0.35)]">

          {/* SOFT GLOBAL REFLECTION (VERY SUBTLE) */}
          <div className="absolute inset-0 pointer-events-none
            bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-60" />

          {/* SINGLE GLASS HIGHLIGHT (THE KEY) */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px]
            bg-white/10 blur-3xl rotate-12 pointer-events-none" />

          {/* EDGE LIGHT (SIMULATES THICK GLASS) */}
          <div className="absolute inset-0 pointer-events-none
            shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.25)]" />

          {/* CONTENT */}
          <div className="relative z-10 flex flex-col gap-4">

            {/* Tables */}
            <div className="flex flex-col justify-center gap-6 items-center lg:items-start lg:flex-row">
              <div className="flex flex-col gap-6 items-center">
                <Maintainers />
                <CategoryTable />
              </div>
              <div className="flex flex-col gap-6 items-start">
                {/* TOP RIGHT LINKS */}
                <div className="w-full flex justify-center">
                  <div className="
                    flex flex-col gap-2
                    rounded-xl
                    bg-white/5
                    backdrop-blur-xl
                    border border-white/10
                    px-3 py-2
                    shadow-[0_10px_30px_rgba(0,0,0,0.25)]
                  ">

                    {/* TITLE */}
                    <p className="
                      text-[10px]
                      tracking-[0.35em]
                      text-white/40
                      uppercase
                      mb-1
                    ">
                      Resources
                    </p>

                    <div className="w-full flex justify-end mb-3">
                      <div className="
                        flex items-center gap-4
                        rounded-xl
                        bg-white/5
                        backdrop-blur-xl
                        border border-white/10
                        px-3 py-2
                        shadow-[0_10px_30px_rgba(0,0,0,0.25)]
                      ">

                        {/* TMI */}
                        <a href="https://donadigo.com/tminterface/" className="flex items-center gap-2 group">
                          <img src="/icons/tmi.webp" className="w-5 h-5 group-hover:scale-110 transition" />
                          <span className="text-[11px] text-pink-200/70">TMInterface</span>
                        </a>

                        {/* DRIVE */}
                        <a href="https://drive.google.com/drive/folders/1x7QYhnQ6svwAdPMW3qGxMGCcVECNCVxU" className="flex items-center gap-2 group">
                          <img src="/icons/google-drive.webp" className="w-5 h-5 group-hover:scale-110 transition" />
                          <span className="text-[11px] text-white/50">Replays</span>
                        </a>

                        {/* DOCS */}
                        <a href="https://docs.google.com/document/d/1iXvjL-ZqHgD6Xk4_NgKsWOl-o1f-0KKsnD3NeTEqsAI/edit" className="flex items-center gap-2 group">
                          <img src="/icons/google-docs.webp" className="w-5 h-5 group-hover:scale-110 transition" />
                          <span className="text-[11px] text-white/50">Tutorial</span>
                        </a>

                      </div>
                    </div>

                  </div>
                </div>

                <BadgeTable />
              </div>
            </div>

          </div>
          
        </div>

        {/* HALL OF FAME (Small screen) */}
        <div className="justify-center flex xl:hidden">
          <HallOfFame />
        </div>

      </div>

      <div className="flex flex-1 items-end justify-center pb-10 pt-5 px-3">
        <CommunityRules />
      </div>
    </main>
  );
}
