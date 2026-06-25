"use client";

import Image from "next/image";
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
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <>
      {/* BACKGROUND WRAPPER */}
      <div className="min-h-screen w-full bg-[url('/wallpapers/profilestadium.webp')] bg-cover bg-center bg-no-repeat bg-fixed text-white fixed"/>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 to-slate-900/80" />

      {/* PAGE CONTENT */}
      <div className="relative min-h-screen px-2 flex flex-col w-full items-center justify-center gap-6 sm:gap-8 pt-22">

        {/* Header */}
        <Image
          src="/wallpapers/profile.png"
          alt="Profile"
          width={371}
          height={74}
          loading="eager"
          className="h-12 lg:h-16 w-auto object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
        />

        {/* Content */}
        <div className="flex w-full flex-col gap-4 items-center justify-center lg:flex-row lg:items-start">

          {/* PROFILE CARD */}
          <ProfileCard 
            profile={profilePublicMe}
            onEditClick={() => setIsEditingProfile(true)}
          />

          {/* SUBMISSIONS */}
          {profilePrivate && (
            <ProfileSubmission
              profilePrivate={profilePrivate}
            />
          )}

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
