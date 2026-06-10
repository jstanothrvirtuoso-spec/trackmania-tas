
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ProfilePublic } from "@/lib/Profiles";
import { Role } from "@/utils/typing";
import { PROFILE_AVATARS, PROFILE_BANNERS, PROFILE_COLOURS } from "@/utils/constants"

const ROLE_TEXT: Record<Role, string> = {
  "user": "Verified TASer",
  "moderator": "Moderator",
  "admin": "Admin",
}

export default function ProfileCard({ profile }: { profile: ProfilePublic }) {

  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const avatar = PROFILE_AVATARS[profile.avatar] ?? PROFILE_AVATARS[0];
  const banner = PROFILE_BANNERS[profile.banner] ?? PROFILE_BANNERS[0];
  const avatar_colour = PROFILE_COLOURS[profile.colour] ?? PROFILE_COLOURS[0];

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const updateRect = () => {
      rectRef.current = el.getBoundingClientRect();
    };

    // IMPORTANT: wait for layout + images
    const raf = requestAnimationFrame(updateRect);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    // extra safety: after full paint
    const timeout1 = setTimeout(updateRect, 50);
    const timeout2 = setTimeout(updateRect, 200);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearTimeout(timeout1);
      clearTimeout(timeout2);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [profile]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {

    const el = cardRef.current;
    const rect = rectRef.current;
    if (!el || !rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 5;
      const rotateX = (0.5 - y) * 5;

      el.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;

    if (!el) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    el.style.transition = "transform 220ms ease";

    el.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
    `;

    setTimeout(() => {
      if (el) {
        el.style.transition = "";
      }
    }, 220);
  };

  if (!profile) {
    return (
      <div className="text-white p-10">
        Loading...
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-100 aspect-[9/16] profile-card rounded-2xl overflow-hidden"
      style={{
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden bg-slate-800">
        <div className="relative w-full h-full banner-frame">
          <Image
            src={banner}
            alt="Banner"
            fill
            className="object-cover opacity-40"
            onLoad={() => {
              rectRef.current = cardRef.current?.getBoundingClientRect() || null;
            }}
            sizes="50vw"
            priority
          />

          <div className="absolute inset-0 pointer-events-none banner-gloss" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative flex flex-col items-center text-center p-6 pt-15">

          {/* AVATAR */}
          <div 
            className="w-[280px] h-[280px] rounded-full overflow-hidden bg-slate-800 border border-black shadow-xl p-4"
            style={{ backgroundColor: avatar_colour}}
          >
            <Image
              src={avatar}
              alt="Avatar"
              width={280}
              height={280}
              priority
            />
          </div>

          {/* DISPLAY NAME */}
          <h2 className="text-4xl font-bold mt-6 [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: "OktaNeue" }}>
            {profile.display_name}
          </h2>

          {/* ROLE */}
          <h2 className="text-lg text-emerald-500 [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: "DOSVGA" }}>
            {ROLE_TEXT[profile.role]}
          </h2>

          {/* BIO */}
          <p className="text-slate-300 italic mt-4 [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]">
            {profile.bio ?? ""}
          </p>
      </div>
    </div>
  );
}
