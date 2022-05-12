import browser from 'webextension-polyfill';

import { Emeris } from './lib/Emeris';
import EmerisStorage, { EmerisStorageMode } from './lib/EmerisStorage';

const storage = new EmerisStorage(EmerisStorageMode.LOCAL);
const emeris = new Emeris(storage);

const pageHandler = async (request, sender) => {
  await emeris.isInitialized();
  request.origin = sender.origin; // take the sender origin here to not allow a manipulated request
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

const messageHandler = async (request, sender) => {
  await emeris.isInitialized();
  if (request.type == 'fromPopup') {
    const result = await emeris.popupHandler(request);
    return result;
  }
  return await pageHandler(request, sender);
};
browser.runtime.onMessage.addListener(messageHandler);
