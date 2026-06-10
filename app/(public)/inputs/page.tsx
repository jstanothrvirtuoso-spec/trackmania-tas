"use client";

import Image from "next/image";
import { useState, useEffect } from "react";


const ENVIRONMENTS = ["STADIUM", "ISLAND", "COAST", "SNOW", "BAY"] as const
type Environment = (typeof ENVIRONMENTS)[number];
type Trick = {
  env: Environment;
  type: string;
  src: string;
  button: string;
};

/* =========================
   CLICK SOUND
========================= */
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

/* =========================
   UNIVERSAL COPY SYSTEM
========================= */
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

/* =========================
   DATA
========================= */
const tricks: Trick[] = [
  { env: "STADIUM", type: "video", src: "/inputs/stadiumvideo.m4v", button: "" },

  { env: "ISLAND", type: "video", src: "/inputs/island1.m4v", button: "Inputs 1" },
  { env: "ISLAND", type: "video", src: "/inputs/island2.m4v", button: "Inputs 2" },
  { env: "ISLAND", type: "video", src: "/inputs/island3.m4v", button: "Inputs 3" },
  { env: "ISLAND", type: "video", src: "/inputs/island4.m4v", button: "Inputs 4" },

  { env: "COAST", type: "video", src: "/inputs/coast1.m4v", button: "Inputs 1" },
  { env: "COAST", type: "video", src: "/inputs/coast2.m4v", button: "Inputs 2" },
  { env: "COAST", type: "video", src: "/inputs/coast3.m4v", button: "Inputs 3" },

  { env: "SNOW", type: "video", src: "/inputs/snowvideo.m4v", button: "Inputs" },

  { env: "BAY", type: "video", src: "/inputs/bayvideo.m4v", button: "Inputs" },
];

const trickNotes = {
  ISLAND: [
    "Bruteforce if the skip gear isn't working",
    "Bruteforce if the skip gear isn't working",
    "Bruteforce if the skip gear isn't working",
    "Bruteforce if the skip gear isn't working",
  ],

  COAST: [
    "Bruteforce if the skip gear isn't working",
    "Bruteforce if the skip gear isn't working",
    "Bruteforce if the skip gear isn't working",
  ],

  SNOW: [
    "No bruteforce needed!",
  ],

  BAY: [
  "I recommend you to make your own start before using the trick.\n  Every start are different, the inputs will never give the same result and so the start might be slow!",
  
],
};



const btnClass =
  "sakura-font relative px-4 py-2 text-xs uppercase text-sky-100 " +
  "tracking-[0.12em] leading-none " +
  "rounded-xl border border-white/10 bg-white/5 backdrop-blur-md " +
  "transition-all duration-300 cursor-pointer " +
  "shadow-[0_0_10px_rgba(56,189,248,0.12)] " +
  "hover:scale-[1.04] active:scale-[0.97] " +
  "hover:text-pink-200 " +
  "hover:border-pink-300/30 " +
  "hover:bg-gradient-to-br hover:from-pink-500/10 hover:via-gray-500/10 hover:to-transparent " +
  "text-sm md:text-[15px] tracking-[0.14em] uppercase font-medium";
  "hover:shadow-[0_0_18px_rgba(236,72,153,0.25)]";
  
const grouped = tricks.reduce<Record<Environment, Trick[]>>(
  (acc, t) => {
    acc[t.env].push(t);
    return acc;
  },
  {
    STADIUM: [],
    ISLAND: [],
    COAST: [],
    SNOW: [],
    BAY: [],
  }
);

/* =========================
   UI
========================= */
function EnvBar({ label }: { label: Environment }) {
  return (
    <div className="flex items-center gap-4 py-6">
      <div className="h-[2px] flex-1 bg-cyan-400/20" />
      <span className="text-xs font-bold tracking-[0.4em] text-cyan-200">
        {label}
      </span>
      <div className="h-[2px] flex-1 bg-cyan-400/20" />
    </div>
  );
}

