"use client";

import Image from "next/image";
import Rain from "@/components/about/rain";
import { useEffect, useRef } from "react";
import { HallOfFame } from "@/components/about/HallOfFame";
import { BadgeTable } from "@/components/about/BadgeTable";
import { Maintainers } from "@/components/about/Maintainers";
import { CommunityRules } from "@/components/about/CommunityRules";
import { CategoryTable } from "@/components/about/CategoryTable";

export default function Page() {

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/sounds/Nature.mp3");
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;

    let unlocked = false;

    const unlock = async () => {
      if (unlocked) return;
      unlocked = true;
      try {
        await audio.play();
      } catch {}
      window.removeEventListener("pointerdown", unlock);
    };

    audio.play().catch(() => {});
    window.addEventListener("pointerdown", unlock);

    return () => {
      audio.pause();
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);
  
  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden pt-12">

      <Rain />

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/wallpapers/vide2.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/20 via-white/5 to-black/50 backdrop-blur-md" />
      <div className="window-reflection absolute inset-0 z-0 opacity-70" />

      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="water water-1" />
        <div className="water water-2" />
      </div>

      {/* ================= TOP LAYOUT ================= */}
      <div className="relative z-10 flex gap-6 pt-10 px-6 items-start">

        <HallOfFame />

        {/* CENTER BOX */}
        <div className="relative w-auto p-6 overflow-hidden rounded-xl
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

            {/* Header */}
            <div className="text-center pointer-events-none">
              <p className="text-[19px] tracking-[0.6em] sakura-font">
                🌸 Welcome to the about page 🌸
              </p>
            </div>

            {/* Tables */}
            <div className="flex flex-row justify-center gap-6 items-start">
              <div className="flex flex-col gap-6 items-center">
                <Maintainers />
                <CategoryTable />
              </div>
              <BadgeTable />
            </div>

          </div>
        </div>
      </div>

      <div className="flex flex-1 items-end justify-center pb-10">
        <CommunityRules />
      </div>
    </main>
  );
}