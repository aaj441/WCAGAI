/**
 * Report Router
 * 
 * Report generation and management API endpoints
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { submitReportJob } from '@/lib/queue';
import { auditReport } from '@/lib/audit';

export const reportRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        scanId: z.string(),
        format: z.enum(['pdf', 'html', 'json']).default('html'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const jobId = await submitReportJob({
        scanId: input.scanId,
        analysisId: input.scanId,
        userId: ctx.user.id,
        format: input.format,
      });

      await auditReport('report_generated', input.scanId, ctx.user.id);

      return { jobId, status: 'generating' };
    }),

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reports = await ctx.prisma.report.findMany({
        where: { userId: ctx.user.id },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: { scan: true },
      });

      let nextCursor: string | undefined = undefined;
      if (reports.length > input.limit) {
        const nextItem = reports.pop();
        nextCursor = nextItem!.id;
      }

      return { reports, nextCursor };
    }),

  getById: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.findUnique({
        where: { id: input.reportId },
        include: { scan: true },
      });

      if (!report || (report.userId !== ctx.user.id && ctx.user.role !== 'ADMIN')) {
        throw new Error('Report not found or unauthorized');
      }

      await auditReport('report_viewed', input.reportId, ctx.user.id);

      return report;
    }),
});
