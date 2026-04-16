import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">SKILL Platform</h1>
        <p className="mt-4 text-lg text-gray-400">
          AI 驅動的程式解題與系統設計導師
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Systematic Knowledge & Integrated Logic Learning
        </p>
      </div>

      <AuthButton />

      <div className="mt-8 grid max-w-2xl grid-cols-3 gap-4 text-center">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="text-2xl font-bold text-blue-400">SKILL</div>
          <div className="mt-2 text-sm text-gray-400">
            蘇格拉底式引導，不餵答案
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="text-2xl font-bold text-green-400">4 語言</div>
          <div className="mt-2 text-sm text-gray-400">
            Python、C、C++、JavaScript
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="text-2xl font-bold text-purple-400">自適應</div>
          <div className="mt-2 text-sm text-gray-400">
            知識圖譜驅動的學習路徑
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <Link
          href="/practice"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-500"
        >
          開始練習
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-700 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
        >
          我的進度
        </Link>
      </div>
    </main>
  );
}
