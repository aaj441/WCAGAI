/**
 * Audit Logging Service
 * 
 * SOC 2 compliant audit trail for all system actions
 */

import prisma from './db';
import { features } from './config';
import type { AuditLog } from '@/types/agents';

export interface AuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  // Skip if SOC 2 audit logging is disabled
  if (!features.soc2AuditLog) {
    return;
  }

  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    // Log error but don't fail the operation
    console.error('[Audit Log] Failed to create audit log:', error);
  }
}

/**
 * Audit log for authentication events
 */
export async function auditAuth(
  action: 'login' | 'logout' | 'login_failed' | 'mfa_enabled' | 'mfa_disabled',
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: `auth.${action}`,
    resource: 'authentication',
    details: metadata,
  });
}

/**
 * Audit log for WCAG scan events
 */
export async function auditScan(
  action: 'scan_started' | 'scan_completed' | 'scan_failed',
  scanId: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: `scan.${action}`,
    resource: 'scan',
    resourceId: scanId,
    details: metadata,
  });
}

/**
 * Audit log for report access
 */
export async function auditReport(
  action: 'report_generated' | 'report_viewed' | 'report_downloaded' | 'report_shared',
  reportId: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: `report.${action}`,
    resource: 'report',
    resourceId: reportId,
    details: metadata,
  });
}

/**
 * Audit log for template operations
 */
export async function auditTemplate(
  action: 'template_created' | 'template_updated' | 'template_deleted' | 'document_generated',
  templateId: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: `template.${action}`,
    resource: 'template',
    resourceId: templateId,
    details: metadata,
  });
}

/**
 * Audit log for data access
 */
export async function auditDataAccess(
  action: 'read' | 'write' | 'delete',
  resource: string,
  resourceId: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: `data.${action}`,
    resource,
    resourceId,
    details: metadata,
  });
}

/**
 * Audit log for security events
 */
export async function auditSecurity(
  action: 'api_key_created' | 'api_key_revoked' | 'permission_changed' | 'encryption_key_rotated',
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: `security.${action}`,
    resource: 'security',
    details: metadata,
  });
}

/**
 * Audit log for compliance events
 */
export async function auditCompliance(
  action: 'fdcpa_validation' | 'wcag_audit' | 'compliance_report',
  resourceId: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action: `compliance.${action}`,
    resource: 'compliance',
    resourceId,
    details: metadata,
  });
}

/**
 * Query audit logs with filters
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> {
  const where: any = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.action) {
    where.action = { contains: filters.action };
  }

  if (filters.resource) {
    where.resource = filters.resource;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filters.limit || 100,
    skip: filters.offset || 0,
  });

  return logs as AuditLog[];
}

/**
 * Export audit logs for compliance reporting
 */
export async function exportAuditLogs(
  startDate: Date,
  endDate: Date
): Promise<string> {
  const logs = await queryAuditLogs({
    startDate,
    endDate,
    limit: 10000,
  });

  // Convert to CSV format for compliance reports
  const headers = [
    'Timestamp',
    'User ID',
    'Action',
    'Resource',
    'Resource ID',
    'IP Address',
    'Details',
  ];

  const rows = logs.map(log => [
    log.createdAt.toISOString(),
    log.userId || 'system',
    log.action,
    log.resource,
    log.resourceId || '',
    log.ipAddress || '',
    JSON.stringify(log.details),
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
}

/**
 * Get audit log statistics for dashboard
 */
export async function getAuditLogStats(
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number;
  eventsByAction: Record<string, number>;
  eventsByResource: Record<string, number>;
  eventsByUser: Record<string, number>;
}> {
  const logs = await queryAuditLogs({
    startDate,
    endDate,
    limit: 10000,
  });

  const stats = {
    totalEvents: logs.length,
    eventsByAction: {} as Record<string, number>,
    eventsByResource: {} as Record<string, number>,
    eventsByUser: {} as Record<string, number>,
  };

  for (const log of logs) {
    // Count by action
    stats.eventsByAction[log.action] =
      (stats.eventsByAction[log.action] || 0) + 1;

    // Count by resource
    stats.eventsByResource[log.resource] =
      (stats.eventsByResource[log.resource] || 0) + 1;

    // Count by user
    const userId = log.userId || 'system';
    stats.eventsByUser[userId] = (stats.eventsByUser[userId] || 0) + 1;
  }

  return stats;
}
