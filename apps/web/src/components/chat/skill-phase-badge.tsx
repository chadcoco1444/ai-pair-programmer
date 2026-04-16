const PHASE_CONFIG: Record<string, { label: string; color: string }> = {
  SOCRATIC: { label: "S 蘇格拉底", color: "bg-blue-600" },
  KNOWLEDGE: { label: "K 知識連結", color: "bg-purple-600" },
  ITERATIVE: { label: "I 疊代優化", color: "bg-amber-600" },
  LOGIC: { label: "L1 邏輯驗證", color: "bg-emerald-600" },
  EVOLUTION: { label: "L2 長期演化", color: "bg-rose-600" },
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
