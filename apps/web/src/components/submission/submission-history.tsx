"use client";

import { trpc } from "@/lib/trpc-client";
import { useSession } from "next-auth/react";

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  ACCEPTED: { label: "Accepted", color: "text-green-500" },
  WRONG_ANSWER: { label: "Wrong Answer", color: "text-red-500" },
  TIME_LIMIT: { label: "Time Limit Exceeded", color: "text-yellow-500" },
  MEMORY_LIMIT: { label: "Memory Limit Exceeded", color: "text-yellow-500" },
  RUNTIME_ERROR: { label: "Runtime Error", color: "text-red-500" },
  COMPILE_ERROR: { label: "Compile Error", color: "text-red-500" },
  PENDING: { label: "Pending", color: "text-gray-400" },
  RUNNING: { label: "Running", color: "text-blue-400" },
};

const LANG_LABEL: Record<string, string> = {
  PYTHON: "Python",
  C: "C",
  CPP: "C++",
  JAVASCRIPT: "JavaScript",
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

export function SubmissionHistory({ problemId }: { problemId: string }) {
  const { status } = useSession();
  const enabled = status === "authenticated";

  const { data: submissions, isLoading } = trpc.submission.history.useQuery(
    { problemId, limit: 20 },
    { enabled, refetchInterval: 5000 }
  );

  if (!enabled) {
    return (
      <div className="p-5 text-[13px] text-gray-500">
        Please sign in to view submissions.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-5 text-[13px] text-gray-500">Loading...</div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-5 text-[13px] text-gray-500">
        No submissions yet. Write your solution and click Submit.
      </div>
    );
  }

  return (
    <div className="p-2">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-700/40 text-left text-[12px] text-gray-500">
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Language</th>
            <th className="px-3 py-2 font-medium">Runtime</th>
            <th className="px-3 py-2 font-medium">Memory</th>
            <th className="px-3 py-2 font-medium text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => {
            const st = STATUS_STYLE[sub.status] ?? { label: sub.status, color: "text-gray-400" };
            return (
              <tr
                key={sub.id}
                className="border-b border-gray-700/20 transition-colors hover:bg-[#252525]"
              >
                <td className="px-3 py-2.5">
                  <span className={`font-medium ${st.color}`}>{st.label}</span>
                </td>
                <td className="px-3 py-2.5 text-gray-400">
                  {LANG_LABEL[sub.language] ?? sub.language}
                </td>
                <td className="px-3 py-2.5 text-gray-400">
                  {sub.runtime != null ? `${sub.runtime} ms` : "—"}
                </td>
                <td className="px-3 py-2.5 text-gray-400">
                  {sub.memory != null ? `${(sub.memory / 1024).toFixed(1)} MB` : "—"}
                </td>
                <td className="px-3 py-2.5 text-right text-gray-500">
                  {timeAgo(sub.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
