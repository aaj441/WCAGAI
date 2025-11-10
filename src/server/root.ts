/**
 * Root tRPC Router
 * 
 * Combines all sub-routers for the API
 */

import { createTRPCRouter } from './trpc';
import { scanRouter } from './routers/scan';
import { reportRouter } from './routers/report';
import { templateRouter } from './routers/template';
import { userRouter } from './routers/user';

/**
 * Main API router
 */
export const appRouter = createTRPCRouter({
  scan: scanRouter,
  report: reportRouter,
  template: templateRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
