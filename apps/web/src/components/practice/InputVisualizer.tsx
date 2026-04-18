"use client";

import { visualizeInput } from "@/lib/input-visualizer";

interface InputVisualizerProps {
  input: string;
}

export function InputVisualizer({ input }: InputVisualizerProps) {
  const svg = visualizeInput(input);
  if (!svg) return null;
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      {svg}
    </div>
  );
}
