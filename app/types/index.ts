export interface Violation {
  id: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  html?: string;
  fixes?: string[];
  nodes?: {
    html: string;
    target: string[];
  }[];
}

export interface ScanResult {
  id: string;
  url: string;
  violations: Violation[];
  keywords?: string[];
  timestamp: string;
  status: 'completed' | 'failed' | 'in-progress';
}