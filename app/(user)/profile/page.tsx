"use client";

import { useEffect, useRef, useState } from "react";
import { Profile, useProfile, useUpdateProfile, AVATARS, BANNERS, PROFILE_COLOURS } from "@/lib/Profiles";

const SETTINGS = [
  { key: "show_rta", label: "RTA Records", desc: "Show RTA record table" },
  { key: "show_time_saved", label: "Time Saved", desc: "Display time saved table"},
  { key: "show_leaderboard", label: "Leaderboard", desc: "Show TAS leaderboard rankings" },
  { key: "show_rta_leaderboard", label: "RTA Leaderboard", desc: "Show RTA leaderboard rankings"},
  { key: "highlight_recent", label: "Highlight Recent", desc: "Highlight recently added TASes" },
  { key: "show_visitor_counter", label: "Visitor Counter", desc: "Display visitor count" },
] as const;

export default function ProfilePage() {

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [draftProfile, setDraftProfile] = useState<Profile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ======================================================
  // PROFILE SETTINGS
  // ======================================================

  useEffect(() => {
    if (profile) setDraftProfile(profile);
  }, [profile]);

  const updateDraftProfile = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setDraftProfile(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const toggleSetting = (key: keyof Profile) => {
    setDraftProfile(prev => prev ? { ...prev, [key]: !prev[key] } : prev);
  };

  const handleSaveProfile = () => {
    if (!draftProfile || !draftProfile.username) return;

    setIsSaving(true);

    updateProfile.mutate(draftProfile, {
      onSuccess: () => {
        setIsSaving(false);
        setIsEditingProfile(false);
      },
      onError: () => {
        setIsSaving(false);
      },
    });
  };

  // ======================================================
  // 3D CARD EFFECTS
  // ======================================================

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

  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {

    if (!rectRef.current || !cardRef.current) return;

    const el = cardRef.current;
    const rect = rectRef.current;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);

    if (!el || !rect) return;

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

  // ======================================================
  // DISPLAY
  // ======================================================

  if (isLoading || !profile) {
    return (
      <div className="text-white p-10">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-violet-800/10 to-slate-700/80 text-white px-6 pt-20 pb-16">
        <div className="max-w-2xl mx-auto space-y-5 flex flex-col justify-center">

          {/* HEADER */}
          <div className="text-center flex flex-row justify-center gap-4">
            <h1 className="text-4xl font-bold">
              Profile
            </h1>
            <button
              onClick={setIsEditingProfile.bind(null, true)}
              className="p-2.5 px-3 bg-slate-900 border border-slate-600 hover:bg-slate-700 rounded-xl flex items-center justify-center cursor-pointer"
            >
              <svg
                className="w-4 h-4 fill-slate-200"
                viewBox="0 0 1000 1000"
              >
                <path d="M968.161,31.839c36.456,36.456,36.396,95.547,0,132.003l-43.991,43.991L792.138,75.83l43.991-43.991
                  C872.583-4.586,931.704-4.617,968.161,31.839z M308.238,559.79l-43.96,175.963l175.963-43.991l439.938-439.938L748.147,119.821
                  L308.238,559.79z M746.627,473.387v402.175H124.438V253.373h402.204l124.407-124.438H0V1000h871.064V348.918L746.627,473.387z"/>
              </svg>
            </button>
          </div>

          {/* PROFILE CARD */}
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

                {profile ? (
                  <img
                    src={BANNERS[profile.banner]}
                    onLoad={() => {
                      rectRef.current =
                        cardRef.current?.getBoundingClientRect() || null;
                    }}
                    className="w-full h-full object-cover opacity-40"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900" />
                )}

                {/* GLOSS */}
                <div className="absolute inset-0 pointer-events-none banner-gloss" />
              </div>
            </div>

            {/* CONTENT */}
            <div className="relative flex flex-col items-center text-center p-6 pt-15">

              {/* AVATAR */}
              <div 
                className="w-[280px] h-[280px] rounded-full overflow-hidden bg-slate-800 border border-black shadow-xl p-4"
                style={{ backgroundColor: PROFILE_COLOURS[profile?.colour ?? 0]}}
              >
                {profile && (
                  <img
                    src={AVATARS[profile.avatar]}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* USERNAME */}
              <h2 className="text-4xl font-bold mt-6 [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: "OktaNeue" }}>
                {profile.username}
              </h2>

              {/* BIO */}
              {profile.bio && (
                <p className="text-slate-300 mt-4 [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* EDIT PAGE */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-4xl">

            <h2 className="text-2xl font-bold mb-6">
              Edit Profile
            </h2>

            <div className="flex gap-6 items-start">

              {/* BANNER */}
              {!bannerOpen ? (
                <button
                  type="button"
                  onClick={() => { setBannerOpen(true); setAvatarOpen(false) }}
                  className="w-[180px] h-[330px] rounded-xl overflow-hidden hover:bg-slate-800 transition cursor-pointer"
                >
                  <img
                    src={BANNERS[draftProfile?.banner ?? 0]}
                    className="w-full h-full object-cover"
                  />
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(BANNERS).map(([key, src]) => {
                    const id = Number(key);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          updateDraftProfile("banner", id);
                          setBannerOpen(false);
                        }}
                        className={`h-16 rounded overflow-hidden border ${
                          draftProfile?.banner === id ? "border-emerald-500" : "border-transparent"}`}
                      >
                        <img
                          src={src}
                          className={`w-full h-full object-cover hover:opacity-100 transition ${
                            draftProfile?.banner === id ? "opacity-100" : "opacity-50"}`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MIDDLE */}
              <div className="flex-1 space-y-4">

                {/* AVATAR */}
                {!avatarOpen ? (
                  <button
                    type="button"
                    onClick={() => { setAvatarOpen(true); setBannerOpen(false) }}
                    className="w-[120px] h-[120px] rounded-full overflow-hidden hover:bg-slate-800 cursor-pointer"
                    style={{ backgroundColor: PROFILE_COLOURS[draftProfile?.colour ?? 0]}}
                  >
                    <img
                      src={AVATARS[draftProfile?.avatar ?? 0]}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-5 gap-2 w-[380px]">
                      {Object.entries(AVATARS).map(([key, src]) => {
                        const id = Number(key);

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              updateDraftProfile("avatar", id);
                              setAvatarOpen(false);
                            }}
                            className={`h-16 rounded overflow-hidden border ${
                              draftProfile?.avatar === id
                                ? "border-emerald-500"
                                : "border-transparent"
                            }`}
                          >
                            <img
                              src={src}
                              className={`w-full h-full object-cover hover:opacity-100 transition ${
                                draftProfile?.avatar === id ? "opacity-100" : "opacity-50"}`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-5 gap-2 w-[380px]">
                      {Object.entries(PROFILE_COLOURS).map(([key, colour]) => {
                        const id = Number(key);

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              updateDraftProfile("colour", id);
                              setAvatarOpen(false);
                            }}
                            className={`h-7 rounded overflow-hidden border hover:opacity-100 ${
                              draftProfile?.colour === id ? "border-emerald-500" : "border-transparent opacity-50"}`}
                            style={{ backgroundColor: colour }}
                          >
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* USERNAME */}
                <input
                  value={draftProfile?.username}
                  maxLength={20}
                  onChange={(e) =>
                    updateDraftProfile("username", e.target.value)
                  }
                  className="w-full p-3 bg-slate-800 rounded-xl"
                  placeholder="Username"
                />

                {/* BIO */}
                <textarea
                  value={draftProfile?.bio ?? ""}
                  onChange={(e) =>
                    updateDraftProfile("bio", e.target.value)
                  }
                  className="w-full p-3 bg-slate-800 rounded-xl"
                  rows={4}
                  maxLength={300}
                  placeholder="Add some info about yourself..."
                />
              </div>

              {/* SETTINGS PANEL */}
              <div className="rounded-3xl bg-slate-900/70 p-1">
                <h2 className="text-xl font-semibold mb-2">
                  Display Settings
                </h2>

                <div className="grid gap-2.5">
                  {SETTINGS.map((setting) => (
                    <div
                      key={setting.key}
                      className="px-3 py-2 bg-slate-800 rounded-xl flex justify-between items-center gap-5"
                    >
                      <div>
                        {setting.label}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSetting(setting.key)}
                        className={`relative w-10 h-6 rounded-full transition cursor-pointer ${
                          draftProfile?.[setting.key] ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-700 hover:bg-slate-600"}`}
                      >
                        <div
                          className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform duration-200 ${
                            draftProfile?.[setting.key] ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-5 py-3 bg-slate-700 rounded-xl cursor-pointer hover:bg-slate-600"
              >
                Cancel
              </button>

              <button
                disabled={!draftProfile || !draftProfile.username || isSaving}
                onClick={handleSaveProfile}
                className="px-5 py-3 bg-emerald-600 rounded-xl disabled:opacity-50 hover:bg-emerald-500 flex items-center justify-center cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>

          </div>
        </div>
      )}

      {isSaving && (
        <div className="fixed inset-0 z-[9999] cursor-wait" />
      )}
    </>
  );
}
