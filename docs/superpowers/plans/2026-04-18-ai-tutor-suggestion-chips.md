# AI Tutor Suggestion Chips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 one-click suggestion chips above the chat input on problem pages — sends pre-written prompts to the AI (optionally with current code) to help beginners who don't know what to ask.

**Architecture:** Pure frontend. Two new files for config + chip component. Wire into `chat-container.tsx` and pass a `getCurrentCode` callback from the problem page so "Review my code" / "Time complexity" chips can include Monaco content.

**Tech Stack:** Next.js 14, React 19, TypeScript, Tailwind CSS, Vitest

**Spec:** `docs/superpowers/specs/2026-04-18-ai-tutor-suggestion-chips-design.md`

---

## File Structure

```
apps/web/src/
├── components/chat/
│   ├── suggestion-prompts.ts         # NEW: SUGGESTION_PROMPTS array + types
│   ├── suggestion-chips.tsx          # NEW: 6-chip renderer
│   └── chat-container.tsx            # MODIFY: mount <SuggestionChips /> above <ChatInput />,
│                                     #         accept optional getCurrentCode/currentLanguage props,
│                                     #         wire click handler that composes code-augmented message
├── app/practice/[slug]/
│   └── page.tsx                      # MODIFY: pass editorRef.current?.getCode + language to ChatContainer

apps/web/__tests__/
└── components/chat/
    ├── suggestion-prompts.test.ts    # NEW: schema validation for 6 prompts
    └── suggestion-chips.test.tsx     # NEW: render + click behavior
```

---

## Task 1: Create suggestion-prompts config + test

**Files:**
- Create: `apps/web/src/components/chat/suggestion-prompts.ts`
- Create: `apps/web/__tests__/components/chat/suggestion-prompts.test.ts`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/components/chat/suggestion-prompts.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { SUGGESTION_PROMPTS } from "@/components/chat/suggestion-prompts";

