"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface ConceptNodeData {
  name: string;
  mastery: number;
  problemCount: number;
  solvedCount: number;
  prereqsMet: boolean;
}

function masteryColor(mastery: number, prereqsMet: boolean): string {
  if (!prereqsMet) return "bg-gray-800/40 border-gray-700 text-gray-500";
  if (mastery >= 0.7) return "bg-emerald-900/40 border-emerald-600 text-emerald-200";
  if (mastery >= 0.4) return "bg-amber-900/40 border-amber-600 text-amber-200";
  return "bg-gray-900/60 border-gray-600 text-gray-300";
}

export function ConceptNode({ data, selected }: NodeProps) {
  const d = data as unknown as ConceptNodeData;
  const colorCls = masteryColor(d.mastery, d.prereqsMet);
  const ringCls = selected ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]" : "";
  const pct = Math.round(d.mastery * 100);

  return (
    <div className={`rounded-lg border-2 px-3 py-2 min-w-[170px] text-center cursor-pointer transition ${colorCls} ${ringCls}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />
      <div className="text-[13px] font-semibold">{d.name}</div>
      <div className="text-[10px] opacity-80 mt-1">
        {d.solvedCount}/{d.problemCount} solved · {pct}%
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
    </div>
  );
}
