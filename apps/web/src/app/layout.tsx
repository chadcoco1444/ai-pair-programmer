import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

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
    <html lang="en" className={`${firaSans.variable} ${firaCode.variable}`}>
      <body className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
