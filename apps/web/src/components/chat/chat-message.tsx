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
        <div className="text-[14px] leading-[1.7]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p({ children }) {
                return <p className="mb-3 last:mb-0">{children}</p>;
              },
              strong({ children }) {
                return <strong className="font-semibold text-white">{children}</strong>;
              },
              em({ children }) {
                return <em className="italic text-slate-300">{children}</em>;
              },
              ul({ children }) {
                return <ul className="mb-3 ml-5 list-disc space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="mb-3 ml-5 list-decimal space-y-1">{children}</ol>;
              },
              li({ children }) {
                return <li>{children}</li>;
              },
              h1({ children }) {
                return <h1 className="mt-4 mb-2 text-lg font-semibold text-white">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="mt-4 mb-2 text-base font-semibold text-white">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="mt-3 mb-1.5 text-sm font-semibold text-white">{children}</h3>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="my-3 border-l-2 border-slate-600 pl-3 italic text-slate-300">
                    {children}
                  </blockquote>
                );
              },
              hr() {
                return <hr className="my-4 border-slate-700" />;
              },
              a({ children, href }) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="text-emerald-400 underline hover:text-emerald-300">
                    {children}
                  </a>
                );
              },
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeStr = String(children).replace(/\n$/, "");

                if (match?.[1] === "mermaid") {
                  return <MermaidBlock chart={codeStr} />;
                }

                if (match) {
                  return (
                    <pre className="my-3 overflow-x-auto rounded bg-gray-900 p-3 text-[13px] leading-[1.6]">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                }

                return (
                  <code className="rounded bg-gray-900 px-1.5 py-0.5 text-[13px] font-mono text-emerald-400" {...props}>
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
