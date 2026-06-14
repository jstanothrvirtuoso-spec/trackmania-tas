
import "./globals.css";
import { CURSOR } from "@/utils/constants";
import Header from "@/components/header/Header";
import Providers from "./providers";
// import VisitorCounter from "@/components/VisitorCounter";

export const metadata = {
  metadataBase: new URL("https://tas-nadeo.com"),

  title: {
    default: "TAS Nadeo - Tool assisted speedruns for nadeo tracks in Trackmania",
    template: "%s | TAS Nadeo",
  },

  description: "TAS Nadeo is a Trackmania TAS leaderboard and community site for nadeo records, inputs, and various stats.",

  openGraph: {
    title: "TAS Nadeo",
    description: "Trackmania TAS leaderboards, tracks, author stats, and input resources for the community.",
    url: "https://www.tas-nadeo.com",
    siteName: "TAS Nadeo",
    type: "website",
    images: [
      {
        url: "/tas-nadeo.png",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TAS Nadeo",
    description: "Trackmania TAS leaderboards, tracks, author stats, and input resources for the community.",
    images: ["/tas-nadeo.png"],
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
        </Providers>
      </body>
    </html>
  );
}
