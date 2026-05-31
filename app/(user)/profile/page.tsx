"use client";

import Image from "next/image";
import { useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import { Profile, useProfile, useUpdateProfile } from "@/lib/Profiles";
import { PROFILE_AVATARS, PROFILE_BANNERS, PROFILE_COLOURS, DISPLAY_SETTINGS } from "@/utils/constants";

type EditMode = "avatar" | "banner" | null;

export default function ProfilePage() {

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftProfile, setDraftProfile] = useState<Profile | null>(null);

  function startEditing() {
    if (!profile) return;

    if (!draftProfile) {
      setDraftProfile(profile)
    };

    setIsEditingProfile(true);
  }

  function updateDraftProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraftProfile(prev => prev ? { ...prev, [key]: value } : prev);
  };

  function toggleSetting(key: keyof Profile) {
    setDraftProfile(prev => prev ? { ...prev, [key]: !prev[key] } : prev);
  };

  function handleSaveProfile() {
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

  if (isLoading || !profile) {
    return (
      <div className="text-white p-10">
        Loading...
      </div>
    );
  }

  return (
  <>
    <div className="min-h-screen bg-gradient-to-br from-violet-800/10 to-slate-700/80 text-white px-6 flex items-center justify-center">
      
      <div className="w-full max-w-2xl space-y-5 flex flex-col items-center">

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

          {/* PROFILE CARD */}
          <ProfileCard 
            profile={profile}
          />

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
              {editMode !== "banner" ? (
                <button
                  type="button"
                  onClick={() => setEditMode("banner")}
                  className="w-[190px] h-[320px] rounded-xl overflow-hidden hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="relative w-full h-full banner-frame">
                    <Image
                      src={PROFILE_BANNERS[draftProfile?.banner ?? 0]}
                      alt="Banner"
                      fill
                      className="object-cover opacity-80"
                      sizes="100vw"
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
                          updateDraftProfile("banner", id);
                          setEditMode(null);
                        }}
                        className={`h-16 rounded overflow-hidden border ${
                          draftProfile?.banner === id ? "border-emerald-500" : "border-transparent"}`}
                      >
                        <Image
                          src={src}
                          alt="Banner"
                          width={50}
                          height={50}
                          className={`object-cover hover:opacity-100 transition ${
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
                {editMode !== "avatar" ? (
                  <button
                    type="button"
                    onClick={() => setEditMode("avatar")}
                    className="w-[120px] h-[120px] rounded-full overflow-hidden hover:bg-slate-800 cursor-pointer"
                    style={{ backgroundColor: PROFILE_COLOURS[draftProfile?.colour ?? 0]}}
                  >
                    <div className="flex justify-center">
                      <Image
                        src={PROFILE_AVATARS[draftProfile?.avatar ?? 0]}
                        alt="Avatar"
                        width={100}
                        height={0}
                        sizes="100vw"
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
                              updateDraftProfile("avatar", id);
                              setEditMode(null);
                            }}
                            className={`h-16 rounded overflow-hidden border ${
                              draftProfile?.avatar === id
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
                                  draftProfile?.avatar === id ? "opacity-100" : "opacity-50"}`}
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
                              updateDraftProfile("colour", id);
                              setEditMode(null);
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
                  value={draftProfile?.username ?? ""}
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
