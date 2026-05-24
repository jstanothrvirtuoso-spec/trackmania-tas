"use client";

import { useEffect, useState } from "react";
import {
  useProfile,
  useUpdateProfile1,
  useUpdateProfile2,
  useUpdateProfileAvatar,
} from "@/lib/Profiles";

const usernameRegex = /^[a-zA-Z0-9_-]+$/;

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

  const isSavingUsername = updateUsername.isPending;
  const isSavingPreferences = updatePreferences.isPending;
  const isSavingAvatar = updateAvatar.isPending;

  const [username, setUsername] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [prefs, setPrefs] = useState({
    show_rta: false,
    show_time_saved: false,
    show_leaderboard: false,
    show_rta_leaderboard: false,
    highlight_recent: false,
    show_visitor_counter: false,
  });

  useEffect(() => {
    if (!profile) return;

    setUsername(profile.username);

    setPrefs({
      show_rta: profile.show_rta,
      show_time_saved: profile.show_time_saved,
      show_leaderboard: profile.show_leaderboard,
      show_rta_leaderboard: profile.show_rta_leaderboard,
      highlight_recent: profile.highlight_recent,
      show_visitor_counter: profile.show_visitor_counter,
    });
  }, [profile]);

  const validateUsername = (value: string) => {
    if (value.length < 3 || value.length > 20) {
      return "Username must be 3-20 characters";
    }
    if (!usernameRegex.test(value)) {
      return "This username contains an invalid character";
    }
    return null;
  };

  const handleSaveUsername = () => {
    const msg = validateUsername(username);
    setWarning(msg);
    if (msg) return;

    updateUsername.mutate({ username });
  };

  const handleSaveSettings = () => {
    updatePreferences.mutate(prefs);
  };

  // ✅ FIXED AVATAR UPLOAD (THIS WAS YOUR BUG)
  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      console.error("No avatar selected");
      return;
    }

    try {
      // IMPORTANT: pass File directly (NOT FormData)
      await updateAvatar.mutateAsync(avatarFile);

      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !profile) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-800/10 to-slate-800 text-white px-6 pt-20">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Preferences</h1>
          <p className="text-slate-400 mt-2">
            Customise your profile and viewing experience
          </p>
        </div>

        {/* PROFILE */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur p-6 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6">Profile</h2>

          {/* AVATAR SECTION */}
          <div className="flex items-center gap-6 mb-6">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center border border-slate-700">
              {avatarPreview || profile.avatar_url ? (
                <img
                  src={avatarPreview || profile.avatar_url || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-slate-300">
                  {profile.username?.[0]?.toUpperCase() || "K"}
                </span>
              )}
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                id="avatarUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setAvatarFile(file);
                  setAvatarPreview(URL.createObjectURL(file));
                }}
              />

              <label
                htmlFor="avatarUpload"
                className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 cursor-pointer"
              >
                Choose profile picture
              </label>

              <p className="text-xs text-slate-400 mt-2">
                Recommended: 260×260 PNG or JPG
              </p>

              {avatarFile && (
                <button
                  onClick={handleUploadAvatar}
                  disabled={isSavingAvatar}
                  className="mt-3 rounded-xl px-4 py-2 bg-emerald-500 hover:bg-emerald-400 flex items-center gap-2"
                >
                  {isSavingAvatar && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {isSavingAvatar ? "Uploading..." : "Save Avatar"}
                </button>
              )}
            </div>
          </div>

          {/* USERNAME */}
          <label className="block text-sm text-slate-400 mb-2">
            Username
          </label>

          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setWarning(validateUsername(e.target.value));
            }}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3"
          />

          {warning && (
            <p className="mt-2 text-sm text-red-400">{warning}</p>
          )}

          <button
            onClick={handleSaveUsername}
            disabled={isSavingUsername}
            className={`mt-4 rounded-xl px-5 py-3 font-medium transition flex items-center justify-center gap-2
              ${isSavingUsername
                ? "bg-emerald-600/70 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98]"
              }`}
          >
            {isSavingUsername && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isSavingUsername ? "Saving..." : "Save Username"}
          </button>
        </div>

        {/* SETTINGS */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur p-6 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6">
            Default Display Settings
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {settings.map((s) => (
              <div
                key={s.key}
                className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-sm text-slate-400">{s.desc}</div>
                  </div>

                  <button
                    onClick={() =>
                      setPrefs((prev) => ({
                        ...prev,
                        [s.key]: !prev[s.key],
                      }))
                    }
                    className={`relative h-7 w-12 rounded-full ${
                      prefs[s.key] ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-5 w-5 bg-white rounded-full transition ${
                        prefs[s.key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSavingPreferences}
            className={`mt-4 rounded-xl px-5 py-3 font-medium transition flex items-center justify-center gap-2
              ${isSavingPreferences
                ? "bg-emerald-600/70 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98]"
              }`}
          >
            {isSavingPreferences && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isSavingPreferences ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}