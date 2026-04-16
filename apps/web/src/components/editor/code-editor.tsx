"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
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
  onSubmit?: (code: string) => void;
  onRun?: (code: string) => void;
  disabled?: boolean;
  showButtons?: boolean;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor({ language, initialCode, onSubmit, onRun, disabled, showButtons = false }, ref) {
    const [code, setCode] = useState(initialCode ?? "");

    useEffect(() => {
      setCode(initialCode ?? "");
    }, [initialCode]);

    useImperativeHandle(ref, () => ({
      getCode: () => code,
    }));

    return (
      <div className="flex h-full flex-col">
        {showButtons && (
          <div className="flex items-center justify-end gap-2 bg-[#252525] px-3 py-1.5">
            {onRun && (
              <button
                onClick={() => onRun(code)}
                disabled={disabled}
                className="flex items-center gap-1 rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600 disabled:opacity-50"
              >
                ▶ Run
              </button>
            )}
            {onSubmit && (
              <button
                onClick={() => onSubmit(code)}
                disabled={disabled}
                className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50"
              >
                ▶ Submit
              </button>
            )}
          </div>
        )}
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
);
