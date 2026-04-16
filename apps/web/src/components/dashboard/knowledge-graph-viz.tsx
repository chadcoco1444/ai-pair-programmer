"use client";

import { useEffect, useRef } from "react";

export function KnowledgeGraphViz({ mermaidCode }: { mermaidCode: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((mermaid) => {
      if (cancelled || !ref.current) return;
      mermaid.default.initialize({ startOnLoad: false, theme: "dark" });
      mermaid.default
        .render(`kg-${Date.now()}`, mermaidCode)
        .then(({ svg }) => {
          if (ref.current && !cancelled) {
            ref.current.innerHTML = svg;
          }
        })
        .catch(() => {
          if (ref.current && !cancelled) {
            ref.current.innerHTML = `<pre class="text-xs text-gray-400">${mermaidCode}</pre>`;
          }
        });
    });
    return () => { cancelled = true; };
  }, [mermaidCode]);

  return (
    <div
      ref={ref}
      className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-4"
    />
  );
}
