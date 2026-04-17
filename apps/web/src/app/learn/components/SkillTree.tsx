"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { layoutGraph } from "@/lib/graph-layout";
import { ConceptNode, type ConceptNodeData } from "./ConceptNode";

const nodeTypes = { concept: ConceptNode };

interface SkillTreeProps {
  nodes: Array<{
    id: string;
    name: string;
    domain: string;
    mastery: number;
    prereqsMet: boolean;
    problemCount: number;
    solvedCount: number;
  }>;
  edges: Array<{ source: string; target: string; type: "prerequisite" | "related" }>;
  selectedConceptId: string | null;
  onConceptClick: (conceptId: string) => void;
}

export function SkillTree({ nodes, edges, selectedConceptId, onConceptClick }: SkillTreeProps) {
  const { rfNodes, rfEdges } = useMemo(() => {
    const baseNodes = nodes.map<Omit<Node<ConceptNodeData>, "position">>((n) => ({
      id: n.id,
      type: "concept",
      data: {
        name: n.name,
        mastery: n.mastery,
        problemCount: n.problemCount,
        solvedCount: n.solvedCount,
        prereqsMet: n.prereqsMet,
      },
      selected: n.id === selectedConceptId,
    }));

    const prereqEdges = edges
      .filter((e) => e.type === "prerequisite")
      .map<Edge>((e) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#4b5563", strokeWidth: 1.5 },
      }));

    const laid = layoutGraph(baseNodes, prereqEdges);
    return { rfNodes: laid.nodes, rfEdges: laid.edges };
  }, [nodes, edges, selectedConceptId]);

  return (
    <ReactFlow
      nodes={rfNodes as any}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onConceptClick(node.id)}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.3}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#1f2937" gap={24} />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(n) => {
          const d = n.data as unknown as ConceptNodeData;
          if (!d.prereqsMet) return "#4b5563";
          if (d.mastery >= 0.7) return "#10b981";
          if (d.mastery >= 0.4) return "#f59e0b";
          return "#6b7280";
        }}
        className="!bg-[#0a0a0f]"
      />
    </ReactFlow>
  );
}
