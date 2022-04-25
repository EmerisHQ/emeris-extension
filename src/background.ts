import BrowserManager from '@@/utils/browser';

import { Emeris } from './lib/Emeris';
import EmerisStorage, { EmerisStorageMode } from './lib/EmerisStorage';

const storage = new EmerisStorage(EmerisStorageMode.LOCAL);
const emeris = new Emeris(storage);

const pageHandler = async (request) => {
  await emeris.isInitialized();
  if (request.id) {
    if (!emeris.loaded) {
      return { id: request.id, data: false };
    }
    if (
      request.action !== 'enable' &&
      request.action !== 'keplrEnable' &&
      (await emeris.isPermitted(request.origin)) === false
    ) {
      return { id: request.id, data: false };
    }
    return { id: request.id, data: await emeris[request.action](request) };
  }
};

const messageHandler = async (request) => {
  await emeris.isInitialized();
  if (request.type == 'fromPopup') {
    const result = await emeris.popupHandler(request);
    return result;
  }
  return await pageHandler(request);
};
const browser = BrowserManager.getInstance().getBrowser();
browser.runtime.onMessage.addListener(messageHandler);
