"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { SkillTree } from "./components/SkillTree";
import { ConceptDrawer } from "./components/ConceptDrawer";
import { RecommendationBanner } from "./components/RecommendationBanner";

export default function LearnPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlConcept = searchParams.get("concept");
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(urlConcept);

  useEffect(() => {
    setSelectedConceptId(urlConcept);
  }, [urlConcept]);

  const { data: graph, isLoading } = trpc.concept.graph.useQuery({});

  const selectConcept = (id: string | null) => {
    setSelectedConceptId(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("concept", id);
    else params.delete("concept");
    router.replace(`/learn?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#0a0a0f] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-baseline justify-between">
          <h1 className="text-[22px] font-bold text-white">Learn Map</h1>
          <div className="text-[12px] text-gray-500">
            點選概念查看題目 · 依 prerequisite 排列
          </div>
        </div>

        {status === "authenticated" && (
          <RecommendationBanner onPickConcept={(cid) => selectConcept(cid)} />
        )}

        <div className="rounded-xl border border-gray-800 bg-[#0d0d12] h-[calc(100vh-14rem)]">
          {isLoading || !graph ? (
            <div className="flex h-full items-center justify-center text-[13px] text-gray-500">
              載入圖譜...
            </div>
          ) : (
            <SkillTree
              nodes={graph.nodes}
              edges={graph.edges}
              selectedConceptId={selectedConceptId}
              onConceptClick={(id) => selectConcept(id)}
            />
          )}
        </div>
      </div>

      <ConceptDrawer
        conceptId={selectedConceptId}
        onClose={() => selectConcept(null)}
        onSelectConcept={(id) => selectConcept(id)}
      />
    </main>
  );
}
