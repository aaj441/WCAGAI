/**
 * Job Queue Service
 * 
 * BullMQ-based job queue for processing WCAG scans, analysis, and report generation.
 * Implements Redis-backed queue with worker processes.
 */

import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import type { ScanRequest } from '@/types/agents';

// Redis connection
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

// Job queues
export const scanQueue = new Queue('wcag-scans', { connection });
export const analysisQueue = new Queue('wcag-analysis', { connection });
export const reportQueue = new Queue('wcag-reports', { connection });
export const templateQueue = new Queue('template-generation', { connection });

// Queue events for monitoring
export const scanQueueEvents = new QueueEvents('wcag-scans', { connection });
export const analysisQueueEvents = new QueueEvents('wcag-analysis', { connection });
export const reportQueueEvents = new QueueEvents('wcag-reports', { connection });

// ============================================================================
// Job Submission
// ============================================================================

/**
 * Submit a WCAG scan job
 */
export async function submitScanJob(data: ScanRequest & { userId: string }) {
  const job = await scanQueue.add('scan', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  });

  console.log(`[Queue] Scan job submitted: ${job.id}`);
  return job.id;
}

/**
 * Submit an analysis job
 */
export async function submitAnalysisJob(data: {
  scanId: string;
  violations: any[];
  userId: string;
}) {
  const job = await analysisQueue.add('analyze', data, {
    attempts: 2,
    priority: 1, // Higher priority than scans
  });

  console.log(`[Queue] Analysis job submitted: ${job.id}`);
  return job.id;
}

/**
 * Submit a report generation job
 */
export async function submitReportJob(data: {
  scanId: string;
  analysisId: string;
  userId: string;
  format: 'pdf' | 'html' | 'json';
}) {
  const job = await reportQueue.add('generate-report', data, {
    attempts: 2,
    priority: 2, // Highest priority
  });

  console.log(`[Queue] Report job submitted: ${job.id}`);
  return job.id;
}

/**
 * Submit a template generation job
 */
export async function submitTemplateJob(data: {
  templateId: string;
  variables: Record<string, any>;
  userId: string;
}) {
  const job = await templateQueue.add('generate-template', data, {
    attempts: 2,
  });

  console.log(`[Queue] Template job submitted: ${job.id}`);
  return job.id;
}

/**
 * Submit bulk template generation jobs
 */
export async function submitBulkTemplateJobs(data: {
  templateId: string;
  variablesList: Record<string, any>[];
  userId: string;
}) {
  const jobs = await templateQueue.addBulk(
    data.variablesList.map((variables, index) => ({
      name: 'generate-template',
      data: {
        templateId: data.templateId,
        variables,
        userId: data.userId,
        batchIndex: index,
      },
      opts: {
        attempts: 2,
      },
    }))
  );

  console.log(`[Queue] ${jobs.length} bulk template jobs submitted`);
  return jobs.map(j => j.id);
}

// ============================================================================
// Job Status
// ============================================================================

/**
 * Get job status
 */
