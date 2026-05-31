
import { BadgeIcon } from "@/components/Icons"
import { BADGE_IMAGES, BADGE_RANKS } from "@/utils/constants"

export function BadgeTable() {

  return (
    <div className="z-20">
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
          {BADGE_IMAGES.map((img, i) => (
            <div key={img} className="grid grid-cols-4 items-center text-center py-2">
              <div className="flex justify-center h-6">
                <BadgeIcon badge_src={img}/>
              </div>
    
              <div>{BADGE_RANKS.TAS[i]}</div>
              <div>{BADGE_RANKS.Contributions[i]}</div>
              <div>
                {i >= 5 ? BADGE_RANKS.Saved[i] / 60 : BADGE_RANKS.Saved[i]}
                {i >= 5 ? " MIN" : " SEC"}
              </div>
            </div>
          ))}
        </div>
    
        {/* FOOTER */}
        <div className="text-center py-2 border-t border-red-500/20 tracking-[0.3em]">
          HOW TO CLAIM BADGES
        </div>
    
      </div>
    </div>
    
  )
};