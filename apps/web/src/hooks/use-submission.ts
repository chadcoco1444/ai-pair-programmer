"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";

interface SubmissionResult {
  submissionId: string;
  status: string;
  testResults: any[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string;
}

export function useSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const submitMutation = trpc.submission.submit.useMutation();

  const submit = async (params: {
    problemId: string;
    language: "PYTHON" | "C" | "CPP" | "JAVASCRIPT";
    code: string;
    conversationId?: string;
  }) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await submitMutation.mutateAsync(params);
      setResult(res);
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, result };
}
