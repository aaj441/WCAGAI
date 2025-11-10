/**
 * Type definitions for WCAG AI Platform v5
 * 
 * Core types used across all agents and services
 */

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentState {
  url?: string;
  scanId?: string;
  userId?: string;
  violations?: Violation[];
  analysis?: AnalysisResult;
  template?: any;
  report?: any;
  error?: string;
  timestamp?: Date;
}

export interface WorkflowResult {
  success: boolean;
  scanId?: string;
  violations?: Violation[];
  analysis?: AnalysisResult;
  template?: any;
  report?: ComplianceReport;
  error?: string;
}

// ============================================================================
// WCAG Scanning Types
// ============================================================================

export interface ScanResult {
  url: string;
  level: 'A' | 'AA' | 'AAA';
  startTime: Date;
  duration: number;
  violations: Violation[];
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  complianceScore: number;
  screenshotUrl?: string | null;
}

export interface Violation {
  id: string;
  source: 'axe-core' | 'pa11y';
  criteriaId: string;
  criteriaName: string;
  level: 'A' | 'AA' | 'AAA';
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  message: string;
  selector: string;
  html: string;
  helpUrl?: string;
}

export interface WCAGCriteria {
  id: string;
  name: string;
  level: 'A' | 'AA' | 'AAA';
  principle: 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';
  guideline: string;
  description: string;
  successCriteria?: string;
  techniques?: string[];
  failures?: string[];
}

// ============================================================================
// Analysis Types
// ============================================================================

export interface AnalysisResult {
  url: string;
  timestamp: Date;
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  priorityIssues?: string[];
  recommendations?: string[];
  estimatedHours?: number;
  businessImpact?: string;
  violationsByCategory?: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

export interface FixSuggestion {
  violationId: string;
  criteriaId: string;
  fixDescription: string;
  codeSnippet: string;
  implementationSteps: string[];
  testingInstructions?: string[];
  alternatives?: string[];
  estimatedTime: number;
}

// ============================================================================
// Template Types
// ============================================================================

export interface Template {
  id: string;
  name: string;
  category: string;
  fdcpaSection?: string;
  content: string;
  variables: Record<string, VariableDefinition>;
  complianceRules: string[];
  createdAt: Date;
  version: string;
}

export interface VariableDefinition {
  type: 'string' | 'number' | 'currency' | 'date' | 'email' | 'phone' | 'address' | 'text';
  required: boolean;
  validation?: RegExp;
  min?: number;
  max?: number;
  mask?: boolean;
}

export interface TemplateVariables {
  [key: string]: any;
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateName: string;
  content: string;
  variables: TemplateVariables;
  generatedAt: Date;
  validated: boolean;
  complianceChecks: FDCPAValidation;
}

export interface FDCPAValidation {
  isCompliant: boolean;
  violations: string[];
  checkedRules: string[];
  timestamp: Date;
}

// ============================================================================
// Report Types
// ============================================================================

export interface ComplianceReport {
  id: string;
  scanId: string;
  userId: string;
  organizationId?: string;
  title: string;
  url: string;
  generatedAt: Date;
  sections: ReportSection[];
  metrics: {
    totalViolations: number;
    byImpact: Record<string, number>;
    complianceScore: number;
    estimatedEffort: number;
    riskLevel: string;
  };
  complianceScore: number;
  level: 'A' | 'AA' | 'AAA';
  status: 'draft' | 'completed' | 'archived';
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'structured' | 'matrix';
  order: number;
  data?: any;
}

// ============================================================================
// Job Queue Types
// ============================================================================

export interface QueueJob {
  id: string;
  name: string;
  data: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
}

// ============================================================================
// Authentication & Authorization Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'AUDITOR' | 'ENTERPRISE';
  organizationId?: string;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  expires: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'FREE' | 'DEVELOPER' | 'COMPLIANCE' | 'ENTERPRISE';
  apiKey?: string;
  rateLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ScanRequest {
  url: string;
  level?: 'A' | 'AA' | 'AAA';
  runPa11y?: boolean;
  screenshot?: boolean;
}

export interface ScanResponse {
  scanId: string;
  status: 'pending' | 'scanning' | 'analyzing' | 'completed' | 'failed';
  url: string;
  startedAt: Date;
  estimatedCompletion?: Date;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ============================================================================
// Error Types
// ============================================================================

export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class ValidationError extends AgentError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AgentError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AgentError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHZ_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends AgentError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface Config {
  database: {
    url: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  ai: {
    openai: {
      apiKey: string;
      model: string;
    };
    anthropic: {
      apiKey: string;
      model: string;
    };
  };
  security: {
    jwtSecret: string;
    sessionSecret: string;
    encryption: {
      algorithm: string;
      key: string;
    };
  };
  monitoring: {
    sentry?: {
      dsn: string;
    };
    datadog?: {
      apiKey: string;
    };
  };
}
