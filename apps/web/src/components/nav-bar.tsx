"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthButton } from "./auth-button";

const NAV_ITEMS = [
  { href: "/practice", label: "Problems" },
  { href: "/learn", label: "Learn Map" },
  { href: "/dashboard", label: "Dashboard", auth: true },
  { href: "/profile", label: "Profile", auth: true },
];

export function NavBar() {
  const pathname = usePathname();
  const { status } = useSession();

  // Hide on practice problem pages (they have their own nav bar)
  if (pathname.startsWith("/practice/") && pathname !== "/practice") {
    return null;
  }

  const items = NAV_ITEMS.filter((item) => !item.auth || status === "authenticated");

  return (
    <header className="flex h-[42px] items-center justify-between border-b border-gray-800/60 bg-[#1a1a1a] px-4">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-[16px] font-bold text-orange-400 hover:text-orange-300">
          SKILL
        </Link>
        <div className="h-4 w-px bg-gray-700" />
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-[13px] font-medium transition-colors ${
              pathname === item.href
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right: Auth */}
      <AuthButton />
    </header>
  );
}
