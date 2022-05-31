<template>
  <Loader v-if="!asset || !recipientAddress" />
  <template v-else>
    <Header :title="`Receive ${asset.display_name}`" />
    <div class="text-center -mt-6">
      <span class="secondary-text">on {{ asset.on_chain }}</span>
    </div>
    <template v-if="recipientAddress">
      <div class="text-left flex flex-col mt-6">
        <span class="secondary-text -text-1 mb-1">{{ asset.display_name }} Address</span>
        <span class="mb-4 break-words">{{ recipientAddress }}</span>
        <div class="cursor-pointer flex -text-1 text-tertiary" @click="pasteClip">
          <Icon v-if="!copied" name="CopyIcon" :icon-size="0.8" class="mr-3" />
          <Icon v-else name="CheckIcon" :icon-size="0.8" class="mr-3" />
          {{ copied ? 'Copied' : 'Copy' }} to clipboard
        </div>
      </div>
      <div class="bg-fg rounded-lg flex py-3 px-4 my-8 items-start">
        <Icon name="InformationIcon" class="text-warning mr-2" :icon-size="1" />
        <p class="secondary-text -text-1">
          This address will only support receiving ATOM. If you use it to receive unsupported assets, they may be
          permanently lost.
        </p>
      </div>
      <QrCode class="relative z-10 mx-auto mb-8" :value="recipientAddress" width="120" color="FFFFFF" />
      <p class="text-center secondary-text -text-1 mb-6">
        Scan this code in a crypto wallet mobile app to enter this account as the recipient address.
      </p>
    </template>
    <div class="mt-auto">
      <Button name="Done" @click="$router.push('/portfolio')" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from '@vue/runtime-core';
import orderBy from 'lodash.orderby';
import { useStore } from 'vuex';

import QrCode from '@/components/common/QrCode.vue';
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import useAccount from '@/composables/useAccount';
import { GlobalGetterTypes } from '@/store';
import { getDisplayName } from '@/utils/actionHandler';
import Header from '@@/components/Header.vue';
import Loader from '@@/components/Loader.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

interface Props {
  denom: string;
}

const props = withDefaults(defineProps<Props>(), { denom: '' });

const { nativeBalances } = useAccount();
const store = useStore();
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
    console.log('checking here', assetValue);
    if (!assetValue) return;
    recipientAddress.value = await store.dispatch(GlobalEmerisActionTypes.GET_ADDRESS, {
      chainId: assetValue.on_chain,
    });
  },
  { immediate: true },
);
</script>
