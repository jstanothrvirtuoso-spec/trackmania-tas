"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";

export default function SubmitPage() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const forceFull = searchParams.get("mode") === "page";

  if (forceFull) return null;

  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => router.back()}
      />

      <SubmitForm />

    </div>

  );
}
