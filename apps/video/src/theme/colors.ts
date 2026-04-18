// Mirrors apps/web Tailwind tokens for visual consistency.
export const colors = {
  bg: "#0f172a",          // slate-900 (page background)
  card: "#1e293b",        // slate-800 (card surface)
  cardAlt: "#0b1222",     // deeper alt
  border: "#334155",      // slate-700
  borderSoft: "#1e293b",
  emerald: "#22c55e",     // primary accent
  emeraldSoft: "#064e3b", // accent bg fill
  amber: "#f59e0b",       // mastery-mid
  red: "#ef4444",
  slate: "#94a3b8",       // slate-400 (body text)
  slateLight: "#cbd5e1",  // slate-300
  slateDim: "#64748b",    // slate-500 (muted)
  slateDimmer: "#475569", // slate-600
  text: "#f8fafc",        // slate-50 (primary text)
  blue: "#3b82f6",        // for user chat bubble (like chat-message.tsx)
} as const;

export type ColorToken = keyof typeof colors;
