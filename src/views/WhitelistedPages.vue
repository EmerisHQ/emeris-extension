<template>
  <div class="page">
    <Header title="Authorized websites" />
    <Search v-model:keyword="keyword" placeholder="Search websites" class="w-full mx-auto max-w-md pb-3 mb-4" />
    <div v-if="filteredWhitelistedWebsites.length > 0">
      <div v-for="(site, index) in filteredWhitelistedWebsites" :key="site.origin" class="flex items-start mb-4">
        <div class="w-1/6 mr-2">
          <img class="h-12 w-12" :src="'/images/Avatar.svg'" />
        </div>
        <div class="flex items-center justify-between border-b border-border w-5/6 pb-4">
          <div class="w-3/4">
            <p class="text-ellipsis overflow-hidden whitespace-nowrap">Emeris</p>
            <p class="secondary-text text-ellipsis overflow-hidden">app.emeris.com</p>
          </div>
          <p class="text-negative-text cursor-pointer" @click="$router.push(`/whitelisted/remove/${index}`)">Remove</p>
        </div>
      </div>
    </div>

    <!-- Empty search result -->
    <div v-if="filteredWhitelistedWebsites.length === 0" class="w-fit mx-auto">
      <p class="secondary-text text-center">
        No <span v-if="keyword">"{{ keyword }}"</span> website found.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import Search from '@/components/common/Search.vue';
import { useStore } from '@/utils/useStore';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const keyword = ref('');
const store = useStore();

const whitelistedWebsites = computed(() => {
  return store.state.extension.whitelistedWebsites;
});

const filteredWhitelistedWebsites = computed(() => {
  const filteredWebsites = (whitelistedWebsites.value.length > 0 ? whitelistedWebsites.value : []).filter((item) => {
    return item.title?.toLowerCase().indexOf(keyword.value.toLowerCase()) !== -1;
  });

  return filteredWebsites;
});

onMounted(() => {
  store.dispatch(GlobalEmerisActionTypes.GET_WHITELISTED_WEBSITES);
});
</script>
