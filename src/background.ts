import browser from 'webextension-polyfill';

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

const messageHandler = async (request, sender) => {
  await emeris.isInitialized();
  const isInternalRequest = sender.id === browser.runtime.id;
  if (isInternalRequest) {
    request.type = 'fromPopup';
    return emeris.popupHandler(request);
  }
  delete request.type;
  return pageHandler(request);
};
browser.runtime.onMessage.addListener(messageHandler);
