"use client";

interface ProblemFiltersProps {
  difficulty: string;
  category: string;
  search: string;
  onDifficultyChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

export function ProblemFilters({
  difficulty,
  category,
  search,
  onDifficultyChange,
  onCategoryChange,
  onSearchChange,
}: ProblemFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="搜尋題目..."
        className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />
      <select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
      >
        <option value="">所有難度</option>
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
        <option value="EXPERT">Expert</option>
      </select>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
      >
        <option value="">所有分類</option>
        <option value="ALGORITHM">演算法</option>
        <option value="DATA_STRUCTURE">資料結構</option>
        <option value="SYSTEM_DESIGN">系統設計</option>
        <option value="SYSTEM_PROGRAMMING">系統程式設計</option>
        <option value="CONCURRENCY">併發</option>
      </select>
    </div>
  );
}
