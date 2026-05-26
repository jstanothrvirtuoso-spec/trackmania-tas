"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function Page() {
  const text =
    "Players who break rules 1, 2, or 5 in will have their records removed!";

  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const chars = useMemo(() => text.split(""), [text]);
  const [fadedIndices, setFadedIndices] = useState<number[]>([]);

  // ---------------------------
  // RANDOM LETTER FADING
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
  // AUDIO + DISTANCE FIELD (CLEAN)
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

  // 👇 handles refresh edge cases
  const safeInit = () => {
    audio.load(); // forces browser to prepare audio buffer
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

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden">
  
  {/* background image */}
  <div className="absolute inset-0 -z-20">
    <img
      src="/wallpapers/islandtest.jpg"
      alt=""
      className="h-full w-full object-cover"
    />
  </div>

  {/* dark overlay for readability */}
  <div className="absolute inset-0 -z-10 bg-black/60" />

      {/* overlay */}
      <img
        src="/overlay.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />

      {/* scanlines */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_3px,rgba(255,255,255,0.05)_4px)]" />

      {/* TOP TEXT */}
      <div className="relative z-10 w-full text-center pt-20">
        <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-gray-400">
          Hosted and maintained by :
        </p>

        {/* OPERATORS */}
        <p className="mt-6 mb-4 text-xs uppercase tracking-[0.35em] text-gray-500">
          Work In Progress PAGE
        </p>

        <div className="flex justify-center gap-10">


         {/* PERSON 1 */}
<div className="flex flex-col items-center">
  <div className="relative">

    {/* very soft glow */}
    <div className="absolute inset-0 rounded-full bg-gray-500 opacity-15 blur-md scale-130" />

    {/* avatar */}
    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden">
      <img
        src="/avatars/virtuoso.png"
        alt="Operator A"
        className="h-full w-full object-cover"
      />
    </div>
  </div>

  <p className="mt-2 text-xs tracking-[0.2em] text-gray-400">
    Virtuoso
  </p>
</div>

{/* PERSON 2 */}
<div className="flex flex-col items-center">
  <div className="relative">

    {/* very soft glow */}
    <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-md scale-110" />

    {/* avatar */}
    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden">
      <img
        src="/avatars/kimura.png"
        alt="Operator B"
        className="h-full w-full object-cover"
      />
    </div>

    {/* cat ears */}
    <img
      src="/avatars/catears.gif"
      alt=""
      className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-auto -translate-x-1/2 -translate-y-[50%] scale-145"
    />
  </div>

  <p className="mt-2 text-xs tracking-[0.2em] text-gray-400">
    Kimura
  </p>
</div>

        </div>
      </div>

      {/* MAIN TEXT AREA */}
      <div className="flex flex-1 items-center justify-center">
        <h1
          ref={containerRef}
          className="vga-text relative z-10 select-none text-center text-2xl md:text-4xl font-black uppercase tracking-[0.2em] leading-snug"
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

      {/* styles */}
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
            3px 3px 0 rgba(0,0,0,0.7);

          animation: electricFlicker 0.29s infinite;
        }

        @keyframes electricFlicker {
          0%   { opacity: 1; }
          15%  { opacity: 0.9; }
          30%  { opacity: 1; }
          45%  { opacity: 0.8; }
          60%  { opacity: 1; }
          75%  { opacity: 0.7; }
          90%  { opacity: 1; }
          100% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}