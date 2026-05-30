

"use client";

import Rain from "./rain";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Page() {
  const text = `Players who break rules 1, 2 or 5
will have their records removed!`;

  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ---------------------------
  // SPLITS (BOTH SYSTEMS KEPT)
  // ---------------------------
  const chars = useMemo(() => text.split(""), [text]);
  const words = useMemo(() => text.split(" "), [text]);

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
  }, [chars]);

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
  }, [words]);

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

    
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden ">
      <Rain />
      {/* background image */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/wallpapers/vide.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>


<h1
  ref={containerRef}
  className="vga-text relative z-10 select-none text-center text-2xl font-black uppercase tracking-[0.2em] leading-snug whitespace-pre-line"
>
  {words.map((word, i) => {
    const isGlitched = glitchedWords.includes(i);

    return (
      <span key={i} style={{ marginRight: "0.4em" }}>
        <span
          style={{
            color: isGlitched ? "#4a0000" : "rgb(220, 30, 30)",
            textShadow: isGlitched
              ? "0 0 2px rgba(40,0,0,0.8)"
              : "0 0 6px rgba(120, 0, 0, 0.9), 0 0 14px rgba(120, 0, 0, 0.7)",
            transition: "all 60ms linear",
          }}
        >
          {word}
        </span>
      </span>
    );
  })}
</h1>
      
{/* TOP BOX WRAPPER (FIXED LAYOUT) */}
<div className="relative z-10 w-full flex justify-center pt-10">
  <div className="w-full flex items-start justify-center gap-6 px-6">

   {/* 🏆 HALL OF FAME (LEFT SIDE) */}
<div className="relative w-[390px] p-4
bg-black/50 backdrop-blur-md
border border-white/10
shadow-[0_0_18px_rgba(0,0,0,0.6),inset_0_0_25px_rgba(255,255,255,0.03)]">
  
  {/* subtle paper glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />

  {/* red ink frame corners (Japanese UI signature) */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-red-400/40" />
    <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-red-400/40" />
    <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-red-400/40" />
    <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-red-400/40" />
  </div>

  

  <p className="relative text-xl uppercase tracking-[0.4em] text-yellow-300 text-center mb-3 sakura-font">
  Hall of Fame
</p>

  <div className="space-y-1 text-gray-300 text-sm">

  <div className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2">
    <span className="font-[OktaNeue] tracking-wide text-white">
      TMI Released
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">30/05/2021</span>
  </div>

  <div className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2">
    <span className="font-[OktaNeue] tracking-wide text-white">
      Noseboost Discovery
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">03/09/2021</span>
  </div>

  {/* Stadium Start Trick */}
  <a
    href="https://www.youtube.com/watch?v=7KLnucE2rdw&list=RD7KLnucE2rdw&start_radio=1&t=1s"
    target="_blank"
    className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2 hover:bg-white/10 transition"
  >
    <span className="font-[OktaNeue] tracking-wide text-white">
      Stadium Start Trick Discovery
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">03/02/2022</span>
  </a>

  {/* Island / Coast */}
  <a
    href="https://youtu.be/cASmgd3lQTM?si=agM-1h9dp3SssNP0"
    target="_blank"
    className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2 hover:bg-white/10 transition"
  >
    <span className="font-[OktaNeue] tracking-wide text-white">
      Island/Coast Start Trick Discovery
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">27/01/2023</span>
  </a>

  {/* TMNF Sub 60 */}
  <a
    href="https://www.youtube.com/watch?v=9maXH1a9vzk"
    target="_blank"
    className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2 hover:bg-white/10 transition"
  >
    <span className="font-[OktaNeue] tracking-wide text-white">
      TMNF Sub 60 Minutes Campaign
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">04/06/2023</span>
  </a>

  <div className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2">
    <span className="font-[OktaNeue] tracking-wide text-white">
      TMNF Sub 50 Minutes Campaign
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">17/05/2025</span>
  </div>

  <div className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2">
    <span className="font-[OktaNeue] tracking-wide text-white">
      1000 TASes Completed
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">09/07/2025</span>
  </div>

  <div className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2">
    <span className="font-[OktaNeue] tracking-wide text-white">
      TMNF 1 Hour Time Save
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">10/05/2026</span>
  </div>

  <div className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2">
    <span className="font-[OktaNeue] tracking-wide text-white">
      TMNF Sub 45 Minutes Campaign
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">???</span>
  </div>

  <div className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2">
    <span className="font-[OktaNeue] tracking-wide text-white">
      United Aftermovie
    </span>
    <span className="text-gray-400 text-xs whitespace-nowrap">???</span>
  </div>

</div>
</div>

   {/* ⭐ CENTER BOX */}
<div className="relative w-[900px] shrink-0 p-6 py-66
bg-black/50 backdrop-blur-md
border border-white/10
shadow-[0_0_18px_rgba(0,0,0,0.6),inset_0_0_25px_rgba(255,255,255,0.03)]">

  {/* paper glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />

{/* NEW CENTER BOX (GRID / TABLE STYLE UI WITH IMAGES) */}
<div className="absolute right-6 top-10 z-20">
    <div className="w-[520px]
      bg-black/60 backdrop-blur-md
      border border-red-500/20
      shadow-[0_0_30px_rgba(255,0,0,0.15)]
      text-xs text-red-100 font-mono">

    {/* HEADER */}
    <div className="text-center py-2 border-b border-red-500/20 tracking-[0.4em]">
      ACHIEVEMENT SPECIAL ROLES
    </div>

    {/* COLUMN HEADER */}
    <div className="grid grid-cols-4 text-center border-b border-red-500/20 py-2 text-red-300">
      <div>BADGE</div>
      <div>TASES</div>
      <div>CONTRIBUTION</div>
      <div>TIME SAVED</div>
    </div>

    {/* ROWS */}
    <div className="divide-y divide-red-500/10">

      <div className="grid grid-cols-4 items-center text-center py-2">
        <div className="flex justify-center">
          <img src="/medals/novice.png" className="h-6 w-6" />
        </div>
        <div>2</div><div>1.5</div><div>5 SEC</div>
      </div>

      <div className="grid grid-cols-4 items-center text-center py-2">
        <div className="flex justify-center">
          <img src="/medals/apprentice.png" className="h-6 w-6" />
        </div>
        <div>5</div><div>2.5</div><div>15 SEC</div>
      </div>

      <div className="grid grid-cols-4 items-center text-center py-2">
        <div className="flex justify-center">
          <img src="/medals/adept.png" className="h-6 w-6" />
        </div>
        <div>10</div><div>5</div><div>30 SEC</div>
      </div>

      <div className="grid grid-cols-4 items-center text-center py-2">
        <div className="flex justify-center">
          <img src="/medals/expert.png" className="h-6 w-6" />
        </div>
        <div>20</div><div>10</div><div>60 SEC</div>
      </div>

      <div className="grid grid-cols-4 items-center text-center py-2">
        <div className="flex justify-center">
          <img src="/medals/elite.png" className="h-6 w-6" />
        </div>
        <div>40</div><div>20</div><div>90 SEC</div>
      </div>

      <div className="grid grid-cols-4 items-center text-center py-2">
        <div className="flex justify-center">
          <img src="/medals/master.png" className="h-6 w-6" />
        </div>
        <div>60</div><div>40</div><div>2 MIN</div>
      </div>

      <div className="grid grid-cols-4 items-center text-center py-2">
        <div className="flex justify-center">
          <img src="/medals/legend.png" className="h-6 w-6" />
        </div>
        <div>80</div><div>70</div><div>4 MIN</div>
      </div>

      <div className="grid grid-cols-4 items-center text-center py-2">
        <div className="flex justify-center">
          <img src="/medals/mythic.png" className="h-6 w-6" />
        </div>
        <div>100</div><div>100</div><div>6 MIN</div>
      </div>

    </div>

    {/* FOOTER */}
    <div className="text-center py-2 border-t border-red-500/20 tracking-[0.3em]">
      HOW TO CLAIM BADGES
    </div>

  </div>
</div>

  {/* Japanese corner frame */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-red-400/30" />
    <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-red-400/30" />
    <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-red-400/30" />
    <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-red-400/30" />
  </div>

  {/* INNER BOX (still top-left, unchanged position) */}
  <div className="absolute top-4 left-4">
    <div className="inline-block relative
border border-white/10
bg-black/40 backdrop-blur-md
shadow-[inset_0_0_18px_rgba(255,255,255,0.03)]
p-2">

  <div className="pointer-events-none absolute inset-0">
  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-400/30" />
  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-red-400/30" />
  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-red-400/30" />
  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-400/30" />
</div>

      <p className="mb-3 text-sm tracking-[0.35em] text-center sakura-font pink-white-gradient">
        Hosted and maintained by :
      </p>

      <div className="flex items-start justify-center gap-10 w-full">

        {/* PERSON 1 */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gray-500 opacity-15 blur-md scale-110" />
            <div className="relative h-20 w-20 rounded-full overflow-hidden">
              <img src="/avatars/virtuoso.png" className="h-full w-full object-cover" />
            </div>
          </div>
          <p className="mt-2 text-base tracking-[0.25em] sakura-font swing-name text-white/90"
   style={{
     textShadow: `
       2px 2px 0 rgba(180, 40, 90, 0.85),
       3px 3px 0 rgba(120, 20, 60, 0.5)
     `
   }}>
  Virtuoso
</p>
        </div>

        {/* PERSON 2 */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-md scale-110" />
            <div className="relative h-20 w-20 rounded-full overflow-hidden">
              <img src="/avatars/kimura.png" className="h-full w-full object-cover" />
            </div>
            <img
              src="/avatars/catears.gif"
              className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-auto -translate-x-1/2 -translate-y-1/2 scale-150"
            />
          </div>
          <p className="mt-2 text-base tracking-[0.25em] sakura-font swing-name text-white/90"
   style={{
     textShadow: `
       2px 2px 0 hsla(187, 64%, 43%, 0.85),
       3px 3px 0 rgba(120, 20, 60, 0.5)
     `
   }}>
  Kimura
</p>
        </div>

      </div>
    </div>
  </div>

   {/* TITLE (NOW TRULY VISUALLY CENTERED) */}
  <div className="absolute top-4 left-34 w-full flex justify-center pointer-events-none">
  <p className="text-[19px] md:text-[22px] tracking-[0.6em] text-gray-0 sakura-font">
    🌸 Welcome to the about page 🌸
  </p>
</div>

  {/* invisible spacer to offset visual center */}
  <div className="pointer-events-none absolute top-0 left-0 h-full w-[360px]" />

</div>

</div>

    </div>







    {/* MAIN TEXT */}
<div className="flex flex-1 items-end justify-center pb-10">
  <div className="relative group">

    {/* Hover popup */}
    <div
  className="
    pointer-events-none
    absolute left-1/2 bottom-full mb-6
    -translate-x-1/2
    opacity-0
    translate-y-2
    transition-all duration-300
    group-hover:opacity-100
    group-hover:translate-y-0
    z-20
  "
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