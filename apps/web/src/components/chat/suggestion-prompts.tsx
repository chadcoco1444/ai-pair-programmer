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
  { id: "approach", label: "Approach", icon: CompassIcon,
    prompt: "What's the thinking approach for this problem? Where should I start? Explain what kind of problem this is." },
  { id: "review", label: "Review my code", icon: SearchIcon, needsCode: true,
    prompt: "Review my current code and point out what's wrong or could be improved." },
  { id: "hint", label: "Give me a hint", icon: BulbIcon,
    prompt: "Give me a small hint without spoiling the full solution." },
  { id: "explain", label: "Explain problem", icon: QuestionIcon,
    prompt: "Explain this problem in simple beginner-friendly terms with a walkthrough example." },
  { id: "complexity", label: "Time complexity", icon: ClockIcon, needsCode: true,
    prompt: "Analyze the time and space complexity of my current approach." },
  { id: "edge-cases", label: "Edge cases", icon: TargetIcon,
    prompt: "What edge cases should I consider for this problem?" },
];
