import React, { useEffect, useState, useCallback } from 'react';
import { searchIndex } from '../algoliaClient';
import { SelectedRecord, AlgoliaHit, stripHtml } from '../types';

interface Props {
  indexName?: string;
  onSelectChange?: (records: SelectedRecord[]) => void;
  mockHits?: AlgoliaHit[]; // for testing / injection
  storeFullRecord?: boolean; // if true persist full hit instead of trimmed selection
}

const AlgoliaSearch: React.FC<Props> = ({ indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME, onSelectChange, mockHits, storeFullRecord = false }) => {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<AlgoliaHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<Record<string, SelectedRecord>>({});

  const performSearch = useCallback(async (q: string) => {
    if (!indexName) {
      setError('Index name missing (VITE_ALGOLIA_INDEX_NAME)');
      return;
    }
    if (!q.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchIndex(indexName, q.trim());
      setHits(res as AlgoliaHit[]);
    } catch (e: any) {
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [indexName]);

  useEffect(() => {
    if (mockHits) {
      setHits(mockHits);
      return;
    }
    const handle = setTimeout(() => {
      performSearch(query);
    }, 350);
    return () => clearTimeout(handle);
  }, [query, performSearch, mockHits]);

  useEffect(() => {
    onSelectChange?.(Object.values(selectedMap));
  }, [selectedMap, onSelectChange]);

  const toggleSelect = (hit: AlgoliaHit) => {
    setSelectedMap(prev => {
      const copy = { ...prev };
      if (copy[hit.objectID]) {
        delete copy[hit.objectID];
      } else {
        if (storeFullRecord) {
          copy[hit.objectID] = {
            objectID: hit.objectID,
            title: hit.title || hit.PartNumber || hit.Description || hit.name || hit.heading || '',
            url: hit.url,
            partNumber: hit.PartNumber,
            uuid: hit.UUID,
            description: stripHtml(hit.Description) || stripHtml(hit.Overview)
          };
        } else {
          copy[hit.objectID] = {
            objectID: hit.objectID,
            title: hit.title || hit.PartNumber || hit.Description || hit.name || hit.heading || '',
            url: hit.url,
            partNumber: hit.PartNumber,
            uuid: hit.UUID,
            description: stripHtml(hit.Description) || stripHtml(hit.Overview)
          };
        }
      }
      return copy;
    });
  };

  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Search</label>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type to search Algolia index..."
        style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', marginBottom: '0.75rem' }}
      />
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'red', fontSize: '0.85rem' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {hits.map(hit => {
          const selected = !!selectedMap[hit.objectID];
          const title = hit.PartNumber || hit.Description || hit.title || hit.name || hit.heading || hit.objectID;
          const categories = hit.CategoryNames ? hit.CategoryNames.split(',').slice(0, 3).join(', ') : undefined;
          return (
            <li
              key={hit.objectID}
              style={{
                border: '1px solid #ddd',
                marginBottom: '0.5rem',
                padding: '0.75rem',
                background: selected ? '#eef7ff' : '#fff',
                cursor: 'pointer'
              }}
              onClick={() => toggleSelect(hit)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: selected ? '#2b6cb0' : '#eee', color: selected ? '#fff' : '#333' }}>{selected ? 'Selected' : 'Select'}</div>
              </div>
              {hit.Description && (() => {
                const desc = stripHtml(hit.Description) || '';
                return <div style={{ fontSize: '0.75rem', color: '#444', marginTop: '0.35rem' }}>{desc.slice(0, 120)}{desc.length > 120 ? '…' : ''}</div>;
              })()}
              {categories && <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '0.35rem' }}>{categories}</div>}
              {hit.KeyFeatures && (
                <details style={{ marginTop: '0.4rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.7rem' }}>Key Features</summary>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.3rem' }} dangerouslySetInnerHTML={{ __html: hit.KeyFeatures }} />
                </details>
              )}
              {hit.TypicalApplications && (
                <details style={{ marginTop: '0.4rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.7rem' }}>Applications</summary>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.3rem' }} dangerouslySetInnerHTML={{ __html: hit.TypicalApplications }} />
                </details>
              )}
            </li>
          );
        })}
        {!loading && hits.length === 0 && query.trim() && !error && (
          <li style={{ fontSize: '0.85rem', color: '#666' }}>No results.</li>
        )}
      </ul>
    </div>
  );
};

export default AlgoliaSearch;
