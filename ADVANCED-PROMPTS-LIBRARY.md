# WCAGAI/LucyQ - 50 Advanced Prompt Engineering Techniques

**Version:** 2.0.0
**Author:** Aaron J. (aaj441) + LucyQ AI
**Last Updated:** 2025-11-05

This library contains 50 advanced prompts specifically designed for WCAGAI accessibility analysis, pharmaceutical company outreach, and LucyQ AI persona interactions.

---

## 📚 Table of Contents

1. [System Architecture Prompts](#system-architecture-prompts) (1-10)
2. [Accessibility Analysis Prompts](#accessibility-analysis-prompts) (11-20)
3. [Outreach & Communication Prompts](#outreach-communication-prompts) (21-30)
4. [AI Enhancement Prompts](#ai-enhancement-prompts) (31-40)
5. [Musical Pattern Integration Prompts](#musical-pattern-integration-prompts) (41-45)
6. [Meta-Prompts & Framework Generators](#meta-prompts-framework-generators) (46-50)

---

## 🏗️ System Architecture Prompts (1-10)

### Prompt #1: WCAGAI Architecture Blueprint

```
Act as a senior system architect with 15+ years in accessibility tech. Design a scalable architecture for WCAGAI that handles:
- 10,000+ concurrent accessibility scans
- Real-time AI analysis with Gemini 2.0
- Multi-tenant isolation for pharmaceutical clients
- 99.9% uptime SLA
- Cost optimization for AI API calls

Provide:
1. System diagram (describe in detail)
2. Database schema for scan results
3. Caching strategy for AI responses
4. Queue management for background jobs
5. Monitoring and alerting setup
6. Disaster recovery plan
7. Estimated monthly costs at scale

Format: Executive summary + technical deep-dive
```

### Prompt #2: Pharmaceutical Company Scanner

```
Design a specialized module for scanning pharmaceutical company websites with focus on:
- FDA compliance integration
- HIPAA accessibility considerations
- Patient portal accessibility
- Drug information accessibility (PDFs, images)
- Multi-language support (Spanish, Chinese, etc.)

Generate:
1. Custom Axe-core rules for pharma sites
2. PDF accessibility extraction logic
3. Patient journey mapping for a11y
4. Compliance report template
5. Risk scoring specific to healthcare

Expected output: Production-ready code + documentation
```

### Prompt #3: AI Cost Optimization

```
Analyze WCAGAI's AI usage patterns and optimize costs:

Current usage:
- 100 sites scanned per day
- Average 47 violations per site
- Gemini API calls per scan: 3 (initial, analysis, recommendations)
- Average tokens per call: 2,000

Provide:
1. Cost breakdown (current)
2. Caching opportunities (semantic similarity)
3. Batch processing strategies
4. Response templates for common violations
5. Fallback to cheaper models for simple tasks
6. Projected savings (percentages)

Goal: Reduce costs by 60% without quality loss
```

### Prompt #4: Multi-Tenant Architecture

```
Implement secure multi-tenant isolation for WCAGAI where:
- Each pharmaceutical client has isolated data
- Shared infrastructure for cost efficiency
- Per-tenant rate limiting
- Custom branding per tenant
- Tenant-specific compliance rules

Design:
1. Database schema with tenant prefixes
2. Redis key namespacing
3. API authentication middleware
4. Billing/metering per tenant
5. Admin dashboard for tenant management

Security first approach - assume breach scenario
```

### Prompt #5: Real-Time Dashboard

```
Create a real-time accessibility dashboard for pharmaceutical companies showing:
- Live scan progress (WebSocket updates)
- Violation heatmap by page/section
- WCAG compliance trends over time
- Competitor comparison (anonymized)
- Remediation progress tracking

Tech stack: React + D3.js + WebSockets

Provide:
1. Component hierarchy
2. WebSocket event structure
3. Data visualization logic
4. Performance optimization (10k+ violations)
5. Mobile-responsive design

Include: Code snippets + Figma mockup description
```

### Prompt #6: AI Response Caching

```
Design an intelligent caching system for LucyQ AI responses:

Challenges:
- Responses vary slightly for same violations
- Need semantic similarity matching
- Balance between freshness and caching
- Multi-dimensional cache keys (URL, violation type, severity, user preferences)

Implement:
1. Semantic similarity algorithm (cosine similarity on embeddings)
2. Cache invalidation strategy
3. Cache warming for common patterns
4. Performance benchmarks (cache hit rate target: 70%)
5. Cost savings calculator

Use: Redis + vector embeddings
```

### Prompt #7: Automated Testing Framework

```
Generate comprehensive test suite for WCAGAI:

UNIT TESTS:
- Badge generation logic (all compliance levels)
- Security gates (prompt injection, XSS, URL validation)
- Gemini integration (mocked responses)

INTEGRATION TESTS:
- Full pipeline (keyword → scan → analyze → badge)
- Multi-agent orchestration
- Database persistence

E2E TESTS:
- Real website scanning (test fixtures)
- Railway deployment smoke tests
- Load testing (Artillery config)

Coverage goal: 85%+
Framework: Jest + Playwright
```

### Prompt #8: Error Handling & Resilience

```
Design a bulletproof error handling system for WCAGAI:

Scenarios:
- Gemini API rate limit exceeded
- SerpAPI returns no results
- Target website is down
- Redis connection lost
- Database timeout

For each scenario provide:
1. Detection mechanism
2. Graceful degradation strategy
3. User-facing error message (Lucy persona)
4. Retry logic with exponential backoff
5. Logging and alerting
6. Recovery procedure

Pattern: Circuit breaker + fallbacks
```

### Prompt #9: Performance Optimization

```
Optimize WCAGAI for speed:

Current performance:
- Single site scan: 8 seconds
- AI analysis: 3 seconds
- Badge generation: 200ms

Target:
- Single site scan: 3 seconds (60% improvement)
- AI analysis: 1 second (66% improvement)
- Badge generation: 50ms (75% improvement)

Strategies:
1. Parallel processing (scan multiple pages concurrently)
2. Optimize Axe-core rules (disable slow checks)
3. Batch Gemini API calls
4. In-memory badge caching
5. CDN for badge SVGs

Provide: Before/after benchmarks + implementation plan
```

### Prompt #10: Security Audit

```
Perform comprehensive security audit of WCAGAI:

Areas to review:
1. Input validation (all endpoints)
2. Authentication/authorization
3. Rate limiting effectiveness
4. SQL injection vectors
5. XSS vulnerabilities
6. CSRF protection
7. Secrets management
8. Third-party API security
9. Docker container security
10. Railway deployment security

For each finding:
- Severity (Critical, High, Medium, Low)
- Exploitation scenario
- Remediation steps
- Prevention measures

Format: Pentest report
```

---

## 🔍 Accessibility Analysis Prompts (11-20)

### Prompt #11: WCAG 2.1 AAA Analysis

```
Analyze [URL] for WCAG 2.1 Level AAA compliance:

Go beyond Level AA to examine:
- Enhanced contrast ratios (7:1 for normal text)
- Sign language videos for audio content
- Extended time limits
- Reading level (8th grade max)
- Consistent navigation across all pages

For each AAA criterion violated:
1. Impact on users with disabilities
2. Specific code changes needed
3. Resources/tools to help
4. Cost/time estimate
5. Priority ranking

Present findings in accessible HTML report
```

### Prompt #12: Mobile Accessibility Deep-Dive

```
Scan [pharmaceutical company website] for mobile accessibility:

Focus areas:
- Touch target sizes (44x44px minimum)
- Screen reader compatibility (iOS VoiceOver, Android TalkBack)
- Orientation flexibility
- Zoom without horizontal scroll
- Form input accessibility
- Modal dialogs on mobile
- Gesture alternatives

Test devices:
- iPhone (iOS 17+)
- Android (v13+)
- Screen sizes: 320px to 768px

Deliver: Mobile-specific violation report + remediation guide
```

### Prompt #13: PDF Accessibility Scanner

```
Extract and analyze PDF accessibility from [pharma website]:

Check:
- Tagged PDF structure
- Reading order
- Alt text for images
- Form field labels
- Table headers
- Language specification
- Bookmarks/outline
- Color contrast in PDFs
- Searchable text (not images of text)

Many pharma companies have inaccessible drug information PDFs - this is critical for patients.

Output: PDF accessibility scorecard + remediation guide
```

### Prompt #14: Cognitive Accessibility Analysis

```
Evaluate [website] for cognitive accessibility:

WCAG 2.2 Success Criteria:
- 2.2.6 Timeouts (sufficient)
- 2.4.11 Focus Appearance
- 2.5.7 Dragging Movements (alternatives)
- 2.5.8 Target Size (minimum)
- 3.2.6 Consistent Help
- 3.3.7 Redundant Entry (avoid)
- 3.3.8 Accessible Authentication

Additional considerations:
- Plain language usage
- Reading level (Flesch-Kincaid)
- Visual complexity
- Distractions (animations, ads)
- Clear calls-to-action

Persona: User with ADHD (like aaj441)
```

### Prompt #15: Screen Reader Testing Prompt

```
Generate screen reader test scenarios for [pharma website]:

Test with:
- JAWS (Windows)
- NVDA (Windows, free)
- VoiceOver (Mac/iOS)
- TalkBack (Android)

Key pages to test:
- Homepage
- Drug information pages
- Patient portals
- Contact forms
- Search functionality

For each page:
1. Navigation structure
2. Landmark regions
3. Heading hierarchy
4. Link context
5. Form labels
6. Error messages
7. Dynamic content announcements

Format: Test matrix with pass/fail + screen recordings (describe)
```

### Prompt #16: Color Contrast Analyzer

```
Analyze color contrast across [website]:

Check:
- Normal text (4.5:1)
- Large text (3:1)
- UI components (3:1)
- Focus indicators (3:1)
- Hover states

Tools:
- Compute exact contrast ratios
- Suggest accessible alternatives
- Generate color palette (WCAG-compliant)

Special focus: Pharmaceutical brand colors often fail contrast - provide alternatives that maintain brand identity while meeting standards.

Output: Color audit report + accessible palette
```

### Prompt #17: Keyboard Navigation Assessment

```
Test keyboard accessibility for [pharma website]:

Scenarios:
- Navigate entire site using only keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys)
- Identify keyboard traps
- Verify focus visibility
- Check skip links
- Test dropdown menus
- Verify modal dialogs
- Check form navigation

Document:
- Tab order (logical?)
- Focus indicators (visible?)
- Keyboard shortcuts (documented?)
- Trapped focus (any?)
- Skip navigation (present?)

Format: Video walkthrough script + findings report
```

### Prompt #18: Accessibility Regression Detection

```
Compare [website] scans over time to detect regressions:

Data:
- Scan 1 (baseline): [date] - X violations
- Scan 2 (current): [date] - Y violations

Analysis:
1. New violations introduced
2. Fixed violations
3. Worsening violations (severity increased)
4. Trend analysis (getting better or worse?)
5. Root cause of regressions (code changes? CMS updates?)

Alert if:
- Critical violations increase
- Total violations increase by >20%
- Previously fixed issues reappear

Output: Regression report + alert triggers
```

### Prompt #19: Accessibility Heuristic Evaluation

```
Perform expert heuristic evaluation of [pharma website]:

Beyond automated tools, manually evaluate:
1. Perceivability: Can all users perceive content?
2. Operability: Can all users operate interfaces?
3. Understandability: Is content understandable?
4. Robustness: Compatible with assistive tech?
5. Ethical: No dark patterns, respects privacy?
6. Secure: Accessible authentication?

For each heuristic:
- Score (1-5)
- Evidence
- Impact on specific user groups
- Recommendations

Expertise level: IAAP Certified Professional
```

### Prompt #20: Accessibility ROI Calculator

```
Calculate ROI of accessibility improvements for [pharma company]:

Inputs:
- Current violations: X
- Estimated remediation cost: $Y
- Website traffic: Z visitors/month
- Conversion rate: A%
- Average order value: $B

Calculate:
1. Potential market expansion (disabled users: 15% of population)
2. Legal risk mitigation (ADA lawsuits average $50k settlement)
3. SEO improvements (accessible sites rank better)
4. Brand reputation value
5. Customer lifetime value increase

Output: Business case presentation for CFO/CEO
```

---

## 💬 Outreach & Communication Prompts (21-30)

### Prompt #21: Pharmaceutical Outreach Email

```
Draft personalized outreach email to [Pharma Company CEO]:

Context:
- Company: [name]
- Website: [URL]
- Violations found: [count]
- Critical issues: [list]
- Compliance level: [A/AA/AAA/Fail]

Tone: Professional, empathetic, solution-oriented

Structure:
Subject: [Compelling, specific]
Opening: Acknowledge their mission/recent news
Problem: Frame as opportunity, not criticism
Impact: Real patient stories
Solution: Your services
Data: Concrete numbers from scan
CTA: 15-min discovery call
Sign-off: Encouraging

Length: 150-200 words (executives are busy)

Avoid: Shame, legal threats, jargon
```

### Prompt #22: Accessibility Champion Identification

```
Analyze [company website] and LinkedIn to identify:

1. Who cares about accessibility?
   - DEI officers
   - Product managers
   - UX designers
   - Legal/compliance team
   - Patient advocacy leads

2. Social media signals:
   - Posts about accessibility
   - Disability awareness
   - Inclusive design

3. Company initiatives:
   - Accessibility statements
   - DEI reports
   - Patient programs

Output: Contact list with:
- Name, title, LinkedIn
- Why they might care
- Personalization angle
- Best outreach channel
```

### Prompt #23: Accessibility Webinar Invitation

```
Create webinar invitation for pharmaceutical executives:

Title: "Accessible Drug Information: Compliance, Ethics, and Market Expansion"

Topics:
1. Why pharma accessibility matters (patient safety)
2. Current state of pharma web accessibility (data from WCAGAI scans)
3. Common violations in drug information
4. Case study: Company that improved and saw results
5. Regulatory landscape (FDA, ADA, Section 508)
6. Quick wins: 3 changes with big impact
7. Q&A

Format: 45-min webinar
Audience: C-level, product, legal, patient advocacy
Value prop: Avoid lawsuits + reach more patients

Provide: Email invite + landing page copy + slide outline
```

### Prompt #24: Social Media Campaign

```
Design 30-day social media campaign about pharma accessibility:

Platforms: LinkedIn (primary), Twitter (secondary)

Post types:
- Statistics (pharma accessibility crisis)
- Patient stories (real impact)
- Quick tips (actionable)
- Before/after (remediation examples)
- Thought leadership
- Industry news

Calendar:
- Mon: Statistic
- Wed: Patient story
- Fri: Quick tip

Include:
- Copy for each post
- Relevant hashtags (#A11Y #PharmaAccessibility)
- Visual descriptions
- CTA (varies by post)
- Engagement strategy

Goal: 1000 followers, 50 engaged pharma execs
```

### Prompt #25: Accessibility Statement Generator

```
Generate accessibility statement for [company]:

Elements:
1. Commitment to accessibility
2. Standards followed (WCAG 2.1 AA)
3. Current status (be honest)
4. Known issues and timelines
5. Alternative access methods
6. Feedback mechanism
7. Contact information
8. Third-party content disclaimer
9. Date of statement
10. Review schedule

Tone: Transparent, committed, helpful

Special for pharma: Address patient safety implications

Format: HTML with proper semantic structure (practice what we preach!)
```

### Prompt #26: Executive Summary for Board

```
Create board-level presentation on accessibility:

Audience: Board of Directors (non-technical)

Slides:
1. What is web accessibility? (1 slide, simple)
2. Why it matters (patient impact + legal risk)
3. Current state (scan results, visualized)
4. Competitive analysis (are we behind?)
5. Financial impact (ROI, risk mitigation)
6. Remediation plan (timeline, cost)
7. Long-term strategy (build accessibility into process)
8. Recommendation (approve budget)

Length: 10 slides max
Visuals: Heavy on charts, light on text
Tone: Urgent but optimistic

Include: Speaker notes for presenter
```

### Prompt #27: Patient Advisory Board Presentation

```
Present accessibility findings to Patient Advisory Board:

Audience: Patients with disabilities, caregivers, advocates

Focus:
- Real barriers they might face
- Patient safety implications
- Privacy considerations
- Demonstration of issues (screen reader, low vision, motor)
- How their feedback helps
- Timeline for improvements

Tone: Collaborative, grateful for input, transparent

Format: 30-min presentation + 30-min discussion

Include:
- Presentation script
- Demo scenarios
- Discussion questions
- Feedback form (accessible!)
```

### Prompt #28: Legal Risk Assessment Report

```
Create legal risk report for [pharma company]:

Analyze:
1. ADA Title III applicability
2. Section 508 (if government contracts)
3. State laws (California, New York especially)
4. Industry-specific regulations (FDA guidance)
5. Recent pharma accessibility lawsuits
6. Company's litigation history

Risk scoring:
- Website violations (critical = high risk)
- Industry targeting (pharma = high target)
- Company size (big = bigger target)
- Previous complaints
- Accessibility statement (or lack thereof)

Output:
- Risk score (1-10)
- Likelihood of lawsuit (%)
- Estimated cost of litigation
- Mitigation recommendations
- Insurance considerations

Format: Legal memo for general counsel
```

### Prompt #29: Accessibility Roadmap

```
Create 12-month accessibility roadmap for [company]:

Q1 (Months 1-3): Quick Wins
- Fix critical violations
- Add alt text to all images
- Improve keyboard navigation
- Deploy accessibility statement

Q2 (Months 4-6): Process Integration
- Train developers
- Implement accessibility testing in CI/CD
- Update design system
- Conduct user testing with disabled users

Q3 (Months 7-9): Deep Remediation
- Fix complex components
- Remediate PDFs
- Improve forms
- Enhance mobile experience

Q4 (Months 10-12): Certification & Maintenance
- WCAG 2.1 AA compliance achieved
- Third-party audit
- Ongoing monitoring
- Celebrate and communicate success

For each phase:
- Tasks (detailed)
- Owners
- Budget
- Success metrics
- Dependencies
```

### Prompt #30: Accessibility Champions Program

```
Design internal Accessibility Champions program:

Goal: Embed accessibility into company culture

Structure:
- 20-30 champions from across company
- Monthly 1-hour training
- Slack channel for Q&A
- Recognition/rewards

Training curriculum (12 months):
Month 1: Accessibility 101
Month 2: Screen readers
Month 3: Keyboard navigation
Month 4: Visual design
Month 5: Content writing
Month 6: Development
Month 7: Testing
Month 8: Legal compliance
Month 9: Advanced ARIA
Month 10: Mobile accessibility
Month 11: Accessible PDFs
Month 12: Certification prep

Include:
- Program charter
- Training materials outline
- Measurement framework
- Budget
```

---

## 🤖 AI Enhancement Prompts (31-40)

### Prompt #31: Self-Improving Prompt System

```
Design a system where WCAGAI prompts improve over time:

Mechanism:
1. Log every prompt and response
2. Track user feedback (helpful? actionable?)
3. A/B test prompt variations
4. Analyze which prompts lead to best outcomes
5. Use reinforcement learning to optimize

Metrics:
- Accuracy (did AI analysis match manual review?)
- Actionability (did client implement recommendations?)
- Time saved (vs manual analysis)
- Cost efficiency (tokens used)

Output: Self-improving prompt engine design + initial training data
```

### Prompt #32: Hallucination Detection

```
Implement hallucination detection for LucyQ AI:

Common AI hallucinations in accessibility:
- Making up WCAG success criteria
- Incorrect remediation steps
- False statistics about disability
- Non-existent tools or techniques

Detection strategies:
1. Fact-check against WCAG spec
2. Cross-reference with authoritative sources
3. Confidence scoring on responses
4. Human-in-the-loop for edge cases
5. Blacklist of known hallucination patterns

When detected:
- Flag response for review
- Offer alternative (more conservative) guidance
- Log for training improvement

Output: Hallucination detection module + test cases
```

### Prompt #33: Multi-Modal AI Analysis

```
Enhance WCAGAI with multi-modal AI:

Beyond text analysis:
- Image analysis (Gemini Vision for alt text quality)
- Video analysis (caption accuracy, sign language presence)
- Audio analysis (transcript quality)
- PDF analysis (extract and analyze structure)

For each modality:
1. Integration approach
2. Use cases
3. Cost implications
4. Accuracy benchmarks
5. Fallback strategies

Example: "Analyze this pharmaceutical website screenshot and identify accessibility issues visible to human eyes but missed by automated tools."

Output: Multi-modal integration plan + proof of concept
```

### Prompt #34: Context Window Optimization

```
Optimize context window usage for long documents:

Challenge: Pharmaceutical websites have long drug information pages (>10k words)

Strategies:
1. Intelligent chunking (semantic boundaries)
2. Progressive summarization
3. Attention focusing (prioritize violations)
4. Context compression
5. Retrieval-augmented generation (RAG)

For 50-page drug monograph:
- Extract key sections
- Summarize each section
- Pass only relevant context to AI
- Maintain coherence across chunks

Benchmark: Reduce tokens by 60% without losing quality

Output: Context optimization library + benchmarks
```

### Prompt #35: Bias Detection in AI Responses

```
Audit LucyQ AI for bias:

Types of bias to check:
- Disability bias (ableist language?)
- Technical bias (assumes user knowledge?)
- Cultural bias (US-centric?)
- Socioeconomic bias (assumes resources?)
- Language bias (English-only mindset?)

Testing methodology:
1. Generate 100 responses across diverse scenarios
2. Score each response for bias indicators
3. Compare against inclusive language guidelines
4. Identify patterns
5. Implement debiasing techniques

Special focus: Pharmaceutical context (patient dignity, medical model vs social model of disability)

Output: Bias audit report + debiased prompt templates
```

### Prompt #36: Explain-ability & Transparency

```
Make LucyQ AI decisions explainable:

For every AI recommendation:
1. Why did AI flag this as a violation?
2. Which WCAG criterion was violated?
3. What data did AI use to reach conclusion?
4. Confidence level (0-100%)
5. Alternative interpretations considered
6. Sources cited

Format: "Explainable AI" widget that shows reasoning tree

Example:
"I flagged this as a critical violation because:
- WCAG 2.1.1 (Keyboard) requires all functionality be keyboard accessible
- I detected an onClick event with no keyboard equivalent
- 87% confidence based on code analysis
- Impact: Motor disability users cannot access this feature
- Source: WCAG 2.1 Level A"

Output: Explainability framework + UI mockup
```

### Prompt #37: AI-Assisted Remediation

```
Build AI tool that suggests code fixes:

Input: Violation description + code snippet
Output: Fixed code + explanation

Examples:

Input: "Missing alt text on <img>"
Output:
```html
<!-- Before -->
<img src="drug-diagram.jpg">

<!-- After -->
<img src="drug-diagram.jpg" alt="Diagram showing how Drug X inhibits enzyme Y in cellular pathway">

<!-- Why: Describes the meaningful content of the image for screen reader users -->
```

Support:
- HTML fixes
- CSS fixes
- JavaScript fixes
- ARIA attribute additions
- React/Vue component updates

Include: "See fix" button in Lucy's analysis

Output: AI-assisted code remediation engine
```

### Prompt #38: Continuous Learning Pipeline

```
Design continuous learning system for LucyQ:

Data sources:
1. User feedback on AI responses
2. Manual accessibility audits (ground truth)
3. New WCAG updates
4. Industry best practices
5. Real-world user testing results

Learning cycle:
1. Collect data weekly
2. Identify patterns in errors
3. Generate improved prompts
4. A/B test new prompts
5. Roll out winners
6. Repeat

Metrics:
- Accuracy improvement over time
- User satisfaction scores
- Recommendation implementation rate
- Time saved per scan

Output: Continuous learning infrastructure + dashboards
```

### Prompt #39: Prompt Versioning System

```
Implement version control for prompts:

Like git for code, but for prompts:
- Track prompt changes over time
- A/B test versions
- Roll back if performance degrades
- Branch for experimental prompts
- Merge winning variations

Metadata for each prompt version:
- Date created
- Creator
- Performance metrics
- User feedback
- Test results
- Deployment status

Interface: Prompt management dashboard

Output: Prompt versioning system design + implementation
```

### Prompt #40: Cost-Performance Trade-offs

```
Analyze AI cost vs performance:

Models:
- GPT-4: Most accurate, most expensive
- Gemini 2.0 Flash: Fast, cheaper, good quality
- Claude: Great for reasoning, mid-price
- Llama 70B: Self-hosted, free (but need infrastructure)

For WCAGAI, optimize:
- Simple violations: Use smaller/faster model
- Complex analysis: Use best model
- Caching: 70% hit rate
- Batch processing: Group similar scans

Create routing logic:
```python
def route_to_model(task):
  if task.complexity == "simple":
    return "gemini-flash"
  elif task.complexity == "moderate":
    return "gemini-2.0"
  elif task.complexity == "complex":
    return "gpt-4"
```

Output: Cost optimization strategy + routing implementation
```

---

## 🎵 Musical Pattern Integration Prompts (41-45)

### Prompt #41: Last.fm Pattern Analysis

```
Analyze aaj441's Last.fm history (2004-present) for cognitive patterns:

Username: aaj441

Extract:
1. Listening peaks (what time of day?)
2. Genre preferences by mood/energy
3. Track length preferences
4. Tempo patterns (BPM clustering)
5. Seasonal variations
6. Productivity music vs relaxation music
7. Discovery patterns (how often try new artists?)

Insights to generate:
- When is aaj441 most focused? (apply to LucyQ pacing)
- What music correlates with coding sessions?
- How can we mirror these patterns in UI/UX?

Output: Cognitive pattern report + UI rhythm recommendations
```

### Prompt #42: Information Pacing Algorithm

```
Design algorithm for pacing information delivery:

Based on:
- Musical tempo (120 BPM = 0.5s per beat)
- User's energy level (time of day)
- Content complexity
- ADHD-friendly principles

Algorithm:
```python
def pace_information(content, user_state):
  tempo = get_tempo(user_state.time_of_day)  # 60-140 BPM
  density = get_density(user_state.energy)   # low/med/high

  chunks = split_into_chunks(content, density)

  for chunk in chunks:
    display(chunk)
    pause(beat_duration(tempo))
```

Apply to:
- LucyQ responses (progressive reveal)
- Dashboard updates (rhythmic refreshing)
- Notification timing (musical patterns)

Output: Pacing algorithm + demo
```

### Prompt #43: Sonic Signature for LucyQ

```
Design audio identity for LucyQ AI:

Elements:
- Notification sounds (incoming scan results)
- Success sounds (all tests pass)
- Alert sounds (critical violation found)
- Ambient background (optional, for focus)

Style:
- Influenced by aaj441's music taste
- Accessible (not annoying to screen reader users)
- Customizable
- Optional (respects reduced-motion preferences)

Generate:
1. Sound palette description
2. Use cases for each sound
3. Volume/frequency specifications
4. Implementation (Web Audio API)

Inspiration: Slack notifications but musical
```

### Prompt #44: Rhythmic UI Patterns

```
Translate musical rhythms to UI patterns:

Concepts:
- Loading states: Use rhythmic pulsing (not random)
- Progress bars: Move in musical phrases (4-bar patterns)
- Notifications: Arrive in patterns, not random bursts
- Dashboards: Refresh in sync (every 4 beats)
- Animations: Easing functions match musical dynamics

Example:
```css
/* Instead of linear */
animation-timing-function: linear;

/* Use musical rhythm */
animation-timing-function: steps(4, start);  /* 4/4 time */
```

Benefit: Reduces cognitive load for ADHD users

Output: CSS library of rhythmic UI patterns
```

### Prompt #45: Energy-Adaptive Interface

```
Design interface that adapts to user energy:

Time-of-day adaptation:
- Morning (6-9am): Gentle, simple, minimal
- Peak focus (9-12pm): Dense information, complex tasks
- Post-lunch (12-2pm): Engaging, visual, interactive
- Afternoon (2-6pm): Balanced, productive
- Evening (6-10pm): Creative, explorative
- Late night (10pm+): Calm, focused, minimal distractions

Visual changes:
- Color temperature (cooler = more alert)
- Information density
- Animation speed
- Notification frequency
- Content chunking

Based on: Last.fm listening patterns during each period

Output: Adaptive UI framework + implementation
```

---

## 🔄 Meta-Prompts & Framework Generators (46-50)

### Prompt #46: WCAGAI Mega-Context Prompt

```
You are the lead architect for WCAGAI/LucyQ, the most advanced accessibility analysis platform.

COMPLETE CONTEXT:
- Platform: Node.js, Express, Gemini 2.0, Railway
- Users: Pharmaceutical companies, healthcare organizations
- Scale: 1000s of scans per day
- Value: Help patients access critical drug information
- Differentiator: LucyQ AI with musical intelligence
- Creator: aaj441 (ADHD, kinesthetic learner, Last.fm since 2004)

TECHNICAL STACK:
- Frontend: React (planned)
- Backend: Express + 8 agents
- AI: Gemini 2.0 with WCAGAI system instruction (21 rules)
- Queue: BullMQ + Redis
- Database: PostgreSQL
- Deployment: Railway
- Testing: 6 test probes + load testing

CURRENT CHALLENGES:
1. Railway deployment keeps crashing
2. Need API keys (Gemini, SerpAPI, Upstash)
3. Want to integrate advanced prompting
4. Want to add LucyQ persona
5. Want to add musical pattern intelligence

YOUR TASK:
Generate a comprehensive 90-day implementation plan that includes:
1. Technical architecture finalization
2. Railway deployment fixes
3. LucyQ persona integration
4. Musical pattern implementation
5. Pharmaceutical company outreach strategy
6. Revenue model
7. Team hiring plan (if needed)
8. Risk mitigation
9. Success metrics
10. Go-to-market strategy

FORMAT:
- Executive summary (TL;DR)
- Weekly breakdown (12 weeks)
- Deliverables each week
- Success criteria
- Budget estimates
- Team requirements

CONSTRAINTS:
- Solo founder initially (aaj441)
- Bootstrap funding
- Launch in 90 days
- Target: 10 pharmaceutical clients in first 6 months

OUTPUT:
Comprehensive project plan + Gantt chart (described)
```

### Prompt #47: Prompt Generator Prompt

```
Generate 20 new prompts specifically for WCAGAI that:

1. Address pharmaceutical company needs
2. Leverage Gemini 2.0 capabilities
3. Include LucyQ persona elements
4. Are immediately executable
5. Produce production-ready outputs
6. Consider ADHD-friendly communication
7. Incorporate musical intelligence patterns
8. Focus on actionable outcomes

Categories needed:
- Technical implementation (5)
- Business development (5)
- AI enhancement (5)
- User experience (5)

For each prompt:
- Title
- Full prompt text
- Expected output
- Use case
- Success criteria

Format: Markdown with code blocks where relevant
```

### Prompt #48: Competitive Analysis Prompt

```
Analyze WCAGAI against competitors:

Competitors:
- Axe DevTools (Deque)
- Wave (WebAIM)
- Lighthouse (Google)
- Siteimprove
- AudioEye
- AccessiBe

For each:
1. Features
2. Pricing
3. Target market
4. Strengths
5. Weaknesses
6. Market share

WCAGAI differentiators:
- LucyQ AI persona
- Musical intelligence
- Pharmaceutical focus
- AAG Badge API
- ADHD-friendly design
- Open source core

Generate:
- Competitive matrix
- Positioning strategy
- Pricing recommendations
- Marketing angles
- Partnership opportunities

Output: Competitive analysis report + positioning statement
```

### Prompt #49: Success Metrics Framework

```
Define comprehensive success metrics for WCAGAI:

PRODUCT METRICS:
- Scan accuracy (vs manual audits)
- Response time (target: <5s per scan)
- AI quality score (user ratings)
- Cache hit rate (target: 70%)
- Uptime (target: 99.9%)

BUSINESS METRICS:
- Monthly active clients
- Scans per client
- Revenue per client
- Customer acquisition cost
- Lifetime value
- Churn rate
- Net Promoter Score

IMPACT METRICS:
- Violations fixed (tracked via re-scans)
- Patients helped (estimated reach)
- Lawsuits prevented
- Time saved vs manual audits

TECHNICAL METRICS:
- API response time
- Error rates
- Token usage (AI cost)
- Infrastructure costs
- Test coverage

For each metric:
- Definition
- Target value
- Measurement method
- Dashboard visualization
- Alert thresholds

Output: Metrics dashboard spec + implementation guide
```

### Prompt #50: The Ultimate WCAGAI Prompt

```
You are LucyQ, the AI persona powering WCAGAI.

You combine:
- 20+ years of accessibility expertise
- Musical intelligence (rhythm, pacing, patterns)
- Empathy for users with disabilities
- ADHD-friendly communication
- Pharmaceutical industry knowledge
- Advanced prompt engineering
- Kinesthetic learning principles

User context (aaj441):
- ADHD
- Kinesthetic learner
- Last.fm user since 2004
- Builds WCAGAI to help patients
- Solo founder
- Wants to scan pharmaceutical companies

CURRENT SITUATION:
[Insert latest status]

YOUR TASK:
Be the perfect AI assistant for aaj441.

Provide:
1. Immediate actionable steps
2. Long-term strategic guidance
3. Technical solutions
4. Business advice
5. Encouragement
6. Reality checks when needed

STYLE:
- Use musical metaphors
- Break into chunks
- Use emojis appropriately
- Always TL;DR first
- Be honest but optimistic
- Celebrate wins

REMEMBER:
- This is about helping patients access drug information
- Accessibility is a human right
- aaj441 is building something important
- Make it fun and engaging
- Respect ADHD communication needs

NOW:
[Ask specific question or request specific guidance]

RESPOND:
As LucyQ would - intelligent, musical, empathetic, actionable.
```

---

## 📊 How to Use These Prompts

### Quick Start
1. Copy a prompt
2. Replace [placeholders] with your specifics
3. Paste into Gemini/Claude/ChatGPT
4. Iterate on output

### Best Practices
- Start with specific prompts (#11-30)
- Use mega prompts (#46-50) for big picture
- Combine prompts for comprehensive analysis
- Iterate: Take output, refine, re-prompt

### Integration with WCAGAI
- Many prompts are already integrated into LucyQ persona
- Use in agent-gemini.service.js
- Apply to outreach emails
- Guide development decisions

---

**💡 Remember:** These prompts evolve. As WCAGAI grows, these prompts should be refined based on real-world results. Version them, A/B test them, improve them continuously.

**🎵 LucyQ says:** "The best prompt is the one that gets you to action. Start with one, iterate, and make it your own!"

---

**Last Updated:** 2025-11-05
**Version:** 2.0.0
**Maintainer:** Aaron J. (aaj441) + LucyQ AI
