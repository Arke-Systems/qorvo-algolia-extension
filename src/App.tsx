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
        (window as any).csSdk = theSdk; // expose globally
        console.info('[contentstack] sdk init', (theSdk as any)?.__sdkType, {
          hasField: !!(theSdk as any)?.field,
          windowApis: Object.keys((theSdk as any)?.window || {})
        });
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
      const desired = h + 32;
      // 1. UI Extensions / legacy API
      if (sdk.window?.updateHeight) {
        try { sdk.window.updateHeight(desired); return; } catch {/* ignore */}
      }
      // 2. Potential App SDK custom field helpers (speculative fallbacks)
      const cf = sdk.location?.CustomField;
      try { cf?.field?.setHeight?.(desired); } catch { /* ignore */ }
      try { cf?.updateSize?.({ height: desired }); } catch { /* ignore */ }
      try { cf?.setSize?.({ height: desired }); } catch { /* ignore */ }
      try { cf?.setHeight?.(desired); } catch { /* ignore */ }
      // 3. postRobot channel if exposed (correct signature: send(targetWindow, name, data, options?))
      try {
        const pr = sdk.postRobot;
        if (pr && typeof pr.send === 'function') {
          const target = window.parent || window;
          // Some implementations expose pr.send(window, name, data). Provide a window object explicitly.
          pr.send(target, 'updateHeight', { height: desired });
        }
      } catch { /* ignore */ }
      // 4. Raw postMessage (may be ignored if parent not listening)
      try { window.parent?.postMessage({ type: 'cs-sdk-height', height: desired }, '*'); } catch { /* ignore */ }
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

  // Recalculate height whenever selection changes (content length often changes)
  useEffect(() => {
    if (!sdk || !containerRef.current) return;
    const h = containerRef.current.scrollHeight;
    const desired = h + 32;
    const cf = sdk.location?.CustomField;
    // Try all fallbacks again when selection changes
    try { sdk.window?.updateHeight?.(desired); } catch { /* ignore */ }
    try { cf?.field?.setHeight?.(desired); } catch { /* ignore */ }
    try { cf?.updateSize?.({ height: desired }); } catch { /* ignore */ }
    try { cf?.setSize?.({ height: desired }); } catch { /* ignore */ }
    try { cf?.setHeight?.(desired); } catch { /* ignore */ }
    try {
      const pr = sdk.postRobot;
      if (pr && typeof pr.send === 'function') {
        const target = window.parent || window;
        pr.send(target, 'updateHeight', { height: desired });
      }
    } catch { /* ignore */ }
    try { window.parent?.postMessage({ type: 'cs-sdk-height', height: desired }, '*'); } catch { /* ignore */ }
  }, [sdk, selected]);

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
