import BrowserManager from '@@/utils/browser';

export async function sendMessage(type, data) {
  const browser = BrowserManager.getInstance().getBrowser();
  return await browser.runtime.sendMessage({ type, data });
}
