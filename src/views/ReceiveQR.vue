<template>
  <Loader v-if="!asset" />
  <template v-else>
    <Header :title="`Receive ${asset.display_name}`" back-to="/receive" />
    <div class="text-center -mt-6">
      <span class="secondary-text text-[13px]">on {{ asset.on_chain }}</span>
    </div>
    <template v-if="recipientAddress">
      <QrCode class="relative z-10 mx-auto mt-20 mb-[73px]" :value="recipientAddress" width="160" color="FFFFFF" />
      <div class="text-left flex flex-col">
        <span>Address</span>
        <span class="secondary-text mb-6 break-words">{{ recipientAddress }}</span>
        <div class="cursor-pointer flex text-quaternary" @click="pasteClip">
          <Icon v-if="!copied" name="CopyIcon" :icon-size="1" class="mr-3" />
          <span v-else class="mr-3">✓</span>
          Copy to clipboard
        </div>
      </div>
    </template>
  </template>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from '@vue/runtime-core';
import orderBy from 'lodash.orderby';
import { useStore } from 'vuex';

import QrCode from '@/components/common/QrCode.vue';
import Icon from '@/components/ui/Icon.vue';
import useAccount from '@/composables/useAccount';
import { GlobalGetterTypes } from '@/store';
import { getDisplayName } from '@/utils/actionHandler';
import Header from '@@/components/Header.vue';
import Loader from '@@/components/Loader.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const store = useStore();
const { nativeBalances } = useAccount();

const props = defineProps<{
  denom: string;
}>();

let displayNameAddedList = ref([]);
let recipientAddress = ref('');
let copied = ref(false);

const assetsList = computed(() => {
  if (!store.getters[GlobalGetterTypes.API.getVerifiedDenoms]) return [];
  return orderBy(nativeBalances.value, (item) => (item.base_denom.startsWith('pool') ? 1 : -1));
});

const asset = computed(() => {
  return displayNameAddedList.value.find((asset) => asset.base_denom === props.denom);
});

const pasteClip = () => {
  navigator.clipboard.writeText(recipientAddress.value);

  if (copied.value) clearTimeout(copied.value);
  copied.value = setTimeout(() => (copied.value = false), 3000);
};

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

watch(
  () => asset.value,
  async (assetValue) => {
    if (!assetValue) return;
    recipientAddress.value = await store.dispatch(GlobalEmerisActionTypes.GET_ADDRESS, {
      chainId: assetValue.on_chain,
    });
  },
  { immediate: true },
);
</script>
