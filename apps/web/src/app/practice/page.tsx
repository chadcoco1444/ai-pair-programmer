"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { ProblemCard } from "@/components/practice/problem-card";
import { ProblemFilters } from "@/components/practice/problem-filters";

export default function PracticeListPage() {
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const { data: problems, isLoading } = trpc.problem.list.useQuery({
    difficulty: difficulty || undefined,
    category: category || undefined,
    search: search || undefined,
  } as any);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">題庫</h1>

      <div className="mb-6">
        <ProblemFilters
          difficulty={difficulty}
          category={category}
          search={search}
          onDifficultyChange={setDifficulty}
          onCategoryChange={setCategory}
          onSearchChange={setSearch}
        />
      </div>

      {isLoading ? (
        <div className="text-gray-400">載入中...</div>
      ) : (
        <div className="space-y-3">
          {problems?.map((p) => (
            <ProblemCard
              key={p.id}
              title={p.title}
              slug={p.slug}
              difficulty={p.difficulty}
              category={p.category}
              tags={p.tags}
            />
          ))}
          {problems?.length === 0 && (
            <div className="text-gray-400">沒有找到符合條件的題目</div>
          )}
        </div>
      )}
    </main>
  );
}
