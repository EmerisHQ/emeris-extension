import { ActionContext, ActionTree } from 'vuex';

import { RootState } from '@@/store';
import { AccountCreateStates, EmerisAccount, EmerisWallet } from '@@/types/index';

import { ActionTypes } from '../action-types';
import { MutationTypes } from '../mutation-types';
import { State } from '../state';
import { sendMessage } from './helpers';

export interface AccountActionsInterface {
  // Cross-chain endpoint actions
  [ActionTypes.CREATE_ACCOUNT](
    { commit }: ActionContext<State, RootState>,
    { account }: { account: EmerisAccount },
  ): Promise<void>;
  [ActionTypes.UPDATE_ACCOUNT](
    { commit }: ActionContext<State, RootState>,
    { targetAccountName, newAccountName }: { targetAccountName: string; newAccountName: string },
  ): Promise<EmerisWallet>;
  [ActionTypes.REMOVE_ACCOUNT](
    { commit }: ActionContext<State, RootState>,
    { accountName }: { accountName: string },
  ): Promise<void>;
  [ActionTypes.GET_LAST_ACCOUNT_USED]({ commit, getters }: ActionContext<State, RootState>): Promise<string>;
  [ActionTypes.SET_LAST_ACCOUNT_USED](
    { commit, getters }: ActionContext<State, RootState>,
    { accountName }: { accountName: string },
  ): Promise<void>;
  [ActionTypes.SET_NEW_ACCOUNT](
    { commit }: ActionContext<State, RootState>,
    account: EmerisAccount & { route: string },
  ): void;
  [ActionTypes.GET_NEW_ACCOUNT]({
    commit,
  }: ActionContext<State, RootState>): Promise<EmerisAccount & { route: string }>;
}

export const airdropActions: ActionTree<State, RootState> & AccountActionsInterface = {
  async [ActionTypes.CREATE_ACCOUNT]({ dispatch }, { account }: { account: EmerisAccount }) {
    await sendMessage('fromPopup', { action: 'createAccount', data: { account } });
    dispatch(ActionTypes.GET_WALLET);
    dispatch(ActionTypes.SET_LAST_ACCOUNT_USED, account);
  },
  async [ActionTypes.UPDATE_ACCOUNT](
    { dispatch },
    { targetAccountName, newAccountName }: { targetAccountName: string; newAccountName: string },
  ) {
    await sendMessage('fromPopup', {
      action: 'updateAccount',
      data: { targetAccountName, account: { accountName: newAccountName } },
    });
    return await dispatch(ActionTypes.GET_WALLET);
  },
  async [ActionTypes.REMOVE_ACCOUNT]({ dispatch }, { accountName }: { accountName: string }) {
    await sendMessage('fromPopup', { action: 'removeAccount', data: { accountName } });
    await dispatch(ActionTypes.GET_WALLET);
  },
  async [ActionTypes.GET_LAST_ACCOUNT_USED]({ commit, getters }) {
    try {
      const accountName = await sendMessage('fromPopup', { action: 'getLastAccount' });
      if (accountName) {
        commit(MutationTypes.SET_LAST_ACCOUNT, accountName);
      }
    } catch (e) {
      throw new Error('Extension:GetLastAccountUsed failed');
    }
    return getters['getLastAccount'];
  },
  async [ActionTypes.SET_LAST_ACCOUNT_USED]({ commit, getters }, { accountName }) {
    try {
      await sendMessage('fromPopup', { action: 'setLastAccount', data: { accountName } });
      commit(MutationTypes.SET_LAST_ACCOUNT, accountName);
    } catch (e) {
      throw new Error('Extension:SetLastAccount failed');
    }
    return getters['getLastAccount'];
  },
  async [ActionTypes.ACCOUNT_BACKED_UP]({ dispatch }, { accountName }: { accountName: string }) {
    await sendMessage('fromPopup', {
      action: 'updateAccount',
      data: { account: { setupState: AccountCreateStates.COMPLETE }, targetAccountName: accountName },
    });
    dispatch(ActionTypes.LOAD_SESSION_DATA);
  },
  async [ActionTypes.SET_NEW_ACCOUNT]({ commit }, account: EmerisAccount & { route: string }) {
    commit(MutationTypes.SET_NEW_ACCOUNT, account);
    return await sendMessage('fromPopup', {
      action: 'setPartialAccountCreationStep',
      data: account,
    });
  },
  async [ActionTypes.GET_NEW_ACCOUNT]({ commit }) {
    const partialAccountCreationStep = await sendMessage('fromPopup', {
      action: 'getPartialAccountCreationStep',
    });
    if (partialAccountCreationStep) {
      commit(MutationTypes.SET_NEW_ACCOUNT, partialAccountCreationStep);
      return partialAccountCreationStep;
    }
    return undefined;
  },
};
