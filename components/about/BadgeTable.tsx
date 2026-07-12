
import { useState } from "react"
import { BadgeIcon } from "@/components/Icons"
import { BADGE_IMAGES, BADGE_RANKS } from "@/utils/constants"

export function BadgeTable() {


  const BADGE_THEMES = [
  { name: "Novice", color: "rgba(180,120,60,0.35)" },   // brown
  { name: "Apprentice", color: "rgba(192,192,192,0.35)" }, // silver
  { name: "Adept", color: "rgba(255,215,0,0.35)" },     // gold
  { name: "Expert", color: "rgba(59,130,246,0.35)" },   // blue
  { name: "Elite", color: "rgba(168,85,247,0.35)" },    // purple
  { name: "Master", color: "rgba(34,197,94,0.35)" },     // green
  { name: "Legend", color: "rgba(239,68,68,0.35)" },     // red
  { name: "Mythic", color: "rgba(34,211,238,0.40)" },    // cyan
]
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="z-20 flex justify-center">
      <div className="w-full max-w-[450px] text-[10px] sm:text-xs relative
        rounded-2xl backdrop-blur-2xl bg-gradient-to-b from-[#120b10]/80 via-[#1a0f14]/70 to-[#0c080b]/85
        border border-pink-200/10 shadow-[0_0_60px_rgba(255,182,193,0.12)] font-mono text-pink-100"
      >
        {/* Soft sakura glow overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-40
          bg-[radial-gradient(circle_at_top,rgba(255,192,203,0.15),transparent_60%)]"
        />

        {/* Floating petals feel (very subtle noise layer) */}
        <div className="absolute inset-0 pointer-events-none
          opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"
        />

        {/* HEADER */}
        <div className="relative text-center py-3 px-2 tracking-[0.4em] font-kiwi text-pink-100/90 border-b border-pink-200/10 bg-white/5">
          ACHIEVEMENT SPECIAL ROLES
        </div>

        {/* COLUMN HEADER */}
        <div className="relative grid grid-cols-4 text-center py-2.5 whitespace-nowrap
          text-pink-200/80 uppercase tracking-widest border-b border-pink-200/10 bg-white/5"
        >
          <div>BADGE</div>
          <div>TASES</div>
          <div className="block sm:hidden">CONT.</div>
          <div className="hidden sm:block">CONTRIBUTION</div>
          <div className="block sm:hidden">SAVED</div>
          <div className="hidden sm:block">TIME SAVED</div>
        </div>

        {/* ROWS */}
        <div className="divide-y divide-pink-200/10">
          {BADGE_IMAGES.map((img, i) => (
            <div
              key={img}
              className="relative grid grid-cols-4 items-center text-center py-2.5 transition-all duration-300 ease-out"
            >
              {/* BADGE */}
              <div className="flex items-center justify-center h-6 relative">

                {/* Big aura glow (rank-based) */}
                <div
                  className="absolute inset-0 scale-150 blur-xl rounded-full opacity-80"
                  style={{
                    backgroundColor: BADGE_THEMES[i]?.color,
                  }}
                />

                {/* Mid glow layer */}
                <div
                  className="absolute inset-0 scale-125 blur-md rounded-full opacity-60"
                  style={{
                    backgroundColor: BADGE_THEMES[i]?.color,
                  }}
                />

                {/* Icon */}
                <div
                  className=" relative flex justify-center h-7 w-11 transition-all duration-300
                    drop-shadow-[0_0_14px_rgba(255,255,255,0.25)]"
                  style={{ filter: `drop-shadow(0 0 10px ${BADGE_THEMES[i]?.color})` }}
                >
                  <BadgeIcon badge_src={img} />
                </div>
              </div>

              {/* TAS */}
              <div className="text-pink-100/80 tabular-nums">
                {BADGE_RANKS.TAS[i]}
              </div>

              {/* CONTRIBUTION */}
              <div className="text-pink-100/80 tabular-nums">
                {BADGE_RANKS.Contributions[i]}
              </div>

              {/* TIME */}
              <div className="text-pink-200/70 tabular-nums">
                {i >= 5 ? BADGE_RANKS.Saved[i] / 60 : BADGE_RANKS.Saved[i]}
                <span className="ml-1 text-pink-300/50">
                  {i >= 5 ? "MIN" : "SEC"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHelp(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-3
              tracking-[0.35em] text-pink-200/90 border-t border-pink-200/10 bg-white/5
              cursor-pointer transition-all duration-300 hover:bg-white/10 hover:text-pink-100"
          >
            {/* Text */}
            <span className="relative font-kiwi translate-y-[-3px]">
              HOW TO CLAIM BADGES

              {/* Subtle pulse underline */}
              <span className="absolute left-0 -bottom-1 w-full h-px bg-pink-200/30 animate-pulse" />
            </span>

            {/* Arrow */}
            <span className={`text-pink-300/70 transition-transform duration-300 translate-y-[-1px] ${showHelp ? "rotate-180 translate-x-[-4px]" : "rotate-0"}`}>
              ▼
            </span>
          </button>

          {/* PANEL */}
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-full max-w-[340px]
            rounded-xl border border-pink-200/10 bg-[#120b10]/95 backdrop-blur-xl
            p-3 sm:p-4 text-left z-50 transition-all duration-200 ease-out shadow-lg
            ${showHelp ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2 pointer-events-none"}`}
          >
            <div className="space-y-3 tracking-normal leading-relaxed text-pink-100/80 rounded-lg overflow-hidden">
              <p>
                These badges are awarded to those who make consistent progress and
                represent their dedication to the community.
              </p>

              <div className="h-px bg-pink-200/10" />

              <p>
                We want these badges to remain prestigious, so earning them is intended
                to be a challenge.
              </p>

              <div className="h-px bg-pink-200/10" />

              <p>
                Badges are allocated based on your average achievement across the three
                categories.
              </p>

              <p className="text-pink-200/60 text-[11px]">
                Example: 12 TASes, 4.2 Contributions, and 2.5 minutes saved correspond
                to ranks 3, 2, and 6. The average rank is 3.66, which rounds to 4,
                awarding the <span className="text-pink-100">Expert TASer</span> rank
                and the diamond badge.
              </p>
            </div>
          </div>
        </div>
          
        {/* Bottom ambient glow */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px]
          bg-pink-300/10 blur-3xl rounded-full pointer-events-none"
        />

      </div>
    </div>
  );
}
