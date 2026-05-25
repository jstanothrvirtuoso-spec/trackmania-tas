"use client";

import { useEffect, useRef, useState } from "react";
import {
  useProfile,
  useUpdateProfile1,
  useUpdateProfile2,
  useUpdateProfileAvatar,
} from "@/lib/Profiles";

// ======================================================
// CONSTANTS
// ======================================================

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const SETTINGS = [
  {
    key: "show_rta",
    label: "RTA",
    desc: "Show RTA record table",
  },
  {
    key: "show_time_saved",
    label: "Time Saved",
    desc: "Display time saved table",
  },
  {
    key: "show_leaderboard",
    label: "Leaderboard",
    desc: "Show TAS leaderboard rankings",
  },
  {
    key: "show_rta_leaderboard",
    label: "RTA Leaderboard",
    desc: "Show RTA leaderboard rankings",
  },
  {
    key: "highlight_recent",
    label: "Highlight Recent",
    desc: "Highlight recently added TASes",
  },
  {
    key: "show_visitor_counter",
    label: "Visitor Counter",
    desc: "Display visitor count",
  },
] as const;

// ======================================================
// HELPERS
// ======================================================

const validateImageSize = (file: File) => {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image must be under ${MAX_IMAGE_SIZE_MB}MB`;
  }

  return null;
};

// ======================================================
// COMPONENT
// ======================================================

export default function PreferencesPage() {
  // ======================================================
  // API
  // ======================================================

  const { data: profile, isLoading } = useProfile();

  const updateUsername = useUpdateProfile1();
  const updatePreferences = useUpdateProfile2();
  const updateAvatar = useUpdateProfileAvatar();

  // ======================================================
  // PROFILE STATE
  // ======================================================

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [pronouns, setPronouns] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // ======================================================
  // SETTINGS STATE
  // ======================================================

  const [prefs, setPrefs] = useState({
    show_rta: false,
    show_time_saved: false,
    show_leaderboard: false,
    show_rta_leaderboard: false,
    highlight_recent: false,
    show_visitor_counter: false,
  });

  // ======================================================
  // MODAL STATE
  // ======================================================

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ======================================================
  // DRAFT PROFILE STATE
  // ======================================================

  const [draftUsername, setDraftUsername] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [draftPronouns, setDraftPronouns] = useState("");

  const [draftAvatarFile, setDraftAvatarFile] = useState<File | null>(null);
  const [draftAvatarPreview, setDraftAvatarPreview] = useState<string | null>(
    null
  );

  const [draftBannerFile, setDraftBannerFile] = useState<File | null>(null);
  const [draftBannerPreview, setDraftBannerPreview] = useState<string | null>(
    null
  );

  // ======================================================
  // 3D CARD REFS
  // ======================================================

  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  // ======================================================
  // INITIAL PROFILE LOAD
  // ======================================================

  useEffect(() => {
    if (!profile) return;

    setUsername(profile.username);
    setBio(profile.bio || "");
    setPronouns(profile.pronouns || "");

    setAvatarPreview(profile.avatar_url || null);
    setBannerPreview(profile.banner_url || null);

    setPrefs({
      show_rta: profile.show_rta,
      show_time_saved: profile.show_time_saved,
      show_leaderboard: profile.show_leaderboard,
      show_rta_leaderboard: profile.show_rta_leaderboard,
      highlight_recent: profile.highlight_recent,
      show_visitor_counter: profile.show_visitor_counter,
    });
  }, [profile]);

  // ======================================================
  // CACHE CARD RECT
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
}, [profile]); // 👈 important change

  // ======================================================
  // 3D CARD EFFECT
  // ======================================================

  
  const handleMouseMove = (
    
    e: React.MouseEvent<HTMLDivElement>
  ) => {
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
  // OPEN MODAL
  // ======================================================

  const openEditProfile = () => {
    setDraftUsername(username);
    setDraftBio(bio);
    setDraftPronouns(pronouns);

    setDraftAvatarPreview(avatarPreview);
    setDraftBannerPreview(bannerPreview);

    setDraftAvatarFile(null);
    setDraftBannerFile(null);

    setIsEditingProfile(true);
  };

  // ======================================================
  // FILE HANDLERS
  // ======================================================

  const handleDraftAvatarChange = (
    file: File | null
  ) => {
    if (!file) return;

    const error = validateImageSize(file);

    if (error) {
      alert(error);
      return;
    }

    setDraftAvatarFile(file);
    setDraftAvatarPreview(URL.createObjectURL(file));
  };

  const handleDraftBannerChange = (
    file: File | null
  ) => {
    if (!file) return;

    const error = validateImageSize(file);

    if (error) {
      alert(error);
      return;
    }

    setDraftBannerFile(file);
    setDraftBannerPreview(URL.createObjectURL(file));
  };

  // ======================================================
  // SAVE PROFILE
  // ======================================================

  const handleSaveProfile = async () => {
    try {
      await updateUsername.mutateAsync({
        username: draftUsername,
      });

      setUsername(draftUsername);
      setBio(draftBio);
      setPronouns(draftPronouns);

      if (draftAvatarFile) {
        await updateAvatar.mutateAsync(draftAvatarFile);

        setAvatarPreview(draftAvatarPreview);
      }

      if (draftBannerFile) {
        setBannerPreview(draftBannerPreview);
      }

      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================================================
  // SETTINGS TOGGLE
  // ======================================================

  const toggleSetting = (key: keyof typeof prefs) => {
    setPrefs((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };

      updatePreferences.mutate(updated);

      return updated;
    });
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (isLoading || !profile) {
    return (
      <div className="text-white p-10">
        Loading...
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-violet-800/10 to-slate-900 text-white px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* HEADER */}

          <div className="text-center">
            <h1 className="text-4xl font-bold">
              Preferences
            </h1>

            <p className="text-slate-400 mt-2">
              Customise your profile and viewing
              experience
            </p>
          </div>

          {/* MAIN GRID */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* PROFILE CARD */}

            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full aspect-[9/16] profile-card"
              style={{
                transform:
                  "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                willChange: "transform",
                transformStyle: "preserve-3d",
              }}
            >
              {/* BACKGROUND */}

             <div className="absolute inset-0 overflow-hidden">
  <div className="relative w-full h-full banner-frame">

    {bannerPreview ? (
      <img
        src={bannerPreview}
        onLoad={() => {
          rectRef.current =
            cardRef.current?.getBoundingClientRect() || null;
        }}
        className="w-full h-full object-cover opacity-85"
      />
    ) : (
      <div className="w-full h-full bg-slate-900" />
    )}

    {/* gloss layer */}
    <div className="absolute inset-0 pointer-events-none banner-gloss" />
  </div>
</div>

              {/* CONTENT */}

              <div className="relative flex flex-col items-center text-center p-6">

                {/* AVATAR */}

                <div className="w-[280px] h-[280px] rounded-full overflow-hidden bg-slate-800">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No Avatar
                    </div>
                  )}
                </div>

                {/* USERNAME */}

                <h2 className="text-4xl font-bold mt-6">
                  {profile.username}
                </h2>

                {/* BIO */}

                {bio && (
                  <p className="text-slate-300 mt-4">
                    {bio}
                  </p>
                )}
              </div>
            </div>

            {/* SETTINGS PANEL */}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-semibold mb-6">
                Default Display Settings
              </h2>

              <div className="grid gap-4">
                {SETTINGS.map((setting) => (
                  <div
                    key={setting.key}
                    className="p-4 bg-slate-800 rounded-xl flex justify-between"
                  >
                    <div>
                      <div>{setting.label}</div>

                      <div className="text-sm text-slate-400">
                        {setting.desc}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        toggleSetting(setting.key)
                      }
                      className={`w-12 h-7 rounded-full ${
                        prefs[setting.key]
                          ? "bg-emerald-500"
                          : "bg-slate-700"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end">
            <button
              onClick={openEditProfile}
              className="px-7 py-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* MODAL */}
      {/* ====================================================== */}

      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">

          <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-2xl">

            <h2 className="text-2xl font-bold mb-6">
              Edit Profile
            </h2>

            <div className="flex gap-6 items-start">

              {/* BANNER */}

              <div
                className="w-[140px] h-[260px] bg-slate-800 rounded-xl overflow-hidden cursor-pointer"
                onClick={() =>
                  document
                    .getElementById("bannerUpload")
                    ?.click()
                }
              >
                {draftBannerPreview ? (
                  <img
                    src={draftBannerPreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700" />
                )}

                <input
                  id="bannerUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleDraftBannerChange(
                      e.target.files?.[0] || null
                    )
                  }
                />
              </div>

              {/* RIGHT SIDE */}

              <div className="flex-1 space-y-4">

                {/* AVATAR */}

                <div
                  className="w-[120px] h-[120px] rounded-full overflow-hidden bg-slate-800 cursor-pointer"
                  onClick={() =>
                    document
                      .getElementById("avatarUpload")
                      ?.click()
                  }
                >
                  {draftAvatarPreview ? (
                    <img
                      src={draftAvatarPreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500" />
                  )}

                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleDraftAvatarChange(
                        e.target.files?.[0] || null
                      )
                    }
                  />
                </div>

                {/* USERNAME */}

                <input
                  value={draftUsername}
                  onChange={(e) =>
                    setDraftUsername(e.target.value)
                  }
                  className="w-full p-3 bg-slate-800 rounded-xl"
                />

                {/* BIO */}

                <textarea
                  value={draftBio}
                  onChange={(e) =>
                    setDraftBio(e.target.value)
                  }
                  className="w-full p-3 bg-slate-800 rounded-xl"
                  rows={4}
                />

                {/* ACTIONS */}

                <div className="flex justify-end gap-3 pt-2">

                  <button
                    onClick={() =>
                      setIsEditingProfile(false)
                    }
                    className="px-5 py-3 bg-slate-700 rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-3 bg-emerald-500 rounded-xl"
                  >
                    Save Profile
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}