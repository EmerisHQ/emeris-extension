<template>
  <Header title="Receive asset" />
  <div class="search-bar relative flex-1 min-h-0 flex flex-col">
    <Search v-model:keyword="keyword" placeholder="Search assets" class="w-full mx-auto max-w-md pb-3" />
    <div class="scroll-container overflow-y-auto flex-grow min-h-0 pt-1">
      <div class="mx-auto max-w-md mb-20">
        <CoinList
          v-if="keywordFilteredAssets.length > 0"
          :data="keywordFilteredAssets"
          type="receive"
          show-balance
          :keyword="keyword"
          @select="(asset) => $router.push('/receive/' + asset.base_denom)"
        >
        </CoinList>
      </div>
    </div>

    <!-- Empty search result -->
    <div v-if="keywordFilteredAssets.length === 0" class="w-fit mx-auto">
      <img class="-mt-8 h-52 w-52" src="/images/no-search-result.png" />
      <p class="secondary-text mt-6 text-center">No "{{ keyword }}" asset found.</p>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from '@vue/runtime-core';
import orderBy from 'lodash.orderby';
import { useStore } from 'vuex';

import CoinList from '@/components/common/CoinList.vue';
import Search from '@/components/common/Search.vue';
import useAccount from '@/composables/useAccount';
import { GlobalGetterTypes } from '@/store';
import { getDisplayName } from '@/utils/actionHandler';
import Header from '@@/components/Header.vue';

export default {
  name: 'Receive Denom',
  components: {
    Header,
    Search,
    CoinList,
  },
  setup() {
    const { nativeBalances } = useAccount();
    const store = useStore();
    let displayNameAddedList = ref([]);
    let keyword = ref('');

    const assetsList = computed(() => {
      if (!store.getters[GlobalGetterTypes.API.getVerifiedDenoms]) return [];
      return orderBy(nativeBalances.value, (item) => (item.base_denom.startsWith('pool') ? 1 : -1));
    });

    const keywordFilteredAssets = computed(() => {
      const filteredAssets = (displayNameAddedList.value.length > 0 ? displayNameAddedList.value : []).filter(
        (asset) => {
          return asset.display_name?.toLowerCase().indexOf(keyword.value.toLowerCase()) !== -1;
        },
      );

      return filteredAssets;
    });

    watch(
      () => assetsList.value,
      async (value) => {
        displayNameAddedList.value = await Promise.all(
          value.map(async (asset) => {
            return {
              ...asset,
              display_name: await getDisplayName(asset.base_denom, store.getters[GlobalGetterTypes.API.getDexChain]),
            };
          }),
        );
      },
      { immediate: true },
    );

    return { assetsList, keywordFilteredAssets, keyword };
  },
};
</script>

<style lang="scss" scoped>
:deep(.scroll-container > div > div) {
  margin: 0;
}
:deep(.search) {
  padding-left: 0;
  padding-right: 0;
}
</style>
