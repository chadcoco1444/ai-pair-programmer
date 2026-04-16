import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { problemRouter } from "./routers/problem";
import { conceptRouter } from "./routers/concept";
import { conversationRouter } from "./routers/conversation";
import { submissionRouter } from "./routers/submission";
import { learningRouter } from "./routers/learning";

export const appRouter = router({
  user: userRouter,
  problem: problemRouter,
  concept: conceptRouter,
  conversation: conversationRouter,
  submission: submissionRouter,
  learning: learningRouter,
});

export type AppRouter = typeof appRouter;
