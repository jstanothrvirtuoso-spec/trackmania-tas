"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import ProfileCard from "@/components/ProfileCard";
import { formatDate, formatTime, timeAgo } from "@/utils/formatting";
import { useProfilePrivate, useProfilePublicMe, useUpdateProfilePrivate, useUpdateProfilePublic } from "@/lib/Profiles";
import { PROFILE_AVATARS, PROFILE_BANNERS, PROFILE_COLOURS, DISPLAY_SETTINGS } from "@/utils/constants";
import { fetchUserSubmissions } from "@/lib/TasSubmissions";

type EditMode = "avatar" | "banner" | null;
type ProfileDraft = {
  display_name: string;
  bio: string;
  avatar: number;
  banner: number;
  colour: number;

  show_rta: boolean;
  show_time_saved: boolean;
  show_leaderboard: boolean;
  show_rta_leaderboard: boolean;
  show_recent: boolean;
  show_visitor_counter: boolean;
};

const DISPLAY_NAME_REGEX = /^(?! )[a-zA-Z0-9_-]+( [a-zA-Z0-9_-]+)*(?<! )$/;
const STATUS_COLOUR = {
  "pending": ["bg-[#3230af]/30", "bg-[#3230af]/40"],
  "approved": ["bg-[#6cbe36]/30", "bg-[#6cbe36]/40"],
  "rejected": ["bg-[#9e2121]/20", "bg-[#9e2121]/30"]
};

