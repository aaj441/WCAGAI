import Hubspot from '@hubspot/api-client';

// Initialize a HubSpot API client.  You must set HUBSPOT_API_KEY in your environment.  
export const hubspot = new Hubspot.Client({ apiKey: process.env.HUBSPOT_API_KEY });