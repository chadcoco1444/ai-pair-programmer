"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

const DIFF_CLS: Record<string, string> = {
  EASY: "text-emerald-400",
  MEDIUM: "text-amber-400",
  HARD: "text-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  RUNTIME_ERROR: "Runtime Error",
  TIME_LIMIT_EXCEEDED: "TLE",
  COMPILE_ERROR: "Compile Error",
};

interface ConceptDrawerProps {
  conceptId: string | null;
  onClose: () => void;
  onSelectConcept: (id: string) => void;
}

export function ConceptDrawer({ conceptId, onClose, onSelectConcept }: ConceptDrawerProps) {
  const { data, isLoading } = trpc.concept.detail.useQuery(
    { conceptId: conceptId ?? "" },
    { enabled: !!conceptId }
  );

  if (!conceptId) return null;

  return (
    <aside className="fixed right-0 top-0 h-screen w-[380px] overflow-y-auto border-l border-gray-800 bg-[#0d0d12] p-5 shadow-2xl z-40">
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-[16px] font-bold text-white">
          {isLoading ? "..." : data?.concept.name}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-[18px]" aria-label="Close">×</button>
      </div>

      {isLoading || !data ? (
        <div className="text-[13px] text-gray-500">載入中...</div>
      ) : (
        <>
          <p className="text-[12px] text-gray-400 mb-4">{data.concept.description}</p>

          <div className="mb-4">
            <div className="flex justify-between text-[11px] text-gray-500 mb-1">
              <span>掌握度</span>
              <span>{Math.round(data.mastery * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-800">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${data.mastery * 100}%` }} />
            </div>
          </div>

          {data.prerequisites.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">先修</div>
              <div className="flex flex-wrap gap-1.5">
                {data.prerequisites.map((p) => (
                  <button key={p.id} onClick={() => onSelectConcept(p.id)} className="rounded-full border border-gray-700 bg-gray-900 px-2.5 py-1 text-[11px] text-gray-300 hover:bg-gray-800">
                    {p.name} · {Math.round(p.mastery * 100)}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {data.followUps.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">後續</div>
              <div className="flex flex-wrap gap-1.5">
                {data.followUps.map((f) => (
                  <button key={f.id} onClick={() => onSelectConcept(f.id)} className="rounded-full border border-gray-700 bg-gray-900 px-2.5 py-1 text-[11px] text-gray-300 hover:bg-gray-800">
                    {f.name} · {Math.round(f.mastery * 100)}%
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">
              題目 ({data.problems.filter((p) => p.solved).length}/{data.problems.length})
            </div>
            <ul className="space-y-1">
              {data.problems.map((p) => (
                <li key={p.slug}>
                  <Link href={`/practice/${p.slug}`} className="flex items-center justify-between rounded px-2 py-1.5 text-[12px] hover:bg-gray-900">
                    <span className="flex items-center gap-1.5">
                      <span className={p.solved ? "text-emerald-400" : "text-gray-600"}>{p.solved ? "✓" : "○"}</span>
                      <span className="text-gray-200">{p.title}</span>
                    </span>
                    <span className={DIFF_CLS[p.difficulty] ?? "text-gray-400"}>{p.difficulty}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {data.recentSubmissions.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">最近提交</div>
              <ul className="space-y-1 text-[11px]">
                {data.recentSubmissions.map((s, i) => (
                  <li key={i} className="flex justify-between text-gray-400">
                    <span>{s.problemTitle}</span>
                    <span>{STATUS_LABEL[s.status] ?? s.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.weaknessStats.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">弱點統計</div>
              <ul className="space-y-1 text-[11px]">
                {data.weaknessStats.map((w, i) => (
                  <li key={i} className="flex justify-between text-gray-400">
                    <span>{w.pattern}</span>
                    <span>× {w.frequency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
