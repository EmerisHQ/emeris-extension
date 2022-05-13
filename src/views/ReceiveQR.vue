<template>
  <Loader v-if="!asset" />
  <template v-else>
    <Header :title="`Receive ${asset.display_name}`" />
    <div style="text-align: center; margin-top: -24px">
      <span class="secondary-text" style="font-size: 13px">on {{ asset.on_chain }}</span>
    </div>
    <template v-if="recipientAddress">
      <QrCode
        class="relative z-10"
        :value="recipientAddress"
        width="160"
        color="FFFFFF"
        style="margin-left: auto; margin-right: auto; margin-top: 79px; margin-bottom: 73px"
      />
      <div style="text-align: left; display: flex; flex-direction: column">
        <span>Address</span>
        <span class="secondary-text" style="margin-bottom: 24px; word-wrap: break-word">{{ recipientAddress }}</span>
        <div style="color: #4ef2e4; cursor: pointer; display: flex" @click="pasteClip">
          <Icon v-if="!copied" name="CopyIcon" :icon-size="1" style="margin-right: 12px" />
          <span v-else style="margin-right: 12px">✓</span>
          Copy to clipboard
        </div>
      </div>
    </template>
  </template>
</template>

<script>
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

export default {
  name: 'Receive QR',
  components: {
    Header,
    QrCode,
    Icon,
    Loader,
  },
  props: {
    denom: { type: String, required: true },
  },
  setup(props) {
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
        if (!assetValue) return;
        recipientAddress.value = await store.dispatch(GlobalEmerisActionTypes.GET_ADDRESS, {
          chainId: assetValue.on_chain,
        });
      },
      { immediate: true },
    );

    return { assetsList, pasteClip, asset, recipientAddress, copied };
  },
};
</script>
