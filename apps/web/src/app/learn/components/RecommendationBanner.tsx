"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

interface RecommendationBannerProps {
  onPickConcept: (conceptId: string) => void;
}

function SparkleIcon() {
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
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
      />
    </svg>
  );
}

export function RecommendationBanner({ onPickConcept }: RecommendationBannerProps) {
  const { data: recs, isLoading } = trpc.learning.recommendations.useQuery();

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-800 rounded-lg px-4 py-2.5 mb-4 text-xs text-slate-500">
        Loading recommendations...
      </div>
    );
  }

  if (!recs || recs.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-800 rounded-lg px-4 py-2.5 mb-4 text-xs text-slate-500">
        No recommendations yet — solve a few problems to unlock personalised picks.
      </div>
    );
  }

  const top = recs[0];
  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-xs min-w-0">
        <span className="text-emerald-400 shrink-0">
          <SparkleIcon />
        </span>
        <span className="text-emerald-400 font-semibold font-mono uppercase tracking-wide shrink-0">
          Today
        </span>
        <span className="text-slate-300 truncate">{top.reason}</span>
      </div>
      <Link
        href={`/practice/${top.problem.slug}`}
        className="cursor-pointer bg-green-500 hover:bg-green-600 text-white rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 shrink-0"
      >
        Solve now
      </Link>
    </div>
  );
}
