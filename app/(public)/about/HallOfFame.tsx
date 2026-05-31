
const FAME_CONTENTS: Record<string, Record<string, string>> = {
  "TMI Released": { date: "30/05/2021", link: "" },
  "Noseboost Discovery": {date: "03/09/2021", link: "" },
  "Stadium Start Trick Discovery": { date: "03/02/2022", link: "https://www.youtube.com/watch?v=7KLnucE2rdw&list=RD7KLnucE2rdw&start_radio=1&t=1s" },
  "Island/Coast Start Trick Discovery": { date: "27/01/2023", link: "https://youtu.be/cASmgd3lQTM?si=agM-1h9dp3SssNP0" },
  "TMNF Sub 60 Minutes Campaign": { date: "04/06/2023", link: "https://www.youtube.com/watch?v=9maXH1a9vzk" },
  "TMNF Sub 50 Minutes Campaign": { date: "17/05/2025", link: "" },
  "1000 TASes Completed": { date: "09/07/2025", link: "" },
  "TMNF 1 Hour Time Save": { date: "10/05/2026", link: "" },
  "TMNF Sub 45 Minutes Campaign": { date: "???", link: "" },
  "United Aftermovie": { date: "???", link: "" },
}

export function HallOfFame() {

  return (
    <div className="relative w-[390px] p-4
      bg-black/50 backdrop-blur-md
      border border-white/10
      shadow-[0_0_18px_rgba(0,0,0,0.6),inset_0_0_25px_rgba(255,255,255,0.03)]">
      
      {/* Subtle paper glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />
    
      {/* Red ink frame corners (Japanese UI signature) */}
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
        {Object.entries(FAME_CONTENTS).map(([title, { date, link }]) => {
          const Wrapper = link ? "a" : "div";

          return (
            <Wrapper
              key={title}
              {...(link ? { href: link, target: "_blank", rel: "noreferrer" } : {})}
              className="flex justify-between items-center border border-white/10 bg-white/5 rounded-md px-3 py-2 hover:bg-white/10 transition"
            >
              <span className="font-[OktaNeue] tracking-wide text-white">
                {title}
              </span>
              <span className="text-gray-400 text-xs whitespace-nowrap">
                {date}
              </span>
            </Wrapper>
          );
        })}
      </div>
    </div>
  )
}
