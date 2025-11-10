/**
 * Template Router
 * 
 * FDCPA template generation API endpoints
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { submitTemplateJob, submitBulkTemplateJobs } from '@/lib/queue';
import { auditTemplate } from '@/lib/audit';
import { features } from '@/lib/config';

export const templateRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!features.templateGeneration) {
      throw new Error('Template generation is disabled');
    }

    const templates = await ctx.prisma.template.findMany({
      where: {
        OR: [{ userId: ctx.user.id }, { isActive: true }],
      },
      orderBy: { createdAt: 'desc' },
    });

    return templates;
  }),

  generate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        variables: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!features.templateGeneration) {
        throw new Error('Template generation is disabled');
      }

      const jobId = await submitTemplateJob({
        templateId: input.templateId,
        variables: input.variables,
        userId: ctx.user.id,
      });

      await auditTemplate('document_generated', input.templateId, ctx.user.id);

      return { jobId, status: 'generating' };
    }),

  bulkGenerate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        variablesList: z.array(z.record(z.any())),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!features.bulkProcessing) {
        throw new Error('Bulk processing is disabled');
      }

      const jobIds = await submitBulkTemplateJobs({
        templateId: input.templateId,
        variablesList: input.variablesList,
        userId: ctx.user.id,
      });

      return { jobIds, count: jobIds.length };
    }),
});
