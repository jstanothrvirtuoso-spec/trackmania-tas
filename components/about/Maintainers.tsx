import Image from "next/image"

export function Maintainers() {
  return (
    <div className="relative inline-flex flex-col h-fit w-fit p-3 aquarium-frame overflow-hidden rounded-[18px] shadow-2xl shadow-black/60">

      {/* 🧊 GLASS BORDER (TOP FRAME LAYER) */}
      <div className="aquarium-glass-border pointer-events-none absolute inset-0" />

      {/* 🌊 WATER SYSTEM */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="aquarium-water aquarium-water-1" />
        <div className="aquarium-water aquarium-water-2" />

        <div className="water-surface" />

        {/* 🫧 BUBBLES */}
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
        <span className="bubble b4" />
        <span className="bubble b5" />
        <span className="bubble b6" />
        <span className="bubble b7" />
        <span className="bubble b8" />
      </div>

      <p className="relative mb-3 px-2 text-sm tracking-[0.25em] text-center font-sakura pink-white-gradient">
        Hosted and maintained by
      </p>

      <div className="relative flex items-start justify-center gap-10 w-full">

        {/* PERSON 1 */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gray-500 opacity-15 blur-md scale-110" />
            <div className="relative h-20 w-20 rounded-full overflow-hidden">
              <Image
                src="/avatars/virtuoso.png"
                alt="Virtuoso"
                fill
                sizes="80px"
                loading="eager"
                className="object-cover"
              />
            </div>
          </div>

          <p className="mt-2 text-base tracking-[0.2em] font-sakura swing-name text-white/90"
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
              <Image
                src="/avatars/kimura.png"
                alt="Kimura"
                fill
                sizes="80px"
                loading="eager"
                className="object-cover"
              />
            </div>

            <Image
              src="/avatars/catears.png"
              alt="Cat-ears"
              width={64}
              height={64}
              unoptimized
              loading="eager"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-150"
            />
          </div>

          <p className="mt-2 text-base tracking-[0.2em] font-sakura swing-name text-white/90"
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
  )
}