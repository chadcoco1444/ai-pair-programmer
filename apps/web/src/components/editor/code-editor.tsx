"use client";

import { useState } from "react";
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

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-700">
      <div className="flex items-center justify-between bg-gray-800 px-3 py-2">
        <span className="text-xs text-gray-400">
          {LANGUAGE_MAP[language] ?? language}
        </span>
        <div className="flex gap-2">
          {onRun && (
            <button
              onClick={() => onRun(code)}
              disabled={disabled}
              className="rounded bg-gray-700 px-3 py-1 text-xs text-white hover:bg-gray-600 disabled:opacity-50"
            >
              執行
            </button>
          )}
          <button
            onClick={() => onSubmit(code)}
            disabled={disabled}
            className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-500 disabled:opacity-50"
          >
            提交
          </button>
        </div>
      </div>
      <Editor
        height="300px"
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
        }}
      />
    </div>
  );
}
