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
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <>
    

  


  {/* BACKGROUND WRAPPER (ONLY ONE) */}
  <div className="min-h-screen w-full bg-[url('/wallpapers/profilestadium.webp')] bg-cover bg-center bg-no-repeat bg-fixed text-white relative">




    {/* overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 to-slate-900/80" />



    {/* PAGE CONTENT */}
    <div className="relative min-h-screen px-6 flex items-center justify-center">
      
      <div className="w-full max-w-6xl space-y-5 flex flex-col items-center mt-20 lg:mt-0">



    {/* image */}
    <div className="px-4 flex items-center justify-center relative -translate-y-2">
  <img
    src="/wallpapers/Profile.png"
    alt="Profile"
    className="h-14 md:h-16 w-auto object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
  />
</div>



          {/* HEADER (ABOVE CARD - SAFE INSERT) */}
<div className="w-full flex justify-center mb-6">
  <div className="flex items-center w-full max-w-xl">
    
    


        
          </div>

          <div className="flex flex-col gap-4 items-center lg:flex-row lg:items-start">

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
