import { getJson } from 'serpapi';

/**
 * Fetch organic search result URLs from Google via SerpApi.
 * @param {string} keyword The search query
 * @param {number} num Maximum number of URLs to return
 * @returns {Promise<string[]>}
 */
export async function getSerpUrls(keyword, num = 10) {
  const params = {
    engine: 'google',
    q: keyword,
    num: num,
    api_key: process.env.SERPAPI_KEY,
  };
  const response = await getJson(params);
  const results = response.organic_results?.map((r) => r.link) ?? [];
  return results.slice(0, num);
}