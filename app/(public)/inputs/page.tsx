"use client";

import { useState, useEffect } from "react";

const envs = ["STADIUM", "ISLAND", "COAST", "SNOW", "BAY"] as const
type Env = (typeof envs)[number];
type Trick = {
  env: Env;
  type: string;
  src: string;
};

/* =========================
   CLICK SOUND (SAFE GLOBAL)
========================= */
let clickAudio = null;

if (typeof window !== "undefined") {
  clickAudio = new Audio("/inputs/click.mp3");
  clickAudio.preload = "auto";
}

const playClick = () => {
  if (!clickAudio) return;

  try {
    clickAudio.currentTime = 0;
    clickAudio.volume = 0.6;
    clickAudio.play().catch(() => {});
  } catch (e) {}
};

/* =========================
   UNIVERSAL COPY SYSTEM
========================= */
const copyInputs = async (env: Env, index: number) => {
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
  { env: "STADIUM", type: "video", src: "/inputs/stadiumvideo.mp4" },

  { env: "ISLAND", type: "video", src: "/inputs/island1.mp4" },
  { env: "ISLAND", type: "video", src: "/inputs/island2.mp4" },
  { env: "ISLAND", type: "video", src: "/inputs/island3.mp4" },
  { env: "ISLAND", type: "video", src: "/inputs/island4.mp4" },

  { env: "COAST", type: "video", src: "/inputs/coast1.mp4" },
  { env: "COAST", type: "video", src: "/inputs/coast2.mp4" },
  { env: "COAST", type: "video", src: "/inputs/coast3.mp4" },

  { env: "SNOW", type: "video", src: "/inputs/snowvideo.mp4" },

  { env: "BAY", type: "video", src: "/inputs/bayvideo.mp4" },
];

const grouped = tricks.reduce<Record<Env, Trick[]>>(
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
function EnvBar({ label }: { label: Env }) {
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
  const [activeEnv, setActiveEnv] = useState<Env>("STADIUM");

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
        className="fixed inset-0 bg-center bg-no-repeat bg-cover pointer-events-none"
        style={{ backgroundImage: "url('/wallpapers/WP1.png')" }}
      />

      {/* OVERLAY */}
      <div className="fixed inset-0 bg-[#070816]/70 pointer-events-none" />

      {/* LEFT MENU */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
        {envs.map((env) => (
          <button
            key={env}
            onClick={() => setActiveEnv(env as Env)}
            className={`p-2 rounded-xl border transition-all duration-200
              ${
                activeEnv === env
                  ? "border-cyan-300 bg-cyan-400/20 scale-110"
                  : "border-cyan-400/20 hover:bg-cyan-400/10"
              }`}
          >
            <img
              src={`/environments/${env.toLowerCase()}.webp`}
              alt={env}
              className="w-10 h-10 object-contain"
            />
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl p-6 space-y-10">

        <div className="relative overflow-hidden rounded-[32px] border border-cyan-400/20 bg-gradient-to-br from-[#10142c] to-[#1b1040] p-10 shadow-[0_0_50px_rgba(0,255,255,0.08)]">
          <div className="text-center">
            <h1 className="text-6xl font-black uppercase tracking-widest text-white">
              Inputs
            </h1>
            <p className="mt-4 mx-auto max-w-xl text-lg text-slate-300">
              test uwu
            </p>
          </div>
        </div>

        <div className="space-y-12">

          <EnvBar label={activeEnv} />

          {(grouped[activeEnv] || []).map((trick, index) => (
            <div
              key={trick.src}
              className="relative overflow-hidden rounded-[32px] border border-cyan-400/20 bg-gradient-to-br from-[#11152d] to-[#190f3d] shadow-[0_0_40px_rgba(0,0,0,0.6)]"
            >

              {/* BACKGROUND */}
              <div className="absolute inset-0 opacity-80">
                {activeEnv === "ISLAND" || activeEnv === "COAST" ? (
                  <img
                    src="/inputs/staticwallaper.png"
                    className="h-full w-full object-cover brightness-110 contrast-110"
                    alt=""
                  />
                ) : (
                  <video
                    className="h-full w-full object-cover brightness-125 contrast-110"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  >
                    <source src="/inputs/background.mp4" type="video/mp4" />
                  </video>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-[#070816] via-[#070816dd] to-transparent" />

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
                      <source src={trick.src} type="video/mp4" />
                    </video>
                  </div>

                  {/* BUTTONS (UNIVERSAL SYSTEM) */}
                  {activeEnv === "STADIUM" && index === 0 && (
                    <div className="flex justify-center gap-6">
                      <button
                        onClick={() => copyInputs("STADIUM", 0)}
                        className="px-3 py-1 text-xs tracking-[0.3em] uppercase text-cyan-200 border border-cyan-400/20 bg-black/40 hover:bg-cyan-400/10 transition"
                      >
                        Left
                      </button>

                      <button
                        onClick={() => copyInputs("STADIUM", 1)}
                        className="px-3 py-1 text-xs tracking-[0.3em] uppercase text-cyan-200 border border-cyan-400/20 bg-black/40 hover:bg-cyan-400/10 transition"
                      >
                        Right
                      </button>
                    </div>
                  )}

                  {activeEnv === "ISLAND" && (
                    <button
                      onClick={() => copyInputs("ISLAND", index)}
                      className="w-full px-3 py-2 text-xs tracking-[0.3em] uppercase text-cyan-200 border border-cyan-400/20 bg-black/40 hover:bg-cyan-400/10 transition"
                    >
                      Inputs {index + 1}
                    </button>
                  )}

                  {activeEnv === "COAST" && (
                    <button
                      onClick={() => copyInputs("COAST", index)}
                      className="w-full px-3 py-2 text-xs tracking-[0.3em] uppercase text-cyan-200 border border-cyan-400/20 bg-black/40 hover:bg-cyan-400/10 transition"
                    >
                      Inputs {index + 1}
                    </button>
                  )}

                  {activeEnv === "SNOW" && index === 0 && (
                    <button
                      onClick={() => copyInputs("SNOW", index)}
                      className="w-full px-3 py-2 text-xs tracking-[0.3em] uppercase text-cyan-200 border border-cyan-400/20 bg-black/40 hover:bg-cyan-400/10 transition"
                    >
                      Inputs
                    </button>
                  )}

                  {activeEnv === "BAY" && index === 0 && (
                    <button
                      onClick={() => copyInputs("BAY", index)}
                      className="w-full px-3 py-2 text-xs tracking-[0.3em] uppercase text-cyan-200 border border-cyan-400/20 bg-black/40 hover:bg-cyan-400/10 transition"
                    >
                      Inputs
                    </button>
                  )}

                </div>

                {/* STADIUM IMAGE */}
                {activeEnv === "STADIUM" && index === 0 && (
                  <div className="border border-cyan-400/20 overflow-hidden bg-[#0b1020]">
                    <img
                      src="/inputs/stadiumtrick.png"
                      className="w-full h-auto object-contain"
                      alt=""
                    />
                  </div>
                )}

              </div>

              <div className="absolute right-0 top-0 h-40 w-40 bg-pink-500/10 blur-3xl" />
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}