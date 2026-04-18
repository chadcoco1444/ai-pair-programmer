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
    <aside className="fixed right-0 top-0 h-screen w-[380px] overflow-y-auto border-l border-slate-800 bg-slate-900 p-5 shadow-2xl z-40">
      <div className="flex items-start justify-between mb-3">
        <h2 className="font-mono text-base font-bold text-white">
          {isLoading ? "..." : data?.concept.name}
        </h2>
        <button
          onClick={onClose}
          className="cursor-pointer text-slate-500 hover:text-white transition-colors duration-200"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isLoading || !data ? (
        <div className="text-sm text-slate-500">Loading...</div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {data.concept.description}
          </p>

          <div className="mb-4">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-mono uppercase tracking-wide">
              <span>Mastery</span>
              <span>{Math.round(data.mastery * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${data.mastery * 100}%` }}
              />
            </div>
          </div>

          {data.prerequisites.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 font-mono">
                Prerequisites
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.prerequisites.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectConcept(p.id)}
                    className="cursor-pointer rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors duration-200"
                  >
                    {p.name} · {Math.round(p.mastery * 100)}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {data.followUps.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 font-mono">
                Unlocks
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.followUps.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onSelectConcept(f.id)}
                    className="cursor-pointer rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors duration-200"
                  >
                    {f.name} · {Math.round(f.mastery * 100)}%
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 font-mono">
              Problems ({data.problems.filter((p) => p.solved).length}/{data.problems.length})
            </div>
            <ul className="space-y-1">
              {data.problems.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/practice/${p.slug}`}
                    className="cursor-pointer flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-slate-800/50 transition-colors duration-200"
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      {p.solved ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 shrink-0 text-emerald-400"
                          aria-label="Solved"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          className="w-4 h-4 shrink-0 text-slate-600"
                          aria-label="Unsolved"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )}
                      <span className="text-slate-200 truncate">{p.title}</span>
                    </span>
                    <span
                      className={`shrink-0 font-mono text-[11px] ${DIFF_CLS[p.difficulty] ?? "text-slate-400"}`}
                    >
                      {p.difficulty}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {data.recentSubmissions.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 font-mono">
                Recent Submissions
              </div>
              <ul className="space-y-1 text-xs">
                {data.recentSubmissions.map((s, i) => (
                  <li key={i} className="flex justify-between text-slate-400">
                    <span className="truncate mr-2">{s.problemTitle}</span>
                    <span
                      className={`font-mono shrink-0 ${
                        s.status === "ACCEPTED"
                          ? "text-emerald-400"
                          : s.status === "WRONG_ANSWER"
                          ? "text-red-400"
                          : "text-slate-500"
                      }`}
                    >
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.weaknessStats.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 font-mono">
                Weak Patterns
              </div>
              <ul className="space-y-1 text-xs">
                {data.weaknessStats.map((w, i) => (
                  <li key={i} className="flex justify-between text-slate-400">
                    <span className="truncate mr-2">{w.pattern}</span>
                    <span className="font-mono text-red-400 shrink-0">
                      ×{w.frequency}
                    </span>
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