export default function ProfilePage() {

  const { data: profilePublicMe } = useProfilePublicMe();
  const { data: profilePrivate, isLoading } = useProfilePrivate();
  const { data: tasSubmissions } = fetchUserSubmissions(profilePrivate?.id ?? "");
  const updateProfilePublic = useUpdateProfilePublic();
  const updateProfilePrivate = useUpdateProfilePrivate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  const recentSubmissions = useMemo(() => {
    if (!tasSubmissions) return [];

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const pending = tasSubmissions.filter(tas => tas.status === "pending");

    const recentNonPending = tasSubmissions
      .filter(tas => tas.status !== "pending" && new Date(tas.created_at) >= oneMonthAgo)
      .slice(0, Math.max(0, 50 - pending.length));

    return [...pending, ...recentNonPending].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [tasSubmissions]);

  function startEditing() {
    if (!profilePrivate || !profilePublicMe) return;
    
    if (!draft) {
      setDraft({
        display_name: profilePublicMe.display_name,
        bio: profilePublicMe.bio ?? "",
        avatar: profilePublicMe.avatar,
        banner: profilePublicMe.banner,
        colour: profilePublicMe.colour,

        show_rta: profilePrivate.show_rta,
        show_time_saved: profilePrivate.show_time_saved,
        show_leaderboard: profilePrivate.show_leaderboard,
        show_rta_leaderboard: profilePrivate.show_rta_leaderboard,
        show_recent: profilePrivate.show_recent,
        show_visitor_counter: profilePrivate.show_visitor_counter,
      });
    }

    setIsEditingProfile(true);
  }

  function updateDraft<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  }

  function handleSaveProfile() {
    if (!draft?.display_name || displayNameError) return;

    setIsSaving(true);

    const publicDraft = {
      display_name: draft.display_name,
      bio: draft.bio,
      avatar: draft.avatar,
      banner: draft.banner,
      colour: draft.colour,
    }

    updateProfilePublic.mutate({ user: profilePublicMe, profileUpdate: publicDraft }, {
      onSuccess: () => {
        setIsSaving(false);
        setIsEditingProfile(false);
      },
      onError: () => {
        setIsSaving(false);
      },
    });

    const privateDraft = {
      show_rta: draft.show_rta,
      show_time_saved: draft.show_time_saved,
      show_leaderboard: draft.show_leaderboard,
      show_rta_leaderboard: draft.show_rta_leaderboard,
      show_recent: draft.show_recent,
      show_visitor_counter: draft.show_visitor_counter,
    }

    updateProfilePrivate.mutate(privateDraft, {
      onSuccess: () => {
        setIsSaving(false);
        setIsEditingProfile(false);
      },
      onError: () => {
        setIsSaving(false);
      },
    });
  };

  if (isLoading || !profilePublicMe) {
    return (
      <div className="text-white p-10">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-violet-800/10 to-slate-700/80 text-white px-6 flex items-center justify-center">
        <div className="w-full max-w-6xl space-y-5 flex flex-col items-center mt-10">

          {/* HEADER */}
          <div className="text-center flex flex-row justify-center gap-4">
            <h1 className="text-4xl font-bold">
              Profile
            </h1>

            <button
              onClick={() => startEditing()}
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

          <div className="flex flex-row gap-4">

            {/* PROFILE CARD */}
            <ProfileCard 
              profile={profilePublicMe}
            />

            {/* SUBMISSIONS */}
            {recentSubmissions && (
              <div className="flex flex-col py-3 gap-2">
                <h1 className="text-lg font-semibold italic justify-center flex text-slate-300">
                  Recent TAS Submissions
                </h1>

                <div className="overflow-x-auto">
                  <table className="border-separate border border-slate-500 rounded-lg overflow-hidden text-center text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-300 uppercase tracking-[0.18em]">
                        <th className="px-3 py-1.5 font-normal">
                          Date
                        </th>
      
                        <th className="px-3 py-1.5 font-normal">
                          Track
                        </th>
      
                        <th className="px-3 py-1.5 font-normal">
                          Time
                        </th>
      
                        <th className="px-3 py-1.5 font-normal">
                          Cat.
                        </th>
      
                        <th className="px-3 py-1.5 font-normal">
                          Authors
                        </th>
      
                        <th className="px-3 py-1.5 font-normal">
                          Status
                        </th>
                      </tr>
                    </thead>
      
                    <tbody>
                      {recentSubmissions.map((row, index) => {
                        const status = row.status === "pending" ? `Submitted ${timeAgo(row.created_at)} ago (pending)`
                          : row.status === "approved" ? "Approved"
                          : row.admin_notes ? `Submission rejected with note: ${row.admin_notes}`
                          : "Submission rejected :("
                        
                        const colourIndex = index % 2 == 0 ? 1 : 0
                        const rowColour = STATUS_COLOUR[row.status]?.[colourIndex] ?? "bg-slate-500/10"
                        
                        return (
                          <tr
                            key={ index }
                            className={`border-b border-slate-800 ${rowColour}`}
                          >
                            <td className="px-3 py-1.5 whitespace-nowrap">
                              { formatDate(row.date) }
                            </td>
      
                            <td className="px-3 py-1.5 whitespace-nowrap">
                              {row.track}
                            </td>
      
                            <td className="px-3 py-1.5">
                              { formatTime(row.time_ms ?? 0) }
                            </td>
      
                            <td className="px-3 py-1.5">
                              { row.category}
                            </td>
      
                            <td className="px-3 py-1.5">
                              { row.authors.join(", ") }
                            </td>
      
                            <td className="px-3 py-1.5">
                              { status }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* EDIT PAGE */}
      {isEditingProfile && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
          onClick={() => setIsEditingProfile(false)}
        >
          <div
            className="bg-slate-900 p-8 rounded-2xl w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >

            <h2 className="text-2xl font-bold mb-6">
              Edit Profile
            </h2>

            <div className="flex gap-6 items-start">

              {/* BANNER */}
              {editMode !== "banner" ? (
                <button
                  type="button"
                  onClick={() => setEditMode("banner")}
                  className="w-[190px] h-[320px] rounded-xl overflow-hidden hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="relative w-full h-full banner-frame">
                    <Image
                      src={PROFILE_BANNERS[draft?.banner ?? 0]}
                      alt="Banner"
                      fill
                      className="object-cover opacity-80"
                      sizes="50vw"
                      priority
                    />
                  </div>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PROFILE_BANNERS).map(([key, src]) => {
                    const id = Number(key);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          updateDraft("banner", id);
                          setEditMode(null);
                        }}
                        className={`h-16 rounded overflow-hidden border cursor-pointer ${
                          draft?.banner === id ? "border-emerald-500" : "border-transparent"}`}
                      >
                        <Image
                          src={src}
                          alt="Banner"
                          width={50}
                          height={50}
                          className={`object-cover hover:opacity-100 transition ${
                            draft?.banner === id ? "opacity-100" : "opacity-50"}`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MIDDLE */}
              <div className="flex-1 space-y-4">

                {/* AVATAR */}
                {editMode !== "avatar" ? (
                  <button
                    type="button"
                    onClick={() => setEditMode("avatar")}
                    className="w-[120px] h-[120px] rounded-full overflow-hidden hover:bg-slate-800 cursor-pointer"
                    style={{ backgroundColor: PROFILE_COLOURS[draft?.colour ?? 0]}}
                  >
                    <div className="flex justify-center">
                      <Image
                        src={PROFILE_AVATARS[draft?.avatar ?? 0]}
                        alt="Avatar"
                        width={100}
                        height={100}
                        className="object-cover"
                      />
                    </div>
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-5 gap-2 w-[380px]">
                      {Object.entries(PROFILE_AVATARS).map(([key, src]) => {
                        const id = Number(key);

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              updateDraft("avatar", id);
                              setEditMode(null);
                            }}
                            className={`h-16 rounded overflow-hidden border cursor-pointer ${
                              draft?.avatar === id
                                ? "border-emerald-500"
                                : "border-transparent"
                            }`}
                          >
                            <div className="flex justify-center">
                              <Image
                                src={src}
                                alt="Avatar"
                                width={50}
                                height={50}
                                className={`object-cover hover:opacity-100 transition ${
                                  draft?.avatar === id ? "opacity-100" : "opacity-50"}`}
                              />
                            </div>

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
                              updateDraft("colour", id);
                              setEditMode(null);
                            }}
                            className={`h-7 rounded overflow-hidden border hover:opacity-100 cursor-pointer ${
                              draft?.colour === id ? "border-emerald-500" : "border-transparent opacity-50"}`}
                            style={{ backgroundColor: colour }}
                          >
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* DISPLAY NAME */}
                <input
                  value={draft?.display_name ?? ""}
                  maxLength={20}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateDraft("display_name", value);

                    if (!value) {
                      setDisplayNameError("Display name is required");
                    } else if (value.length < 3) {
                      setDisplayNameError("Too short (min 3 characters)");
                    } else if (value.length > 20) {
                      setDisplayNameError("Too long (max 20 characters)");
                    } else if (value[0] === " ") {
                      setDisplayNameError("You cannot start your display name with a space");
                    } else if (!DISPLAY_NAME_REGEX.test(value)) {
                      setDisplayNameError("This display name is invalid");
                    } else {
                      setDisplayNameError(null);
                    }
                  }}
                  className="w-full p-3 bg-slate-800 rounded-xl"
                  placeholder="Display Name"
                />
                {displayNameError && (
                  <p className="mt-1 text-sm text-red-400">
                    {displayNameError}
                  </p>
                )}

                {/* BIO */}
                <textarea
                  value={draft?.bio ?? ""}
                  onChange={(e) =>
                    updateDraft("bio", e.target.value)
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
                  {DISPLAY_SETTINGS.map((setting) => (
                    <div
                      key={setting.key}
                      className="px-3 py-2 bg-slate-800 rounded-xl flex justify-between items-center gap-5"
                    >
                      <div>
                        {setting.label}
                      </div>

                      <button
                        type="button"
                        onClick={() => updateDraft(setting.key, !(draft?.[setting.key] ?? true))}
                        className={`relative w-10 h-6 rounded-full transition cursor-pointer ${
                          draft?.[setting.key] ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-700 hover:bg-slate-600"}`}
                      >
                        <div
                          className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform duration-200 ${
                            draft?.[setting.key] ? "translate-x-4" : "translate-x-0"}`}
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
                disabled={!draft || !draft.display_name || (displayNameError?.length ?? 0) > 0 || isSaving}
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
