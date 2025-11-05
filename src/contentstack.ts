// Client-only initialization with priority for UI Extensions when in a field context.
// The "No handler found for post message: extensionEvent" error typically means
// the wrong SDK (App SDK) was initialized inside a Custom Field iframe.
let sdkPromise: Promise<any> | null = null;

export function initContentstack() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (sdkPromise) return sdkPromise;
  sdkPromise = (async () => {
    const w = window as any;

    const attach = (s: any, type: string) => {
      if (s) {
        (s as any).__sdkType = type;
        (window as any).csSdk = s; // expose globally for debugging
        // Basic debug log
        try {
          console.info('[contentstack] initialized', type, {
            hasField: !!s.field,
            windowApis: Object.keys(s.window || {})
          });
        } catch {/* ignore */}
      }
      return s;
    };

    // 1. Global UI Extension object
    if (w.ContentstackUIExtension?.init) {
      try {
        const uiSdk = await w.ContentstackUIExtension.init();
        return attach(uiSdk, 'ui-extension-global');
      } catch (e) {
        console.warn('[contentstack] Global UIExtension init failed; trying module import', e);
      }
    }

    // 2. Module UI Extensions SDK
    try {
      const uiMod: any = await import('@contentstack/ui-extensions-sdk');
      if (uiMod?.init) {
        const uiSdk = await uiMod.init();
        return attach(uiSdk, 'ui-extension-module');
      }
    } catch (e) {
      console.info('[contentstack] UI Extensions SDK module not available, will try App SDK');
    }

    // 3. App SDK fallback
    try {
      const mod = await import('@contentstack/app-sdk');
      const ContentstackAppSDK = mod.default || (mod as any);
      const appSdk = await ContentstackAppSDK.init();
      return attach(appSdk, 'app-sdk');
    } catch (e) {
      console.error('[contentstack] Failed to initialize any SDK', e);
      return null;
    }
  })();
  return sdkPromise;
}
