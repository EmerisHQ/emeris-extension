import { MutationTree } from 'vuex';

import { MutationTypes } from './mutation-types';
import { getDefaultState, USERState } from './state';

export type Mutations<S = USERState> = {
  [MutationTypes.SET_BALANCES_FIRST_LOAD](state: S, payload: boolean): void;
  [MutationTypes.SET_STAKING_BALANCES_FIRST_LOAD](state: S, payload: boolean): void;
  [MutationTypes.SET_PRICES_FIRST_LOAD](state: S, payload: boolean): void;
  [MutationTypes.RESET_STATE](state: S): void;
};

export const mutations: MutationTree<USERState> & Mutations = {
  [MutationTypes.SET_BALANCES_FIRST_LOAD](state: USERState, payload: boolean) {
    state.balancesFirstLoad = payload;
  },
  [MutationTypes.SET_PRICES_FIRST_LOAD](state: USERState, payload: boolean) {
    state.pricesFirstLoad = payload;
  },
  [MutationTypes.SET_STAKING_BALANCES_FIRST_LOAD](state: USERState, payload: boolean) {
    state.stakingBalancesFirstLoad = payload;
  },
  [MutationTypes.RESET_STATE](state: USERState) {
    Object.assign(state, getDefaultState());
  },
};
