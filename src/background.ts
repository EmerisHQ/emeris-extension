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

const sendMessageToActiveTab = (message) => {
  browser.tabs
    .query({ currentWindow: true, active: true })
    .then(([tab]) => {
      if (tab && tab.id) browser.tabs.sendMessage(tab.id, message);
    })
    .catch((e) => console.warn('message error', e));
};

const messageHandler = async (request) => {
  console.log('background messagehandler', request);
  await emeris.isInitialized();
  console.log('background messagehandler isInitialized');
  if (request.type === 'fromPopup') {
    const result = await emeris.popupHandler(request);
    return result;
  }

  if (request.action === 'getEmerisStatus') {
    console.log('background messageHandler request.type getEmerisStatus');
    const result = await emeris.contentScriptsHandler('getEmerisStatus');
    console.log('background messageHandler request.type getEmerisStatus response', result);

    sendMessageToActiveTab({ type: 'fromEmerisExtension', action: 'getEmerisStatus' });
  }

  return await pageHandler(request);
};
browser.runtime.onMessage.addListener(messageHandler);

// detect extension popup onClosed event
browser.runtime.onConnect.addListener((port) => {
  if (port.name === 'emerisPopup') {
    port.onDisconnect.addListener(async () => {
      sendMessageToActiveTab({ type: 'fromEmerisExtension', action: 'popupClosed' });
    });
  }
});
