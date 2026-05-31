"use client";

import Image from "next/image";
import Rain from "./rain";
import { useEffect, useRef, useState } from "react";
import { HallOfFame } from "./HallOfFame";
import { BadgeTable } from "./BadgeTable";
import { Maintainers } from "./Maintainers";

const text = `Players who break rules 1, 2 or 5 will have their records removed!`;
const chars = text.split("");
const words = text.split(" ");

export default function Page() {

  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ---------------------------
  // STATES
  // ---------------------------
  const [glitchedWords, setGlitchedWords] = useState<number[]>([]);
  const [fadedIndices, setFadedIndices] = useState<number[]>([]);

  // ---------------------------
  // LETTER FLICKER SYSTEM (FIXED + KEPT)
  // ---------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 4) + 2;
      const indices: number[] = [];

      while (indices.length < count) {
        const i = Math.floor(Math.random() * chars.length);
        if (chars[i] !== " " && !indices.includes(i)) {
          indices.push(i);
        }
      }

      setFadedIndices(indices);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // WORD GLITCH SYSTEM (FIXED CLEANLY)
  // ---------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      const indices: number[] = [];

      while (indices.length < count) {
        const i = Math.floor(Math.random() * words.length);
        if (!indices.includes(i)) indices.push(i);
      }

      setGlitchedWords(indices);

      const timeout = setTimeout(() => {
        setGlitchedWords([]);
      }, 120);

      return () => clearTimeout(timeout);
    }, 180);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // AUDIO + DISTANCE FIELD (UNCHANGED)
  // ---------------------------
  useEffect(() => {
    const audio = new Audio("/sounds/ElectHum.mp3");
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    let unlocked = false;

    const tryUnlock = async () => {
      if (unlocked) return;
      unlocked = true;

      try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
      } catch {}

      window.removeEventListener("mousemove", tryUnlock);
      window.removeEventListener("pointerdown", tryUnlock);
    };

    const safeInit = () => {
      audio.load();
    };

    safeInit();

    window.addEventListener("mousemove", tryUnlock, { once: true });
    window.addEventListener("pointerdown", tryUnlock, { once: true });

    const handleMove = (e: MouseEvent) => {
      const el = containerRef.current;
      const audio = audioRef.current;

      if (!el || !audio || !unlocked) return;

      const rect = el.getBoundingClientRect();

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

      const maxDistance = 320;

      let targetVolume = 1 - dist / maxDistance;
      targetVolume = Math.max(0, Math.min(1, targetVolume));

      audio.volume += (targetVolume - audio.volume) * 0.12;

      if (targetVolume > 0.02 && audio.paused) {
        audio.play().catch(() => {});
      }

      if (targetVolume <= 0.02 && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("pointerdown", tryUnlock);
      audio.pause();
    };
  }, []);

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden pt-12">
      
      {/* Rain sound effect */}
      <Rain />

      {/* Background image */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/wallpapers/vide.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* TOP BOX WRAPPER */}
      <div className="relative z-10 w-full flex justify-center pt-10">
        <div className="w-full flex flex-row items-start justify-center gap-6 px-6">

          {/* 🏆 HALL OF FAME (LEFT SIDE) */}
          <HallOfFame />

          {/* ⭐ CENTER BOX */}
          <div className="relative w-[900px] shrink-0 p-6 py-3
            bg-black/50 backdrop-blur-md border border-white/10
            shadow-[0_0_18px_rgba(0,0,0,0.6),inset_0_0_25px_rgba(255,255,255,0.03)]">

            {/* Japanese corner frame */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-red-400/30" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-red-400/30" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-red-400/30" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-red-400/30" />
            </div>

            {/* Paper glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />

            <div className="flex flex-col items-start">
              
              {/* Welcome */}
              <div className="w-full flex justify-center pointer-events-none">
                <p className="text-[19px] md:text-[22px] tracking-[0.6em] text-gray-0 sakura-font">
                  🌸 Welcome to the about page 🌸
                </p>
              </div>

              <div className="flex flex-row gap-6 w-full">
                {/* Maintainers Table */}
                <Maintainers/>

                {/* Badge Table */}
                <BadgeTable/>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TEXT */}
      <div className="flex flex-1 items-end justify-center pb-10">
        <div className="relative group">

          {/* Hover popup */}
          <div className="pointer-events-none absolute left-1/2 bottom-full mb-6 -translate-x-1/2
              opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100
              group-hover:translate-y-0 z-20"
          >
            <div className="border border-red-500/60 bg-black/90 px-4 py-3 text-xs text-red-300 shadow-[0_0_20px_rgba(255,0,0,0.3)] whitespace-normal max-w-md">

              <div>
                <strong>1.</strong> Stay civil and sane while discussing any topic. Do not overhype.
              </div>

              <div className="mt-2">
                <strong>2.</strong> Respect everyone in this server and do not attack each other for their opinions. This server is not a place for resolving personal matters.
              </div>

              <div className="mt-2">
                <strong>5.</strong> We do not condone any forms of unfair play or cheating. Players who attempt to pass tool-assisted runs as legitimate or upload them to sites such as TMX will be immediately banned from the server.
              </div>

            </div>
          </div>

          {/* MAIN TEXT */}
          <h1
            ref={containerRef}
            data-text={text}
            className="vga-text relative z-10 select-none text-center text-2xl font-black uppercase tracking-[0.2em] leading-snug whitespace-pre-line"
          >
            {chars.map((char, i) => (
              <span
                key={i}
                style={{
                  opacity: fadedIndices.includes(i) ? 0.2 : 1,
                  transition: "opacity 0.4s ease",
                }}
              >
                {char}
              </span>
            ))}
          </h1>

        </div>
      </div>

      <style>{`
        @font-face {
          font-family: "DOSVGA";
          src: url("/fonts/DOSVGA.ttf") format("truetype");
        }

        .vga-text {
          font-family: "DOSVGA", monospace;
          color: rgb(220, 30, 30);
          text-shadow:
            0 0 6px rgba(120, 0, 0, 0.9),
            0 0 14px rgba(120, 0, 0, 0.7),
            0 0 28px rgba(80, 0, 0, 0.5),
            3px 3px 0 rgb(0, 0, 0);
          animation: electricFlicker 0.08s infinite;
        }

        @keyframes electricFlicker {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `}</style>

      <div className="crt-overlay" />
    </main>
    
  );
}
