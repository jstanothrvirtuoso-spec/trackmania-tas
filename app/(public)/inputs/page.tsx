"use client";

import Image from "next/image";
import { soundManager } from "@/lib/SoundManager";
import { useState, useEffect, useRef } from "react";

const ENVIRONMENTS = ["STADIUM", "ISLAND", "COAST", "SNOW", "BAY"] as const;
type Environment = (typeof ENVIRONMENTS)[number];
type Trick = {
  src: string;
  button: string[];
  inputs: string[];
  notes: string[];
};

const copyInputs = async (input: string) => {
  const res = await fetch(`/inputs/inputs/${input}`);
  const text = await res.text();
  await navigator.clipboard.writeText(text);
  soundManager.play("click");
};

const tricks: Record<Environment, Trick[]> = {
  "STADIUM": [ 
    { src: "/inputs/videos/stadiumvideo.webm", button: ["Left", "Right"], inputs: ["stadiumleft.txt", "stadiumright.txt"], notes: ["Bruteforce using the settings above until you reach 208 km/h"]} ],
  "ISLAND": [
    { src: "/inputs/videos/island1.webm", button: ["Inputs 1"], inputs: ["islandtrick1.txt"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/videos/island2.webm", button: ["Inputs 2"], inputs: ["islandtrick2.txt"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/videos/island3.webm", button: ["Inputs 3"], inputs: ["islandtrick3.txt"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/videos/island4.webm", button: ["Inputs 4"], inputs: ["islandtrick4.txt"], notes: ["Bruteforce if the skip gear isn't working"]},
  ],
  "COAST": [
    { src: "/inputs/videos/coast1.webm", button: ["Inputs 1"], inputs: ["coasttrick1.txt"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/videos/coast2.webm", button: ["Inputs 2"], inputs: ["coasttrick2.txt"], notes: ["Bruteforce if the skip gear isn't working"]},
    { src: "/inputs/videos/coast3.webm", button: ["Inputs 3"], inputs: ["coasttrick3.txt"], notes: ["Bruteforce if the skip gear isn't working"]},
  ],
  "SNOW": [ { src: "/inputs/videos/snowvideo.webm", button: ["Inputs"], inputs: ["snowtrick.txt"], notes: ["No bruteforce needed!"]} ],
  "BAY": [ { src: "/inputs/videos/bayvideo.webm", button: ["Inputs"], inputs: ["baytrick.txt"], notes: ["I recommend you make your own start before using the trick", "Every start is different, so you cannot achieve the optimum result every time!"]} ],
};

const btnClass = `font-sakura relative px-4 py-2 text-xs uppercase text-sky-100 tracking-[0.12em] leading-none
  rounded-xl border border-white/10 bg-white/5 backdrop-blur-md 
  transition-all duration-300 cursor-pointer
  shadow-[0_0_10px_rgba(56,189,248,0.12)]
  hover:scale-[1.04] active:scale-[0.97] hover:text-pink-200 hover:border-pink-300/30
  hover:bg-gradient-to-br hover:from-pink-500/10 hover:via-gray-500/10 hover:to-transparent
  text-sm md:text-[15px] tracking-[0.14em] uppercase font-medium
  hover:shadow-[0_0_18px_rgba(236,72,153,0.25)]`;

function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points: { x: number; y: number; time: number }[] = [];
    const LIFETIME = 110;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    const onMove = (e: MouseEvent) => {
      points.push({
        x: e.clientX,
        y: e.clientY,
        time: performance.now(),
      });
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);

    let animationId: number;

    const render = () => {
      const now = performance.now();

      // remove old points
      for (let i = points.length - 1; i >= 0; i--) {
        if (now - points[i].time > LIFETIME) {
          points.splice(i, 1);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (points.length > 2) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < points.length - 1; i++) {
          const p0 = points[i - 1];
          const p1 = points[i];
          const p2 = points[i + 1];

          const age = now - p1.time;
          const life = Math.max(0, 1 - age / LIFETIME);

          const alpha = life * (i / points.length) * 0.8;

          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p1.x, p1.y, mx, my);

          ctx.strokeStyle = `rgba(80,240,255,${alpha})`;
          ctx.lineWidth = Math.max(1, alpha * 6);
          ctx.shadowBlur = 18;
          ctx.shadowColor = "#00d8ff";

          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

export default function InputsPage() {
  
  const [activeEnv, setActiveEnv] = useState<Environment>("STADIUM");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (input: string) => {
    await copyInputs(input);
    setCopied(input);
    setTimeout(() => setCopied(null), 700);
  };
  
  return (
    <div className="min-h-screen pt-16 relative overflow-hidden">
      <CursorTrail />

      {/* WALLPAPER */}
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-cover -z-20"
        style={{ backgroundImage: "url('/wallpapers/inputs-bg.webp')" }}
      />

      {/* DARKEN LAYER */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5" />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl space-y-7 sm:space-y-10 p-2 sm:p-6">

        {/* HEADER */}
        <div className="relative -translate-x-1">
          <Image
            src="/inputs/inputstxt.png"
            alt="Inputs"
            width={334}
            height={190}
            className="mx-auto min-w-40 max-w-[17vw] h-auto"
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
                src={`/inputs/backgrounds/${activeEnv.toLowerCase()}.webp`}
                alt={`${activeEnv} background`}
                fill
                sizes="80vw"
                priority
              />
              <div className="absolute inset-0 opacity-95 bg-gradient-to-r from-[#000404] via-[#070816dd] to-transparent"/>

              {/* INPUTS CARD */}
              <div className="relative z-10 grid gap-6 md:grid-cols-[420px_1fr] items-center p-4 sm:p-8">
                <div className="space-y-2 h-full flex flex-col justify-center">

                  {/* VIDEO */}
                  <div className="border border-cyan-400/20 bg-[#0b1020] overflow-hidden rounded-xl">
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
                    {trick.button.map((button, index) => {
                      const input = trick.inputs[index];
                      
                      return (
                        <button
                          key={button}
                          onClick={() => void handleCopy(input)}
                          className={`${btnClass} flex-1 relative overflow-hidden`}
                        >
                          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300
                            ${copied === input ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                          >
                            {button}
                          </span>

                          <span className={`flex items-center justify-center transition-all duration-300
                            ${copied === input ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                          >
                            Copied!
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* INSTRUCTIONS */}
                <div className="relative z-10 flex-col items-center hidden md:flex">
                  {activeEnv === "STADIUM" && (
                    <div className="overflow-hidden rounded-lg hidden md:flex">
                      <Image
                        src="/inputs/stadiumtrick.webp"
                        alt="Stadium trick instructions"
                        width={620}
                        height={400}
                        className="max-w-full w-auto h-auto"
                        style={{ width: "auto", height: "auto" }}
                      />
                    </div>
                  )}
                  <div
                    className={`font-teko italic tracking-wide text-slate-200 py-2 text-center [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)] ${
                      activeEnv === "BAY" ? "text-2xl" : "text-3xl"
                    }`}
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
