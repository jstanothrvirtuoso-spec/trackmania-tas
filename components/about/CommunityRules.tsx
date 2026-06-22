
import { soundManager } from "@/lib/SoundManager";
import { useState, useRef, useEffect } from "react";

const chars = `Users who break site rules may have their records removed!`.split("");

export function CommunityRules() {

  const [fadedIndices, setFadedIndices] = useState<number[]>([]);
  const containerRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const closestX = Math.max(rect.left, Math.min(e.clientX, rect.right));
      const closestY = Math.max(rect.top, Math.min(e.clientY, rect.bottom));
      const dx = e.clientX - closestX;
      const dy = e.clientY - closestY;
      const dist = Math.hypot(dx, dy);
      const maxDistance = 50;

      let volume = 1 - dist / maxDistance;
      volume = Math.max(0, Math.min(1, volume)) * 0.6;

      soundManager.play("electricHum");
      soundManager.setVolume("electricHum", volume);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
  
  return (
    <div>
      <div
        className="relative group"
        onMouseEnter={() => {
          soundManager.play("load");
        }}
      >
        {/* Main text */}
        <h1
          ref={containerRef}
          className="vga-text font-vga select-none text-center text-2xl font-black uppercase tracking-[0.2em]"
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
          group-hover:opacity-100 z-20"
        >
          <div
            className="px-4 py-3 text-xs text-pink-100 max-w-lg relative overflow-hidden
            bg-gradient-to-br from-[#0b0508] via-[#160a12] to-[#070308]
            border border-pink-200/20
            shadow-[0_0_30px_rgba(255,182,193,0.10),inset_0_0_25px_rgba(255,182,193,0.05)]
            backdrop-blur-md"
          >
            {/* Header bar */}
            <div className="flex items-center justify-center border-b border-pink-200/10 pb-2 mb-2">
              <span className="text-[10px] tracking-[0.3em] text-pink-200/80 uppercase text-center">
                Site rules
              </span>
            </div>

            {/* Sakura particles layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="sakura-flake flake-1" />
              <div className="sakura-flake flake-2" />
              <div className="sakura-flake flake-3" />
              <div className="sakura-flake flake-4" />
              <div className="sakura-flake flake-5" />
              <div className="sakura-flake flake-6" />
              <div className="sakura-flake flake-7" />
              <div className="sakura-flake flake-8" />
            </div>

            {/* Rules */}
            <div className="relative z-10">
              <div className="italic text-pink-200 text-[11px]">
                In addition to the following rules, all rules from the official discord page (TrackMania Tool Assisted) also apply here.
                Some are repeated here for clarity and emphasis.
              </div>

              <ol className="mt-2 list-decimal space-y-2 pl-3 text-pink-100">
                <li>
                  We take cheating very seriously. 
                  Users who intentionally attempt to represent tool-assisted runs as legitimate or upload them to sites such as TMX 
                  will be immediately banned from this site and have all their records permanently removed.
                </li>

                <li>
                  Respect everyone and do not attack each other for their opinions. 
                  This is not a place for resolving personal matters. Impersonating, trolling, harassing, 
                  insulting, threatening, doxing, or attacking other users is strictly forbidden.
                </li>

                <li>
                  All content (including replays) uploaded to this site must be appropriate. 
                  It must not contain NSFW, offensive, hateful, intentionally misleading, or illegal content. 
                  It must not contain links to inappropriate sites. 
                  Never provide personal details or information (phone numbers, addresses, etc.).
                </li>
                
                <li>
                  Moderators reserve the right to decide the category of each TAS
                  and whether a sufficient level of contribution qualifies for authorship status.
                  However, if any TAS record contains incorrect or outdated information, 
                  we encourage you to report it via the official Discord (link in the header).
                </li>

                <li>
                    Replay Rules:
                  <ul className="mt-1 ml-3 list-disc space-y-1 text-pink-200">
                    <li>
                      When uploading a TAS from another author, you must have their permission.
                    </li>

                    <li>
                      Replays must be driven on the genuine, unmodified version of the track.
                    </li>

                    <li>
                      Replays must be validable. Physics hacks, over-steering, 
                      modified game behaviour, etc. are not permitted.
                    </li>

                    <li>
                      Replay submissions must not contain intentionally falsified information.
                    </li>

                    <li>
                      Do not spam submissions.
                    </li>

                    <li>
                      Moderators can request additional evidence to verify submission details.
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STYLE ================= */}
      <style>{`
        .vga-text {
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
          50% { opacity: 0.85; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
