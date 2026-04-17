"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

interface RecommendationBannerProps {
  onPickConcept: (conceptId: string) => void;
}

export function RecommendationBanner({ onPickConcept }: RecommendationBannerProps) {
  const { data: recs, isLoading } = trpc.learning.recommendations.useQuery();

  if (isLoading) {
    return (
      <div className="border border-gray-800 rounded-lg bg-[#1a1a1f] px-4 py-2.5 mb-4 text-[12px] text-gray-500">
        載入推薦...
      </div>
    );
  }

  if (!recs || recs.length === 0) {
    return (
      <div className="border border-gray-800 rounded-lg bg-[#1a1a1f] px-4 py-2.5 mb-4 text-[12px] text-gray-500">
        暫無推薦 — 先完成幾題以解鎖個人化推薦
      </div>
    );
  }

  const top = recs[0];
  return (
    <div className="border border-emerald-900/50 rounded-lg bg-gradient-to-r from-emerald-900/20 to-[#1a1a1f] px-4 py-2.5 mb-4 flex items-center justify-between">
      <div className="text-[12px]">
        <span className="text-emerald-400 font-semibold">✨ 今日推薦:</span>{" "}
        <span className="text-gray-300">{top.reason}</span>
      </div>
      <div className="flex gap-2">
        <Link href={`/practice/${top.problem.slug}`} className="rounded bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500">
          去解題 →
        </Link>
      </div>
    </div>
  );
}
