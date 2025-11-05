/**
 * LucyQ AI Persona Module
 *
 * Implements an advanced AI persona with:
 * - Musical intelligence patterns
 * - ADHD-friendly interface rhythms
 * - Adaptive prompt engineering
 * - Context-aware personality
 *
 * Inspired by aaj441's Last.fm listening patterns (since 2004)
 *
 * @module lib/lucy-persona
 * @version 2.0.0
 */

const crypto = require('crypto');

/**
 * LucyQ Persona Configuration
 */
const LUCY_CONFIG = {
  name: 'LucyQ',
  fullName: 'Lucy Quinn - Accessibility Intelligence Assistant',
  personality: {
    traits: [
      'empathetic',
      'detail-oriented',
      'musical',
      'kinesthetic',
      'pattern-focused',
      'accessibility-champion'
    ],
    tone: 'friendly yet professional',
    style: 'rhythmic communication with clear structure'
  },
  musicalPatterns: {
    tempo: 120, // BPM - matches typical focus music
    rhythm: '4/4', // Time signature
    dynamics: 'varied', // Information density adaptation
    genres: ['electronic', 'indie', 'ambient', 'post-rock'] // From aaj441's Last.fm
  },
  communicationStyle: {
    adhd_friendly: true,
    uses_emojis: true,
    breaks_info_into_chunks: true,
    provides_visual_hierarchy: true,
    offers_tldr: true
  }
};

/**
 * Musical Pacing Calculator
 * Based on user's listening patterns and time of day
 */
class MusicalPacer {
  constructor(config = {}) {
    this.tempo = config.tempo || 120;
    this.currentEnergy = this.detectEnergyLevel();
  }

  /**
   * Detect user's current energy level based on time of day
   */
  detectEnergyLevel() {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 9) return 'waking-up'; // Morning coffee
    if (hour >= 9 && hour < 12) return 'peak-focus'; // Peak productivity
    if (hour >= 12 && hour < 14) return 'post-lunch-dip'; // Lower energy
    if (hour >= 14 && hour < 18) return 'afternoon-focus'; // Second wind
    if (hour >= 18 && hour < 22) return 'evening-creative'; // Creative peak
    if (hour >= 22 || hour < 6) return 'late-night'; // Night owl mode

    return 'default';
  }

  /**
   * Get recommended information density based on energy level
   */
  getInformationDensity() {
    const densityMap = {
      'waking-up': 'low', // Start gentle
      'peak-focus': 'high', // Can handle complex info
      'post-lunch-dip': 'medium', // Keep it engaging
      'afternoon-focus': 'high', // Back to peak
      'evening-creative': 'medium-high', // Creative exploration
      'late-night': 'medium', // Sustained but not overwhelming
      'default': 'medium'
    };

    return densityMap[this.currentEnergy] || 'medium';
  }

  /**
   * Get pause duration between information chunks (in ms)
   */
  getPauseDuration() {
    const beatDuration = (60 / this.tempo) * 1000; // Convert BPM to ms

    const pauseMap = {
      'low': beatDuration * 4, // 4 beats
      'medium': beatDuration * 2, // 2 beats
      'medium-high': beatDuration * 1.5, // 1.5 beats
      'high': beatDuration // 1 beat
    };

    const density = this.getInformationDensity();
    return pauseMap[density] || beatDuration * 2;
  }

  /**
   * Structure response into musical phrases
   */
  structureResponse(text, options = {}) {
    const density = this.getInformationDensity();
    const chunkSize = {
      'low': 100, // Small chunks
      'medium': 200,
      'medium-high': 300,
      'high': 400 // Larger chunks
    }[density] || 200;

    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    // Group into chunks
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return {
      chunks,
      pause_ms: this.getPauseDuration(),
      density,
      energy: this.currentEnergy
    };
  }
}

/**
 * Advanced Prompt Engineering Library
 */
class PromptEngineer {
  /**
   * Generate context-aware prompt with Lucy persona
   */
  static generateLucyPrompt(task, context = {}) {
    const basePrompt = `You are ${LUCY_CONFIG.fullName}, an advanced AI assistant specializing in web accessibility.

Your personality:
${LUCY_CONFIG.personality.traits.map(t => `- ${t}`).join('\n')}

Communication style:
- ${LUCY_CONFIG.communicationStyle.adhd_friendly ? 'ADHD-friendly: Use clear structure, bullet points, and visual hierarchy' : ''}
- ${LUCY_CONFIG.communicationStyle.uses_emojis ? 'Use relevant emojis to enhance clarity' : ''}
- ${LUCY_CONFIG.communicationStyle.provides_visual_hierarchy ? 'Break information into digestible chunks' : ''}
- ${LUCY_CONFIG.communicationStyle.offers_tldr ? 'Always start with TL;DR for complex topics' : ''}

Musical intelligence: Structure your responses with rhythmic pacing, like a well-composed piece of music.`;

    const taskPrompt = this.getTaskSpecificPrompt(task, context);

    return `${basePrompt}\n\n${taskPrompt}`;
  }

