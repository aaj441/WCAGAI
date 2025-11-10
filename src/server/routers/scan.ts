/**
 * Scan Router
 * 
 * WCAG scanning API endpoints
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, rateLimitedProcedure } from '../trpc';
import { submitScanJob, getJobStatus } from '@/lib/queue';
import { auditScan } from '@/lib/audit';
import { isValidUrl } from '@/lib/security';

export const scanRouter = createTRPCRouter({
  /**
   * Submit a new WCAG scan
   */
  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        level: z.enum(['A', 'AA', 'AAA']).default('AA'),
        runPa11y: z.boolean().default(false),
        screenshot: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate URL
      if (!isValidUrl(input.url)) {
        throw new Error('Invalid or unsafe URL');
      }

      // Submit scan job
      const jobId = await submitScanJob({
        ...input,
        userId: ctx.user.id,
      });

      // Create database record
      const scan = await ctx.prisma.scan.create({
        data: {
          url: input.url,
          status: 'PENDING',
          userId: ctx.user.id,
          organizationId: ctx.user.organizationId,
        },
      });

      // Audit log
      await auditScan('scan_started', scan.id, ctx.user.id, { url: input.url });

      return {
        scanId: scan.id,
        jobId,
        status: 'PENDING',
        message: 'Scan submitted successfully',
      };
    }),

  /**
   * Get scan status
   */
  getStatus: protectedProcedure
    .input(z.object({ scanId: z.string() }))
    .query(async ({ ctx, input }) => {
      const scan = await ctx.prisma.scan.findUnique({
        where: { id: input.scanId },
        include: {
          violations_data: {
            take: 10,
            orderBy: { impact: 'desc' },
          },
        },
      });

      if (!scan) {
        throw new Error('Scan not found');
      }

      // Check if user has access
      if (scan.userId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      return scan;
    }),

  /**
   * List user's scans
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        status: z.enum(['PENDING', 'SCANNING', 'ANALYZING', 'COMPLETED', 'FAILED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const scans = await ctx.prisma.scan.findMany({
        where: {
          userId: ctx.user.id,
          status: input.status,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { violations_data: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (scans.length > input.limit) {
        const nextItem = scans.pop();
        nextCursor = nextItem!.id;
      }

      return {
        scans,
        nextCursor,
      };
    }),

  /**
   * Get scan details with violations
   */
  getDetails: protectedProcedure
    .input(z.object({ scanId: z.string() }))
    .query(async ({ ctx, input }) => {
      const scan = await ctx.prisma.scan.findUnique({
        where: { id: input.scanId },
        include: {
          violations_data: {
            orderBy: [{ impact: 'desc' }, { level: 'asc' }],
          },
          reports: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!scan) {
        throw new Error('Scan not found');
      }

      // Check access
      if (scan.userId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      return scan;
    }),

  /**
   * Delete a scan
   */
  delete: protectedProcedure
    .input(z.object({ scanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const scan = await ctx.prisma.scan.findUnique({
        where: { id: input.scanId },
      });

      if (!scan) {
        throw new Error('Scan not found');
      }

      // Check access
      if (scan.userId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      await ctx.prisma.scan.delete({
        where: { id: input.scanId },
      });

      return { success: true };
    }),
});
