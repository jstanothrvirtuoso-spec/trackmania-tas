"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";

export default function SubmitPage() {
  
  const router = useRouter();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto px-2 py-2">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => router.back()}
      />

      <div className="w-full flex justify-center mb-7">
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="w-full max-w-3xl"
        >
          <SubmitForm />
        </div>
      </div>
    </div>
  );
}
