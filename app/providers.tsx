"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { STALE_TIME } from "@/utils/constants";
import { AlertProvider } from "@/components/AlertProvider";
import { ConfirmProvider } from "@/components/ConfirmProvider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <AlertProvider>{children}</AlertProvider>
      </ConfirmProvider>
    </QueryClientProvider>
  );
}
