// Lazy client-only initialization to avoid window access during SSR.
export async function initContentstack() {
  if (typeof window === 'undefined') {
    return null;
  }
  const mod = await import('@contentstack/app-sdk');
  const ContentstackAppSDK = mod.default || (mod as any);
  const sdk = await ContentstackAppSDK.init();
  return sdk;
}
