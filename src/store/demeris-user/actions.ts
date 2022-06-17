/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines-per-function */
import { ActionTree } from 'vuex';

import { RootState, RootStoreTyped } from '@/store';
import { Namespaced } from '@/types/util';

import { USERStore } from '.';
import { ActionTypes } from './action-types';
import { MutationTypes } from './mutation-types';
import { USERState } from './state';

type UserActionContext = {
  dispatch: Pick<USERStore<USERState>, 'dispatch'>['dispatch'] & Pick<RootStoreTyped, 'dispatch'>['dispatch'];
  commit: Pick<USERStore<USERState>, 'commit'>['commit'];
  state: USERState;
  getters: Pick<USERStore<USERState>, 'getters'>['getters'];
  rootState: RootState;
  rootGetters: Pick<RootStoreTyped, 'getters'>['getters'];
};
export type Subscription<K extends keyof Actions> = {
  action: K;
  payload?: Parameters<Actions[K]>[1];
};
export type Subscriptions = Subscription<keyof Actions>;
export interface Actions {
  [ActionTypes.BALANCES_LOADED](context: UserActionContext): Promise<void>;
  [ActionTypes.STAKING_BALANCES_LOADED](context: UserActionContext): Promise<void>;
  [ActionTypes.PRICES_LOADED](context: UserActionContext): Promise<void>;
  [ActionTypes.RESET_STATE](context: UserActionContext): void;
}

export type GlobalActions = Namespaced<Actions, 'demerisUSER'>;

export const actions: ActionTree<USERState, RootState> & Actions = {
  async [ActionTypes.PRICES_LOADED]({ commit }) {
    commit(MutationTypes.SET_PRICES_FIRST_LOAD, false);
  },
  async [ActionTypes.BALANCES_LOADED]({ commit }) {
    commit(MutationTypes.SET_BALANCES_FIRST_LOAD, false);
  },
  async [ActionTypes.STAKING_BALANCES_LOADED]({ commit }) {
    commit(MutationTypes.SET_STAKING_BALANCES_FIRST_LOAD, false);
  },
  [ActionTypes.RESET_STATE]({ commit }) {
    commit(MutationTypes.RESET_STATE);
  },
};
