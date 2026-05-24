
import "./globals.css";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Header from "@/components/Header";
import Providers from "./providers";
import VisitorCounter from "@/components/VisitorCounter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import './globals.css'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-screen justify-center cursor-[url('/cursor.png')_0_0,_auto]">
        <Providers>
          <Header />
          <main className="sticky inset-0">{children}</main>
          <VisitorCounter />
        </Providers>
      </body>
    </html>
  );
}