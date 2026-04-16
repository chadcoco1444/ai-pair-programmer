import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKILL Platform — AI Pair Programmer",
  description: "Master algorithms and system design with an AI tutor using the SKILL framework",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0f] text-white">
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
