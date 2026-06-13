"use client";

import { useRouter } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";

export default function SubmitPage() {

  const router = useRouter();

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
