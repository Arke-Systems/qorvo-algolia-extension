"use client";
import React, { useEffect, useState, useRef } from 'react';
import { initContentstack } from './contentstack';
import AlgoliaSearch from './components/AlgoliaSearch';
import { SelectedRecord } from './types';

const App: React.FC = () => {
  const [sdk, setSdk] = useState<any>(null);
  const [selected, setSelected] = useState<SelectedRecord[]>([]);
  const [persistStatus, setPersistStatus] = useState<string>('');

  useEffect(() => {
    initContentstack()
      .then(async (theSdk) => {
        setSdk(theSdk);
        // Attempt to load existing field data if we are in a field context
        try {
          const field = resolveField(theSdk);
          if (field) {
            const existing = field.getData();
            if (existing) {
              let parsed: any = existing;
              if (typeof existing === 'string') {
                try { parsed = JSON.parse(existing); } catch { /* ignore */ }
              }
              if (Array.isArray(parsed)) {
                setSelected(parsed as SelectedRecord[]);
              } else if (parsed && parsed.selected && Array.isArray(parsed.selected)) {
                setSelected(parsed.selected as SelectedRecord[]);
              }
            }
          }
        } catch (e) {
          console.warn('Could not pre-load field data', e);
        }
      })
      .catch(err => {
        console.error('Contentstack init failed', err);
        setPersistStatus('Init error');
      });
  }, []);

  const resolveField = (sdkInstance: any) => {
    if (!sdkInstance) return null;
    // UI Extension SDK exposes field directly
    if (sdkInstance.field) return sdkInstance.field;
    // App SDK via location objects
    if (sdkInstance.location) {
      const loc = sdkInstance.location;
      return loc.CustomField?.field || loc.EntryFieldLocation?.field || loc.FieldModifierLocation?.field || null;
    }
    return null;
  };

  const getLocationLabel = () => {
    if (!sdk) return 'Unknown';
    const loc = sdk.location;
    if (loc.CustomField) return 'CustomField';
    if (loc.EntryFieldLocation) return 'EntryFieldLocation';
    if (loc.FieldModifierLocation) return 'FieldModifierLocation';
    if (loc.DashboardWidget) return 'DashboardWidget';
    if (loc.SidebarWidget) return 'SidebarWidget';
    if (loc.FullPage) return 'FullPage';
    return 'Other';
  };

  const persistSelection = async () => {
    if (!sdk) return;
    const field = resolveField(sdk);
    setPersistStatus('Saving...');
    try {
      if (field) {
        // Determine storage format based on field data type (if plain text, stringify)
        const dataType = field.schema?.data_type;
        let toStore: any = selected;
        if (dataType && ['text', 'string', 'multi_line', 'rich_text', 'markdown'].includes(dataType)) {
          toStore = JSON.stringify(selected);
        }
        await field.setData(toStore);
        setPersistStatus('Saved to field');
        return;
      }
      // Fallback: store in app config / store if available
      if (sdk.store) {
        await sdk.store.set('selectedRecords', selected);
        setPersistStatus('Saved to app store');
        return;
      }
      setPersistStatus('Unsupported location – cannot save');
    } catch (e: any) {
      console.error('Persist error', e);
      setPersistStatus('Error saving');
    }
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-resize the Contentstack field iframe or app container to fit content
  useEffect(() => {
    if (!sdk || !containerRef.current) return;

    const targetEl = containerRef.current;

    const directUpdate = () => {
      const h = targetEl.scrollHeight;
      if (sdk.window?.updateHeight) sdk.window.updateHeight(h + 32);
    };

    // Attempt native auto resizing (UI Extension SDK)
    if (sdk.window?.enableAutoResizing) {
      try {
        sdk.window.enableAutoResizing();
        return; // let SDK handle it
      } catch {/* fallback */}
    }

    // ResizeObserver + MutationObserver for dynamic content changes
    const ro = new ResizeObserver(() => directUpdate());
    ro.observe(targetEl);
    const mo = new MutationObserver(() => directUpdate());
    mo.observe(targetEl, { childList: true, subtree: true });
    // initial
    directUpdate();
    window.addEventListener('resize', directUpdate);
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', directUpdate);
    };
  }, [sdk]);

  return (
    <div ref={containerRef} style={{ fontFamily: 'Inter, Arial, sans-serif', padding: '1rem', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Algolia Browser for Contentstack</h1>
      <p style={{ marginTop: 0, color: '#555' }}>Search and select records from your Algolia index.</p>
      <AlgoliaSearch onSelectChange={setSelected} storeFullRecord />
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button disabled={!sdk || selected.length === 0} onClick={persistSelection}>Save selection to Contentstack</button>
        <span>Selected: {selected.length}</span>
        {persistStatus && <span style={{ fontSize: '0.8rem', color: '#333' }}>{persistStatus}</span>}
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: '#666' }}>
        Location: {getLocationLabel()}
        {(() => {
          const field = resolveField(sdk);
          if (!field) return null;
          return <>
            {' '}| Field UID: {field.uid} | Type: {field.schema?.data_type}
          </>;
        })()}
      </div>
      <details style={{ marginTop: '1rem' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Selection JSON Preview</summary>
        <pre style={{ background: '#f5f5f5', padding: '0.75rem', marginTop: '0.5rem', overflowX: 'auto' }}>
{JSON.stringify(selected, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default App;
