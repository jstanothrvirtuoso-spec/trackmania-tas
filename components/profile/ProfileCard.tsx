"use client"

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ProfilePublic } from "@/lib/Profiles";
import { Role } from "@/utils/typing";
import { PROFILE_AVATARS, PROFILE_BANNERS } from "@/utils/constants";

type Particle = {
  x: number,
  y: number,
  r: number,
  dx: number,
  dy: number,
  angle: number,
  spin: number,
  alpha: number,
}

type Rect = {
  left: number,
  right: number,
  top: number,
  bottom: number,
}

const ROLE_TEXT: Record<Role, string> = {
  user: "Verified TASer",
  moderator: "Moderator",
  admin: "Admin",
};

const makeColour = (h: number, l: number) => `hsl(${h}, 70%, ${l}%)`;

export default function ProfileCard({ profile, onEditClick }: {
  profile: ProfilePublic;
  onEditClick?: () => void;
}) {

  const handleMouseLeave = () => {
    target.current.x = 0.5;
    target.current.y = 0.5;
  };
  const target = useRef({ x: 0.5, y: 0.5 });
  const current = useRef({ x: 0.5, y: 0.5 });

  const rainbowRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const bannerRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const avatar = PROFILE_AVATARS[profile.avatar] ?? PROFILE_AVATARS[0];
  const banner = PROFILE_BANNERS[profile.banner] ?? PROFILE_BANNERS[0];
  const avatar_colour = `hsl(${profile.colour}, 80%, 60%)`
  
  const hueRef = useRef(profile.theme1);
  const [hover, setHover] = useState(false);
  const theme1 = {
    200: makeColour(profile.theme1, 85),
    400: makeColour(profile.theme1, 65),
    500: makeColour(profile.theme1, 55),
  };
  const theme2 = {
    200: makeColour(profile.theme2, 75),
    600: makeColour(profile.theme2, 45),
  };
  const bio = profile.bio ?? "";
  const len = bio.length;
  const fontSize =
    len < 40 ? "text-2xl" :
    len < 80 ? "text-xl" :
    len < 140 ? "text-lg" :
    "text-base";

  useEffect(() => {
    hueRef.current = profile.theme1;
  }, [profile.theme1]);

  useEffect(() => {

    const canvas = canvasRef.current;
    const card = cardRef.current;

    if (!canvas || !card) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const wallsRef = { current: [] as (Rect | null)[] };

    const computeWalls = () => {
      const c = card.getBoundingClientRect();

      const getRect = (el: HTMLElement | null): Rect | null => {
        if (!el) return null;

        const r = el.getBoundingClientRect();
        const sx = canvas.width / c.width;
        const sy = canvas.height / c.height;

        return {
          left: (r.left - c.left) * sx,
          right: (r.right - c.left) * sx,
          top: (r.top - c.top) * sy,
          bottom: (r.bottom - c.top) * sy,
        };
      };

      wallsRef.current = [
        getRect(bannerRef.current),
        getRect(topBarRef.current),
        getRect(bottomBarRef.current),
      ];
    };

    const isInside = (x: number, y: number, w: Rect | null) => {
      if (!w) return false;
      return x > w.left && x < w.right && y > w.top && y < w.bottom;
    };

    const init = () => {
      canvas.width = card.clientWidth;
      canvas.height = card.clientHeight;

      computeWalls();

      const walls = wallsRef.current;

      particlesRef.current = Array.from({ length: 25 }).map(() => {
        const speed = Math.random() * 0.6 + 0.1;

        let x = 0;
        let y = 0;

        do {
          x = Math.random() * canvas.width;
          y = Math.random() * canvas.height;
        } while (walls.some((w) => isInside(x, y, w)));

        return {
          x,
          y,
          r: Math.random() * 2.8 + 0.6,
          dx: (Math.random() - 0.5) * speed,
          dy: (Math.random() - 0.5) * speed,
          angle: 0,
          spin: 0,
          alpha: Math.random() * 0.5 + 0.25,
        };
      });
    };

    const resize = () => {
      canvas.width = card.clientWidth;
      canvas.height = card.clientHeight;
      computeWalls();
    };

    window.addEventListener("resize", resize);

    const tick = () => {

      // Pointer easing
      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;

      const x = current.current.x;
      const y = current.current.y;
      const intensityX = x - 0.5;
      const intensityY = y - 0.5;
      const moveX = intensityX * 90;
      const moveY = intensityY * 60;
      const rotate = intensityX * 18;
      const strength = Math.min(1, Math.sqrt(intensityX ** 2 + intensityY ** 2));

      // DOM animations
      if (rainbowRef.current) {
        rainbowRef.current.style.transform = `
          translate3d(${moveX}px, ${moveY}px, 0)
          rotate(${rotate}deg)
          scale(${1.1 + strength * 0.18})
        `;
        rainbowRef.current.style.opacity = `${0.25 + strength * 0.65}`;
      }

      if (beamRef.current) {
        beamRef.current.style.transform = `
          translate3d(${moveX * 1.5}px, ${moveY * 1.1}px, 0)
          rotate(${rotate * 0.5}deg)
          skewX(${intensityX * 14}deg)
        `;
        beamRef.current.style.opacity = `${0.1 + strength * 1.3}`;
      }

      if (cardRef.current) {
        cardRef.current.style.transform = `
          perspective(1000px)
          rotateX(${-intensityY * 6}deg)
          rotateY(${intensityX * 6}deg)
        `;
      }

      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `
          translate3d(${intensityX * -18}px, ${intensityY * -18}px, 0)
          scale(1.08)
        `;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Particles
      const walls = wallsRef.current;
      const time = performance.now() * 0.001;

      for (const p of particlesRef.current) {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < p.r - 1) { p.x = p.r - 1; p.dx *= -1 };
        if (p.x > canvas.width - p.r + 1) { p.x = canvas.width - p.r + 1; p.dx *= -1 };

        // Collision with UI zones
        for (const w of walls) {
          if (!w) continue;

          const inside =
            p.x + p.r - 1 > w.left &&
            p.x - p.r + 1 < w.right &&
            p.y + p.r - 1 > w.top &&
            p.y - p.r + 1 < w.bottom;

          if (!inside) continue;

          const overlapLeft = Math.abs(p.x + p.r - w.left);
          const overlapRight = Math.abs(w.right - (p.x - p.r));
          const overlapTop = Math.abs(p.y + p.r - w.top);
          const overlapBottom = Math.abs(w.bottom - (p.y - p.r));

          const minOverlap = Math.min(
            overlapLeft,
            overlapRight,
            overlapTop,
            overlapBottom
          );

          if (minOverlap === overlapLeft) {
            p.x = w.left - p.r + 1;
            p.dx = -Math.abs(p.dx);
          } else if (minOverlap === overlapRight) {
            p.x = w.right + p.r - 1;
            p.dx = Math.abs(p.dx);
          } else if (minOverlap === overlapTop) {
            p.y = w.top - p.r + 1;
            p.dy = -Math.abs(p.dy);
          } else {
            p.y = w.bottom + p.r - 1;
            p.dy = Math.abs(p.dy);
          }
        }

        const alpha = p.alpha + Math.sin(time + p.x * 0.01) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hueRef.current}, 80%, 65%, ${Math.max(0, alpha)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    
    resize();
    init();
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    // eslint-disable-next-line react-hooks/immutability
    target.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }; 

  if (!profile) return <div>Loading...</div>;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-[320px] aspect-[0.67] overflow-hidden rounded-1xl bg-white/95 shadow-1xl flex flex-col mt-[3px]"
      style={{
        transform: "perspective(1000px) translateZ(0)",
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Edit button */}
      {onEditClick && (
        <button
          onClick={onEditClick}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="hidden sm:flex absolute top-9 right-3 z-50 group flex items-center gap-2 px-2.5 py-1.5
                    bg-white/80 backdrop-blur cursor-pointer hover:scale-105 border
                    rounded-full shadow-[3px_3px_10px_rgba(0,0,0,0.15)] transition-all"
          aria-label="Edit profile"
          style={{
            background: hover ? theme2[200] : "rgba(255,255,255,0.8)",
            color: theme1[500],
            borderColor: theme1[200],
          }}
        >
          <span className="text-sm font-semibold [text-shadow:1px_1px_0px_rgba(0,0,0,0.1)]">
            Edit
          </span>
        </button>
      )}

      {/* Upper section */}
      <div
        ref={topBarRef}
        className="h-5"
        style={{
          background: `linear-gradient(to right, ${theme2[200]}, ${theme2[600]})`,
        }}
      />
      <div className="px-6 py-2 flex items-center gap-2 relative">
        <div
          className="relative w-12 h-12 rounded-full overflow-hidden z-50"
          style={{
            backgroundColor: avatar_colour,
            boxShadow: `0 0 3px ${avatar_colour}, 0 0 3px ${avatar_colour}`
          }}
        >
          <Image
            src={avatar}
            alt="Avatar"
            fill
            sizes="50vw"
            className="object-contain p-0.5"
          />
        </div>

        <div className="text-left z-20">
          <div
            className={`font-bold text-black leading-tight font-sakura tracking-[0.5px] break-words overflow-wrap-anywhere max-w-45 ${profile.display_name.length > 10 ? "text-xl" : "text-2xl"}`}
            style={{ textShadow: "0 1px 8px rgba(0, 0, 0, 0.15)" }}
          >
            {profile.display_name}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div
        ref={bannerRef}
        className="flex-grow min-h-[150px] mx-6 rounded-2xl overflow-hidden relative z-20 border"
      >
        <div
          ref={parallaxRef}
          className="absolute inset-0 will-change-transform m-0.5"
        >
          <Image
            src={banner}
            alt="Banner"
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            priority
            className="object-fill"
          />
        </div>
        <div
          ref={rainbowRef}
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,0,200,0.25), transparent 60%)",
            mixBlendMode: "screen",
          }}
        />
        <div
          ref={beamRef}
          className="absolute pointer-events-none z-20"
          style={{
            inset: "-20%",
            background: "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Lower section */}
      <div className="px-2 py-2 text-center">
        <h2
          className={`${fontSize} font-bold italic leading-tight [text-shadow:1px_1px_0px_rgba(0,0,0,0.2)]`}
          style={{ fontFamily: "serif", color: theme1[400] }}
        >
          {profile.bio ? `❝ ${profile.bio} ❞` : "❝ bio ❞"}
        </h2>

        <div className="flex items-center justify-center gap-3 mt-1">
          <div 
            className="flex-1 border-t-2 border-dashed"
            style={{ borderColor: theme1[500] }}
          />
          <p 
            className="tracking-widest text-xs font-semibold uppercase whitespace-nowrap [text-shadow:1px_1px_0px_rgba(0,0,0,0.3)]"
            style={{ color: theme1[400] }}
          >
            {ROLE_TEXT[profile.role]}
          </p>
          <div 
            className="flex-1 border-t-2 border-dashed"
            style={{ borderColor: theme1[500] }}
          />
        </div>
      </div>
      <div
        ref={bottomBarRef}
        className="h-5"
        style={{
          background: `linear-gradient(to right, ${theme2[200]}, ${theme2[600]})`,
        }}
      />
      
      {/* Card frame and particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/banners/bannertp.png"
          alt="Banner"
          fill
          sizes="50vw"
          loading="eager"
          className="w-full h-full object-contain"
        />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />
    </div>
  );
}
