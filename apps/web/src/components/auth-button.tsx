"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-10 w-24 animate-pulse rounded bg-gray-700" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">{session.user.name}</span>
        <button
          onClick={() => signOut()}
          className="rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => signIn("google")}
        className="rounded bg-white px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
      >
        Google 登入
      </button>
      <button
        onClick={() => signIn("github")}
        className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        GitHub 登入
      </button>
    </div>
  );
}
