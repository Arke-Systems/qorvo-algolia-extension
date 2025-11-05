export interface ProductFacetSubFacet {
  Name: string;
  UUID?: string;
}

export interface ProductFacet {
  Name: string;
  SubFacets: ProductFacetSubFacet[];
}

export interface ProductSearchFacetCollection {
  Facets: ProductFacet[];
}

export interface AlgoliaHit {
  objectID: string;
  UUID?: string;
  PartNumber?: string;
  Description?: string;
  Overview?: string; // HTML
  KeyFeatures?: string; // HTML list
  TypicalApplications?: string; // HTML list
  CategoryNames?: string; // comma-separated
  SearchFacetCollection?: ProductSearchFacetCollection;
  title?: string; // legacy generic display fields
  name?: string;
  heading?: string;
  url?: string;
  [key: string]: any;
}

export interface SelectedRecord {
  objectID: string;
  title?: string;
  url?: string;
  partNumber?: string;
  uuid?: string;
  description?: string;
}

// Helper to safely strip HTML tags when persisting plain text if needed.
export function stripHtml(input?: string): string | undefined {
  if (!input) return input;
  return input.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
