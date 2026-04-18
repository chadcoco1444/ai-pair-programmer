import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

const FEATURES = [
  {
    title: "Guided Practice",
    description:
      "Socratic AI tutor nudges you toward insight — never spoon-feeds the answer.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
        />
      </svg>
    ),
  },
  {
    title: "Adaptive Path",
    description:
      "Knowledge-graph driven recommendations adapt to your weak spots every session.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
  {
    title: "SKILL Framework",
    description:
      "Systematic Knowledge & Integrated Logic Learning — master concepts, not answers.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443"
        />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-slate-900 relative">
      {/* Subtle dot-grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(#f8fafc 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <h1 className="font-mono text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
          SKILL <span className="text-emerald-400">Platform</span>
        </h1>

        <p className="mt-6 font-sans text-xl text-slate-400 max-w-2xl leading-relaxed">
          An AI pair programmer for algorithms and system design. Master problems
          through guided discovery — not answer memorisation.
        </p>

        {/* Primary CTA + auth */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/practice"
            className="cursor-pointer bg-green-500 hover:bg-green-600 text-white rounded-md px-5 py-2.5 text-sm font-medium transition-colors duration-200 inline-flex items-center gap-2"
          >
            Start Practicing
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12m0 0l-4-4m4 4l-4 4" />
            </svg>
          </Link>
          <AuthButton />
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-slate-800/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors duration-200"
            >
              <div className="text-emerald-400 mb-4">{f.icon}</div>
              <h3 className="font-mono font-semibold text-lg text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
