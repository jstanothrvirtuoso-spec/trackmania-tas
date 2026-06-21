"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";
import { useProfilePrivate } from "@/lib/Profiles";

export default function SubmitPage() {

  const router = useRouter();
  const { data: profilePrivate, isLoading } = useProfilePrivate();

  useEffect(() => {
    if (!isLoading && !profilePrivate?.submit_permission) {
      router.replace("/");
    }
  }, [isLoading, profilePrivate, router]);

  if (isLoading || !profilePrivate?.submit_permission) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-2 pt-20 pb-6 text-slate-100">
      <SubmitForm />
    </div>
  );
}
