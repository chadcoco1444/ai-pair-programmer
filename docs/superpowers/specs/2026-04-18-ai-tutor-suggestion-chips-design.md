# AI Tutor Suggestion Chips Design

**Date**: 2026-04-18
**Status**: Approved — ready for implementation plan

## Problem

Beginners often don't know what to ask the AI tutor. They open the chat, stare at the empty input, and don't know how to phrase a question. Common situations:

- Don't understand what the problem is asking
- Understand the problem but have no idea where to start
- Wrote some code but it doesn't work and can't diagnose why
- Want to know if their complexity is good enough
- Haven't thought about edge cases

Current `useChat` interface just has a text input. Users must formulate their own questions, which is a usability barrier for less-experienced students.

Goal: Add 6 one-click suggestion chips above the chat input that send pre-written prompts directly to the AI, optionally including the current code snapshot for code-review-style prompts.

## User Flow

```
User opens a problem page and sees the chat panel
  ↓
Above input: row of 6 chips (Approach, Review my code, Hint, Explain, Time complexity, Edge cases)
  ↓
User clicks "Approach" chip
  ↓
Message auto-sends: "What's the thinking approach for this problem? Where should I start?..."
  ↓
Appears in chat as user message (just like manually typed)
  ↓
AI responds via existing SSE stream, follows SKILL framework as usual
```

Special case for "Review my code" and "Time complexity":

```
User clicks "Review my code" chip
  ↓
System fetches Monaco editor current content
  ↓
Sends: "Review my current code and point out what's wrong or could be improved.\n\n```python\n<editor code>\n```"
  ↓
AI sees both the prompt AND the code, can give specific feedback
```

## Architecture

No backend/API changes. Pure frontend enhancement that composes the existing chat flow.

### Files

```
apps/web/src/
├── components/chat/
│   ├── suggestion-prompts.ts      # NEW: 6 prompts config with icons
│   ├── suggestion-chips.tsx       # NEW: chip row component
│   └── chat-panel.tsx             # MODIFY: mount <SuggestionChips /> above input,
│                                  #         wire click handler that calls sendMessage
```

### Component Contract

**SuggestionChips** (new component)
```tsx
interface SuggestionChipsProps {
  onSelect: (prompt: SuggestionPrompt) => void;
  disabled?: boolean;
}
```

Renders a `flex flex-wrap` row of 6 chip buttons. Each chip has:
- Emerald-accented SVG icon (16px)
- Short label (Fira Sans 12px)
- Hover: `bg-slate-700`, `text-white`
- Click: calls `onSelect(prompt)` with the full prompt object
- Disabled when `disabled` (e.g., while AI is responding) — opacity 50%, cursor not-allowed

**SuggestionPrompt** type
```typescript
interface SuggestionPrompt {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  needsCode?: boolean;  // if true, chat-panel will append current editor content
}
```

### The 6 Prompts

| id | label | icon | needsCode | prompt text |
|----|-------|------|-----------|-------------|
| `approach` | Approach | Compass | no | "What's the thinking approach for this problem? Where should I start? Explain what kind of problem this is." |
| `review` | Review my code | Search | **yes** | "Review my current code and point out what's wrong or could be improved." |
| `hint` | Give me a hint | Bulb | no | "Give me a small hint without spoiling the full solution." |
| `explain` | Explain problem | Question | no | "Explain this problem in simple beginner-friendly terms with a walkthrough example." |
| `complexity` | Time complexity | Clock | **yes** | "Analyze the time and space complexity of my current approach." |
| `edge-cases` | Edge cases | Target | no | "What edge cases should I consider for this problem?" |

### Chat Panel Integration

In `chat-panel.tsx`, after locating the input area, insert `<SuggestionChips />` just above the input. The click handler:

```typescript
const handleSuggestion = async (suggestion: SuggestionPrompt) => {
  let message = suggestion.prompt;
  if (suggestion.needsCode) {
    const code = getCurrentEditorContent();  // lifted from existing editor integration
    const lang = currentLanguage.toLowerCase();
    message += `\n\n\`\`\`${lang}\n${code}\n\`\`\``;
  }
  await sendMessage(message);  // reuses existing send pipeline
};
```

The existing `sendMessage` path handles:
- Rendering the user message in the chat history
- Calling the SSE endpoint
- Streaming the AI response
- Phase detection
- Persistence to DB

No changes to `skill-prompts.ts`, `skill-orchestrator.ts`, or server-side code.

## Error Handling

- **AI service unavailable**: existing `sendMessage` error path handles it — shows "Failed to send" toast.
- **User not authenticated**: `SuggestionChips` only mounts if `status === "authenticated"` (same gate as input).
- **Empty editor**: `needsCode` prompts still send even with empty code (AI will handle gracefully: "Your code appears empty — write something first").
- **AI still streaming**: `disabled` prop prevents re-click during active response.
- **Unknown language for code fence**: fallback to empty language tag `\`\`\`\n...\n\`\`\``.

## Visual Layout

```
┌─ Chat Panel (on /practice/[slug]) ─────────────────┐
│                                                     │
│  [Scrollable message history]                       │
│                                                     │
│  User: <previous message>                           │
│  AI:   <response with SKILL phase tag>              │
│  ...                                                │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [🧭 Approach] [🔍 Review my code] [💡 Hint]       │  ← NEW row
│  [❓ Explain] [⏱ Time complexity] [🎯 Edge cases]  │
├─────────────────────────────────────────────────────┤
│  [ Ask anything...                         ] [Send] │
└─────────────────────────────────────────────────────┘
```

Chips wrap onto 2 lines on narrow viewports (default Tailwind flex-wrap). On very narrow mobile, may push to 3 lines — acceptable.

## Non-Goals (Out of Scope)

- ❌ Dynamic suggestions that change based on current SKILL phase (future enhancement)
- ❌ Per-user customization of suggestions (future)
- ❌ Analytics/tracking which prompts are used most (future)
- ❌ Backend prompt templates (these are fixed client-side strings)
- ❌ Support for suggestions in multiple languages UI — labels stay English; AI responds in whatever language the user prefers through normal conversation
- ❌ Editing the chip prompt before sending (design decision: click = send immediately)

## Testing

**Unit**:
- `suggestion-prompts.ts`: schema validation (each entry has id, label, prompt, and icon)
- `suggestion-chips.tsx`: renders 6 chips, click fires `onSelect` with correct prompt, respects `disabled`

**Visual**:
- Chips render correctly on dark theme
- Icons visible and aligned
- Wrap behavior on narrow viewports
- Hover/focus states work
- Disabled state visually distinct

**Integration**:
- Manual: click each chip on `/practice/two-sum`, verify:
  - User message appears in chat
  - For `review` and `complexity`: code block is included with current editor content
  - AI responds (SSE stream works)
  - SKILL phase detection still works (tag at end of AI response)

No new E2E tests needed — this is purely client-side composition.

## Success Criteria

1. Six chip buttons appear above the chat input on problem pages
2. Clicking a chip sends the corresponding prompt to AI and renders user message
3. "Review my code" and "Time complexity" chips include current Monaco editor content as a fenced code block
4. Chips respect authentication gate (don't show when unauthenticated)
5. Chips are disabled while AI is streaming a response
6. All existing chat functionality (manual input, history, phase detection) unchanged
7. Unit tests for suggestion-prompts config + chip component
8. No regression in existing 83 unit tests + 284 E2E tests
