import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

const FEATURES = [
  {
    label: "SKILL Framework",
    description: "Socratic guidance — no spoilers, just the right nudge",
    accent: "text-orange-400",
    border: "border-orange-400/20",
  },
  {
    label: "75 Problems",
    description: "Curated Blind 75 + extended problem set",
    accent: "text-green-400",
    border: "border-green-400/20",
  },
  {
    label: "4 Languages",
    description: "Python, C, C++, JavaScript",
    accent: "text-blue-400",
    border: "border-blue-400/20",
  },
  {
    label: "Adaptive",
    description: "Knowledge-graph driven learning paths",
    accent: "text-amber-400",
    border: "border-amber-400/20",
  },
];

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#0a0a0f]">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-3 inline-block rounded-full border border-orange-400/30 bg-orange-400/5 px-4 py-1 text-[12px] font-medium uppercase tracking-widest text-orange-400">
          AI Pair Programmer
        </div>

        <h1 className="mt-4 text-[38px] font-bold leading-tight tracking-tight text-white sm:text-[48px]">
          SKILL Platform
        </h1>

        <p className="mt-3 text-[15px] text-gray-400">
          Systematic Knowledge &amp; Integrated Logic Learning
        </p>
        <p className="mt-1.5 max-w-md text-[13px] text-gray-500">
          AI-powered programming tutor for algorithms and system design.
          Master problems through guided discovery, not answer memorisation.
        </p>

        {/* Auth */}
        <div className="mt-8">
          <AuthButton />
        </div>

        {/* CTAs */}
        <div className="mt-6 flex gap-3">
          <Link
            href="/practice"
            className="rounded-lg bg-green-500 px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-green-400"
          >
            Start Practicing
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-700/50 bg-transparent px-6 py-2.5 text-[13px] font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-[#1a1a1a] hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className={`rounded-xl border ${f.border} bg-[#1a1a1a] p-5 transition-colors hover:bg-[#1e1e1e]`}
            >
              <div className={`text-[22px] font-bold ${f.accent}`}>{f.label}</div>
              <div className="mt-2 text-[12px] leading-relaxed text-gray-500">
                {f.description}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-12 border-t border-gray-800/60" />

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-10 text-center">
          {[
            { value: "75+", label: "Curated Problems" },
            { value: "4", label: "Languages Supported" },
            { value: "SKILL", label: "Learning Framework" },
            { value: "AI", label: "Adaptive Tutor" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[22px] font-bold text-white">{s.value}</div>
              <div className="mt-1 text-[12px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
