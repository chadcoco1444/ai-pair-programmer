import { Queue, QueueEvents } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export interface ExecutionJob {
  submissionId: string;
  language: "PYTHON" | "C" | "CPP" | "JAVASCRIPT";
  code: string;
  testCases: {
    id: string;
    input: string;
    args?: any[];
    expected: string;
    isHidden: boolean;
    isKiller: boolean;
  }[];
  timeout: number;
  memoryLimit: number;
}

export const executionQueue = new Queue<ExecutionJob>("execution", {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 1,
  },
});

export const executionQueueEvents = new QueueEvents("execution", { connection });
