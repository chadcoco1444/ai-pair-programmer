"use client";

import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGE_MAP: Record<string, string> = {
  PYTHON: "python",
  C: "c",
  CPP: "cpp",
  JAVASCRIPT: "javascript",
};

export interface CodeEditorHandle {
  getCode: () => string;
}

interface CodeEditorProps {
  language: string;
  initialCode?: string;
  storageKey?: string;  // e.g. "two-sum-PYTHON" — saves to localStorage
  disabled?: boolean;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor({ language, initialCode, storageKey, disabled }, ref) {
    const [code, setCode] = useState(() => {
      // Load from localStorage on mount
      if (storageKey && typeof window !== "undefined") {
        const saved = localStorage.getItem(`skill-code:${storageKey}`);
        if (saved) return saved;
      }
      return initialCode ?? "";
    });

    // When language/initialCode changes, check localStorage first
    useEffect(() => {
      if (storageKey && typeof window !== "undefined") {
        const saved = localStorage.getItem(`skill-code:${storageKey}`);
        if (saved) {
          setCode(saved);
          return;
        }
      }
      setCode(initialCode ?? "");
    }, [storageKey, initialCode]);

    // Save to localStorage on change (debounced)
    useEffect(() => {
      if (!storageKey) return;
      const timer = setTimeout(() => {
        localStorage.setItem(`skill-code:${storageKey}`, code);
      }, 500);
      return () => clearTimeout(timer);
    }, [code, storageKey]);

    useImperativeHandle(ref, () => ({
      getCode: () => code,
    }));

    return (
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <Editor
            height="100%"
            language={LANGUAGE_MAP[language] ?? "plaintext"}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, monospace",
              fontLigatures: true,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
              padding: { top: 12 },
            }}
          />
        </div>
      </div>
    );
  }
);
