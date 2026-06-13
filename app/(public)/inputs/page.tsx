"use client";

import Image from "next/image";
import { useState } from "react";

const ENVIRONMENTS = ["STADIUM", "ISLAND", "COAST", "SNOW", "BAY"] as const
type Environment = (typeof ENVIRONMENTS)[number];
type Trick = {
  src: string;
  button: string[];
  notes: string[];
};

const getClickAudio = (() => {
  let audio: HTMLAudioElement | null = null;

  return () => {
    if (!audio && typeof window !== "undefined") {
      audio = new Audio("/inputs/click.mp3");
      audio.preload = "auto";
    }

    return audio;
  };
})();

const playClick = () => {
  const audio = getClickAudio();
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch {}
};

const copyInputs = async (env: Environment, index: number) => {
  const fileMap = {
    STADIUM: {
      left: "/inputs/Stadium-Left.txt",
      right: "/inputs/Stadium-Right.txt",
    },
    COAST: (i: number) => `/inputs/coasttrick${i}.txt`,
    ISLAND: (i: number) => `/inputs/islandtrick${i}.txt`,
    SNOW: () => `/inputs/snowtrick.txt`,
    BAY: () => `/inputs/baytrick.txt`,
  };

  let path = "";

  if (env === "STADIUM") {
    path = index === 0 ? fileMap.STADIUM.left : fileMap.STADIUM.right;
  } else if (env === "COAST") {
    path = fileMap.COAST(index + 1);
  } else if (env === "ISLAND") {
    path = fileMap.ISLAND(index + 1);
  } else if (env === "SNOW") {
    path = fileMap.SNOW();
  } else if (env === "BAY") {
    path = fileMap.BAY();
  }

  if (!path) return;

  const res = await fetch(path);
  const text = await res.text();
  await navigator.clipboard.writeText(text);
  playClick();
};

