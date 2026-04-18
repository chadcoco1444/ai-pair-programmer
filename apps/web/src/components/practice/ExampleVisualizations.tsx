"use client";

import { InputVisualizer } from "./InputVisualizer";

interface TestCase {
  id: string;
  input: string;
  expected: string;
  isHidden?: boolean;
}

interface ExampleVisualizationsProps {
  testCases: TestCase[];
  limit?: number;
}

export function ExampleVisualizations({ testCases, limit = 3 }: ExampleVisualizationsProps) {
  const visible = testCases.filter((t) => !t.isHidden).slice(0, limit);
  if (visible.length === 0) return null;
  return (
    <section className="my-4 space-y-3">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-slate-400">
        Visualized Examples
      </h3>
      {visible.map((tc, i) => (
        <div key={tc.id} className="space-y-1">
          <div className="font-mono text-[11px] text-slate-500">Example {i + 1}</div>
          <InputVisualizer input={tc.input} />
        </div>
      ))}
    </section>
  );
}
