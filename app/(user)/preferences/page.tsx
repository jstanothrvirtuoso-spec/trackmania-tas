"use client";

import { useEffect, useState } from "react";
import {
  useProfile,
  useUpdateProfile1,
  useUpdateProfile2,
  useUpdateProfileAvatar,
} from "@/lib/Profiles";

const usernameRegex = /^[a-zA-Z0-9_-]+$/;

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const validateImageSize = (file: File) => {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image must be under ${MAX_IMAGE_SIZE_MB}MB`;
  }
  return null;
};

const settings = [
  { key: "show_rta", label: "RTA", desc: "Show RTA record table" },
  { key: "show_time_saved", label: "Time Saved", desc: "Display time saved table" },
  { key: "show_leaderboard", label: "Leaderboard", desc: "Show TAS leaderboard rankings" },
  { key: "show_rta_leaderboard", label: "RTA Leaderboard", desc: "Show RTA leaderboard rankings" },
  { key: "highlight_recent", label: "Highlight Recent", desc: "Highlight recently added TASes" },
  { key: "show_visitor_counter", label: "Visitor Counter", desc: "Display visitor count" },
] as const;

export default function PreferencesPage() {
  const { data: profile, isLoading } = useProfile();

  const updateUsername = useUpdateProfile1();
  const updatePreferences = useUpdateProfile2();
  const updateAvatar = useUpdateProfileAvatar();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [pronouns, setPronouns] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [prefs, setPrefs] = useState({
    show_rta: false,
    show_time_saved: false,
    show_leaderboard: false,
    show_rta_leaderboard: false,
    highlight_recent: false,
    show_visitor_counter: false,
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [draftUsername, setDraftUsername] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [draftPronouns, setDraftPronouns] = useState("");

  const [draftAvatarFile, setDraftAvatarFile] = useState<File | null>(null);
  const [draftAvatarPreview, setDraftAvatarPreview] = useState<string | null>(null);

  const [draftBannerFile, setDraftBannerFile] = useState<File | null>(null);
  const [draftBannerPreview, setDraftBannerPreview] = useState<string | null>(null);

  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [avatarCropTemp, setAvatarCropTemp] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    setUsername(profile.username);
    setBio(profile.bio || "");
    setPronouns(profile.pronouns || "");

    setPrefs({
      show_rta: profile.show_rta,
      show_time_saved: profile.show_time_saved,
      show_leaderboard: profile.show_leaderboard,
      show_rta_leaderboard: profile.show_rta_leaderboard,
      highlight_recent: profile.highlight_recent,
      show_visitor_counter: profile.show_visitor_counter,
    });

    setAvatarPreview(profile.avatar_url || null);
    setBannerPreview(profile.banner_url || null);
  }, [profile]);

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

  const handleDraftAvatarChange = (file: File | null) => {
    if (!file) return;

    const error = validateImageSize(file);
    if (error) return alert(error);

    const url = URL.createObjectURL(file);

    setDraftAvatarFile(file);
    setAvatarCropTemp(url);
    setAvatarCropOpen(true);
  };

  const handleDraftBannerChange = (file: File | null) => {
    if (!file) return;

    const error = validateImageSize(file);
    if (error) return alert(error);

    setDraftBannerFile(file);
    setDraftBannerPreview(URL.createObjectURL(file));
  };

  const confirmAvatarCrop = () => {
    if (!avatarCropTemp) return;

    setDraftAvatarPreview(avatarCropTemp);
    setAvatarCropOpen(false);
    setAvatarCropTemp(null);
  };

  const handleSaveProfile = async () => {
    try {
      await updateUsername.mutateAsync({ username: draftUsername });

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

  const handleCancel = () => {
    setIsEditingProfile(false);
    setDraftAvatarFile(null);
    setDraftBannerFile(null);
  };

  if (isLoading || !profile) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-800/10 to-slate-900 text-white px-6 pt-20 pb-16">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold">Preferences</h1>
          <p className="text-slate-400 mt-2">
            Customise your profile and viewing experience
          </p>
        </div>

        {/* PROFILE + SETTINGS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

         {/* PROFILE CARD (CUSTOM UI RESOLUTION - NOT CROPPED) */}
<div className="rounded-3xl border border-slate-800 overflow-hidden relative w-full aspect-[9/16] md:aspect-[11/16]">

  {/* BACKGROUND */}
  <div className="absolute inset-0">
    {bannerPreview ? (
      <img
  src={bannerPreview}
  className="w-full h-full object-cover blur-[0px] scale-100 opacity-70"
/>
    ) : (
      <div className="w-full h-full bg-slate-900" />
    )}
  </div>

  <div className="absolute inset-0 bg-black/10" />

  {/* CONTENT (REAL UI LAYOUT) */}
  <div className="relative h-full flex flex-col items-center text-center px-6 py-10">

    {/* AVATAR */}
    <div className="w-[280px] h-[280px] md:w-[300px] md:h-[300px] rounded-full overflow-hidden border-4 border-slate-900 shadow-2xl bg-slate-800 flex-shrink-0">
      {avatarPreview ? (
        <img src={avatarPreview} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
          No Avatar
        </div>
      )}
    </div>

    {/* TEXT BLOCK */}
    <div className="mt-8 space-y-2">
      <h2 className="text-4xl font-bold">{profile.username}</h2>

      {pronouns && (
        <p className="text-slate-400 mt-2">{pronouns}</p>
      )}

      {bio && (
        <p className="text-slate-300 mt-5 max-w-lg leading-relaxed">
          {bio}
        </p>
      )}
    </div>

    {/* BUTTON (now guaranteed visible) */}
    <div className="mt-10">
      <button
        onClick={openEditProfile}
        className="px-7 py-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-lg"
      >
        Edit Profile
      </button>
    </div>

  </div>
</div>

          {/* SETTINGS */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">

            <h2 className="text-xl font-semibold mb-6">
              Default Display Settings
            </h2>

            <div className="grid gap-4">
              {settings.map((s) => (
                <div key={s.key} className="p-4 bg-slate-800 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <div>{s.label}</div>
                      <div className="text-sm text-slate-400">{s.desc}</div>
                    </div>

                    {/* ✅ FIXED TOGGLE (AUTO SAVE) */}
                    <button
                      onClick={() => {
                        setPrefs((prev) => {
                          const updated = {
                            ...prev,
                            [s.key]: !prev[s.key],
                          };

                          updatePreferences.mutate(updated);

                          return updated;
                        });
                      }}
                      className={`w-12 h-7 rounded-full ${
                        prefs[s.key] ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* EDIT MODAL */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6">
            <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-xl">

              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

              <div className="mb-6">
                <div className="h-32 w-full bg-slate-800 rounded-xl overflow-hidden">
                  {draftBannerPreview && (
                    <img src={draftBannerPreview} className="w-full h-full object-cover" />
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 text-sm"
                  onChange={(e) =>
                    handleDraftBannerChange(e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="flex gap-4 mb-6 items-start">
                <div className="w-[200px] h-[200px] rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                  {draftAvatarPreview ? (
                    <img
                      src={draftAvatarPreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-500">No Avatar</span>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleDraftAvatarChange(e.target.files?.[0] || null)
                  }
                />
              </div>

              <input
                value={draftUsername}
                onChange={(e) => setDraftUsername(e.target.value)}
                className="w-full p-3 bg-slate-800 rounded-xl mb-4"
              />

              <input
                value={draftPronouns}
                onChange={(e) => setDraftPronouns(e.target.value)}
                className="w-full p-3 bg-slate-800 rounded-xl mb-4"
              />

              <textarea
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                className="w-full p-3 bg-slate-800 rounded-xl mb-4"
                rows={4}
              />

              <div className="flex justify-end gap-3">
                <button onClick={handleCancel} className="px-5 py-3 bg-slate-700 rounded-xl">
                  Cancel
                </button>

                <button onClick={handleSaveProfile} className="px-5 py-3 bg-emerald-500 rounded-xl">
                  Save Profile
                </button>
              </div>

            </div>
          </div>
        )}

        {/* CROPPER */}
        {avatarCropOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative">

              <h3 className="text-center mb-4 font-bold">Crop Preview</h3>

              <div className="relative w-[260px] h-[260px]">
                <img
                  src={avatarCropTemp || ""}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/50"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[200px] h-[200px] rounded-full overflow-hidden border-4 border-emerald-500">
                    <img
                      src={avatarCropTemp || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => setAvatarCropOpen(false)}
                  className="px-4 py-2 bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmAvatarCrop}
                  className="px-4 py-2 bg-emerald-500 rounded-lg"
                >
                  Use This
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}