import { AuthButton } from "@/components/auth-button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          SKILL Platform
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          AI 驅動的程式解題與系統設計導師
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Systematic Knowledge & Integrated Logic Learning
        </p>
      </div>
      <AuthButton />
    </main>
  );
}
