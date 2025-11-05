import React, { useEffect, useState } from 'react';
import { initContentstack } from './contentstack';
import AlgoliaSearch from './components/AlgoliaSearch';
import { SelectedRecord } from './types';

const App: React.FC = () => {
  const [sdk, setSdk] = useState<any>(null);
  const [selected, setSelected] = useState<SelectedRecord[]>([]);
  const [persistStatus, setPersistStatus] = useState<string>('');

  useEffect(() => {
    initContentstack().then(setSdk).catch(err => {
      console.error('Contentstack init failed', err);
    });
  }, []);

  const persistSelection = async () => {
    if (!sdk) return;
    setPersistStatus('Saving...');
    try {
      // Field location (entry editor)
      if (sdk?.location?.entry && sdk.location.entry.field) {
        await sdk.location.entry.field.setData(selected);
        setPersistStatus('Saved to field');
        return;
      }
      // Dashboard / installation fallback
      if (sdk?.location?.dashboard) {
        await sdk.location.dashboard.setInstallationData({ selected });
        setPersistStatus('Saved to installation data');
        return;
      }
      setPersistStatus('Unsupported location – cannot save');
    } catch (e: any) {
      console.error(e);
      setPersistStatus('Error saving');
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', padding: '1rem', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Algolia Browser for Contentstack</h1>
      <p style={{ marginTop: 0, color: '#555' }}>Search and select records from your Algolia index.</p>
      <AlgoliaSearch onSelectChange={setSelected} />
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button disabled={!sdk} onClick={persistSelection}>Save selection to Contentstack</button>
        <span>Selected: {selected.length}</span>
        {persistStatus && <span style={{ fontSize: '0.8rem', color: '#333' }}>{persistStatus}</span>}
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
