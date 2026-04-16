"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import { SKILLPhaseBadge } from "./skill-phase-badge";

interface ChatMessageProps {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  skillPhase?: string | null;
  isStreaming?: boolean;
}

function MermaidBlock({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((mermaid) => {
      if (cancelled || !ref.current) return;
      mermaid.default.initialize({ startOnLoad: false, theme: "dark" });
      mermaid.default
        .render(`mermaid-${Date.now()}`, chart)
        .then(({ svg }) => {
          if (ref.current && !cancelled) {
            ref.current.innerHTML = svg;
          }
        })
        .catch(() => {
          if (ref.current && !cancelled) {
            ref.current.textContent = chart;
          }
        });
    });
    return () => { cancelled = true; };
  }, [chart]);

  return <div ref={ref} className="my-4 flex justify-center" />;
}

export function ChatMessage({ role, content, skillPhase, isStreaming }: ChatMessageProps) {
  if (role === "SYSTEM") return null;

  const isUser = role === "USER";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-800 text-gray-100"
        }`}
      >
        {!isUser && skillPhase && (
          <div className="mb-2">
            <SKILLPhaseBadge phase={skillPhase} />
          </div>
        )}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeStr = String(children).replace(/\n$/, "");

                if (match?.[1] === "mermaid") {
                  return <MermaidBlock chart={codeStr} />;
                }

                if (match) {
                  return (
                    <pre className="overflow-x-auto rounded bg-gray-900 p-3">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                }

                return (
                  <code className="rounded bg-gray-900 px-1 py-0.5 text-sm" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        {isStreaming && (
          <span className="mt-1 inline-block h-4 w-1 animate-pulse bg-gray-400" />
        )}
      </div>
    </div>
  );
}
