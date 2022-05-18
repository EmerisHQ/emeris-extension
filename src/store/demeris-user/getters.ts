import { GetterTree } from 'vuex';

import { RootState } from '@/store';
import { Namespaced } from '@/types/util';

import { GetterTypes } from './getter-types';
import { USERState } from './state';

export type Getters = {
  [GetterTypes.isSignedIn](state: USERState, getters, rootState, rootGetters): boolean;
  [GetterTypes.getKeyhashes](state: USERState, getters, rootState, rootGetters): string[];
  [GetterTypes.getCorrelationId](state: USERState, getters, rootState, rootGetters): string;
  [GetterTypes.getKeplrAccountName](state: USERState, getters, rootState, rootGetters): string | null;
  [GetterTypes.isDemoAccount](state: USERState): boolean;
  [GetterTypes.getBalancesFirstLoad](state: USERState): boolean;
  [GetterTypes.getStakingBalancesFirstLoad](state: USERState): boolean;
  [GetterTypes.getPricesFirstLoad](state: USERState): boolean;
  [GetterTypes.getFirstLoad](state: USERState): boolean;
  [GetterTypes.getKeplrAddress](state: USERState, getters, rootState, rootGetters): string;
  [GetterTypes.isAllBalancesLoaded](state: USERState, getters, rootState): boolean;
};

export type GlobalGetters = Namespaced<Getters, 'demerisUSER'>;

export const getters: GetterTree<USERState, RootState> & Getters = {
  [GetterTypes.getCorrelationId]: (_state, _getters, _rootState, rootGetters) => {
    const account = rootGetters['extension/getAccount'];
    return account?.keyHashes[0] ?? null;
  },
  [GetterTypes.isSignedIn]: (_state, _getters, _rootState, rootGetters) => {
    return rootGetters['extension/getWallet'] ? true : false;
  },
  [GetterTypes.isDemoAccount]: (_state) => {
    return false;
  },
  [GetterTypes.getKeplrAccountName]: (_state, _getters, _rootState, rootGetters) => {
    const account = rootGetters['extension/getAccount'];
    return account?.accountName ?? null;
  },
  [GetterTypes.getKeplrAddress]: (_state, _getters, _rootState, rootGetters) => {
    const account = rootGetters['extension/getAccount'];
    return account?.keyHashes[0] ?? null;
  },
  [GetterTypes.getKeyhashes]: (_state, _getters, _rootState, rootGetters) => {
    const account = rootGetters['extension/getAccount'];
    return account?.keyHashes ?? null;
  },
  [GetterTypes.getBalancesFirstLoad]: (state) => {
    return state.balancesFirstLoad;
  },
  [GetterTypes.getStakingBalancesFirstLoad]: (state) => {
    return state.stakingBalancesFirstLoad;
  },
  [GetterTypes.getPricesFirstLoad]: (state) => {
    return state.pricesFirstLoad;
  },
  [GetterTypes.getFirstLoad]: (state) => {
    return state.balancesFirstLoad || state.stakingBalancesFirstLoad || state.pricesFirstLoad;
  },
  [GetterTypes.isAllBalancesLoaded]: (_, getters, rootState) => {
    const keyHashes = getters[GetterTypes.getKeyhashes] || [];
    if (!keyHashes.length) return false;

    const balances = rootState?.demerisAPI?.balances || [];
    const keys = Object.keys(balances);

    return keyHashes.every((keyhash) => keys.includes(keyhash));
  },
};
