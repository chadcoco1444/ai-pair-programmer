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
        placeholder="Search problems..."
        className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />
      <select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
      >
        <option value="">All difficulties</option>
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
        <option value="">All categories</option>
        <option value="ALGORITHM">Algorithm</option>
        <option value="DATA_STRUCTURE">Data Structure</option>
        <option value="SYSTEM_DESIGN">System Design</option>
        <option value="SYSTEM_PROGRAMMING">System Programming</option>
        <option value="CONCURRENCY">Concurrency</option>
      </select>
    </div>
  );
}
