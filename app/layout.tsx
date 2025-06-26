import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import UserSync from "@/components/user-sync";
import { Toaster } from "sonner";
import { Header } from "@/components/header";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Checkmate - TikTok Fact Checker",
  description:
    "Verify content with AI-powered fact-checking. Transcribe, analyze, and get credibility reports for social media videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* User sync is used to sync the user to the database */}
          <UserSync />
          <Header />
          {children}
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
