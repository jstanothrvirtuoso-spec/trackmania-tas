import { BadgeIcon } from "@/components/Icons"
import { BADGE_IMAGES, BADGE_RANKS } from "@/utils/constants"

export function BadgeTable() {

  return (
    <div className="z-20 flex justify-center">
      <div
        className="
          w-auto text-[10px] sm:w-[420px] sm:text-xs
          relative overflow-hidden

          rounded-2xl
          backdrop-blur-2xl

          bg-gradient-to-b from-[#120b10]/80 via-[#1a0f14]/70 to-[#0c080b]/85

          border border-pink-200/10
          shadow-[0_0_60px_rgba(255,182,193,0.12)]

          font-mono text-pink-100
        "
      >

        {/* soft sakura glow overlay */}
        <div className="
          absolute inset-0
          pointer-events-none
          opacity-40
          bg-[radial-gradient(circle_at_top,rgba(255,192,203,0.15),transparent_60%)]
        " />

        {/* floating petals feel (very subtle noise layer) */}
        <div className="
          absolute inset-0
          pointer-events-none
          opacity-[0.06]
          bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]
        " />

        {/* HEADER */}
        <div className="
          relative text-center py-3
          tracking-[0.5em]
          text-pink-100/90

          border-b border-pink-200/10

          bg-white/5
        ">
          ACHIEVEMENT SPECIAL ROLES
        </div>

        {/* COLUMN HEADER */}
        <div className="
          relative grid grid-cols-4 text-center
          py-2.5 whitespace-nowrap

          text-pink-200/80
          uppercase tracking-widest

          border-b border-pink-200/10

          bg-white/5
        ">
          <div>BADGE</div>
          <div>TASES</div>
          <div>CONTRIBUTION</div>
          <div>TIME SAVED</div>
        </div>

        {/* ROWS */}
        <div className="divide-y divide-pink-200/10">
          {BADGE_IMAGES.map((img, i) => (
            <div
              key={img}
              className="
                relative grid grid-cols-4 items-center text-center
                py-2.5

                transition-all duration-300 ease-out

                hover:bg-white/5
                hover:backdrop-blur-md
              "
            >

              {/* soft sakura “petal glow” on hover */}
              <div className="
                absolute inset-0
                opacity-0 hover:opacity-100
                transition-opacity duration-300
                bg-[radial-gradient(circle_at_center,rgba(255,182,193,0.08),transparent_60%)]
              " />

              {/* BADGE */}
              <div className="flex items-center justify-center h-6 relative drop-shadow-[0_0_8px_rgba(255,182,193,0.35)]">
                <div className="flex justify-center h-7 w-11 relative">
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
                {i >= 5
                  ? BADGE_RANKS.Saved[i] / 60
                  : BADGE_RANKS.Saved[i]}
                <span className="ml-1 text-pink-300/50">
                  {i >= 5 ? "MIN" : "SEC"}
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="
          relative text-center py-3

          tracking-[0.45em]
          text-pink-200/80

          border-t border-pink-200/10

          bg-white/5
        ">
          HOW TO CLAIM BADGES
        </div>

        {/* bottom ambient glow */}
        <div className="
          absolute -bottom-20 left-1/2 -translate-x-1/2
          w-[300px] h-[200px]
          bg-pink-300/10
          blur-3xl
          rounded-full
          pointer-events-none
        " />

      </div>
    </div>
  )
}