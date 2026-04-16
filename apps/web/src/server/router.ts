import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { problemRouter } from "./routers/problem";
import { conceptRouter } from "./routers/concept";

export const appRouter = router({
  user: userRouter,
  problem: problemRouter,
  concept: conceptRouter,
});

export type AppRouter = typeof appRouter;
