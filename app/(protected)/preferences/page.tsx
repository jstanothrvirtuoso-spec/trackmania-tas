"use client";

import { useEffect, useState } from "react";
import { useProfile, useUpdateProfile1, useUpdateProfile2 } from "@/lib/Profiles";

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
  const isSavingUsername = updateUsername.isPending;
  const isSavingPreferences = updatePreferences.isPending;
  const [username, setUsername] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

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
    setUsername(profile.username)
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

        {/* USERNAME */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur p-6 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>

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
                : "bg-emerald-500 hover:bg-emerald-400 hover:cursor-pointer active:scale-[0.98]"
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
            {settings.map((s) => {
              return (
                <div
                  key={s.key}
                  className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-sm text-slate-400">
                        {s.desc}
                      </div>
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
              );
            })}
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSavingPreferences}
            className={`mt-4 rounded-xl px-5 py-3 font-medium transition flex items-center justify-center gap-2
              ${isSavingPreferences
                ? "bg-emerald-600/70 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 hover:cursor-pointer active:scale-[0.98]"
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
