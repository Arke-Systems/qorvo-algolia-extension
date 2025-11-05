"use client";
// Lazy (client-only) Algolia init to avoid window access during SSR/prerender.
// Using loose typing to avoid direct type import during SSR build phase.
type AlgoliaClient = any;
let client: AlgoliaClient | null = null;

export async function getAlgoliaClient() {
  if (client) return client;
  if (typeof window === 'undefined') {
    throw new Error('Algolia client is only available in the browser environment');
  }
  const { algoliasearch } = await import('algoliasearch');
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string | undefined;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY as string | undefined;
  if (!appId || !apiKey) {
    throw new Error('Algolia credentials missing. Define NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_API_KEY.');
  }
  client = algoliasearch(appId, apiKey);
  return client;
}

export async function searchIndex(indexName: string, query: string) {
  const c = await getAlgoliaClient();
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
