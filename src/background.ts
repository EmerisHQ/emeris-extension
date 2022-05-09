import browser from 'webextension-polyfill';

import { Emeris } from './lib/Emeris';
import EmerisStorage, { EmerisStorageMode } from './lib/EmerisStorage';

const storage = new EmerisStorage(EmerisStorageMode.LOCAL);
const emeris = new Emeris(storage);
// let isPopupOpen = false;

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
    // if (request.data.action === 'popupOpened') {
    //   console.log('emerisPopup has been opened');
    //   isPopupOpen = true;
    // }
    return result;
  }
  return await pageHandler(request);
};
browser.runtime.onMessage.addListener(messageHandler);

// detect popup status
browser.runtime.onConnect.addListener((port) => {
  if (port.name === 'emerisPopup') {
    port.onDisconnect.addListener(async () => {
      console.log('emerisPopup has been closed');
      // isPopupOpen = false;
      // abort enable promise if wallet is locked and popup closes

      browser.tabs
        .query({ currentWindow: true, active: true })
        .then(([tab]) => {
          if (tab && tab.id) browser.tabs.sendMessage(tab.id, { type: 'fromEmerisExtension', action: 'popupClosed' });
        })
        .catch((e) => console.warn('message error', e));
    });
  }
});
