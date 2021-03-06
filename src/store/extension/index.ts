import { CommitOptions, DispatchOptions, Module, Store as VuexStore } from 'vuex';

import { RootState } from '..';
import { actions, GlobalActions } from './actions';
import { Getters, getters } from './getters';
import { Mutations, mutations } from './mutations';
import type { State } from './state';
import { getDefaultState } from './state';

export { State };

export type ExtensionStore<S = State> = Omit<VuexStore<S>, 'getters' | 'commit' | 'dispatch'> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions,
  ): ReturnType<Mutations[K]>;
} & {
  dispatch<K extends keyof GlobalActions>(
    key: K,
    payload?: Parameters<GlobalActions[K]>[1],
    options?: DispatchOptions,
  ): ReturnType<GlobalActions[K]>;
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>;
  };
};

export const store: Module<State, RootState> = {
  state: getDefaultState(),
  mutations,
  getters,
  actions,
  namespaced: true,
};
