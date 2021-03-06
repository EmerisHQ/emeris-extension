<template>
  <router-view></router-view>
</template>

<script lang="ts">
/* eslint-disable max-lines-per-function */
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'vuex';

import { GlobalActionTypes } from '@/store/demeris-api/action-types';
import { MutationTypes } from '@/store/demeris-api/mutation-types';
import { setStore } from '@/utils/useStore';

if (+window.outerHeight > +window.innerHeight) {
  document.querySelector('html').classList.add('popup-height');
}

export default defineComponent({
  name: 'App',
  setup() {
    const store = useStore();

    setStore(store);

    onMounted(async () => {
      store.commit(
        'demerisAPI/' + MutationTypes.INIT,
        {
          endpoint: process.env.VUE_APP_EMERIS_PROD_ENDPOINT || 'https://api.emeris.com/v1',
        },
        { root: true },
      );

      // TODO handle in the background and just get from there (hit cache first)
      const loadData = async () => {
        if (localStorage.getItem('denoms')) {
          store.commit('demerisAPI/' + MutationTypes.SET_VERIFIED_DENOMS, {
            value: JSON.parse(localStorage.getItem('denoms')),
          });
        }
        store
          .dispatch(GlobalActionTypes.GET_VERIFIED_DENOMS, {
            subscribe: true,
          })
          .then((denoms) => {
            localStorage.setItem('denoms', JSON.stringify(denoms));
          });
        if (localStorage.getItem('chains')) {
          store.commit('demerisAPI/' + MutationTypes.SET_CHAINS, {
            value: Object.values(JSON.parse(localStorage.getItem('chains'))),
          });
        }
        store
          .dispatch(GlobalActionTypes.GET_CHAINS, {
            subscribe: false,
          })
          .then(async (chains) => {
            await Promise.all(
              Object.values(chains).map(async (chain) => {
                await store.dispatch(GlobalActionTypes.GET_CHAIN, {
                  subscribe: true,
                  params: chain,
                });
                await store.dispatch(GlobalActionTypes.GET_CHAIN_STATUS, {
                  subscribe: true,
                  params: chain,
                });
              }),
            );
            localStorage.setItem('chains', JSON.stringify(store.getters['demerisAPI/getChains']));
          });
        try {
          if (localStorage.getItem('prices')) {
            store.commit('demerisAPI/' + MutationTypes.SET_PRICES, {
              value: JSON.parse(localStorage.getItem('prices')),
            });
          }
          store
            .dispatch(GlobalActionTypes.GET_PRICES, {
              subscribe: true,
            })
            .then((prices) => {
              localStorage.setItem('prices', JSON.stringify(prices));
            });
        } catch (e) {
          //
        }
        // init starport store
        store
          .dispatch('common/env/config', {
            apiNode: process.env.VUE_APP_EMERIS_PROD_LIQUIDITY_ENDPOINT || 'https://api.emeris.com/v1/liquidity',
            rpcNode: null,
            wsNode: null,
            chainId: 'cosmos-hub',
            addrPrefix: 'cosmos',
            sdkVersion: 'Stargate',
            getTXApi: null,
            offline: true,
            refresh: 10000,
          })
          .then(() => {
            store.dispatch(
              'tendermint.liquidity.v1beta1/QueryLiquidityPools',
              { options: { subscribe: false, all: true }, params: {} },
              { root: true },
            );
          });
      };
      loadData();
    });
  },
});
</script>

<style lang="scss">
html {
  @apply bg-darkBanner w-[375px] h-[600px];

  &.popup-height {
    @apply max-h-screen;
  }
}
</style>
