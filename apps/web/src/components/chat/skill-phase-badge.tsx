const PHASE_CONFIG: Record<string, { label: string; color: string }> = {
  SOCRATIC: { label: "S Socratic", color: "bg-blue-600" },
  KNOWLEDGE: { label: "K Knowledge", color: "bg-purple-600" },
  ITERATIVE: { label: "I Iterative", color: "bg-amber-600" },
  LOGIC: { label: "L1 Logic", color: "bg-emerald-600" },
  EVOLUTION: { label: "L2 Evolution", color: "bg-rose-600" },
};

export function SKILLPhaseBadge({ phase }: { phase: string }) {
  const config = PHASE_CONFIG[phase] ?? { label: phase, color: "bg-gray-600" };

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${config.color}`}
    >
      {config.label}
    </span>
  );
}
