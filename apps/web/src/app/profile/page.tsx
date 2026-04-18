"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  ACCEPTED: {
    label: "Accepted",
    cls: "bg-emerald-500/10 text-emerald-400",
  },
  WRONG_ANSWER: {
    label: "Wrong Answer",
    cls: "bg-red-500/10 text-red-400",
  },
  TIME_LIMIT_EXCEEDED: {
    label: "TLE",
    cls: "bg-slate-700/50 text-slate-400",
  },
  RUNTIME_ERROR: {
    label: "Runtime Error",
    cls: "bg-slate-700/50 text-slate-400",
  },
  COMPILE_ERROR: {
    label: "Compile Error",
    cls: "bg-red-500/10 text-red-400",
  },
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function ProfilePage() {
  const { status } = useSession();

  if (status === "unauthenticated") {
    redirect("/");
  }

  const enabled = status === "authenticated";
  const { data: user } = trpc.user.me.useQuery(undefined, { enabled });
  const { data: stats } = trpc.learning.stats.useQuery(undefined, { enabled });
  const { data: submissions } = trpc.submission.history.useQuery(
    { limit: 10 },
    { enabled }
  );

  if (status === "loading" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const totalSubmissions = submissions?.length ?? 0;
  const acceptanceRate = stats ? Math.round(stats.passRate * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* Page header */}
        <h1 className="font-mono text-2xl font-bold text-white">Profile</h1>

        {/* User card */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-6 flex items-center gap-6 hover:border-slate-700 transition-colors duration-200">
          {/* Avatar */}
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="w-16 h-16 rounded-full ring-1 ring-slate-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-700 text-white font-mono text-2xl flex items-center justify-center">
              {initials}
            </div>
          )}

          {/* Name + email */}
          <div className="min-w-0 flex-1">
            <h2 className="font-mono text-2xl font-bold text-white truncate">
              {user.name ?? "Anonymous"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-400 truncate">
              {user.email}
            </p>
          </div>

          {/* Level badge */}
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-mono">
              {user.level ?? "Beginner"}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              <span className="text-amber-400 font-semibold">
                {user.xp ?? 0}
              </span>{" "}
              XP
            </span>
          </div>
        </div>

        {/* Stats grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors duration-200">
              <div className="font-mono text-3xl font-bold text-white">
                {stats.totalSolved}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                Total Solved
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors duration-200">
              <div className="font-mono text-3xl font-bold text-white">
                {acceptanceRate}
                <span className="text-slate-500">%</span>
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                Acceptance Rate
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors duration-200">
              <div className="font-mono text-3xl font-bold text-white">
                {totalSubmissions}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                Recent Submissions
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors duration-200">
              <div className="font-mono text-3xl font-bold text-white">
                {stats.currentLevel}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                Current Level
              </div>
            </div>
          </div>
        )}

        {/* Submission history */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-3.5">
            <h2 className="font-mono text-sm font-semibold text-white uppercase tracking-wide">
              Recent Submissions
            </h2>
          </div>

          {!submissions || submissions.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              No submissions yet
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                  <th className="px-5 py-2.5 text-left font-medium">Problem</th>
                  <th className="px-5 py-2.5 text-left font-medium">Language</th>
                  <th className="px-5 py-2.5 text-left font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Runtime</th>
                  <th className="px-5 py-2.5 text-right font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {submissions.map((s) => {
                  const st =
                    STATUS_STYLE[s.status] ?? {
                      label: s.status,
                      cls: "bg-slate-700/50 text-slate-400",
                    };
                  return (
                    <tr
                      key={s.id}
                      className="cursor-pointer hover:bg-slate-800/50 transition-colors duration-200"
                      onClick={() => {
                        window.location.href = `/practice/${s.problem.slug}`;
                      }}
                    >
                      <td className="px-5 py-3 text-sm font-medium text-slate-100">
                        <Link
                          href={`/practice/${s.problem.slug}`}
                          className="cursor-pointer hover:text-emerald-400 transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {s.problem.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400 uppercase font-mono">
                        {s.language}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-400">
                        {s.runtime != null ? `${s.runtime} ms` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-500">
                        {s.createdAt ? formatDate(String(s.createdAt)) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
