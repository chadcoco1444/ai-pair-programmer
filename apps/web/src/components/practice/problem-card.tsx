import Link from "next/link";

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-green-400",
  MEDIUM: "text-amber-400",
  HARD: "text-red-400",
  EXPERT: "text-purple-400",
};

interface ProblemCardProps {
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  tags: { tag: string }[];
}

export function ProblemCard({ title, slug, difficulty, category, tags }: ProblemCardProps) {
  return (
    <Link
      href={`/practice/${slug}`}
      className="block rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-600"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-white">{title}</h3>
        <span className={`text-sm font-medium ${DIFFICULTY_COLORS[difficulty] ?? "text-gray-400"}`}>
          {difficulty}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
          {category}
        </span>
        {tags.map((t) => (
          <span
            key={t.tag}
            className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
          >
            {t.tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
