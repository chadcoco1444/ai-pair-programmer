interface StatsOverviewProps {
  totalSolved: number;
  passRate: number;
  currentLevel: string;
  recentActivity: number;
}

export function StatsOverview({ totalSolved, passRate, currentLevel, recentActivity }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: "Problems Solved", value: totalSolved },
        { label: "Acceptance Rate", value: `${Math.round(passRate * 100)}%` },
        { label: "Current Level", value: currentLevel },
        { label: "This Week", value: recentActivity },
      ].map((stat) => (
        <div key={stat.label} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">{stat.label}</div>
          <div className="mt-1 text-2xl font-bold">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
