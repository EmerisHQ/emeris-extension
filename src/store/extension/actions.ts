import { Coin } from '@cosmjs/amino';
import { ActionContext, ActionTree } from 'vuex';
import browser from 'webextension-polyfill';

import { GlobalActionTypes } from '@/store';
import { keyHashfromAddress } from '@/utils/basic';
import { ExtensionRequest } from '@@/types/index';

import chainConfig from '../../chain-config';
import { RootState } from '..';
import { ActionTypes } from './action-types';
import { accountActions, AccountActionsInterface } from './actions/account';
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
  [ActionTypes.SET_CURRENT_FLOW](
    { commit }: ActionContext<State, RootState>,
    { currentFlow }: { currentFlow: string },
  ): Promise<void>;
}
export type GlobalActions = Namespaced<Actions, 'extension'>;

const respond = async (id, data) => {
  await browser.runtime.sendMessage({
    type: 'fromPopup',
    data: { action: 'setResponse', data: { id, ...data } },
  });
};

export const actions: ActionTree<State, RootState> & Actions = {
  ...accountActions,
  ...walletActions,
  async [ActionTypes.GET_PENDING]({ commit, getters }) {
    try {
      const latestPending = await browser.runtime.sendMessage({ type: 'fromPopup', data: { action: 'getPending' } });

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
  async [ActionTypes.LOAD_SESSION_DATA]({ dispatch, commit }) {
    const lastAccountused = await dispatch(ActionTypes.GET_LAST_ACCOUNT_USED); // also loads the last account to the state
    await dispatch(GlobalActionTypes.USER.SIGN_OUT, null, { root: true });
    // HACK to conform with the current data handling in the demeris
    commit(
      'demerisUSER/SET_ACCOUNT',
      {
        name: lastAccountused,
      },
      {
        root: true,
      },
    );
    const chainConfigs = await chainConfig;
    await Promise.all(
      Object.keys(chainConfigs).map(async (chainId) => {
        const keyHash = keyHashfromAddress(await dispatch(ActionTypes.GET_ADDRESS, { chainId }));
        commit(
          'demerisUSER/ADD_CHAIN_KEY_DATA',
          {
            keyHash,
            chainName: chainConfigs[chainId].chain_name,
            pubKey: new Uint8Array(), // TODO
            algo: 'secp256k1',
          },
          {
            root: true,
          },
        );
      }),
    );
    await Promise.all([
      dispatch(GlobalActionTypes.API.GET_ALL_BALANCES, { subscribe: false }, { root: true }),
      dispatch(GlobalActionTypes.API.GET_ALL_UNBONDING_DELEGATIONS, { subscribe: false }, { root: true }),
      dispatch(GlobalActionTypes.API.GET_ALL_STAKING_BALANCES, { subscribe: false }, { root: true }),
    ]);
  },
  async [ActionTypes.GET_MNEMONIC]({ commit }, { accountName, password }: { accountName: string; password: string }) {
    try {
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
  async [ActionTypes.SET_CURRENT_FLOW]({ commit }, { currentFlow }: { currentFlow: string }) {
    commit(MutationTypes.SET_CURRENT_FLOW, { currentFlow });
  },
  async [ActionTypes.GET_ADDRESS]({}, { chainId }: { chainId: string }) {
    try {
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
    return await browser.runtime.sendMessage({ type: 'fromPopup', data: { action: 'extensionReset' } });
  },
  async [ActionTypes.GET_WHITELISTED_WEBSITES]({ commit }) {
    const whitelistWebsites = await browser.runtime.sendMessage({
      type: 'fromPopup',
      data: { action: 'getWhitelistedWebsite' },
    });
    if (whitelistWebsites) commit(MutationTypes.SET_WHITELISTED_WEBSITES, whitelistWebsites);
    else commit(MutationTypes.SET_WHITELISTED_WEBSITES, []);
    return whitelistWebsites;
  },
  async [ActionTypes.REMOVE_WHITELISTED_WEBSITE]({ dispatch }, { website }) {
    await browser.runtime.sendMessage({
      type: 'fromPopup',
      data: { action: 'removeWhitelistedWebsite', data: { website } },
    });
    await dispatch(ActionTypes.GET_WHITELISTED_WEBSITES);
  },
  async [ActionTypes.WHITELIST_WEBSITE]({}, { id, accept }) {
    await respond(id, { accept });
    // await dispatch(ActionTypes.GET_WHITELISTED_WEBSITES); // the list is not necessary updated at this point and the page needing the websites loads the data individually
  },
  // TODO potentially refactor and split signing with ledger from signing in the background
  async [ActionTypes.ACCEPT_TRANSACTION]({}, { id, action, broadcastable, ...transaction }) {
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
