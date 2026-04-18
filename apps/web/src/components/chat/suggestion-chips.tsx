"use client";

import { SUGGESTION_PROMPTS, type SuggestionPrompt } from "./suggestion-prompts";

interface SuggestionChipsProps {
  onSelect: (prompt: SuggestionPrompt) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div
      className="flex flex-wrap gap-2 border-t border-slate-800 bg-slate-900/50 px-4 py-2.5"
      role="toolbar"
      aria-label="Suggested questions"
    >
      {SUGGESTION_PROMPTS.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            disabled={disabled}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 transition-colors duration-200 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800/50"
          >
            <Icon className="h-3.5 w-3.5 text-emerald-400" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