const tricks: Record<Environment, Trick[]> = {
  "STADIUM": [ { src: "/inputs/stadiumvideo.m4v", button: ["Left", "Right"], notes: ["Bruteforce using the settings above until you reach 208 km/h"]} ],
  "ISLAND": [
    { src: "/inputs/island1.m4v", button: ["Inputs 1"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/island2.m4v", button: ["Inputs 2"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/island3.m4v", button: ["Inputs 3"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/island4.m4v", button: ["Inputs 4"], notes: ["Bruteforce if the skip gear isn't working"]},
  ],
  "COAST": [
    { src: "/inputs/coast1.m4v", button: ["Inputs 1"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/coast2.m4v", button: ["Inputs 2"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/coast3.m4v", button: ["Inputs 3"], notes: ["Bruteforce if the skip gear isn't working"]},
  ],
  "SNOW": [ { src: "/inputs/snowvideo.m4v", button: ["Inputs"], notes: ["No bruteforce needed!"]} ],
  "BAY": [ { src: "/inputs/bayvideo.m4v", button: ["Inputs"], notes: [ "I recommend you make your own start before using the trick", "Every start is different, so you cannot achieve the optimum result every time!"]} ],
};

const btnClass = `sakura-font relative px-4 py-2 text-xs uppercase text-sky-100 tracking-[0.12em] leading-none
  rounded-xl border border-white/10 bg-white/5 backdrop-blur-md 
  transition-all duration-300 cursor-pointer
  shadow-[0_0_10px_rgba(56,189,248,0.12)]
  hover:scale-[1.04] active:scale-[0.97] hover:text-pink-200 hover:border-pink-300/30
  hover:bg-gradient-to-br hover:from-pink-500/10 hover:via-gray-500/10 hover:to-transparent
  text-sm md:text-[15px] tracking-[0.14em] uppercase font-medium
  hover:shadow-[0_0_18px_rgba(236,72,153,0.25)]`;

export default function InputsPage() {
  
  const [activeEnv, setActiveEnv] = useState<Environment>("STADIUM");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (env: Environment, i: number) => {
    await copyInputs(env, i);
    setCopied(`${env}-${i}`);
    setTimeout(() => setCopied(null), 700);
  };

  return (
    <div className="min-h-screen pt-16 relative overflow-hidden">

      {/* WALLPAPER */}
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-cover -z-20"
        style={{ backgroundImage: "url('/wallpapers/WP1.jpg')" }}
      />

      {/* DARKEN LAYER */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5" />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl p-6 space-y-10 flex flex-col items-center justify-center">

        {/* HEADER */}
        <div className="relative -translate-x-1">
          <Image
            src="/inputs/inputstxt.png"
            alt="Inputs"
            width={250}
            height={150}
          />
        </div>

        {/* ENVIRONMENTS */}
        <div className="relative z-30 flex flex-row gap-4 justify-center xl:fixed xl:left-6 xl:top-1/2 xl:-translate-y-1/2 xl:flex-col">
          {ENVIRONMENTS.map((env) => (
            <button
              key={env}
              onClick={() => setActiveEnv(env)}
              className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer
                ${activeEnv === env ? "border-cyan-300 bg-cyan-400/20 scale-110" : "border-cyan-400/20 hover:bg-cyan-400/10"}`}
            >
              <Image
                src={`/environments/${env.toLowerCase()}.webp`}
                alt={env}
                width={50}
                height={50}
              />
            </button>
          ))}
        </div>
        
        {/* INPUTS */}
        <div className="space-y-10">

          {/* ENVIRONMENT TITLE */}
          <div className="flex items-center gap-4 py-1">
            <div className="h-[3px] flex-1 bg-cyan-400/40" />
            <span className="font-bold tracking-[0.4em] text-cyan-200 pl-[0.4em] text-sm xl:text-lg">
              {activeEnv}
            </span>
            <div className="h-[3px] flex-1 bg-cyan-400/40" />
          </div>

          {/* INPUTS CARD */}
          {tricks[activeEnv].map((trick) => (
            <div
              key={trick.src}
              className="relative overflow-hidden rounded-[12px] border border-cyan-400/20 bg-gradient-to-br from-[#11152d] to-[#190f3d] shadow-[0_0_40px_rgba(0,0,0,0.3)]"
            >
              {/* BACKGROUND */}
              <Image
                src={`/inputs/${activeEnv.toLowerCase()}.png`}
                alt={`${activeEnv} background`}
                fill
                priority
              />
              <div className="absolute inset-0 opacity-95 bg-gradient-to-r from-[#000404] via-[#070816dd] to-transparent"/>

              {/* INPUTS CARD */}
              <div className="relative z-10 grid gap-6 p-4 md:p-8 md:grid-cols-[420px_1fr] items-center">
                <div className="space-y-2 h-full flex flex-col justify-center">

                  {/* VIDEO */}
                  <div className="border border-cyan-400/20 bg-[#0b1020] shadow-lg overflow-hidden rounded-xl">
                    <video
                      className="w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    >
                      <source src={trick.src} type="video/mp4"/>
                    </video>
                  </div>

                  {/* COPY BUTTONS */}
                  <div className="flex gap-2">
                    {trick.button.map((label, buttonIndex) => (
                      <button
                        key={label}
                        onClick={() => void handleCopy(activeEnv, buttonIndex)}
                        className={`${btnClass} flex-1 relative overflow-hidden`}
                      >
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300
                          ${copied === `${activeEnv}-${buttonIndex}` ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                        >
                          {label}
                        </span>

                        <span className={`flex items-center justify-center transition-all duration-300
                          ${copied === `${activeEnv}-${buttonIndex}` ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                        >
                          Copied!
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* INSTRUCTIONS */}
                <div className="relative z-10 flex-col items-center hidden md:flex">
                  {activeEnv === "STADIUM" && (
                    <div className="overflow-hidden rounded-lg shadow-lg hidden md:flex">
                      <Image
                        src="/inputs/stadiumtrick.png"
                        alt="Stadium trick instructions"
                        width={650}
                        height={400}
                      />
                    </div>
                  )}
                  <div
                    className={`italic tracking-wide teko-font text-slate-200 py-2 text-center [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)] ${
                      activeEnv === "BAY" ? "text-2xl" : "text-3xl"
                    }`}
                    style={{ fontFamily: "Teko" }}
                  >
                    {trick.notes.map((note) => (
                      <div key={note}>
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-0 h-40 w-40 bg-pink-500/20 blur-3xl" />

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
