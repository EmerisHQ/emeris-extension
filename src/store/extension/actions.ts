import { Coin } from '@cosmjs/amino';
import { ActionContext, ActionTree } from 'vuex';

import { GlobalActionTypes } from '@/store';
import { ExtensionRequest } from '@@/types/index';
import BrowserManager from '@@/utils/browser';

import { RootState } from '..';
import { ActionTypes } from './action-types';
import { AccountActionsInterface, airdropActions } from './actions/account';
import { walletActions, WalletActionsInterface } from './actions/wallet';
import { MutationTypes } from './mutation-types';
import { State } from './state';

type Namespaced<T, N extends string> = {
  [P in keyof T & string as `${N}/${P}`]: T[P];
};

export interface Actions extends AccountActionsInterface, WalletActionsInterface {
  // Cross-chain endpoint actions
  [ActionTypes.GET_PENDING]({ commit, getters }: ActionContext<State, RootState>): Promise<ExtensionRequest[]>;
  [ActionTypes.GET_MNEMONIC](
    { commit }: ActionContext<State, RootState>,
    { accountName, password }: { accountName: string; password: string },
  ): Promise<void>;
  [ActionTypes.GET_ADDRESS]({}: ActionContext<State, RootState>, { chainId }: { chainId: string }): Promise<string>;
  [ActionTypes.REMOVE_WHITELISTED_WEBSITE](
    {}: ActionContext<State, RootState>,
    { website }: { website: string },
  ): Promise<void>;
}
export type GlobalActions = Namespaced<Actions, 'extension'>;

const respond = async (id, data) => {
  const browser = BrowserManager.getInstance().getBrowser();
  await browser.runtime.sendMessage({
    type: 'fromPopup',
    data: { action: 'setResponse', data: { id, ...data } },
  });
};

