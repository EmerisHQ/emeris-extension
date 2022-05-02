import browser from 'webextension-polyfill';

export async function sendMessage(type, data) {
  return await browser.runtime.sendMessage({ type, data });
}
