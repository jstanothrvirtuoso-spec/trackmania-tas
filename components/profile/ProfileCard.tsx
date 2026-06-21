
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ProfilePublic } from "@/lib/Profiles";
import { Role } from "@/utils/typing";
import { PROFILE_AVATARS, PROFILE_BANNERS } from "@/utils/constants";

const ROLE_TEXT: Record<Role, string> = {
  user: "Verified TASer",
  moderator: "Moderator",
  admin: "Admin",
};

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
  const shineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafParticles = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]); // FIX: use real ref

  const bannerRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const avatar = PROFILE_AVATARS[profile.avatar] ?? PROFILE_AVATARS[0];
  const banner = PROFILE_BANNERS[profile.banner] ?? PROFILE_BANNERS[0];
  const avatar_colour = `hsl(${profile.colour}, 80%, 60%)`

  useEffect(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isInside = (x: number, y: number, w: any) =>
      w && x > w.left && x < w.right && y > w.top && y < w.bottom;

    const getRect = (el: HTMLElement | null) => {
      if (!el) return null;
      const c = card.getBoundingClientRect();
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

    const resize = () => {
      canvas.width = card.clientWidth;
      canvas.height = card.clientHeight;

      const walls = [
        getRect(bannerRef.current),
        getRect(topBarRef.current),
        getRect(bottomBarRef.current),
      ];

      particlesRef.current = Array.from({ length: 18 }).map(() => {
        const speed = Math.random() * 0.6 + 0.1;

        let x = 0,
          y = 0;

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
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.02,
          alpha: Math.random() * 0.5 + 0.25,
        };
      });
    };

    const draw = () => {
      const walls = [
        getRect(bannerRef.current),
        getRect(topBarRef.current),
        getRect(bottomBarRef.current),
      ];

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      for (const p of particlesRef.current) {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        for (const w of walls) {
          if (!w) continue;
          if (p.x > w.left && p.x < w.right && p.y > w.top && p.y < w.bottom) {
            p.dx *= -1;
            p.dy *= -1;
          }
        }

        const alpha =
          p.alpha + Math.sin(time + p.x * 0.01) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,180,220,${Math.max(0, alpha)})`;
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

  useEffect(() => {
    let raf: number;
    let alive = true;

    const animate = () => {
      if (!alive) return;

      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;

      const x = current.current.x;
      const y = current.current.y;

      const intensityX = x - 0.5;
      const intensityY = y - 0.5;

      const strength = Math.min(1, Math.sqrt(intensityX * intensityX + intensityY * intensityY));
      const moveX = intensityX * 90;
      const moveY = intensityY * 60;
      const rotate = intensityX * 18;

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

      raf = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    target.current.x = (e.clientX - rect.left) / rect.width;
    target.current.y = (e.clientY - rect.top) / rect.height;
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-[320px] aspect-[0.67] overflow-hidden rounded-1xl bg-white shadow-1xl flex flex-col"
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
          className="absolute top-10 right-3 z-50 group flex items-center gap-2 px-3 py-2 
                    bg-white/80 backdrop-blur hover:bg-black text-pink-500 cursor-pointer
                    rounded-full shadow-lg transition-all hover:scale-105 border border-pink-100"
          aria-label="Edit profile"
        >
          <span className="text-xs font-semibold hidden sm:inline">
            Edit
          </span>
        </button>
      )}

      {/* Upper section */}
      <div
        ref={topBarRef}
        className="h-5 bg-gradient-to-r from-teal-300/80 via-cyan-300/80 to-emerald-300/80"
      />
      <div className="px-5 py-2 flex items-center gap-2 bg-white/75 backdrop-blur relative">
        <div
          className="relative w-14 h-14 rounded-full overflow-hidden"
          style={{
            backgroundColor: avatar_colour,
            boxShadow: `
              0 0 5px ${avatar_colour},
              0 0 5px ${avatar_colour}88
            `,
            transform: "translateZ(40px)",
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

        <div className="text-left">
          <div
            className="font-bold text-black text-2xl leading-tight font-sakura tracking-[0.5px]"
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
        <div
          ref={shineRef}
          className="absolute inset-2 pointer-events-none z-10"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25), transparent 60%)",
            opacity: 0,
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* Lower section */}
      <div className="px-2 py-2 text-center">
        <h2
          className="text-2xl text-pink-400 font-bold italic leading-tight"
          style={{ fontFamily: "serif" }}
        >
          {profile.bio ? `❝ ${profile.bio} ❞` : "❝ bio ❞"}
        </h2>

        <div className="flex items-center justify-center gap-3 mt-1">
          <div className="flex-1 border-t-2 border-dashed border-pink-500" />
          <p className="text-pink-400 tracking-widest text-xs font-semibold uppercase whitespace-nowrap">
            {ROLE_TEXT[profile.role]}
          </p>
          <div className="flex-1 border-t-2 border-dashed border-pink-500" />
        </div>
      </div>
      <div
        ref={bottomBarRef}
        className="h-5 bg-gradient-to-r from-teal-300/80 via-cyan-300/80 to-emerald-300/80"
      />
      
      {/* Card frame and particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/banners/bannertp.png"
          alt="Banner"
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
