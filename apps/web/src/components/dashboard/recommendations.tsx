import Link from "next/link";

interface Recommendation {
  problem: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    category: string;
  };
  reason: string;
}

export function Recommendations({ items }: { items: Recommendation[] }) {
  if (items.length === 0) {
    return <div className="text-gray-400">No recommendations yet — keep solving!</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.problem.id}
          href={`/practice/${item.problem.slug}`}
          className="block rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-600"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.problem.title}</span>
            <span className="text-sm text-gray-400">{item.problem.difficulty}</span>
          </div>
          <p className="mt-1 text-sm text-gray-400">{item.reason}</p>
        </Link>
      ))}
    </div>
  );
}
