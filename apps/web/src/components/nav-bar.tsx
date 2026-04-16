"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthButton } from "./auth-button";

const PUBLIC_ITEMS = [
  { href: "/practice", label: "題庫" },
];

const AUTH_ITEMS = [
  { href: "/dashboard", label: "儀表板" },
  { href: "/practice", label: "題庫" },
  { href: "/profile", label: "個人檔案" },
];

export function NavBar() {
  const pathname = usePathname();
  const { status } = useSession();
  const navItems = status === "authenticated" ? AUTH_ITEMS : PUBLIC_ITEMS;

  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            SKILL
          </Link>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <AuthButton />
      </nav>
    </header>
  );
}
