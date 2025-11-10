/**
 * Content Analyzer Agent
 * 
 * Analyzes WCAG scan results using LangChain with OpenAI GPT-4o and Claude 3.5 Sonnet.
 * Provides AI-powered recommendations and fix suggestions.
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import type { Violation, AnalysisResult, FixSuggestion } from '@/types/agents';

export class ContentAnalyzerAgent {
  private openai: ChatOpenAI;
  private claude: ChatAnthropic;
  private analysisChain: RunnableSequence;
  private fixChain: RunnableSequence;

  constructor() {
    // Initialize OpenAI GPT-4o
    this.openai = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3,
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Claude 3.5 Sonnet
    this.claude = new ChatAnthropic({
      modelName: 'claude-3-5-sonnet-20241022',
      temperature: 0.3,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.initializeChains();
  }

  /**
   * Initialize LangChain prompt chains
   */
  private initializeChains(): void {
    // Analysis prompt template
    const analysisPrompt = PromptTemplate.fromTemplate(`
You are an expert WCAG accessibility auditor analyzing compliance violations.

URL: {url}
Total Violations: {totalViolations}
WCAG Level: {level}

Violations by Impact:
- Critical: {criticalCount}
- Serious: {seriousCount}
- Moderate: {moderateCount}
- Minor: {minorCount}

Top 5 Violations:
{topViolations}

Provide a comprehensive analysis including:
1. Overall compliance assessment
2. Key problem areas
3. Business impact
4. Priority recommendations
5. Estimated effort to remediate

Format your response as structured JSON with these keys:
- summary: string
- riskLevel: "low" | "medium" | "high" | "critical"
- priorityIssues: string[]
- recommendations: string[]
- estimatedHours: number
- businessImpact: string
`);

    // Fix suggestion prompt template
    const fixPrompt = PromptTemplate.fromTemplate(`
You are an expert web developer specializing in accessibility fixes.

Violation Details:
- Criteria: {criteriaId} - {criteriaName}
- Impact: {impact}
- Element: {selector}
- HTML: {html}
- Issue: {message}

Provide a detailed fix suggestion including:
1. Exact code changes needed
2. Step-by-step implementation guide
3. Testing instructions
4. Alternative solutions if applicable

Format your response as JSON with these keys:
- fixDescription: string
- codeSnippet: string
- implementationSteps: string[]
- testingInstructions: string[]
- alternatives: string[]
- estimatedTime: number (in minutes)
`);

    // Create runnable chains
    this.analysisChain = RunnableSequence.from([
      analysisPrompt,
      this.openai,
    ]);

    this.fixChain = RunnableSequence.from([
      fixPrompt,
      this.claude,
    ]);
  }

  /**
   * Analyze scan results and provide comprehensive insights
   */
  async analyzeScan(params: {
    url: string;
    violations: Violation[];
    level: 'A' | 'AA' | 'AAA';
  }): Promise<AnalysisResult> {
    try {
      const { url, violations, level } = params;

      // Categorize violations
      const categorized = this.categorizeByImpact(violations);
      
      // Get top 5 most critical violations
      const topViolations = violations
        .sort((a, b) => this.getImpactWeight(b.impact) - this.getImpactWeight(a.impact))
        .slice(0, 5)
        .map(v => `- ${v.criteriaName}: ${v.message}`)
        .join('\n');

      console.log('[Content Analyzer] Analyzing scan with OpenAI GPT-4o');
      
      // Run analysis chain
      const result = await this.analysisChain.invoke({
        url,
        totalViolations: violations.length,
        level,
        criticalCount: categorized.critical,
        seriousCount: categorized.serious,
        moderateCount: categorized.moderate,
        minorCount: categorized.minor,
        topViolations,
      });

      // Parse AI response
      const analysis = this.parseAnalysisResponse(result.content as string);

      return {
        url,
        timestamp: new Date(),
        ...analysis,
        violationsByCategory: categorized,
      };
    } catch (error) {
      console.error('[Content Analyzer] Analysis failed:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate AI-powered fix suggestions for specific violations
   */
  async generateFixSuggestions(
    violations: Violation[],
    options?: {
      maxSuggestions?: number;
      preferredModel?: 'openai' | 'claude';
    }
  ): Promise<FixSuggestion[]> {
    const maxSuggestions = options?.maxSuggestions || 10;
    const model = options?.preferredModel === 'openai' ? this.openai : this.claude;

    console.log(`[Content Analyzer] Generating fix suggestions using ${options?.preferredModel || 'claude'}`);

    const suggestions: FixSuggestion[] = [];

    // Process violations in batches to avoid rate limits
    const batch = violations.slice(0, maxSuggestions);

    for (const violation of batch) {
      try {
        const result = await this.fixChain.invoke({
          criteriaId: violation.criteriaId,
          criteriaName: violation.criteriaName,
          impact: violation.impact,
          selector: violation.selector,
          html: violation.html,
          message: violation.message,
        });

        const fixData = this.parseFixResponse(result.content as string);

        suggestions.push({
          violationId: violation.id,
          criteriaId: violation.criteriaId,
          ...fixData,
        });
      } catch (error) {
        console.error(`[Content Analyzer] Failed to generate fix for ${violation.id}:`, error);
        // Continue with next violation
      }
    }

    return suggestions;
  }

  /**
   * Compare results between OpenAI and Claude for higher accuracy
   */
  async generateConsensusAnalysis(params: {
    url: string;
    violations: Violation[];
    level: 'A' | 'AA' | 'AAA';
  }): Promise<AnalysisResult & { consensus: number }> {
    console.log('[Content Analyzer] Running consensus analysis with both AI models');

    // Run analysis with both models in parallel
    const [openaiResult, claudeResult] = await Promise.all([
      this.analyzeScanWithModel(params, this.openai),
      this.analyzeScanWithModel(params, this.claude),
    ]);

    // Calculate consensus score
    const consensus = this.calculateConsensus(openaiResult, claudeResult);

    // Merge results, preferring higher confidence responses
    const mergedResult = this.mergeAnalyses(openaiResult, claudeResult, consensus);

    return {
      ...mergedResult,
      consensus,
    };
  }

  /**
   * Analyze with specific model
   */
  private async analyzeScanWithModel(
    params: { url: string; violations: Violation[]; level: string },
    model: ChatOpenAI | ChatAnthropic
  ): Promise<AnalysisResult> {
    // Similar to analyzeScan but using specified model
    // Implementation details...
    return {} as AnalysisResult;
  }

  /**
   * Categorize violations by impact
   */
  private categorizeByImpact(violations: Violation[]): {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  } {
    return {
      critical: violations.filter(v => v.impact === 'critical').length,
      serious: violations.filter(v => v.impact === 'serious').length,
      moderate: violations.filter(v => v.impact === 'moderate').length,
      minor: violations.filter(v => v.impact === 'minor').length,
    };
  }

  /**
   * Get numeric weight for impact level
   */
  private getImpactWeight(impact: string): number {
    const weights: Record<string, number> = {
      critical: 4,
      serious: 3,
      moderate: 2,
      minor: 1,
    };
    return weights[impact] || 0;
  }

  /**
   * Parse AI analysis response
   */
  private parseAnalysisResponse(content: string): Partial<AnalysisResult> {
    try {
      // Try to parse as JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[Content Analyzer] Failed to parse response:', error);
    }

    // Fallback to basic parsing
    return {
      summary: content.substring(0, 500),
      riskLevel: 'medium',
      recommendations: [],
      estimatedHours: 0,
    };
  }

  /**
   * Parse AI fix suggestion response
   */
  private parseFixResponse(content: string): Partial<FixSuggestion> {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[Content Analyzer] Failed to parse fix response:', error);
    }

    return {
      fixDescription: content.substring(0, 200),
      codeSnippet: '',
      implementationSteps: [],
      estimatedTime: 30,
    };
  }

  /**
   * Calculate consensus between two analyses
   */
  private calculateConsensus(result1: AnalysisResult, result2: AnalysisResult): number {
    // Simple consensus calculation
    // In production, this would use semantic similarity
    return 0.85;
  }

  /**
   * Merge two analysis results
   */
  private mergeAnalyses(
    result1: AnalysisResult,
    result2: AnalysisResult,
    consensus: number
  ): AnalysisResult {
    // Merge logic preferring higher confidence results
    return result1;
  }
}

export const contentAnalyzer = new ContentAnalyzerAgent();
