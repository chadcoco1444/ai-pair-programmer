"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { Recommendations } from "@/components/dashboard/recommendations";
import { KnowledgeGraphViz } from "@/components/dashboard/knowledge-graph-viz";

export default function DashboardPage() {
  const { status } = useSession();

  if (status === "unauthenticated") {
    redirect("/");
  }

  const { data: stats, isLoading: statsLoading } = trpc.learning.stats.useQuery(
    undefined,
    { enabled: status === "authenticated" }
  );
  const { data: recommendations, isLoading: recsLoading } = trpc.learning.recommendations.useQuery(
    undefined,
    { enabled: status === "authenticated" }
  );
  const { data: mermaid } = trpc.concept.mermaid.useQuery(
    undefined,
    { enabled: status === "authenticated" }
  );

  if (status === "loading" || statsLoading) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <div className="text-gray-400">載入中...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">儀表板</h1>
        <p className="mt-1 text-gray-400">你的學習進度一覽</p>
      </div>

      {/* 統計概覽 */}
      {stats && (
        <StatsOverview
          totalSolved={stats.totalSolved}
          passRate={stats.passRate}
          currentLevel={stats.currentLevel}
          recentActivity={stats.recentActivity}
        />
      )}

      {/* 升級進度 */}
      {stats?.nextLevelProgress && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-3 text-lg font-bold">升級進度</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">掌握概念</span>
              <span>{stats.nextLevelProgress.conceptsMastered} / {stats.nextLevelProgress.conceptsRequired}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${Math.min(100, (stats.nextLevelProgress.conceptsMastered / stats.nextLevelProgress.conceptsRequired) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">通過題數</span>
              <span>{stats.nextLevelProgress.problemsAccepted} / {stats.nextLevelProgress.problemsRequired}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-green-500"
                style={{
                  width: `${Math.min(100, (stats.nextLevelProgress.problemsAccepted / stats.nextLevelProgress.problemsRequired) * 100)}%`,
                }}
              />
            </div>
            {stats.nextLevelProgress.missingDomains.length > 0 && (
              <div className="text-gray-400">
                需探索領域：{stats.nextLevelProgress.missingDomains.join("、")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 弱點 */}
      {stats?.topWeaknesses && stats.topWeaknesses.length > 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-3 text-lg font-bold">需要加強的地方</h2>
          <div className="space-y-2">
            {stats.topWeaknesses.map((w) => (
              <div key={w.pattern} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-red-400">{w.pattern}</span>
                  <span className="ml-2 text-gray-400">{w.description}</span>
                </div>
                <span className="text-gray-500">出現 {w.frequency} 次</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 推薦題目 */}
      <div>
        <h2 className="mb-3 text-lg font-bold">今日推薦</h2>
        {recsLoading ? (
          <div className="text-gray-400">載入中...</div>
        ) : (
          <Recommendations items={recommendations ?? []} />
        )}
      </div>

      {/* 知識圖譜 */}
      {mermaid && (
        <div>
          <h2 className="mb-3 text-lg font-bold">知識圖譜</h2>
          <KnowledgeGraphViz mermaidCode={mermaid} />
        </div>
      )}
    </main>
  );
}
