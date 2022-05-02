import { ActionContext, ActionTree } from 'vuex';

import { RootState } from '@@/store';
import { EmerisWallet } from '@@/types/index';
import BrowserManager from '@@/utils/browser';

import { ActionTypes } from '../action-types';
import { MutationTypes } from '../mutation-types';
import { State } from '../state';

export interface WalletActionsInterface {
  //Wallet Action types
  [ActionTypes.GET_WALLET]({ commit, getters }: ActionContext<State, RootState>): Promise<EmerisWallet>;
  [ActionTypes.HAS_WALLET]({ commit, getters }: ActionContext<State, RootState>): Promise<boolean>;
  [ActionTypes.CREATE_WALLET](
    { commit }: ActionContext<State, RootState>,
    { password }: { password: string },
  ): Promise<EmerisWallet>;
  [ActionTypes.UNLOCK_WALLET](
    { commit }: ActionContext<State, RootState>,
    { password }: { password: string },
  ): Promise<EmerisWallet>;
}

export const walletActions: ActionTree<State, RootState> & WalletActionsInterface = {
  async [ActionTypes.GET_WALLET]({ commit, getters }) {
    try {
      const browser = BrowserManager.getInstance().getBrowser();
      const wallet = await browser.runtime.sendMessage({ type: 'fromPopup', data: { action: 'getWallet' } });
      if (wallet) {
        commit(MutationTypes.SET_WALLET, wallet as EmerisWallet);
      }
    } catch (e) {
      console.log(e);
      throw new Error('Extension:GetWallet failed');
    }
    return getters['getWallet'];
  },
  async [ActionTypes.HAS_WALLET]({ commit }) {
    try {
      const browser = BrowserManager.getInstance().getBrowser();
      const hasWallet = await browser.runtime.sendMessage({ type: 'fromPopup', data: { action: 'hasWallet' } });
      if (!hasWallet) {
        commit(MutationTypes.SET_WALLET, [] as EmerisWallet);
      }
      return hasWallet;
    } catch (e) {
      console.log(e);
      throw new Error('Extension:HasWallet failed');
    }
  },
  async [ActionTypes.CREATE_WALLET]({ commit, getters }, { password }: { password: string }) {
    const browser = BrowserManager.getInstance().getBrowser();
    const response = await browser.runtime.sendMessage({
      type: 'fromPopup',
      data: { action: 'createWallet', data: { password } },
    });
    commit(MutationTypes.SET_WALLET, response as EmerisWallet);
    return getters['getWallet'];
  },
  async [ActionTypes.UNLOCK_WALLET]({ commit, dispatch, getters }, { password }: { password: string }) {
    try {
      const browser = BrowserManager.getInstance().getBrowser();
      const wallet = await browser.runtime.sendMessage({
        type: 'fromPopup',
        data: { action: 'unlockWallet', data: { password } },
      });
      if (wallet) {
        commit(MutationTypes.SET_WALLET, wallet as EmerisWallet);
        dispatch(ActionTypes.GET_WALLET);
        return getters['getWallet'];
      }
    } catch (e) {
      console.log(e);
      throw new Error('Extension:UnlockWallet failed');
    }
  },
};
