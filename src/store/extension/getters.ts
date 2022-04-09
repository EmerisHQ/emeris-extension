import { GetterTree } from 'vuex';

import { GlobalGetterTypes as GlobalApiGetterTypes } from '@/store/demeris-api/getter-types';
import { EmerisWallet, ExtensionRequest } from '@@/types/index';

import { RootState } from '..';
import { GetterTypes, GlobalEmerisGetterTypes } from './getter-types';
import { State } from './state';
export interface Getters {
  [GetterTypes.getPending](state: State): ExtensionRequest[];
  [GetterTypes.getWallet](state: State): EmerisWallet;
  [GetterTypes.getLastAccount](state: State): string;
}

export interface GlobalGetters {
  [GlobalEmerisGetterTypes.getPending](
    ...args: Parameters<Getters[GetterTypes.getPending]>
  ): ReturnType<Getters[GetterTypes.getPending]>;
  [GlobalEmerisGetterTypes.getWallet](
    ...args: Parameters<Getters[GetterTypes.getWallet]>
  ): ReturnType<Getters[GetterTypes.getWallet]>;
  [GlobalEmerisGetterTypes.getLastAccount](
    ...args: Parameters<Getters[GetterTypes.getLastAccount]>
  ): ReturnType<Getters[GetterTypes.getLastAccount]>;
}

export const getters: GetterTree<State, RootState> & Getters = {
  [GetterTypes.getPending]: (state) => {
    return state.pending;
  },
  [GetterTypes.getWallet]: (state) => {
    return state.wallet;
  },
  [GetterTypes.getLastAccount]: (state) => {
    return state.lastAccount;
  },
  [GetterTypes.getAccount]: (state) => {
    return (state.wallet || []).find((account) => account.accountName === state.lastAccount);
  },
  // accessing rootState doesn't allow for isolating each module, but this way we don't need to change the demeris module
  [GetterTypes.getAllBalances]: (state, getters, rootState, rootGetters) => (account) => {
    return []
      .concat(
        ...account.keyHashes.map((keyHash) => {
          return rootGetters[GlobalApiGetterTypes.getBalances]({ address: keyHash });
        }),
      )
      .filter((x) => !!x);
  },
};
