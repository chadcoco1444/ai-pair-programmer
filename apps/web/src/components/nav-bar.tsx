"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, type ComponentType, type SVGProps } from "react";
import { AuthButton } from "./auth-button";

type IconProps = SVGProps<SVGSVGElement>;

function HomeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function PracticeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3.5 6 1.2 1.2L7 5" />
      <path d="m3.5 12 1.2 1.2L7 11" />
      <path d="m3.5 18 1.2 1.2L7 17" />
    </svg>
  );
}

function LearnIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="13" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M7.7 7.2 10.3 11.8M16.3 7.2 13.7 11.8M10.8 14.7 7 17.5M13.2 14.7 17 17.5" />
    </svg>
  );
}

function DashboardIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 20h18" />
      <path d="M6 20V11" />
      <path d="M11 20V6" />
      <path d="M16 20v-7" />
      <path d="M21 20V9" />
    </svg>
  );
}

function ProfileIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function MenuIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  auth?: boolean;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon, exact: true },
  { href: "/practice", label: "Practice", icon: PracticeIcon },
  { href: "/learn", label: "Learn Map", icon: LearnIcon },
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon, auth: true },
  { href: "/profile", label: "Profile", icon: ProfileIcon, auth: true },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function NavBar() {
  const pathname = usePathname();
  const { status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide on individual practice problem pages (they have their own nav bar)
  if (pathname.startsWith("/practice/") && pathname !== "/practice") {
    return null;
  }

  const items = NAV_ITEMS.filter((item) => !item.auth || status === "authenticated");

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/70 md:px-6"
      role="banner"
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-slate-50 transition-colors duration-200"
          onClick={() => setMobileOpen(false)}
        >
          <span
            className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          />
          <span>AI Pair</span>
        </Link>
      </div>

      {/* Desktop nav */}
      <nav
        aria-label="Primary"
        className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
      >
        {items.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-flex min-h-[36px] items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-200",
                active
                  ? "bg-slate-800 text-white shadow-[inset_2px_0_0_0_rgba(34,197,94,0.9)]"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right: Auth + Mobile toggle */}
      <div className="flex items-center gap-2">
        <div className="hidden md:block">
          <AuthButton />
        </div>
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="primary-mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-300 transition-colors duration-200 hover:bg-slate-800/60 hover:text-white md:hidden"
        >
          {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="primary-mobile-nav"
          className="absolute inset-x-0 top-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
            {items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-200",
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="mt-2 border-t border-slate-800 pt-3">
              <AuthButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
