"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { trpc } from "@/lib/trpc-client";

export default function ProfilePage() {
  const { status } = useSession();

  if (status === "unauthenticated") {
    redirect("/");
  }

  const enabled = status === "authenticated";
  const { data: user } = trpc.user.me.useQuery(undefined, { enabled });
  const { data: stats } = trpc.learning.stats.useQuery(undefined, { enabled });
  const { data: submissions } = trpc.submission.history.useQuery({ limit: 10 }, { enabled });

  if (status === "loading" || !user) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <div className="text-gray-400">載入中...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-8">
      {/* 個人資訊 */}
      <div className="flex items-center gap-4">
        {user.image && (
          <img src={user.image} alt="" className="h-16 w-16 rounded-full" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
          <div className="mt-1 flex gap-2">
            <span className="rounded bg-blue-600 px-2 py-0.5 text-xs">{user.level}</span>
            <span className="text-sm text-gray-400">{user.xp} XP</span>
          </div>
        </div>
      </div>

      {/* 統計 */}
      {stats && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-3 text-lg font-bold">學習統計</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.totalSolved}</div>
              <div className="text-sm text-gray-400">已解題數</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(stats.passRate * 100)}%</div>
              <div className="text-sm text-gray-400">通過率</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <div className="text-sm text-gray-400">本週解題</div>
            </div>
          </div>
        </div>
      )}

      {/* 最近提交 */}
      <div>
        <h2 className="mb-3 text-lg font-bold">最近提交</h2>
        {submissions && submissions.length > 0 ? (
          <div className="space-y-2">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm"
              >
                <div>
                  <span className="font-medium">{s.problem.title}</span>
                  <span className="ml-2 text-gray-400">{s.language}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      s.status === "ACCEPTED" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {s.status}
                  </span>
                  {s.runtime && (
                    <span className="text-gray-500">{s.runtime}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">還沒有提交記錄</div>
        )}
      </div>
    </main>
  );
}
