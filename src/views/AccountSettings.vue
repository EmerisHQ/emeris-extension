<template>
  <div class="page">
    <Header title="Account settings" back-to="/accounts" />

    <!-- Account -->
    <div class="text-center my-8">
      <div
        class="bg-brand w-16 h-16 rounded-full text-center font-medium text-3 text-inverse pt-[0.5rem] mx-auto shadow-brand"
      >
        {{ nameFirstLetter(currentWallet.accountName) }}
      </div>
      <p class="text-1 mt-4 mb-2">{{ currentWallet.accountName }}</p>
      <span v-if="currentWallet.isLedger" class="py-1 px-3 text-[13px] text-text bg-surface-2 rounded-2xl">Ledger</span>
    </div>

    <!-- Wallet settings -->
    <div class="mb-4">
      <div class="bg-fg rounded-xl">
        <div class="cursor-pointer p-4" @click="$router.push('/accountRename/' + $route.params.index)">
          Account name <Icon name="ChevronRightIcon" :icon-size="1" class="inline-flex float-right mt-1" />
        </div>
        <hr class="mx-4 border-bg opacity-80" />
        <tippy class="block relative">
          <div
            class="cursor-pointer p-4 flex justify-between"
            :class="{ 'pointer-events-none secondary-text': currentWallet.isLedger }"
            @click="goToBackup()"
          >
            <div>
              <p>Secret recovery phrase</p>
              <p v-if="!backedUp(currentWallet)" class="-text-2 text-warning">Your account is not backed up</p>
            </div>
            <span class="inline-flex float-right mt-1">
              <Icon v-if="!backedUp(currentWallet)" name="WarningTriangleIcon" :icon-size="1" class="text-warning" />
              <Icon name="ChevronRightIcon" :icon-size="1" class="ml-2" />
            </span>
          </div>

          <template v-if="currentWallet.isLedger" #content>
            <p class="text-center font-medium">Secret recovery phrase not available</p>
            <p class="text-center secondary-text">Your secret recovery phrase is stored on your Ledger device.</p>
          </template>
        </tippy>
        <hr v-if="currentWallet.hdPath" class="mx-4 border-bg opacity-80" />
        <div v-if="currentWallet.hdPath" class="p-4">
          HD derivation path
          <span class="inline-flex float-right mt-1">
            <p class="secondary-text -text-1">{{ currentWallet.hdPath }}</p>
          </span>
        </div>
      </div>
    </div>

    <!-- Remove account -->
    <div class="mb-8">
      <div class="bg-fg rounded-xl">
        <div
          class="cursor-pointer p-4 text-negative-text"
          @click="$router.push('/accountRemove/' + $route.params.index)"
        >
          Remove account <Icon name="ChevronRightIcon" :icon-size="1" class="inline-flex float-right mt-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { AccountCreateStates } from '@@/types';

const store = useStore();
const router = useRouter();
const route = useRoute();

const wallet = computed(() => {
  return store.state.extension.wallet;
});

const currentWallet = computed(() => {
  return wallet.value[Number(route.params.index)];
});

const backedUp = (account) => {
  return account.setupState === AccountCreateStates.COMPLETE;
};

const nameFirstLetter = (name) => {
  return name && name.length > 0 ? name.slice(0, 1) : 'S';
};

const goToBackup = () => {
  store.dispatch(GlobalEmerisActionTypes.SET_LAST_ACCOUNT_USED, {
    accountName: currentWallet.value.accountName,
  });
  store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
    currentFlow: `BACKUP_ACCOUNT_${route.params.index}`,
  });
  router.push('/backup');
};
</script>

<style lang="scss" scoped>
.shadow-brand {
  box-shadow: 0.1rem 0.2rem 0.5rem 0.02rem var(--primary);
}
</style>
