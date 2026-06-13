"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SubmitForm from "@/components/SubmitForm";

export default function SubmitPage() {

  const router = useRouter();

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) {
      router.replace("/submit");
    }
  }, []);

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
