// Client-only initialization with priority for UI Extensions when in a field context.
// The "No handler found for post message: extensionEvent" error typically means
// the wrong SDK (App SDK) was initialized inside a Custom Field iframe.
export async function initContentstack() {
  if (typeof window === 'undefined') return null;

  const w = window as any;

  // 1. If global UI extension bridge is already injected by Contentstack, use it.
  if (w.ContentstackUIExtension && typeof w.ContentstackUIExtension.init === 'function') {
    try {
  const uiSdk = await w.ContentstackUIExtension.init();
  (uiSdk as any).__sdkType = 'ui-extension-global';
  return uiSdk;
    } catch (e) {
      console.warn('[contentstack] Global UIExtension init failed, will attempt module import fallback', e);
    }
  }

  // 2. Try importing the UI Extensions SDK module (field/location contexts)
  try {
    const uiMod: any = await import('@contentstack/ui-extensions-sdk');
    if (uiMod && typeof uiMod.init === 'function') {
  const uiSdk = await uiMod.init();
  (uiSdk as any).__sdkType = 'ui-extension-module';
  return uiSdk;
    }
  } catch (e) {
    // Silently ignore; we'll try App SDK next.
    console.info('[contentstack] UI Extensions SDK module not available, trying App SDK');
  }

  // 3. Fallback: App SDK (used for app locations, dashboard/full page/sidebar)
  try {
    const mod = await import('@contentstack/app-sdk');
    const ContentstackAppSDK = mod.default || (mod as any);
  const appSdk = await ContentstackAppSDK.init();
  (appSdk as any).__sdkType = 'app-sdk';
  return appSdk;
  } catch (e) {
    console.error('[contentstack] Failed to initialize any Contentstack SDK', e);
    return null;
  }
}
