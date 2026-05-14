"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VisibleTablesProvider } from "../lib/VisibleTablesContext";
import { useState } from "react";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  // useState prevents recreating QueryClient on rerenders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <VisibleTablesProvider>
        {children}
      </VisibleTablesProvider>
    </QueryClientProvider>
  );
}