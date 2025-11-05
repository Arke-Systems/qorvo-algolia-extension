import { contentstackAppSdk } from '@contentstack/app-sdk';

export async function initContentstack() {
  const sdk = await contentstackAppSdk.init();
  return sdk;
}
