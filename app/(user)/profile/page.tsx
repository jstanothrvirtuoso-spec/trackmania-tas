"use client";

import { useState } from "react";
import ProfileCard from "@/components/profile/ProfileCard";
import { useProfilePrivate, useProfilePublicMe } from "@/lib/Profiles";
import ProfileSubmission from "@/components/profile/ProfileSubmissions";
import EditProfile from "@/components/profile/EditProfile";

export default function ProfilePage() {

  const { data: profilePublicMe } = useProfilePublicMe();
  const { data: profilePrivate, isLoading } = useProfilePrivate();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
        <div className="w-full max-w-6xl space-y-5 flex flex-col items-center mt-20 lg:mt-0">

          {/* HEADER */}
          <div className="text-center flex flex-row justify-center gap-4">
            <h1 className="text-4xl font-bold">
              Profile
            </h1>

            <button
              onClick={() => setIsEditingProfile(true)}
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

          <div className="flex flex-col gap-4 items-center lg:flex-row lg:items-start">

            {/* PROFILE CARD */}
            <ProfileCard 
              profile={profilePublicMe}
            />

            {/* SUBMISSIONS */}
            {profilePrivate && (
              <ProfileSubmission
                profilePrivate={profilePrivate}
              />
            )}

          </div>
        </div>
      </div>

      {/* EDIT PAGE */}
      {isEditingProfile && profilePrivate && profilePublicMe && (
        <EditProfile
          profilePrivate={profilePrivate}
          profilePublicMe={profilePublicMe}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          setIsEditingProfile={setIsEditingProfile}
        />
      )}

      {isSaving && (
        <div className="fixed inset-0 z-[9999] cursor-wait" />
      )}
    </>
  );
}
