import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">
        歡迎回來，{session.user.name}
      </h1>
      <p className="mt-2 text-gray-400">
        你的個人儀表板（建置中）
      </p>
    </main>
  );
}
