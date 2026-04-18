const EXECUTOR_URL = process.env.EXECUTOR_URL ?? "http://localhost:4000";

export interface ExecuteRequest {
  submissionId: string;
  language: "PYTHON" | "C" | "CPP" | "JAVASCRIPT";
  code: string;
  testCases: {
    id: string;
    input: string;
    expected: string;
    isHidden: boolean;
    isKiller: boolean;
  }[];
  timeout?: number;
  memoryLimit?: number;
}

export interface ExecuteResult {
  submissionId: string;
  status: string;
  testResults: {
    testCaseId: string;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    runtime: number;
    memory: number;
  }[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string;
}

export class ExecutionClient {
  // Synchronous execution (waits for result)
  async executeSync(request: ExecuteRequest): Promise<ExecuteResult> {
    let response: Response;
    try {
      response = await fetch(`${EXECUTOR_URL}/execute/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
    } catch (error: any) {
      throw new Error(
        `Cannot connect to execution engine (${EXECUTOR_URL}). Make sure to start with: npm run dev:web`
      );
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Executor error: ${response.status}`);
    }

    return response.json();
  }

  // Asynchronous execution (enqueue)
  async executeAsync(request: ExecuteRequest): Promise<{ jobId: string }> {
    const response = await fetch(`${EXECUTOR_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Executor error: ${response.status}`);
    }

    return response.json();
  }

  // Query job status
  async getStatus(jobId: string): Promise<{
    jobId: string;
    state: string;
    result: ExecuteResult | null;
    failedReason: string | null;
  }> {
    const response = await fetch(`${EXECUTOR_URL}/status/${jobId}`);

    if (!response.ok) {
      throw new Error(`Status query failed: ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${EXECUTOR_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
