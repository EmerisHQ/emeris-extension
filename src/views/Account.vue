<template>
  <div class="page">
    <Header title="">
      <template #backButton>
        <!-- TODO add icon to Demeris -->
        <img :src="'/images/CoqIcon.svg'" @click="$router.push('/settings')" />
      </template>
      <Icon name="ChevronRightIcon" @click="$router.push('/portfolio')" />
    </Header>
    <img class="h-[72px] w-[72px] mt-10 mx-auto" :src="'/images/Avatar.svg'" />
    <span class="account-selector text-center mb-8 cursor-pointer text-1" @click="$router.push('/accounts')">
      {{ account.accountName }} <Icon name="ChevronRightIcon" :icon-size="1" />
    </span>
    <div
      class="list-card-container mb-4"
      :style="{
        opacity: account.isLedger ? 0.6 : 1,
      }"
      @click="goToBackupPage"
    >
      <h2>Back up your wallet</h2>
      <span v-if="!backedUp" class="secondary-text">Your wallet is currently not secured</span>
      <span v-if="account.isLedger" class="secondary-text">Not possible on Ledger devices</span>
      <Icon name="ChevronRightIcon" :icon-size="1" />
    </div>
    <div class="list-card-container mb-4">
      <h2>Swap</h2>
      <span class="secondary-text">Swap assets wih Emeris</span>
      <img :src="'/images/SwapListItemGraphic.svg'" />
    </div>
    <div class="list-card-container">
      <h2>Add liquidity to a pool</h2>
      <span class="secondary-text">Browse our pool on Emeris</span>
      <img :src="'/images/LiquidityListItemGraphic.svg'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { AccountCreateStates } from '@@/types';

const store = useStore();
const router = useRouter();

const account = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getAccount] || {};
});
const backedUp = computed(() => {
  return account.value.setupState === AccountCreateStates.COMPLETE;
});

const goToBackupPage = () => {
  store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
    currentFlow: 'BACK_UP',
  });
  if (!account.value.isLedger) {
    router.push('/backup');
  }
};
</script>

<style lang="scss" scoped>
.account-selector {
  .icon {
    @apply inline-block rotate-90 translate-x-[2px];
  }
}
.list-card-container {
  @apply relative flex flex-col items-start p-6 h-24 cursor-pointer overflow-hidden rounded-[10px];

  background: linear-gradient(0deg, #171717 0%, #040404 100%);
  box-shadow: 3px 9px 32px -4px rgba(0, 0, 0, 0.07);

  img {
    @apply absolute top-0 right-0;
  }

  .icon {
    @apply absolute top-1/2 right-6;
  }

  .secondary-text {
    @apply text-[13px];
  }
}
</style>
