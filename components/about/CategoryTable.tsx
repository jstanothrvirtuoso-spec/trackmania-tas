
import { Category } from "@/utils/typing";

const CATEGORY_INFO: Record<Category | "RTA", string[]> = {
  "Open": ["Current TAS WR using any strategy"],
  "NOseboost": ["Fastest TAS without any noseboosts", "(nosebugs <400 speed allowed)"],
  "No Uber": ["Fastest TAS without noseboosts or new* ubers", "(*not done by RTA WR)"],
  "WR Route": ["Fastest TAS following RTA WR route", "(SDs, ramms, and minor tricks allowed)"],
  "No Cut": ["Fastest TAS following original nadeo route", "(SDs, ramms, and minor tricks allowed)"],
  "Low Input": ["Minimum number of inputs to finish the track", "(ties are broken using the fastest time)"],
  "RTA": ["Current RTA world record"],
};

export function CategoryTable() {

  return (
    <div className="z-20 flex justify-center">
      <div
        className="
          w-[420px]
          relative overflow-hidden

          rounded-2xl
          backdrop-blur-2xl

          bg-gradient-to-b from-[#120b10]/80 via-[#1a0f14]/70 to-[#0c080b]/85

          border border-pink-200/10
          shadow-[0_0_60px_rgba(255,182,193,0.12)]

          text-xs font-mono text-pink-100
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
          CATEGORY DETAILS
        </div>

        {/* ROWS */}
        <div className="divide-y divide-pink-200/10">
          {Object.entries(CATEGORY_INFO).map(([category, info]) => (
            <div
              key={category}
              className="
                relative grid grid-cols-2 grid-cols-[100px_1fr] items-center text-center
                py-2.5

                transition-all duration-300 ease-out

                hover:bg-white/5
                hover:backdrop-blur-md
              "
            >

              {/* Soft sakura “petal glow” on hover */}
              <div className="
                absolute inset-0
                opacity-0 hover:opacity-100
                transition-opacity duration-300
                bg-[radial-gradient(circle_at_center,rgba(255,182,193,0.08),transparent_60%)]
              " />

              {/* CONTRIBUTION */}
              <div className="text-pink-100/80 tabular-nums">
                {category}
              </div>

              {/* CONTRIBUTION */}
              <div className="text-pink-100/80 tabular-nums">
                {info.map((block, i) => (
                  <div key={i}>{block}</div>
                ))}
              </div>

            </div>
          ))}
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