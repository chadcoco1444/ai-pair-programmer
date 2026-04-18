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
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-900 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="font-mono text-2xl font-bold text-white">
            Learn <span className="text-emerald-400">Map</span>
          </h1>
          <div className="text-xs text-slate-500">
            Click a concept to explore problems · arranged by prerequisite
          </div>
        </div>

        {status === "authenticated" && (
          <RecommendationBanner onPickConcept={(cid) => selectConcept(cid)} />
        )}

        <div className="relative rounded-lg border border-slate-800 bg-slate-900/50 h-[calc(100vh-14rem)]">
          {isLoading || !graph ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading graph...
            </div>
          ) : (
            <>
              <SkillTree
                nodes={graph.nodes}
                edges={graph.edges}
                selectedConceptId={selectedConceptId}
                onConceptClick={(id) => selectConcept(id)}
              />
              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-3 text-xs z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Mastered</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-300">Learning</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-300">Untouched</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span className="text-slate-500">Locked</span>
                </div>
              </div>
            </>
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