/* =========================
   MAIN
========================= */
export default function InputsPage() {
  
  const [activeEnv, setActiveEnv] = useState<Environment>("STADIUM");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (env: Environment, i: number) => {
    await copyInputs(env, i);
    setCopied(`${env}-${i}`);
    setTimeout(() => setCopied(null), 700);
  };

  useEffect(() => {
    tricks.forEach((t) => {
      const video = document.createElement("video");
      video.src = t.src;
      video.preload = "auto";
    });
  }, []);

  return (
    <div className="min-h-screen pt-16 relative overflow-hidden">

     {/* WALLPAPER */}
<div
  className="fixed inset-0 bg-center bg-no-repeat bg-cover -z-20"
  style={{ backgroundImage: "url('/wallpapers/WP1.jpg')" }}
/>

{/* DARKEN LAYER */}
<div className="fixed inset-0 bg-black/10 pointer-events-none" />

     <div className="fixed inset-0 pointer-events-none overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5" />


</div>

      {/* LEFT MENU */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
        {ENVIRONMENTS.map((env) => (
          <button
            key={env}
            onClick={() => setActiveEnv(env)}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer
              ${
                activeEnv === env
                  ? "border-cyan-300 bg-cyan-400/20 scale-110"
                  : "border-cyan-400/20 hover:bg-cyan-400/10"
              }`}
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



      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl p-6 space-y-10">


{/* HEADER */}
<div className="relative p-0">
  <div className="text-center">
    <img
      src="/inputs/inputstxt.png"
      alt="Inputs"
      className="mx-auto h-40 w-auto"
    />
  </div>
</div>

        <div className="space-y-12">

          <EnvBar label={activeEnv} />

          {(grouped[activeEnv] || []).map((trick, index) => (
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


              <div className="absolute inset-0 bg-gradient-to-r from-[#000404] via-[#070816dd] to-transparent"/>

              <div className="relative z-10 grid gap-6 p-8 md:grid-cols-[420px_1fr] items-center">

                <div className="space-y-2">

                  {/* VIDEO */}
                  <div className="border border-cyan-400/20 bg-[#0b1020] overflow-hidden">
                    <video
                      className="h-[260px] w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    >
                      <source src={trick.src} type="video/mp4"/>
                    </video>
                  </div>

                  {/* INPUTS */}
                  {activeEnv === "STADIUM" && index === 0 ? (
                    <div className="w-full flex gap-2">
                      {["Left", "Right"].map((label, i) => (
                        <button
                          key={label}
                          onClick={() => void handleCopy("STADIUM", i)}
                          className={`${btnClass} flex-1 py-1 text-center relative overflow-hidden`}
                        >
                          <span
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-300
                              ${copied === `STADIUM-${i}` ? "opacity-0 scale-95" : "opacity-100 scale-100"} ${i === 0 ? "translate-x-[3px]" : ""}`}
                          >
                            {label}
                          </span>
                          <span
                            className={`flex items-center justify-center transition-all duration-300
                              ${copied === `STADIUM-${i}` ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                          >
                            Copied!
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => void handleCopy(activeEnv, index)}
                      className={`${btnClass} w-full relative overflow-hidden`}
                    >
                      <span
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300
                          ${copied === `${activeEnv}-${index}` ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                      >
                        {trick.button}
                      </span>
                      <span
                        className={`flex items-center justify-center transition-all duration-300
                          ${copied === `${activeEnv}-${index}` ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                      >
                        Copied!
                      </span>
                    </button>
                  )}
                </div>

                {/* RIGHT PANEL */}
                <div className="relative z-10 flex justify-center">
  {activeEnv === "STADIUM" ? (
    <Image
      src="/inputs/stadiumtrick.png"
      alt="Stadium trick instructions"
      width={750}
      height={0}
    />
  ) : (
    <>
    

     <p
  className={`whitespace-pre-line italic tracking-wide teko-font text-slate-200 leading-loose ${
    activeEnv === "BAY" ? "text-lg" : "text-2xl"
  }`}
>
  {trickNotes[activeEnv]?.[index] ?? "No notes available."}
</p>
    </>
  )}
</div>
</div>

             

              <div className="absolute right-0 top-0 h-40 w-40 bg-pink-500/10 blur-3xl" />
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}