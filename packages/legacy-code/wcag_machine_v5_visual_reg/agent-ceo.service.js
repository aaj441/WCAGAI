#!/usr/bin/env node

/*
 * Agent 3: Mine CEO
 *
 * Retrieves the CEO contact details for a given domain via the mineCeo helper.  
 * Creates a new contact in HubSpot and outputs the contactId and email.
 */

import { mineCeo } from './lib/ceo.js';
import { hubspot } from './lib/hubspot.js';

const domain = process.argv[2];
if (!domain) {
  console.error('❌ domain needed');
  process.exit(1);
}

try {
  const ceo = await mineCeo(domain);
  const contact = await hubspot.contacts.create(ceo);
  console.log(JSON.stringify({ ok: true, contactId: contact.id, email: ceo.email }));
} catch (err) {
  console.error('❌ failed to mine CEO or create contact:', err);
  process.exit(1);
}