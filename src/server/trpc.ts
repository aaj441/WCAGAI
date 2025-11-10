/**
 * tRPC Server Configuration
 * 
 * Type-safe API setup with context, middleware, and procedures
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { createAuditLog } from '@/lib/audit';

/**
 * Create context for each request
 */
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts;

  // Get user session (would integrate with NextAuth)
  const session = null; // await getServerSession(req, res, authOptions);

  return {
    req,
    res,
    prisma,
    session,
    user: session?.user,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session },
      user: ctx.user,
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({ ctx });
});

/**
 * Audited procedure - logs all actions
 */
export const auditedProcedure = protectedProcedure.use(
  async ({ ctx, next, path, rawInput }) => {
    const result = await next({ ctx });

    // Log to audit trail
    await createAuditLog({
      userId: ctx.user.id,
      action: `api.${path}`,
      resource: path.split('.')[0],
      details: {
        input: rawInput,
        success: true,
      },
      ipAddress: ctx.req.headers['x-forwarded-for'] as string,
      userAgent: ctx.req.headers['user-agent'],
    });

    return result;
  }
);

/**
 * Rate limited procedure
 */
export const rateLimitedProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    // Rate limiting logic would go here
    // For now, just pass through
    return next({ ctx });
  }
);
