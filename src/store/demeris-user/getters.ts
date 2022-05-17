import { EmerisFees } from '@emeris/types';
import { GetterTree } from 'vuex';

import { RootState } from '@/store';
import { KeplrKeyData } from '@/types/user';
import { Namespaced } from '@/types/util';

import { GetterTypes } from './getter-types';
import { USERState } from './state';

export type Getters = {
  [GetterTypes.getKeplr](state: USERState): KeplrKeyData;
  [GetterTypes.getGasLimit](state: USERState): number;
  [GetterTypes.isSignedIn](state: USERState, getters, rootState, rootGetters): boolean;
  [GetterTypes.getKeyhashes](state: USERState, getters, rootState, rootGetters): string[];
  [GetterTypes.getCorrelationId](state: USERState, getters, rootState, rootGetters): string;
  [GetterTypes.getKeplrAccountName](state: USERState, getters, rootState, rootGetters): string | null;
  [GetterTypes.isDemoAccount](state: USERState): boolean;
  [GetterTypes.hasSeenReedem](state: USERState): boolean;
  [GetterTypes.viewUnverified](state: USERState): boolean;
  [GetterTypes.viewLPAssetPools](state: USERState): boolean;
  [GetterTypes.allowCustomSlippage](state: USERState): boolean;
  [GetterTypes.getSlippagePerc](state: USERState): number;
  [GetterTypes.getKeplrAddress](state: USERState, getters, rootState, rootGetters): string;
  [GetterTypes.theme](state: USERState): string;
  [GetterTypes.getPreferredGasPriceLevel](state: USERState): EmerisFees.GasPriceLevel;
  [GetterTypes.isAllBalancesLoaded](state: USERState, getters, rootState): boolean;
};

export type GlobalGetters = Namespaced<Getters, 'demerisUSER'>;

export const getters: GetterTree<USERState, RootState> & Getters = {
  [GetterTypes.getKeplr]: (state) => {
    return state.keplr ?? null;
  },
  [GetterTypes.getSlippagePerc]: (state) => {
    return state._Session.slippagePerc;
  },
  [GetterTypes.isDemoAccount]: (_state) => {
    return false;
  },
  [GetterTypes.hasSeenReedem]: (_state) => {
    return false;
  },
  [GetterTypes.theme]: (state) => {
    return state._Session.theme;
  },
  [GetterTypes.getPreferredGasPriceLevel]: (state) => {
    return state._Session.gasPriceLevel;
  },
  [GetterTypes.getCorrelationId]: (_state, _getters, _rootState, rootGetters) => {
    const account = rootGetters['extension/getAccount'];
    return account?.keyHashes[0] ?? null;
  },
  [GetterTypes.allowCustomSlippage]: (state) => {
    return state._Session.customSlippage;
  },
  [GetterTypes.viewUnverified]: (_state) => {
    return false;
  },
  [GetterTypes.viewLPAssetPools]: (_state) => {
    return false;
  },
  [GetterTypes.isSignedIn]: (_state, _getters, _rootState, rootGetters) => {
    return rootGetters['extension/getWallet'] ? true : false;
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
  [GetterTypes.getGasLimit]: (state) => {
    return state.gas_limit;
  },
  [GetterTypes.isAllBalancesLoaded]: (_, getters, rootState) => {
    const keyHashes = getters[GetterTypes.getKeyhashes] || [];
    if (!keyHashes.length) return false;

    const balances = rootState?.demerisAPI?.balances || [];
    const keys = Object.keys(balances);

    return keyHashes.every((keyhash) => keys.includes(keyhash));
  },
};
