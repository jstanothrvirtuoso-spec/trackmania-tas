
import "./globals.css";
import Script from "next/script";
import { CURSOR } from "@/utils/constants";
import Header from "@/components/header/Header";
import Providers from "./providers";
// import VisitorCounter from "@/components/VisitorCounter";

export const metadata = {
  metadataBase: new URL("https://www.tas-nadeo.com"),

  title: {
    default: "TAS Nadeo - A fine collection of TrackMania Nadeo TASes",
    template: "%s | TAS Nadeo",
  },

  description: "TAS Nadeo is a Trackmania TAS leaderboard and community site for nadeo TAS records, inputs, and various stats.",

  openGraph: {
    title: "TAS Nadeo",
    description: "TAS Nadeo is a Trackmania TAS leaderboard and community site for nadeo TAS records, inputs, and various stats.",
    url: "https://www.tas-nadeo.com",
    siteName: "TAS Nadeo",
    type: "website",
    images: [
      {
        url: "/tas-nadeo.webp",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TAS Nadeo",
    description: "TAS Nadeo is a Trackmania TAS leaderboard and community site for nadeo TAS records, inputs, and various stats.",
    images: ["/tas-nadeo.webp"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className={`min-h-screen justify-center ${CURSOR}`}>
        <Providers>
          <Header />
          <main className="sticky inset-0">{children}</main>
          {/* <VisitorCounter /> */}
          {modal}
          <Script src="/scripts/lzo1x.js" strategy="afterInteractive" />
          <Script src="/scripts/extractInputs.js" strategy="afterInteractive" />
        </Providers>
      </body>
    </html>
  );
}
