"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-7 w-16 animate-pulse rounded bg-[#333]" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <img src={session.user.image} alt="" className="h-6 w-6 rounded-full" />
        )}
        <span className="text-[12px] text-gray-400">{session.user.name}</span>
        <button
          onClick={() => signOut()}
          className="rounded px-2 py-1 text-[11px] text-gray-500 hover:bg-[#333] hover:text-gray-300"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => signIn("google")}
        className="rounded bg-[#333] px-3 py-1 text-[12px] text-gray-300 hover:bg-[#444]"
      >
        Google
      </button>
      <button
        onClick={() => signIn("github")}
        className="rounded bg-[#333] px-3 py-1 text-[12px] text-gray-300 hover:bg-[#444]"
      >
        GitHub
      </button>
    </div>
  );
}
