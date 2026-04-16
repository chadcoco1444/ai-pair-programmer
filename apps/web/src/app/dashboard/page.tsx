"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { KnowledgeGraphViz } from "@/components/dashboard/knowledge-graph-viz";
import Link from "next/link";

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: "text-emerald-400 bg-emerald-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  HARD: "text-red-400 bg-red-400/10",
  EXPERT: "text-purple-400 bg-purple-400/10",
};

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800/60 bg-[#1a1a1a] p-5">
      <div className={`text-[28px] font-bold leading-none ${accent ?? "text-white"}`}>
        {value}
      </div>
      <div className="mt-1.5 text-[13px] text-gray-400">{label}</div>
      {sub && <div className="mt-1 text-[12px] text-gray-600">{sub}</div>}
    </div>
  );
}

function ProgressBar({
  value,
  max,
  color = "bg-blue-500",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { status } = useSession();

  if (status === "unauthenticated") {
    redirect("/");
  }

  const { data: stats, isLoading: statsLoading } = trpc.learning.stats.useQuery(
    undefined,
    { enabled: status === "authenticated" }
  );
  const { data: recommendations, isLoading: recsLoading } =
    trpc.learning.recommendations.useQuery(undefined, {
      enabled: status === "authenticated",
    });
  const { data: mermaid } = trpc.concept.mermaid.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  if (status === "loading" || statsLoading) {
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

  const conceptPct =
    stats?.nextLevelProgress
      ? Math.min(
          100,
          Math.round(
            (stats.nextLevelProgress.conceptsMastered /
              stats.nextLevelProgress.conceptsRequired) *
              100
          )
        )
      : 0;

  const problemPct =
    stats?.nextLevelProgress
      ? Math.min(
          100,
          Math.round(
            (stats.nextLevelProgress.problemsAccepted /
              stats.nextLevelProgress.problemsRequired) *
              100
          )
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* Page header */}
        <div>
          <h1 className="text-[22px] font-bold text-white">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">學習進度一覽</p>
        </div>

        {/* Stats grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="已解題數"
              value={stats.totalSolved}
              accent="text-emerald-400"
            />
            <StatCard
              label="通過率"
              value={`${Math.round(stats.passRate * 100)}%`}
              accent="text-blue-400"
            />
            <StatCard
              label="目前等級"
              value={stats.currentLevel}
              accent="text-amber-400"
            />
            <StatCard
              label="本週解題"
              value={stats.recentActivity}
              sub="questions this week"
              accent="text-purple-400"
            />
          </div>
        )}

        {/* Level progress */}
        {stats?.nextLevelProgress && (
          <div className="rounded-xl border border-gray-800/60 bg-[#1a1a1a] p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-white">
              升級進度
            </h2>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-gray-400">掌握概念</span>
                  <span className="text-gray-300">
                    {stats.nextLevelProgress.conceptsMastered}
                    <span className="text-gray-600">
                      {" "}
                      / {stats.nextLevelProgress.conceptsRequired}
                    </span>
                  </span>
                </div>
                <ProgressBar
                  value={stats.nextLevelProgress.conceptsMastered}
                  max={stats.nextLevelProgress.conceptsRequired}
                  color="bg-blue-500"
                />
                <div className="mt-1 text-right text-[11px] text-gray-600">
                  {conceptPct}%
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-gray-400">通過題數</span>
                  <span className="text-gray-300">
                    {stats.nextLevelProgress.problemsAccepted}
                    <span className="text-gray-600">
                      {" "}
                      / {stats.nextLevelProgress.problemsRequired}
                    </span>
                  </span>
                </div>
                <ProgressBar
                  value={stats.nextLevelProgress.problemsAccepted}
                  max={stats.nextLevelProgress.problemsRequired}
                  color="bg-emerald-500"
                />
                <div className="mt-1 text-right text-[11px] text-gray-600">
                  {problemPct}%
                </div>
              </div>

              {stats.nextLevelProgress.missingDomains.length > 0 && (
                <div className="rounded-lg border border-amber-800/30 bg-amber-900/10 px-4 py-3 text-[13px]">
                  <span className="text-amber-400 font-medium">需探索領域：</span>
                  <span className="ml-1 text-gray-400">
                    {stats.nextLevelProgress.missingDomains.join("、")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {stats?.topWeaknesses && stats.topWeaknesses.length > 0 && (
          <div className="rounded-xl border border-gray-800/60 bg-[#1a1a1a] p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-white">
              需要加強的地方
            </h2>
            <div className="divide-y divide-gray-800/60">
              {stats.topWeaknesses.map((w) => (
                <div
                  key={w.pattern}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-500" />
                    <div>
                      <span className="text-[13px] font-medium text-red-400">
                        {w.pattern}
                      </span>
                      {w.description && (
                        <span className="ml-2 text-[13px] text-gray-500">
                          {w.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-red-900/20 px-2.5 py-0.5 text-[11px] text-red-400">
                    {w.frequency}× 出現
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div>
          <h2 className="mb-3 text-[14px] font-semibold text-white">今日推薦</h2>
          {recsLoading ? (
            <div className="rounded-xl border border-gray-800/60 bg-[#1a1a1a] px-5 py-10 text-center text-[13px] text-gray-600">
              載入推薦中...
            </div>
          ) : !recommendations || recommendations.length === 0 ? (
            <div className="rounded-xl border border-gray-800/60 bg-[#1a1a1a] px-5 py-10 text-center text-[13px] text-gray-600">
              暫無推薦，繼續解題吧！
            </div>
          ) : (
            <div className="space-y-2">
              {recommendations.map((item) => {
                const diffClass =
                  DIFFICULTY_BADGE[item.problem.difficulty] ??
                  "text-gray-400 bg-gray-400/10";
                return (
                  <Link
                    key={item.problem.id}
                    href={`/practice/${item.problem.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-gray-800/60 bg-[#1a1a1a] px-5 py-4 transition-colors hover:bg-[#222] hover:border-gray-700/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-medium text-white group-hover:text-blue-400 transition-colors">
                          {item.problem.title}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${diffClass}`}
                        >
                          {item.problem.difficulty}
                        </span>
                      </div>
                      {item.reason && (
                        <p className="mt-0.5 text-[12px] text-gray-500 truncate">
                          {item.reason}
                        </p>
                      )}
                    </div>
                    <svg
                      className="ml-4 h-4 w-4 shrink-0 text-gray-700 group-hover:text-gray-400 transition-colors"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <polyline points="6,3 10,8 6,13" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Knowledge graph */}
        {mermaid && (
          <div>
            <h2 className="mb-3 text-[14px] font-semibold text-white">知識圖譜</h2>
            <KnowledgeGraphViz mermaidCode={mermaid} />
          </div>
        )}
      </div>
    </div>
  );
}
