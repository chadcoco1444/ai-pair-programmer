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
  EASY: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  HARD: "bg-red-500/10 text-red-400 border border-red-500/30",
  EXPERT: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
};

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "ALGORITHM", label: "Algorithms" },
  { value: "DATA_STRUCTURE", label: "Data Structures" },
  { value: "SYSTEM_DESIGN", label: "System Design" },
  { value: "SYSTEM_PROGRAMMING", label: "Systems" },
  { value: "CONCURRENCY", label: "Concurrency" },
];

const DIFFICULTIES = [
  { value: "", label: "All" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
  { value: "EXPERT", label: "Expert" },
];

// ── Heroicons (outline) ─────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-4 h-4 shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="w-5 h-5 text-emerald-400"
      aria-label="Solved"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function MinusCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-5 h-5 text-slate-600"
      aria-label="Unsolved"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

// ── Filter pill group ───────────────────────────────────────────────────────
function FilterPills({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs transition-colors duration-200 ${
              active
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-transparent"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
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
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-900 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="font-mono text-2xl font-bold text-white">Problems</h1>
          {problems && (
            <div className="font-mono text-xl text-slate-400">
              <span className="text-white">{totalSolved}</span>
              <span className="text-slate-500"> / {problems.length} solved</span>
            </div>
          )}
        </div>

        {/* Card container */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-slate-800 p-4 space-y-3">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-500 focus-within:border-emerald-500 transition-colors duration-200">
              <SearchIcon />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide font-mono shrink-0">
                  Difficulty
                </span>
                <FilterPills
                  value={difficulty}
                  onChange={setDifficulty}
                  options={DIFFICULTIES}
                  ariaLabel="Filter by difficulty"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide font-mono shrink-0">
                  Topic
                </span>
                <FilterPills
                  value={category}
                  onChange={setCategory}
                  options={CATEGORIES}
                  ariaLabel="Filter by topic"
                />
              </div>
            </div>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : problems?.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              No problems match your filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {problems?.map((p, i) => {
                const solved = solvedSlugs.has(p.slug);
                return (
                  <Link
                    key={p.id}
                    href={`/practice/${p.slug}`}
                    className="cursor-pointer flex items-center gap-4 px-5 py-3 hover:bg-slate-800/50 transition-colors duration-200"
                  >
                    {/* Status icon */}
                    <span className="shrink-0">
                      {solved ? <CheckCircleIcon /> : <MinusCircleIcon />}
                    </span>

                    {/* Number */}
                    <span className="font-mono text-sm text-slate-500 w-8 shrink-0">
                      {i + 1}
                    </span>

                    {/* Title */}
                    <span className="font-medium text-slate-100 truncate flex-1">
                      {p.title}
                    </span>

                    {/* Difficulty badge */}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${
                        DIFF_BADGE[p.difficulty] ??
                        "bg-slate-700/50 text-slate-400"
                      }`}
                    >
                      {DIFF_LABEL[p.difficulty] ?? p.difficulty}
                    </span>

                    {/* Category */}
                    <span className="hidden sm:block text-xs text-slate-500 shrink-0 w-36 text-right truncate">
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
            <div className="border-t border-slate-800 px-5 py-2.5 text-right text-xs text-slate-500 font-mono">
              {problems.length} problem{problems.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
