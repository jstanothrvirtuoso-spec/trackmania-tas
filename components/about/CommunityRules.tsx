
import { useState, useRef, useEffect } from "react";

const text = `Players who break rules 1, 2 or 5 will have their records removed!`;
const chars = text.split("");

export function CommunityRules() {

  const [fadedIndices, setFadedIndices] = useState<number[]>([]);
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const proximityAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 4) + 2;
      const indices: number[] = [];

      while (indices.length < count) {
        const i = Math.floor(Math.random() * chars.length);
        if (chars[i] !== " " && !indices.includes(i)) indices.push(i);
      }

      setFadedIndices(indices);
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const audio = new Audio("/sounds/load.mp3");
    audio.volume = 0.6;

    hoverAudioRef.current = audio;

    return () => {
      audio.pause();
      hoverAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = new Audio("/sounds/ElectHum.mp3");
    audio.loop = true;
    audio.volume = 0;

    proximityAudioRef.current = audio;

    return () => {
      audio.pause();
      proximityAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      const audio = proximityAudioRef.current;
      if (!el || !audio) return;

      const rect = el.getBoundingClientRect();

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const dist = Math.sqrt(dx * dx + dy * dy);

      const maxDistance = 400;

      let volume = 1 - dist / maxDistance;
      volume = Math.max(0, Math.min(1, volume));

      audio.volume = volume;

      if (volume > 0 && audio.paused) {
        audio.play().catch(() => {});
      }

      if (volume === 0 && !audio.paused) {
        audio.pause();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div>

      <div
        className="relative group"
        onMouseEnter={() => {
          if (!hoverAudioRef.current) return;
          hoverAudioRef.current.currentTime = 0;
          hoverAudioRef.current.play().catch(() => {});
        }}
      >
        {/* Main text */}
        <h1
          ref={containerRef}
          className="vga-text select-none text-center text-2xl font-black uppercase tracking-[0.2em]"
        >
          {chars.map((char, i) => (
            <span
              key={i}
              style={{
                opacity: fadedIndices.includes(i) ? 0.2 : 1,
                transition: "opacity 0.08s steps(2,end)"
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Hover popup */}
        <div
          className="pointer-events-none absolute left-1/2 bottom-full mb-6 -translate-x-1/2
          opacity-0 translate-y-2 transition-all duration-150
          group-hover:opacity-100 group-hover:translate-y-0 z-20"
        >
          <div
          className="px-4 py-3 text-xs text-pink-100 max-w-md relative overflow-hidden
          bg-gradient-to-br from-[#0b0508] via-[#160a12] to-[#070308]
          border border-pink-200/20
          shadow-[0_0_30px_rgba(255,182,193,0.10),inset_0_0_25px_rgba(255,182,193,0.05)]
          backdrop-blur-md"
          >
            <div className="relative z-10 space-y-2">

              {/* Header bar */}
              <div className="flex items-center justify-center border-b border-pink-200/10 pb-2 mb-2">
                <span className="text-[10px] tracking-[0.3em] text-pink-200/80 uppercase text-center">
                  Community rules
                </span>
              </div>

              {/* Sakura particles layer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="sakura-flake" />
                <div className="sakura-flake delay-1" />
                <div className="sakura-flake delay-2" />
              </div>

              {/* Rules */}
              <div className="relative z-10">
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
          </div>
        </div>
      </div>

      {/* ================= STYLE ================= */}
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
    </div>
  )
}