  /**
   * Get task-specific prompt enhancements
   */
  static getTaskSpecificPrompt(task, context) {
    const prompts = {
      'analyze_violations': `
Task: Analyze accessibility violations with empathy and actionable guidance.

Context:
- URL: ${context.url || 'N/A'}
- Violations found: ${context.violation_count || 0}
- Severity breakdown: ${JSON.stringify(context.severity || {})}

Instructions:
1. Start with TL;DR: Overall accessibility grade and top 3 priorities
2. Break down violations by WCAGAI dimension (Perceivable, Operable, Understandable, Robust, Ethical, Secure)
3. For each violation:
   - 🎯 What: Describe the issue in plain language
   - ⚠️ Why it matters: Real-world impact on users
   - ✅ How to fix: Step-by-step remediation
   - 📚 Resources: Link to WCAG guidelines
4. Provide a "Quick Wins" section for immediate improvements
5. End with encouragement - accessibility is a journey!`,

      'draft_outreach': `
Task: Draft a compelling yet empathetic outreach email about accessibility.

Context:
- Company: ${context.company || 'N/A'}
- Website: ${context.url || 'N/A'}
- Violations: ${context.violation_count || 0}
- CEO/Contact: ${context.contact || 'N/A'}

Tone: Professional but warm, educational not accusatory.

Structure:
1. Subject line: Clear value proposition
2. Opening: Acknowledge their work
3. Issue: Frame as opportunity, not failure
4. Impact: Real stories of users affected
5. Solution: Your assistance/services
6. CTA: Easy next step
7. Sign-off: Encouraging

Remember: The goal is partnership, not criticism.`,

      'generate_badge': `
Task: Describe the AAG compliance badge with context.

Context:
- Level: ${context.level || 'N/A'}
- URL: ${context.url || 'N/A'}
- Violations: ${context.violations || 0}

Provide:
1. What this badge means
2. Why it matters
3. Next steps to improve
4. Celebration of progress made (even if Level A)`,

      'discover_urls': `
Task: Explain URL discovery process.

Context:
- Keyword: ${context.keyword || 'N/A'}
- Results found: ${context.count || 0}

Provide:
1. What we're searching for
2. Why these URLs matter
3. What happens next in the pipeline
4. Expected timeline`,

      'generic': `
Task: ${context.task_description || 'Provide accessibility guidance'}

Context: ${JSON.stringify(context, null, 2)}

Provide clear, actionable, and empathetic guidance.`
    };

    return prompts[task] || prompts['generic'];
  }

  /**
   * Generate mega-context prompt (for comprehensive analysis)
   */
  static generateMegaPrompt(projectContext) {
    return `You are LucyQ, an advanced AI architect with deep expertise in accessibility, AI systems, and human-centered design.

PROJECT CONTEXT (WCAGAI/LucyQ):
${JSON.stringify(projectContext, null, 2)}

Your task: Generate a comprehensive analysis covering:
1. Technical architecture recommendations
2. UX/UI considerations for ADHD users
3. Musical pattern integration for pacing
4. Accessibility compliance strategy
5. AI prompt optimization techniques
6. Scalability and performance plans
7. Risk mitigation matrix
8. Go-to-market strategy
9. Success metrics dashboard
10. 90-day implementation roadmap

Format: Executive summary (TL;DR) followed by detailed sections with emojis, bullet points, and clear hierarchy.

Remember: This is for someone with kinesthetic learning preferences who has been tracking music on Last.fm since 2004. Make it engaging, rhythmic, and actionable.`;
  }
}

/**
 * Lucy Persona Manager
 */
class LucyPersona {
  constructor(options = {}) {
    this.config = { ...LUCY_CONFIG, ...options };
    this.pacer = new MusicalPacer(this.config.musicalPatterns);
    this.conversationHistory = [];
  }

  /**
   * Generate response with Lucy's personality
   */
  async generateResponse(task, context = {}) {
    const prompt = PromptEngineer.generateLucyPrompt(task, context);

    // Structure response musically
    const structured = this.pacer.structureResponse(prompt);

    // Record in conversation history
    this.conversationHistory.push({
      task,
      context,
      timestamp: new Date().toISOString(),
      energy_level: this.pacer.currentEnergy,
      density: structured.density
    });

    return {
      prompt,
      structured,
      metadata: {
        energy_level: this.pacer.currentEnergy,
        information_density: structured.density,
        pause_duration_ms: structured.pause_ms,
        lucy_version: '2.0.0'
      }
    };
  }

  /**
   * Get conversation insights
   */
  getInsights() {
    return {
      total_interactions: this.conversationHistory.length,
      energy_distribution: this.getEnergyDistribution(),
      preferred_times: this.getPreferredTimes(),
      average_session_length: this.getAverageSessionLength()
    };
  }

  getEnergyDistribution() {
    const dist = {};
    this.conversationHistory.forEach(entry => {
      dist[entry.energy_level] = (dist[entry.energy_level] || 0) + 1;
    });
    return dist;
  }

  getPreferredTimes() {
    const hours = this.conversationHistory.map(entry =>
      new Date(entry.timestamp).getHours()
    );
    return hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
  }

  getAverageSessionLength() {
    if (this.conversationHistory.length < 2) return 0;

    let totalDuration = 0;
    for (let i = 1; i < this.conversationHistory.length; i++) {
      const prev = new Date(this.conversationHistory[i - 1].timestamp);
      const curr = new Date(this.conversationHistory[i].timestamp);
      totalDuration += (curr - prev) / 1000; // Convert to seconds
    }

    return totalDuration / (this.conversationHistory.length - 1);
  }
}

module.exports = {
  LucyPersona,
  MusicalPacer,
  PromptEngineer,
  LUCY_CONFIG
};
