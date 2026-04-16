"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";

// ── Difficulty display helpers ─────────────────────────────────────────────
const DIFF_LABEL: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  EXPERT: "Expert",
};

const DIFF_BADGE: Record<string, string> = {
  EASY: "bg-emerald-400/10 text-emerald-400",
  MEDIUM: "bg-amber-400/10 text-amber-400",
  HARD: "bg-red-400/10 text-red-400",
  EXPERT: "bg-purple-400/10 text-purple-400",
};

const CATEGORIES = [
  { value: "", label: "All Topics" },
  { value: "ALGORITHM", label: "Algorithms" },
  { value: "DATA_STRUCTURE", label: "Data Structures" },
  { value: "SYSTEM_DESIGN", label: "System Design" },
  { value: "SYSTEM_PROGRAMMING", label: "System Programming" },
  { value: "CONCURRENCY", label: "Concurrency" },
];

const DIFFICULTIES = [
  { value: "", label: "All Difficulties" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
  { value: "EXPERT", label: "Expert" },
];

// ── Search icon ─────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="shrink-0"
    >
      <circle cx="6.5" cy="6.5" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

// ── Check icon ──────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#4ade80"
      strokeWidth="2.2"
    >
      <polyline points="3,8 6.5,11.5 13,5" />
    </svg>
  );
}

// ── Select wrapper ──────────────────────────────────────────────────────────
function DarkSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-800/60 bg-[#282828] px-3 py-2 text-[13px] text-gray-300 focus:border-gray-600 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function PracticeListPage() {
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const { status } = useSession();

  const { data: problems, isLoading } = trpc.problem.list.useQuery({
    difficulty: difficulty || undefined,
    category: category || undefined,
    search: search || undefined,
  } as any);

  const { data: submissions } = trpc.submission.history.useQuery(
    { limit: 200 },
    { enabled: status === "authenticated" }
  );

  const solvedSlugs = new Set(
    submissions?.filter((s) => s.status === "ACCEPTED").map((s) => s.problem.slug) ?? []
  );

  const totalSolved = problems
    ? problems.filter((p) => solvedSlugs.has(p.slug)).length
    : 0;

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#0a0a0f] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-white">Problems</h1>
            {problems && (
              <p className="mt-0.5 text-[12px] text-gray-500">
                {totalSolved} / {problems.length} solved
              </p>
            )}
          </div>
        </div>

        {/* Card container */}
        <div className="rounded-xl border border-gray-800/60 bg-[#1a1a1a]">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-800/60 px-4 py-3">
            {/* Search */}
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-800/60 bg-[#282828] px-3 py-2 text-gray-500 focus-within:border-gray-600 focus-within:text-gray-400">
              <SearchIcon />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Difficulty filter */}
            <DarkSelect
              value={difficulty}
              onChange={setDifficulty}
              options={DIFFICULTIES}
            />

            {/* Category filter */}
            <DarkSelect
              value={category}
              onChange={setCategory}
              options={CATEGORIES}
            />
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_7rem_9rem] gap-x-4 border-b border-gray-800/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            <span className="text-center">#</span>
            <span>Title</span>
            <span>Difficulty</span>
            <span>Category</span>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="px-4 py-10 text-center text-[13px] text-gray-500">
              Loading...
            </div>
          ) : problems?.length === 0 ? (
            <div className="px-4 py-10 text-center text-[13px] text-gray-500">
              No problems match your filters.
            </div>
          ) : (
            <div>
              {problems?.map((p, i) => {
                const solved = solvedSlugs.has(p.slug);
                const isEven = i % 2 === 0;
                return (
                  <Link
                    key={p.id}
                    href={`/practice/${p.slug}`}
                    className={`grid grid-cols-[2rem_1fr_7rem_9rem] gap-x-4 px-4 py-3 text-[13px] transition-colors hover:bg-[#222] ${
                      isEven ? "bg-transparent" : "bg-[#1e1e1e]/60"
                    }`}
                  >
                    {/* Index / solved indicator */}
                    <span className="flex items-center justify-center text-center">
                      {solved ? (
                        <CheckIcon />
                      ) : (
                        <span className="text-[12px] text-gray-600">{i + 1}</span>
                      )}
                    </span>

                    {/* Title */}
                    <span className="truncate font-medium text-gray-200 group-hover:text-white">
                      {p.title}
                    </span>

                    {/* Difficulty badge */}
                    <span>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          DIFF_BADGE[p.difficulty] ?? "bg-gray-700/30 text-gray-400"
                        }`}
                      >
                        {DIFF_LABEL[p.difficulty] ?? p.difficulty}
                      </span>
                    </span>

                    {/* Category */}
                    <span className="truncate text-[12px] text-gray-500">
                      {p.category
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Footer summary */}
          {!isLoading && problems && problems.length > 0 && (
            <div className="border-t border-gray-800/60 px-4 py-2.5 text-right text-[12px] text-gray-600">
              {problems.length} problem{problems.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
