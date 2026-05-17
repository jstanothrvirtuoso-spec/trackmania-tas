import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import "./globals.css";

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
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <VisitorCounter />
        </Providers>
      </body>
    </html>
  );
}