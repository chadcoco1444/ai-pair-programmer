"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGE_MAP: Record<string, string> = {
  PYTHON: "python",
  C: "c",
  CPP: "cpp",
  JAVASCRIPT: "javascript",
};

interface CodeEditorProps {
  language: string;
  initialCode?: string;
  onSubmit: (code: string) => void;
  onRun?: (code: string) => void;
  disabled?: boolean;
}

export function CodeEditor({
  language,
  initialCode,
  onSubmit,
  onRun,
  disabled,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode ?? "");

  useEffect(() => {
    setCode(initialCode ?? "");
  }, [initialCode]);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 bg-gray-900 px-3 py-1.5">
        {onRun && (
          <button
            onClick={() => onRun(code)}
            disabled={disabled}
            className="flex items-center gap-1 rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600 disabled:opacity-50"
          >
            <span>&#9654;</span> Run
          </button>
        )}
        <button
          onClick={() => onSubmit(code)}
          disabled={disabled}
          className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50"
        >
          <span>&#9654;</span> Submit
        </button>
      </div>

      {/* Editor */}
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
