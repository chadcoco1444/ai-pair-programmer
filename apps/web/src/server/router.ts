import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { problemRouter } from "./routers/problem";
import { conceptRouter } from "./routers/concept";
import { conversationRouter } from "./routers/conversation";
import { submissionRouter } from "./routers/submission";

export const appRouter = router({
  user: userRouter,
  problem: problemRouter,
  concept: conceptRouter,
  conversation: conversationRouter,
  submission: submissionRouter,
});

export type AppRouter = typeof appRouter;
