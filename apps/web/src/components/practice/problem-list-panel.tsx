"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";

const DIFF_COLORS: Record<string, string> = {
  EASY: "text-emerald-400",
  MEDIUM: "text-amber-400",
  HARD: "text-red-400",
  EXPERT: "text-purple-400",
};

const DIFF_SHORT: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Med.",
  HARD: "Hard",
  EXPERT: "Exp.",
};

interface ProblemListPanelProps {
  currentSlug: string;
  onClose: () => void;
}

export function ProblemListPanel({ currentSlug, onClose }: ProblemListPanelProps) {
  const [search, setSearch] = useState("");
  const { status } = useSession();
  const { data: problems } = trpc.problem.list.useQuery({});
  const { data: submissions } = trpc.submission.history.useQuery(
    { limit: 50 },
    { enabled: status === "authenticated" }
  );

  // Build set of accepted problem IDs
  const solvedIds = new Set(
    submissions?.filter((s) => s.status === "ACCEPTED").map((s) => s.problem.slug) ?? []
  );

  const filtered = problems?.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Panel */}
      <div className="flex h-full w-[420px] flex-col border-r border-gray-700/50 bg-[#1a1a1a] shadow-2xl">
        {/* Header */}
        <div className="flex h-11 items-center justify-between border-b border-gray-700/50 px-4">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-white">Problem List</span>
            <span className="text-[12px] text-gray-500">
              {solvedIds.size}/{problems?.length ?? 0} Solved
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-[#333] hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-700/50 px-3 py-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="w-full rounded bg-[#282828] px-3 py-1.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        {/* Problem List */}
        <div className="flex-1 overflow-y-auto">
          {filtered?.map((p, i) => {
            const isCurrent = p.slug === currentSlug;
            const solved = solvedIds.has(p.slug);
            return (
              <Link
                key={p.id}
                href={`/practice/${p.slug}`}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors ${
                  isCurrent
                    ? "bg-[#282828] text-white"
                    : "text-gray-300 hover:bg-[#222]"
                } ${i % 2 === 0 ? "" : "bg-[#1e1e1e]/50"}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 shrink-0 text-center">
                    {solved ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#4ade80" strokeWidth="2">
                        <polyline points="3,8 6.5,11.5 13,5" />
                      </svg>
                    ) : (
                      <span className="text-gray-600">{i + 1}.</span>
                    )}
                  </span>
                  <span className="truncate">{p.title}</span>
                </div>
                <span className={`shrink-0 text-[12px] font-medium ${DIFF_COLORS[p.difficulty] ?? "text-gray-400"}`}>
                  {DIFF_SHORT[p.difficulty] ?? p.difficulty}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
    </div>
  );
}
