import Image from "next/image";
import { useEffect, useRef } from "react";
import { ProfilePublic } from "@/lib/Profiles";
import { Role } from "@/utils/typing";
import { PROFILE_AVATARS, PROFILE_BANNERS, PROFILE_COLOURS } from "@/utils/constants";

const ROLE_TEXT: Record<Role, string> = {
  user: "Verified TASer",
  moderator: "Moderator",
  admin: "Admin",
};



export default function ProfileCard({
  profile,
  onEditClick,
}: {
  profile: ProfilePublic;
  onEditClick?: () => void;
}) {
  const shineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const rafParticles = useRef<number | null>(null);

const wallsRef = useRef<any[]>([]);
  const bannerRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
const bottomBarRef = useRef<HTMLDivElement>(null);
const bannerRectRef = useRef<DOMRect | null>(null);

  const avatar = PROFILE_AVATARS[profile.avatar] ?? PROFILE_AVATARS[0];
  const banner = PROFILE_BANNERS[profile.banner] ?? PROFILE_BANNERS[0];
  const avatar_colour =
    PROFILE_COLOURS[profile.colour] ?? PROFILE_COLOURS[0];

  /* =========================
     PARTICLE SYSTEM
  ========================= */

  const getLocalBannerRect = () => {
  const banner = bannerRef.current;
  const card = cardRef.current;
  if (!banner || !card) return null;

  const b = banner.getBoundingClientRect();
  const c = card.getBoundingClientRect();

  return {
    left: b.left - c.left,
    right: b.right - c.left,
    top: b.top - c.top,
    bottom: b.bottom - c.top,
  };
};

  useEffect(() => {
  const canvas = canvasRef.current;
  const card = cardRef.current;
  if (!canvas || !card) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const particlesRef = { current: [] as any[] };

  const isInsideAnyWall = (x: number, y: number, walls: any[]) => {
    for (const w of walls) {
      if (!w) continue;
      if (x > w.left && x < w.right && y > w.top && y < w.bottom) {
        return true;
      }
    }
    return false;
  };

  const getLocalRect = (el: HTMLElement | null) => {
    const c = card.getBoundingClientRect();
    if (!el) return null;

    const r = el.getBoundingClientRect();

    const scaleX = canvas.width / c.width;
    const scaleY = canvas.height / c.height;

    return {
      left: (r.left - c.left) * scaleX,
      right: (r.right - c.left) * scaleX,
      top: (r.top - c.top) * scaleY,
      bottom: (r.bottom - c.top) * scaleY,
    };
  };

  const resize = () => {
    canvas.width = card.clientWidth;
    canvas.height = card.clientHeight;

    const walls = [
      getLocalRect(bannerRef.current),
      getLocalRect(topBarRef.current),
      getLocalRect(bottomBarRef.current),
    ];

    particlesRef.current = Array.from({ length: 18 }).map(() => {
      const speed = Math.random() * 0.6 + 0.1;

      const padding = 2;

      let x = 0;
      let y = 0;

      do {
        x = padding + Math.random() * (canvas.width - padding * 2);
        y = padding + Math.random() * (canvas.height - padding * 2);
      } while (isInsideAnyWall(x, y, walls));

      return {
  x,
  y,
  r: Math.random() * 2.8 + 0.6,

  dx: (Math.random() - 0.5) * speed,
  dy: (Math.random() - 0.5) * speed,

  angle: Math.random() * Math.PI * 2,
  spin: (Math.random() - 0.5) * 0.02,
  alpha: Math.random() * 0.5 + 0.25,

};
    });
  };

  const draw = () => {
    const walls = [
      getLocalRect(bannerRef.current),
      getLocalRect(topBarRef.current),
      getLocalRect(bottomBarRef.current),
    ];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;

    for (const p of particlesRef.current) {
      p.x += p.dx;
      p.y += p.dy;

      p.angle += p.spin;

      p.x += Math.cos(p.angle + time) * 0.15;
      p.y += Math.sin(p.angle + time) * 0.15;

      p.x += Math.sin(time + p.y * 0.01) * 0.1;

      // wrap edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // wall collisions
      for (const w of walls) {
        if (!w) continue;

        const inX = p.x > w.left && p.x < w.right;
        const inY = p.y > w.top && p.y < w.bottom;

        if (inX && inY) {
          const dL = Math.abs(p.x - w.left);
          const dR = Math.abs(p.x - w.right);
          const dT = Math.abs(p.y - w.top);
          const dB = Math.abs(p.y - w.bottom);

          const min = Math.min(dL, dR, dT, dB);

          if (min === dL) {
            p.x = w.left;
            p.dx *= -1;
          } else if (min === dR) {
            p.x = w.right;
            p.dx *= -1;
          } else if (min === dT) {
            p.y = w.top;
            p.dy *= -1;
          } else {
            p.y = w.bottom;
            p.dy *= -1;
          }
        }
      }

      const alpha =
        p.alpha + Math.sin(time * 2 + p.x * 0.01) * 0.15;

      const size =
        p.r + Math.sin(time + p.y * 0.01) * 0.3;

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 60, 60, ${Math.max(0, alpha)})`;
      ctx.fill();
    }

    rafParticles.current = requestAnimationFrame(draw);
  };

  resize();
  draw();

  window.addEventListener("resize", resize);

  return () => {
    window.removeEventListener("resize", resize);
    if (rafParticles.current) cancelAnimationFrame(rafParticles.current);
  };
}, []);

  /* =========================
     CARD RECT (mouse tracking)
  ========================= */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const updateRect = () => {
      rectRef.current = el.getBoundingClientRect();
    };

    updateRect();

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [profile]);

  /* =========================
     3D HOVER
  ========================= */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const el = cardRef.current;
 const rect = bannerRef.current?.getBoundingClientRect();
const shine = shineRef.current;

if (!el || !rect || !shine) return;

  const x = (e.clientX - rect.left) / rect.width;
const y = (e.clientY - rect.top) / rect.height;

  const rotateY = (x - 0.5) * 5;
  const rotateX = (0.5 - y) * 5;

  if (rafRef.current) cancelAnimationFrame(rafRef.current);

  rafRef.current = requestAnimationFrame(() => {
    el.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;

    // 🔥 glossy highlight movement
    const px = x * 100;
    const py = y * 100;

    shine.style.background = `
      radial-gradient(
  circle at ${px}% ${py}%,
  rgba(255,255,255,0.45),
  rgba(255,255,255,0.12) 25%,
  rgba(255,255,255,0) 60%
)
    `;

    shine.style.opacity = "1";
  });
};  

  const handleMouseLeave = () => {
  const el = cardRef.current;
  const shine = shineRef.current;

  if (!el) return;

  el.style.transition = "transform 220ms ease";
  el.style.transform = `
    perspective(1000px)
    rotateX(0deg)
    rotateY(0deg)
  `;

  if (shine) {
    shine.style.transition = "opacity 250ms ease";
    shine.style.opacity = "0";
  }

  setTimeout(() => {
    if (el) el.style.transition = "";
    if (shine) shine.style.transition = "";
  }, 220);
};

  if (!profile) return <div className="text-white p-10">Loading...</div>;

  return (
  <div
    ref={cardRef}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    className="relative w-[420px] aspect-[0.67] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
    style={{
      transform: "perspective(1000px)",
      willChange: "transform",
      transformStyle: "preserve-3d",
    }}
  >
    {/* =========================
        PARTICLES LAYER
    ========================= */}


    {/* =========================
        EDIT BUTTON
    ========================= */}
    {onEditClick && (
      <button
        onClick={onEditClick}
        className="absolute top-10 right-3 z-50 group flex items-center gap-2 px-3 py-2 
                   bg-white/80 backdrop-blur hover:bg-white text-pink-500 
                   rounded-full shadow-lg transition-all hover:scale-105 border border-pink-100"
        aria-label="Edit profile"
      >
        <svg className="w-4 h-4 fill-pink-500" viewBox="0 0 1000 1000">
          <path d="M968.161,31.839c36.456,36.456,36.396,95.547,0,132.003l-43.991,43.991L792.138,75.83l43.991-43.991
            C872.583-4.586,931.704-4.617,968.161,31.839z M308.238,559.79l-43.96,175.963l175.963-43.991l439.938-439.938L748.147,119.821
            L308.238,559.79z M746.627,473.387v402.175H124.438V253.373h402.204l124.407-124.438H0V1000h871.064V348.918L746.627,473.387z"/>
        </svg>

        <span className="text-xs font-semibold hidden sm:inline">
          Edit
        </span>
      </button>
    )}

    {/* =========================
        TOP BANNER
    ========================= */}
    <div
  ref={topBarRef}
  className="h-5 bg-gradient-to-r from-teal-300/80 via-cyan-300/80 to-emerald-300/80"
/>

    {/* =========================
        PROFILE HEADER
    ========================= */}
    <div className="px-5 py-2 flex items-center gap-2 bg-white/75 backdrop-blur relative">
      <div
        className="relative w-14 h-14 rounded-full overflow-hidden"
        style={{ backgroundColor: avatar_colour }}
      >
        <Image
          src={avatar}
          alt="Avatar"
          fill
          className="object-contain"
        />
      </div>

      <div className="text-left">
  <div
    className="font-bold text-black text-2xl leading-tight"
    style={{
      fontFamily: "Sakura",
      textShadow: "0 1px 8px rgba(0, 0, 0, 0.15)",
      letterSpacing: "0.5px",
    }}
  >
    {profile.display_name}
  </div>
</div>
</div>

    {/* =========================
        MAIN BANNER AREA
    ========================= */}
    <div
  ref={bannerRef}
  className="flex-grow rounded-2xl border-3 border-pink-300 overflow-hidden relative z-20"
>
  {/* SHINE */}
  <div
    ref={shineRef}
    className="absolute inset-2 pointer-events-none z-10 overflow-hidden"
    style={{
      background:
        "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25), transparent 60%)",
      opacity: 0,
      mixBlendMode: "screen",
    }}
  />

  {/* IMAGE */}
  <Image
    src={banner}
    alt="Banner"
    fill
    priority
    className="object-cover z-0"
  />
</div>

    {/* =========================
        BOTTOM SECTION
    ========================= */}
    <div className="px-2 py-2 text-center bg-white/75 backdrop-blur">
      <h2
        className="text-2xl text-pink-400 font-bold italic leading-tight"
        style={{ fontFamily: "serif" }}
      >
        {profile.bio ? `❝ ${profile.bio} ❞` : "❝bio❞"}
      </h2>

      <div className="flex items-center justify-center gap-3 mt-1">
        <div className="flex-1 border-t-2 border-dashed border-pink-200" />
        <p className="text-pink-300 tracking-widest text-xs font-semibold uppercase whitespace-nowrap">
          {ROLE_TEXT[profile.role]}
        </p>
        <div className="flex-1 border-t-2 border-dashed border-pink-200" />
      </div>
    </div>
  
 <canvas
  ref={canvasRef}
  className="absolute inset-0 w-full h-full pointer-events-none z-0"
/>
    {/* =========================
        BOTTOM BORDER
    ========================= */}
    <div
  ref={bottomBarRef}
  className="h-5 bg-gradient-to-r from-teal-300/80 via-cyan-300/80 to-emerald-300/80"
/>
  </div>
);
}
