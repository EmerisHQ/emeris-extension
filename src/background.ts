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
    if (!['enable', 'keplrEnable'].includes(request.action)) {
      if (!(await emeris.hasWallet())) throw new Error('Wallet has not yet been created.');
      if (!emeris.isUnlocked()) throw new Error('Wallet is locked.');
      if (!(await emeris.isPermitted(request.origin))) throw new Error('Website has not been whitelisted.');
    }
    return { id: request.id, data: await emeris[request.action](request) };
  }
};

const messageHandler = async (request, sender) => {
  if (sender.id !== browser.runtime.id) {
    throw new Error('Only messaging from popup or content-script is allowed');
  }
  await emeris.isInitialized();
  request.type = sender.origin.startsWith('chrome-extension://') ? 'fromPopup' : 'fromContentScript';
  if (request.type === 'fromPopup') {
    request.type = 'fromPopup';
    return emeris.popupHandler(request);
  }
  return pageHandler(request, sender);
};
browser.runtime.onMessage.addListener(messageHandler);