export async function getJobStatus(queueName: string, jobId: string) {
  const queue = getQueueByName(queueName);
  const job = await queue.getJob(jobId);

  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    status: state,
    progress,
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
  };
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics(queueName: string) {
  const queue = getQueueByName(queueName);
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Get all queue metrics
 */
export async function getAllQueueMetrics() {
  const [scans, analysis, reports, templates] = await Promise.all([
    getQueueMetrics('wcag-scans'),
    getQueueMetrics('wcag-analysis'),
    getQueueMetrics('wcag-reports'),
    getQueueMetrics('template-generation'),
  ]);

  return { scans, analysis, reports, templates };
}

// ============================================================================
// Worker Management
// ============================================================================

/**
 * Create scan worker
 */
export function createScanWorker() {
  return new Worker(
    'wcag-scans',
    async (job: Job) => {
      console.log(`[Worker] Processing scan job ${job.id}`);
      
      // Import agent dynamically to avoid circular dependencies
      const { wcagAuditor } = await import('@/agents/wcag-auditor');
      
      await job.updateProgress(10);
      
      // Perform scan
      const result = await wcagAuditor.audit(job.data.url, {
        level: job.data.level || 'AA',
        runPa11y: job.data.runPa11y,
        screenshot: job.data.screenshot,
      });

      await job.updateProgress(80);

      // Submit analysis job
      await submitAnalysisJob({
        scanId: job.id as string,
        violations: result.violations,
        userId: job.data.userId,
      });

      await job.updateProgress(100);

      return result;
    },
    {
      connection,
      concurrency: 5,
    }
  );
}

/**
 * Create analysis worker
 */
export function createAnalysisWorker() {
  return new Worker(
    'wcag-analysis',
    async (job: Job) => {
      console.log(`[Worker] Processing analysis job ${job.id}`);
      
      const { contentAnalyzer } = await import('@/agents/content-analyzer');
      
      await job.updateProgress(10);

      // Perform analysis
      const result = await contentAnalyzer.analyzeScan({
        url: job.data.scanId, // Would get actual URL from DB
        violations: job.data.violations,
        level: 'AA',
      });

      await job.updateProgress(50);

      // Generate fix suggestions
      const fixes = await contentAnalyzer.generateFixSuggestions(
        job.data.violations.slice(0, 10) // Top 10 violations
      );

      await job.updateProgress(80);

      // Submit report job
      await submitReportJob({
        scanId: job.data.scanId,
        analysisId: job.id as string,
        userId: job.data.userId,
        format: 'html',
      });

      await job.updateProgress(100);

      return { ...result, fixes };
    },
    {
      connection,
      concurrency: 3,
    }
  );
}

/**
 * Create report worker
 */
export function createReportWorker() {
  return new Worker(
    'wcag-reports',
    async (job: Job) => {
      console.log(`[Worker] Processing report job ${job.id}`);
      
      const { reportSynthesizer } = await import('@/agents/report-synthesizer');
      
      await job.updateProgress(10);

      // Get scan and analysis data from previous jobs
      // In production, fetch from database
      const scanResult = {} as any;
      const analysisResult = {} as any;

      await job.updateProgress(30);

      // Generate report
      const report = await reportSynthesizer.synthesize({
        scanResult,
        analysis: analysisResult,
        userId: job.data.userId,
      });

      await job.updateProgress(70);

      // Generate requested format
      let output;
      switch (job.data.format) {
        case 'pdf':
          output = await reportSynthesizer.generatePDF(report);
          break;
        case 'html':
          output = await reportSynthesizer.generateHTML(report);
          break;
        case 'json':
          output = await reportSynthesizer.exportJSON(report);
          break;
      }

      await job.updateProgress(100);

      return { report, output };
    },
    {
      connection,
      concurrency: 2,
    }
  );
}

/**
 * Create template worker
 */
export function createTemplateWorker() {
  return new Worker(
    'template-generation',
    async (job: Job) => {
      console.log(`[Worker] Processing template job ${job.id}`);
      
      const { templateGenerator } = await import('@/agents/template-generator');
      
      await job.updateProgress(30);

      // Generate document
      const document = await templateGenerator.generateDocument(
        job.data.templateId,
        job.data.variables
      );

      await job.updateProgress(100);

      return document;
    },
    {
      connection,
      concurrency: 10, // Templates are fast, allow high concurrency
    }
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function getQueueByName(name: string): Queue {
  switch (name) {
    case 'wcag-scans':
      return scanQueue;
    case 'wcag-analysis':
      return analysisQueue;
    case 'wcag-reports':
      return reportQueue;
    case 'template-generation':
      return templateQueue;
    default:
      throw new Error(`Unknown queue: ${name}`);
  }
}

/**
 * Clean up old jobs
 */
export async function cleanupOldJobs() {
  await Promise.all([
    scanQueue.clean(24 * 3600 * 1000, 100, 'completed'),
    analysisQueue.clean(24 * 3600 * 1000, 100, 'completed'),
    reportQueue.clean(7 * 24 * 3600 * 1000, 100, 'completed'),
    templateQueue.clean(24 * 3600 * 1000, 100, 'completed'),
  ]);

  console.log('[Queue] Old jobs cleaned up');
}

/**
 * Graceful shutdown
 */
export async function shutdown() {
  console.log('[Queue] Shutting down queues...');
  
  await Promise.all([
    scanQueue.close(),
    analysisQueue.close(),
    reportQueue.close(),
    templateQueue.close(),
    connection.quit(),
  ]);

  console.log('[Queue] Queues closed');
}
