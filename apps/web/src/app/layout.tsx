import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKILL Platform — AI 程式解題導師",
  description: "透過 AI 導師的蘇格拉底式引導，精進你的演算法與系統設計能力",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-950 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
