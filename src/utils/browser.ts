import { useExtensionStore } from '@@/store';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { account, password, wallet } from '@@/utils/web-debugging';

const store = useExtensionStore();

declare global {
  interface Window {
    chrome: any;
  }
}

if (import.meta.env.MODE === 'web') {
  window.chrome.runtime = {
    sendMessage: (req) => {
      if (req.data.action === 'createWallet') {
        return wallet;
      } else if (req.data.action === 'getPending') {
        return store.getters[GlobalEmerisGetterTypes.getPending];
      } else if (req.data.action === 'hasWallet') {
        return wallet;
      } else if (req.data.action === 'unlockWallet') {
        return wallet;
      }
    },
    onMessage: {
      addListener: (getPendingMethod) => {
        getPendingMethod({
          type: 'toPopup',
          data: {
            action: 'update',
          },
        });
      },
    },
  };
  window.chrome.storage = {
    session: {
      get: (item) => {
        if (item === 'password') {
          return {
            password: password,
          };
        } else if (item === 'wallet') {
          return {
            wallet: wallet,
          };
        } else if (item === 'selectedAccount') {
          return {
            selectedAccount: account.accountName,
          };
        } else if (item === 'popup') {
          return {
            popup: 1,
          };
        }
      },
      set: () => {
        return true;
      },
    },
  };
}

const browser = import.meta.env.MODE != 'web' ? await import('webextension-polyfill') : window.chrome;

export default browser;
