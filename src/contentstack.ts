// Simplified Contentstack App SDK initialization matching marketplace docs.
// See: ContentstackAppSdk.init().then(function(appSdk) { /* logic */ })
// We cache the promise to avoid duplicate inits and expose the sdk on window for debugging.
let sdkPromise: Promise<any> | null = null;

export function initContentstack() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (sdkPromise) return sdkPromise;
  sdkPromise = (async () => {
    try {
      const mod = await import('@contentstack/app-sdk');
      const ContentstackAppSDK = mod.default || (mod as any);
      const sdk = await ContentstackAppSDK.init();
      (window as any).csSdk = sdk;
      try {
        console.info('[contentstack] App SDK initialized', {
          // sdk.type may be private; expose safe diagnostics only
          locationKeys: Object.keys(sdk.location || {}),
          hasCustomField: !!sdk.location?.CustomField,
          configKeys: Object.keys(sdk.getConfig?.() || {})
        });
      } catch {/* ignore */}
      return sdk;
    } catch (e) {
      console.error('[contentstack] App SDK init failed', e);
      return null;
    }
  })();
  return sdkPromise;
}
