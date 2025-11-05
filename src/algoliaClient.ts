import { algoliasearch } from 'algoliasearch';

type AlgoliaClient = ReturnType<typeof algoliasearch>;
let client: AlgoliaClient | null = null;

export function getAlgoliaClient() {
  if (!client) {
    const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
    const apiKey = import.meta.env.VITE_ALGOLIA_API_KEY;
    if (!appId || !apiKey) {
      throw new Error('Algolia credentials missing. Define VITE_ALGOLIA_APP_ID and VITE_ALGOLIA_API_KEY.');
    }
    client = algoliasearch(appId, apiKey);
  }
  return client;
}

export async function searchIndex(indexName: string, query: string) {
  const c = getAlgoliaClient();
  if (!indexName) throw new Error('Index name required');
  const trimmed = query.trim();
  if (!trimmed) return [];
  // Use multi-search to stay compatible with both full and lite clients.
  const responses = await c.search([
    {
      indexName,
      params: { query: trimmed, hitsPerPage: 20 }
    }
  ] as any);
  const first = responses.results[0] as any;
  return first?.hits || [];
}