describe("SUGGESTION_PROMPTS", () => {
  it("exports exactly 6 prompts", () => {
    expect(SUGGESTION_PROMPTS).toHaveLength(6);
  });

  it("each prompt has required fields", () => {
    for (const p of SUGGESTION_PROMPTS) {
      expect(p.id).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.prompt).toBeTruthy();
      expect(typeof p.icon).toBe("function");
    }
  });

  it("all ids are unique", () => {
    const ids = SUGGESTION_PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("review and complexity prompts need code", () => {
    const review = SUGGESTION_PROMPTS.find((p) => p.id === "review");
    const complexity = SUGGESTION_PROMPTS.find((p) => p.id === "complexity");
    expect(review?.needsCode).toBe(true);
    expect(complexity?.needsCode).toBe(true);
  });

  it("other prompts do not need code", () => {
    const others = SUGGESTION_PROMPTS.filter(
      (p) => !["review", "complexity"].includes(p.id)
    );
    for (const p of others) {
      expect(p.needsCode).toBeFalsy();
    }
  });

  it("contains approach, review, hint, explain, complexity, edge-cases", () => {
    const ids = SUGGESTION_PROMPTS.map((p) => p.id).sort();
    expect(ids).toEqual(
      ["approach", "edge-cases", "explain", "hint", "review", "complexity"].sort()
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/components/chat/suggestion-prompts.test.ts
```

Expected: FAIL — "Cannot find module '@/components/chat/suggestion-prompts'"

- [ ] **Step 3: Create config file**

Create `apps/web/src/components/chat/suggestion-prompts.ts`:

```typescript
import type { ComponentType, SVGProps } from "react";

export interface SuggestionPrompt {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  prompt: string;
  /** If true, chat-container will append the current editor content. */
  needsCode?: boolean;
}

type IconProps = SVGProps<SVGSVGElement>;

function CompassIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-6 2-2 6 6-2 2-6z" />
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BulbIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3a6 6 0 0 0-4 10.5V16h8v-2.5A6 6 0 0 0 12 3Z" />
      <path d="M10 20h4" />
    </svg>
  );
}

function QuestionIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2.5-2.5 4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function TargetIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export const SUGGESTION_PROMPTS: SuggestionPrompt[] = [
  {
    id: "approach",
    label: "Approach",
    icon: CompassIcon,
    prompt:
      "What's the thinking approach for this problem? Where should I start? Explain what kind of problem this is.",
  },
  {
    id: "review",
    label: "Review my code",
    icon: SearchIcon,
    needsCode: true,
    prompt: "Review my current code and point out what's wrong or could be improved.",
  },
  {
    id: "hint",
    label: "Give me a hint",
    icon: BulbIcon,
    prompt: "Give me a small hint without spoiling the full solution.",
  },
  {
    id: "explain",
    label: "Explain problem",
    icon: QuestionIcon,
    prompt:
      "Explain this problem in simple beginner-friendly terms with a walkthrough example.",
  },
  {
    id: "complexity",
    label: "Time complexity",
    icon: ClockIcon,
    needsCode: true,
    prompt: "Analyze the time and space complexity of my current approach.",
  },
  {
    id: "edge-cases",
    label: "Edge cases",
    icon: TargetIcon,
    prompt: "What edge cases should I consider for this problem?",
  },
];
```

Note: the file extension is `.ts` but contains JSX. Rename to `.tsx` if your linter complains. (The plan uses `.ts` for brevity; Next.js accepts JSX in `.tsx` only — so actually **create `suggestion-prompts.tsx` instead** and adjust the test's import path.)

Actually: use `.tsx` file extension because of JSX. Create `apps/web/src/components/chat/suggestion-prompts.tsx` (not `.ts`). Update the test import if needed.

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/components/chat/suggestion-prompts.test.ts
```

Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/components/chat/suggestion-prompts.tsx apps/web/__tests__/components/chat/suggestion-prompts.test.ts && git commit -m "feat(chat): add suggestion-prompts config with 6 beginner-friendly prompts"
```

---

## Task 2: Create SuggestionChips component + test

**Files:**
- Create: `apps/web/src/components/chat/suggestion-chips.tsx`
- Create: `apps/web/__tests__/components/chat/suggestion-chips.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/components/chat/suggestion-chips.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { SUGGESTION_PROMPTS } from "@/components/chat/suggestion-prompts";

describe("SuggestionChips", () => {
  it("renders a button for each prompt", () => {
    const onSelect = vi.fn();
    render(<SuggestionChips onSelect={onSelect} />);
    for (const p of SUGGESTION_PROMPTS) {
      expect(screen.getByRole("button", { name: new RegExp(p.label, "i") })).toBeInTheDocument();
    }
  });

  it("fires onSelect with the matching prompt when a chip is clicked", () => {
    const onSelect = vi.fn();
    render(<SuggestionChips onSelect={onSelect} />);
    const btn = screen.getByRole("button", { name: /approach/i });
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      SUGGESTION_PROMPTS.find((p) => p.id === "approach")
    );
  });

  it("does not fire onSelect when disabled", () => {
    const onSelect = vi.fn();
    render(<SuggestionChips onSelect={onSelect} disabled />);
    fireEvent.click(screen.getByRole("button", { name: /approach/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("each chip has disabled attribute when disabled", () => {
    render(<SuggestionChips onSelect={vi.fn()} disabled />);
    for (const p of SUGGESTION_PROMPTS) {
      const btn = screen.getByRole("button", { name: new RegExp(p.label, "i") });
      expect(btn).toBeDisabled();
    }
  });
});
```

- [ ] **Step 2: Check @testing-library/react is available**

```bash
cd apps/web && grep -E '"@testing-library/react|jsdom"' package.json
```

If not present, install:
```bash
cd apps/web && npm install -D @testing-library/react @testing-library/jest-dom jsdom
```

Check `apps/web/vitest.config.ts` has `environment: 'jsdom'`. If not, add it:
```typescript
test: {
  environment: "jsdom",
  globals: true,
}
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/components/chat/suggestion-chips.test.tsx
```

Expected: FAIL — "Cannot find module '@/components/chat/suggestion-chips'"

- [ ] **Step 4: Create component**

Create `apps/web/src/components/chat/suggestion-chips.tsx`:

```typescript
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
```

- [ ] **Step 5: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/components/chat/suggestion-chips.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/components/chat/suggestion-chips.tsx apps/web/__tests__/components/chat/suggestion-chips.test.tsx && git commit -m "feat(chat): SuggestionChips component renders 6 clickable prompts"
```

---

## Task 3: Wire SuggestionChips into ChatContainer

**Files:**
- Modify: `apps/web/src/components/chat/chat-container.tsx`

- [ ] **Step 1: Read current chat-container.tsx**

Open `apps/web/src/components/chat/chat-container.tsx` and note the existing structure. The component currently renders `<ChatInput onSend={sendMessage} disabled={isLoading} />`.

- [ ] **Step 2: Update chat-container.tsx**

Replace the full file with:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { SuggestionChips } from "./suggestion-chips";
import type { SuggestionPrompt } from "./suggestion-prompts";
import { useChat } from "@/hooks/use-chat";

interface ChatContainerProps {
  conversationId: string;
  initialMessages?: {
    id: string;
    role: string;
    content: string;
    skillPhase?: string | null;
  }[];
  /** Returns current Monaco editor content for code-aware prompts. */
  getCurrentCode?: () => string;
  /** Current language label for fenced code block (e.g. "python", "javascript"). */
  currentLanguage?: string;
}

export function ChatContainer({
  conversationId,
  initialMessages,
  getCurrentCode,
  currentLanguage,
}: ChatContainerProps) {
  const { messages, isLoading, currentPhase, sendMessage, loadHistory } =
    useChat({ conversationId });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages) {
      loadHistory(initialMessages);
    }
  }, [initialMessages, loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSuggestion = (p: SuggestionPrompt) => {
    let message = p.prompt;
    if (p.needsCode) {
      const code = getCurrentCode?.() ?? "";
      const lang = (currentLanguage ?? "").toLowerCase();
      message += `\n\n\`\`\`${lang}\n${code}\n\`\`\``;
    }
    sendMessage(message);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              skillPhase={msg.skillPhase}
              isStreaming={msg.isStreaming}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <SuggestionChips onSelect={handleSuggestion} disabled={isLoading} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
```

Note the two new optional props. Existing callers that don't pass them still work (code-aware prompts will send empty code blocks, which is acceptable fallback).

- [ ] **Step 3: Run all chat tests**

```bash
cd apps/web && npx vitest run __tests__/components/chat
```

Expected: ALL PASS (including the new tests from Tasks 1-2).

- [ ] **Step 4: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/components/chat/chat-container.tsx && git commit -m "feat(chat): wire SuggestionChips into ChatContainer"
```

---

## Task 4: Pass editor code + language from problem page

**Files:**
- Modify: `apps/web/src/app/practice/[slug]/page.tsx`

- [ ] **Step 1: Find the ChatContainer usage**

```bash
grep -n "ChatContainer conversationId" "c:\Users\88698\Desktop\Workspace\AI Pair Programmer\apps\web\src\app\practice\[slug]\page.tsx"
```

Expected: one line around `<ChatContainer conversationId={conversationId} initialMessages={initialMessages} />`.

- [ ] **Step 2: Update page.tsx to pass new props**

Replace that one line (find exactly `<ChatContainer conversationId={conversationId} initialMessages={initialMessages} />`) with:

```tsx
<ChatContainer
  conversationId={conversationId}
  initialMessages={initialMessages}
  getCurrentCode={() => editorRef.current?.getCode() ?? ""}
  currentLanguage={language.toLowerCase()}
/>
```

The `editorRef` is already defined in the page (`useRef<CodeEditorHandle>(null)`). The `language` state is already there (`useState<Language>("PYTHON")`). No imports needed.

- [ ] **Step 3: Run dev server and click a chip manually**

```bash
cd apps/web && npm run dev
```

Visit `http://localhost:3001/practice/two-sum` (log in if needed). Verify:
- 6 chips appear above chat input
- Click "Approach" — sends "What's the thinking approach...", AI responds
- Click "Review my code" after editing — sends prompt + code block, AI responds
- Chips are disabled while AI is streaming

- [ ] **Step 4: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/app/practice/[slug]/page.tsx && git commit -m "feat(practice): pass editor code + language to ChatContainer for code-aware chips"
```

---

## Task 5: Run full test suite + push

- [ ] **Step 1: Run all unit tests**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer\apps\web" && npx vitest run
```

Expected: all previous tests still pass + new 10 tests pass (6 config + 4 component).

- [ ] **Step 2: Typecheck (if tsc runs clean)**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new TypeScript errors in the files we touched.

- [ ] **Step 3: Push**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git push
```

---

## Summary

**Total tasks:** 5

- Task 1 — config + schema tests (6 prompts)
- Task 2 — SuggestionChips component + render/click tests
- Task 3 — wire into ChatContainer
- Task 4 — pass editor code + language from problem page
- Task 5 — verify + push

**Self-review:**

- ✅ All spec requirements covered:
  - 6 chips above input → Task 3
  - Click sends immediately → Task 3 handleSuggestion
  - Code injection for review/complexity → Task 3 + Task 4
  - Disabled while streaming → Task 2 disabled prop + Task 3 passes `isLoading`
  - Auth-gated → inherits from ChatContainer mount condition (existing behavior)
  - No server-side changes → confirmed
  - Tests for config + component → Tasks 1 & 2
- ✅ No placeholders; all code and commands are complete
- ✅ Type consistency: `SuggestionPrompt`, `onSelect`, `needsCode`, `getCurrentCode`, `currentLanguage` — same shape across tasks