export const actions: ActionTree<State, RootState> & Actions = {
  ...airdropActions,
  ...walletActions,
  async [ActionTypes.GET_PENDING]({ commit, getters }) {
    try {
      const browser = BrowserManager.getInstance().getBrowser();
      console.log('browser', browser);
      console.log('browser.runtime', browser.runtime);
      const latestPending = await browser.runtime.sendMessage({ type: 'fromPopup', data: { action: 'getPending' } });
      console.log('test 4'); //@TODO does not show for some reason in the extension version! Something wrong with the browser polyfill
      commit(MutationTypes.ADD_PENDING, latestPending);
    } catch (e) {
      throw new Error('Extension:GetPendingRequests failed');
    }
    return getters['getPending'];
  },
  async [ActionTypes.COMPLETE_REQUEST]({ commit }, { requestId }) {
    try {
      commit(MutationTypes.REMOVE_REQUEST, requestId);
      return true;
    } catch (e) {
      return false;
    }
  },
  async [ActionTypes.LOAD_SESSION_DATA]({ dispatch, getters }) {
    const lastAccountused = await dispatch(ActionTypes.GET_LAST_ACCOUNT_USED); // also loads the last account to the state
    const account =
      getters['getWallet'].find((account) => account.accountName === lastAccountused) || getters['getWallet'][0];
    await Promise.all(
      account.keyHashes.map((keyHash) =>
        dispatch(GlobalActionTypes.API.GET_BALANCES, { subscribe: true, params: { address: keyHash } }, { root: true }),
      ),
    );
  },
  async [ActionTypes.CHANGE_PASSWORD]({}, { password }: { password: string }) {
    const browser = BrowserManager.getInstance().getBrowser();
    await browser.runtime.sendMessage({
      type: 'fromPopup',
      data: { action: 'changePassword', data: { password } },
    });
  },
  async [ActionTypes.GET_MNEMONIC]({ commit }, { accountName, password }: { accountName: string; password: string }) {
    try {
      const browser = BrowserManager.getInstance().getBrowser();
      const account = await browser.runtime.sendMessage({
        type: 'fromPopup',
        data: { action: 'getMnemonic', data: { accountName, password } },
      });
      if (!account) throw new Error('Password incorrect');
      commit(MutationTypes.SET_MNEMONIC, { account });
    } catch (e) {
      console.log(e);
      throw new Error('Extension:getMnemonic failed');
    }
  },
  async [ActionTypes.GET_ADDRESS]({}, { chainId }: { chainId: string }) {
    try {
      const browser = BrowserManager.getInstance().getBrowser();
      const address = await browser.runtime.sendMessage({
        type: 'fromPopup',
        data: { action: 'getAddress', data: { chainId } },
      });
      return address;
    } catch (e) {
      console.log(e);
      throw new Error('Extension:getAddress failed');
    }
  },
  async [ActionTypes.EXTENSION_RESET]() {
    const browser = BrowserManager.getInstance().getBrowser();
    return await browser.runtime.sendMessage({ type: 'fromPopup', data: { action: 'extensionReset' } });
  },
  async [ActionTypes.GET_WHITELISTED_WEBSITES]({ commit }) {
    const browser = BrowserManager.getInstance().getBrowser();
    const whitelistWebsites = await browser.runtime.sendMessage({
      type: 'fromPopup',
      data: { action: 'getWhitelistedWebsite' },
    });
    commit(MutationTypes.SET_WHITELISTED_WEBSITES, whitelistWebsites);
  },
  async [ActionTypes.REMOVE_WHITELISTED_WEBSITE]({ dispatch }, { website }) {
    const browser = BrowserManager.getInstance().getBrowser();
    await browser.runtime.sendMessage({
      type: 'fromPopup',
      data: { action: 'removeWhitelistedWebsite', data: { website } },
    });
    await dispatch(ActionTypes.GET_WHITELISTED_WEBSITES);
  },
  async [ActionTypes.WHITELIST_WEBSITE]({ dispatch }, { id, accept }) {
    await respond(id, { accept });
    await dispatch(ActionTypes.GET_WHITELISTED_WEBSITES);
  },
  // TODO potentially refactor and split signing with ledger from signing in the background
  async [ActionTypes.ACCEPT_TRANSACTION]({}, { id, action, broadcastable, ...transaction }) {
    const browser = BrowserManager.getInstance().getBrowser();
    let response = broadcastable;
    // when signing with ledger we get the signed message from the view, when signing with a key we get it signing in the background
    if (!response) {
      response = await browser.runtime.sendMessage({
        type: 'fromPopup',
        data: { action, data: { id, ...transaction } },
      });
    } else {
      // we need to transport the buffer and it will be converted badly by native methods so we convert to hex
      response = Buffer.from(broadcastable).toString('hex');
    }
    await respond(id, { response });
  },
  async [ActionTypes.CANCEL_TRANSACTION]({}, { id }) {
    await respond(id, { broadcastable: undefined });
  },
  async [ActionTypes.GET_RAW_TRANSACTION]({}, { messages, chainId, signingAddress, gas, fees, memo }) {
    const browser = BrowserManager.getInstance().getBrowser();
    return await browser.runtime.sendMessage({
      type: 'fromPopup',
      data: {
        action: 'getRawTransaction',
        data: {
          messages,
          chainId,
          signingAddress,
          fee: {
            gas,
            amount: fees,
          },
          memo,
        },
      },
    });
  },
  async [ActionTypes.SET_LEDGER_SIGN_DATA](
    {},
    ledgerSignData: {
      fees: {
        gas: number;
        amount: Coin[];
      };
      memo: string;
      rawTransaction: string;
    },
  ) {
    localStorage.setItem('ledger_sign_data', JSON.stringify(ledgerSignData));
  },

  async [ActionTypes.GET_LEDGER_SIGN_DATA]({}): Promise<{
    fees: {
      gas: number;
      amount: Coin[];
    };
    memo: string;
    rawTransaction: string;
  }> {
    return JSON.parse(localStorage.getItem('ledger_sign_data'));
  },
};
