#!/usr/bin/env node

/*
 * Agent 4: Draft Outreach Email
 *
 * This module generates a personalized outreach email using the accessibility report
 * and CEO contact.  It is intentionally left as a placeholder — integrate your
 * preferred LLM or templating system by implementing lib/draft.js.
 */

import { generateDraft } from './lib/draft.js';

const domain = process.argv[2];
if (!domain) {
  console.error('❌ domain needed to fetch CEO and report');
  process.exit(1);
}

try {
  const draft = await generateDraft(domain);
  console.log(JSON.stringify({ ok: true, draft }));
} catch (err) {
  console.error('❌ failed to generate draft:', err);
  process.exit(1);
}