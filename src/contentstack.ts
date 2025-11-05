// Lazy client-only initialization to avoid window access during SSR.
export async function initContentstack() {
  if (typeof window === 'undefined') return null;

  // Try App SDK first (for app locations). If that fails, fallback to UI Extensions SDK (for custom field).
  try {
    const mod = await import('@contentstack/app-sdk');
    const ContentstackAppSDK = mod.default || (mod as any);
    return await ContentstackAppSDK.init();
  } catch (appErr) {
    try {
  // UI Extensions SDK lacks TypeScript types; import as any.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uiMod: any = await import('@contentstack/ui-extensions-sdk');
      // uiMod.init returns a promise resolving to the extension sdk
      const uiSdk = await uiMod.init();
      return uiSdk;
    } catch (uiErr) {
      console.error('Contentstack SDK initialization failed for both App and UI Extension SDKs', { appErr, uiErr });
      return null;
    }
  }
}
