"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  ACCEPTED: { label: "Accepted", cls: "text-emerald-400" },
  WRONG_ANSWER: { label: "Wrong Answer", cls: "text-red-400" },
  TIME_LIMIT_EXCEEDED: { label: "TLE", cls: "text-amber-400" },
  RUNTIME_ERROR: { label: "Runtime Error", cls: "text-orange-400" },
  COMPILE_ERROR: { label: "Compile Error", cls: "text-red-400" },
};

function levelColor(level: string) {
  const l = level?.toLowerCase() ?? "";
  if (l.includes("expert") || l.includes("senior")) return "bg-purple-500/20 text-purple-300 border-purple-700/40";
  if (l.includes("advanced") || l.includes("mid")) return "bg-blue-500/20 text-blue-300 border-blue-700/40";
  return "bg-emerald-500/20 text-emerald-300 border-emerald-700/40";
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("zh-TW", {
      month: "2-digit",
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="flex items-center gap-2 text-[13px] text-gray-500">
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="mx-auto max-w-4xl space-y-5 px-6 py-8">
        {/* Page header */}
        <div>
          <h1 className="text-[22px] font-bold text-white">Profile</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">個人資訊與學習紀錄</p>
        </div>

        {/* User card */}
        <div className="rounded-xl border border-gray-800/60 bg-[#1a1a1a] p-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? ""}
                className="h-16 w-16 rounded-full ring-2 ring-gray-700/50"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2a2a2a] ring-2 ring-gray-700/50 text-[20px] font-bold text-gray-300">
                {initials}
              </div>
            )}

            {/* Name + email + badges */}
            <div className="min-w-0 flex-1">
              <h2 className="text-[18px] font-bold text-white truncate">
                {user.name ?? "Anonymous"}
              </h2>
              <p className="mt-0.5 text-[13px] text-gray-500 truncate">
                {user.email}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${levelColor(user.level ?? "")}`}
                >
                  {user.level ?? "Beginner"}
                </span>
                <span className="text-[13px] text-gray-500">
                  <span className="font-semibold text-amber-400">{user.xp ?? 0}</span>
                  <span className="ml-1">XP</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats card */}
        {stats && (
          <div className="rounded-xl border border-gray-800/60 bg-[#1a1a1a] p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-white">學習統計</h2>
            <div className="grid grid-cols-3 divide-x divide-gray-800/60 text-center">
              <div className="px-4 first:pl-0 last:pr-0">
                <div className="text-[28px] font-bold text-emerald-400 leading-none">
                  {stats.totalSolved}
                </div>
                <div className="mt-1.5 text-[12px] text-gray-500">已解題數</div>
              </div>
              <div className="px-4">
                <div className="text-[28px] font-bold text-blue-400 leading-none">
                  {Math.round(stats.passRate * 100)}%
                </div>
                <div className="mt-1.5 text-[12px] text-gray-500">通過率</div>
              </div>
              <div className="px-4">
                <div className="text-[28px] font-bold text-purple-400 leading-none">
                  {stats.recentActivity}
                </div>
                <div className="mt-1.5 text-[12px] text-gray-500">本週解題</div>
              </div>
            </div>
          </div>
        )}

        {/* Submission history table */}
        <div className="rounded-xl border border-gray-800/60 bg-[#1a1a1a] overflow-hidden">
          <div className="border-b border-gray-800/60 px-5 py-3.5">
            <h2 className="text-[14px] font-semibold text-white">最近提交</h2>
          </div>

          {!submissions || submissions.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-gray-600">
              還沒有提交記錄
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/60">
                  <th className="px-5 py-2.5 text-left text-[12px] font-medium text-gray-600">
                    題目
                  </th>
                  <th className="px-5 py-2.5 text-left text-[12px] font-medium text-gray-600">
                    語言
                  </th>
                  <th className="px-5 py-2.5 text-left text-[12px] font-medium text-gray-600">
                    狀態
                  </th>
                  <th className="px-5 py-2.5 text-right text-[12px] font-medium text-gray-600">
                    耗時
                  </th>
                  <th className="px-5 py-2.5 text-right text-[12px] font-medium text-gray-600">
                    時間
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {submissions.map((s) => {
                  const st =
                    STATUS_STYLE[s.status] ?? {
                      label: s.status,
                      cls: "text-gray-400",
                    };
                  return (
                    <tr
                      key={s.id}
                      className="cursor-pointer transition-colors hover:bg-[#222]"
                      onClick={() => {
                        window.location.href = `/practice/${s.problem.slug}`;
                      }}
                    >
                      <td className="px-5 py-3 text-[13px] font-medium text-white">
                        <Link
                          href={`/practice/${s.problem.slug}`}
                          className="hover:text-emerald-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {s.problem.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-gray-500 uppercase">
                        {s.language}
                      </td>
                      <td className={`px-5 py-3 text-[13px] font-medium ${st.cls}`}>
                        {st.label}
                      </td>
                      <td className="px-5 py-3 text-right text-[12px] text-gray-600">
                        {s.runtime != null ? `${s.runtime} ms` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right text-[12px] text-gray-600">
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
