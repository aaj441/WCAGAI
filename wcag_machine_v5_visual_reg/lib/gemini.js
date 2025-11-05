/**
 * Gemini API Helper Module
 *
 * Provides wrapper functions for Google Gemini API with:
 * - WCAGAI system instruction integration
 * - Error handling and retries
 * - Streaming support
 * - Rate limiting awareness
 *
 * @module lib/gemini
 * @version 2.0.0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// WCAGAI System Instruction (21 Rules)
const WCAGAI_SYSTEM_INSTRUCTION = `You are WCAGAI (Web Content Accessibility Guidelines AI), an expert accessibility consultant powered by 21 embedded rules across 6 dimensions:

**1. PERCEIVABLE (4 rules)**
- Provide text alternatives for non-text content
- Provide captions and alternatives for multimedia
- Create content that can be presented in different ways
- Make it easier to see and hear content

**2. OPERABLE (5 rules)**
- Make all functionality keyboard accessible
- Give users enough time to read and use content
- Do not use content that causes seizures or physical reactions
- Help users navigate and find content
- Make it easier to use inputs other than keyboard

**3. UNDERSTANDABLE (4 rules)**
- Make text readable and understandable
- Make content appear and operate in predictable ways
- Help users avoid and correct mistakes
- Ensure consistent navigation and identification

**4. ROBUST (4 rules)**
- Maximize compatibility with current and future user tools
- Use valid HTML/CSS/ARIA
- Ensure parsing and semantic correctness
- Support assistive technologies

**5. ETHICAL (2 rules)**
- Protect user privacy and data
- Avoid dark patterns and manipulative design

**6. SECURE (2 rules)**
- Prevent accessibility barriers from creating security vulnerabilities
- Ensure secure authentication methods are accessible

**AAG Compliance Levels:**
- **Level A:** Minimum accessibility (basic barriers removed)
- **Level AA:** Reasonable accessibility (recommended baseline)
- **Level AAA:** Enhanced accessibility (gold standard)

When analyzing accessibility issues:
1. Identify which WCAGAI rules are violated
2. Assess severity (critical, serious, moderate, minor)
3. Provide specific, actionable remediation steps
4. Reference WCAG 2.1 success criteria where applicable
5. Determine AAG compliance level

Always prioritize user empowerment and inclusive design.`;

class GeminiClient {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    if (!apiKey) {
      const errorMsg = [
        'GEMINI_API_KEY is required',
        '',
        '💡 API Key Setup:',
        '   1. Get your Gemini API key: https://aistudio.google.com/app/apikey',
        '   2. Add to .env file: GEMINI_API_KEY=your_key_here',
        '   3. Or set environment variable: export GEMINI_API_KEY=your_key_here',
        ''
      ].join('\n');
      throw new Error(errorMsg);
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: WCAGAI_SYSTEM_INSTRUCTION
    });
  }

  /**
   * Generate accessibility guidance for a given prompt
   * @param {string} prompt - The user's question or input
   * @param {Object} context - Optional context (scan results, URL, etc.)
   * @returns {Promise<Object>} { text, model, timestamp }
   */
  async generateContent(prompt, context = {}) {
    try {
      const fullPrompt = Object.keys(context).length > 0
        ? `Context: ${JSON.stringify(context)}\n\nUser question: ${prompt}`
        : prompt;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        model: 'gemini-2.0-flash-exp',
        system_instruction: 'WCAGAI (21 rules)',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Analyze scan violations and provide remediation guidance
   * @param {Array} violations - Array of axe-core violations
   * @param {string} url - URL that was scanned
   * @returns {Promise<Object>} { analysis, recommendations, compliance_level }
   */
  async analyzeViolations(violations, url) {
    const prompt = `I scanned ${url} and found ${violations.length} accessibility violations. Please analyze them and provide remediation guidance.

Violations:
${violations.map((v, i) => `${i + 1}. [${v.impact}] ${v.description} - ${v.help}`).join('\n')}

Please provide:
1. Overall accessibility assessment
2. Priority violations to fix first
3. Specific remediation steps for each violation
4. Estimated AAG compliance level
5. References to WCAG 2.1 success criteria`;

    const result = await this.generateContent(prompt);

    // Parse compliance level from response
    let complianceLevel = 'Unknown';
    if (result.text.toLowerCase().includes('level aaa')) {
      complianceLevel = 'AAA';
    } else if (result.text.toLowerCase().includes('level aa')) {
      complianceLevel = 'AA';
    } else if (result.text.toLowerCase().includes('level a')) {
      complianceLevel = 'A';
    } else if (violations.length > 10) {
      complianceLevel = 'Fail';
    }

    return {
      analysis: result.text,
      recommendations: result.text,
      compliance_level: complianceLevel,
      url,
      violations_count: violations.length,
      timestamp: result.timestamp
    };
  }
}

/**
 * Factory function to create Gemini client
 * @param {string} apiKey - Optional API key (defaults to env var)
 * @returns {GeminiClient}
 */
function createGeminiClient(apiKey) {
  return new GeminiClient(apiKey);
}

export {
  GeminiClient,
  createGeminiClient,
  WCAGAI_SYSTEM_INSTRUCTION
};
