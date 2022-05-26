<template>
  <Loader v-if="!account || balances === null" />

  <div v-else-if="balances.length === 0" class="page">
    <img :src="'/images/EmptyPortfolioBG.png'" class="background" />
    <div class="flex relative mb-8">
      <img class="w-6 h-6 absolute" :src="'/images/Avatar.svg'" @click="$router.push('/account')" />
    </div>
    <div class="mt-auto">
      <h1>Get started by funding your wallet</h1>
      <p class="secondary-text mb-8 mt-4 text-center">Send your assets from an exchange or another wallet.</p>
      <Button name="Receive assets" @click="() => $router.push('/receive')" />
    </div>
  </div>

  <div v-else class="page">
    <img :src="'/images/PortfolioBG.png'" class="background" />
    <div class="flex relative mb-8">
      <img class="w-6 h-6 absolute" :src="'/images/Avatar.svg'" @click="$router.push('/account')" />
      <img class="wordmark" :src="'/images/EmerisWordmark.svg'" />
    </div>

    <span class="secondary-text account-selector mb-2 cursor-pointer" @click="$router.push('/accounts')"
      >{{ account.accountName }} <Icon name="ChevronRightIcon" :icon-size="1"
    /></span>
    <h1 class="text-2 text-left mb-6">
      <SumBalances :balances="balances" />
    </h1>
    <div class="flex">
      <Button name="Receive" class="mr-3 flex-1" @click="$router.push('/receive')" />
      <Button name="Send" variant="secondary" class="flex-1" disabled />
    </div>

    <h1 class="text-left mt-14 mb-6 text-1">Assets</h1>
    <AssetsTable
      v-if="balances && balances.length > 0 && verifiedDenoms"
      class="mb-6"
      :balances="balances"
      :hide-zero-assets="true"
      variant="balance"
      :show-headers="false"
      :limit-rows="4"
    />
  </div>
  <Slideout :open="showMnemonicBackup" @update:open="() => {}">
    <h1 class="mb-4">Back up your account</h1>
    <div class="mb-6 checkbox inline-flex items-start p-4 rounded-xl border border-solid border-border cursor-pointer">
      <img class="mt-1 ml-0.5" :src="'/images/BackupIcon.svg'" />
      <p class="checkbox__label ml-4 -text-1 leading-copy">Your assets are not secured. Please back up your wallet.</p>
    </div>
    <div class="buttons">
      <Button name="Back up now" @click="() => $router.push('/backup?previous=/accountCreate')" />
      <Button name="Back up later" variant="link" @click="skipBackup" />
    </div>
  </Slideout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

import AssetsTable from '@/components/assets/AssetsTable/AssetsTable.vue';
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import { GlobalGetterTypes } from '@/store';
import Loader from '@@/components/Loader.vue';
import Slideout from '@@/components/Slideout.vue';
import SumBalances from '@@/components/SumBalances.vue';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { AccountCreateStates, BalanceDenom } from '@@/types/index';
import { webDebugging } from '@@/utils/web-debugging';

const store = useStore();

const CHECK_INTERVAL_SECONDS = 60 * 60 * 24; //  1 day

const showMnemonicBackup = ref(false);

const account = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getAccount];
});

const verifiedDenoms = computed(() => {
  return store.getters[GlobalGetterTypes.API.getVerifiedDenoms];
});

const balances = computed(() => {
  if (!account.value) {
    return undefined;
  }
  return store.getters[GlobalEmerisGetterTypes.getAllBalances](account.value).filter((b: BalanceDenom) => b.verified);
});

watch(account.value, (newValue) => {
  if (newValue.setupState === AccountCreateStates.COMPLETE) {
    showMnemonicBackup.value = false;
  }
});

onMounted(async () => {
  if (import.meta.env.MODE === 'web') {
    await webDebugging();
  }
  if (account.value && account.value.setupState !== AccountCreateStates.COMPLETE) {
    const localStorageKey = `nextBackupCheck-${account.value.accountName}`;
    const nextCheckTimestamp = Number(window.localStorage.getItem(localStorageKey));
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (isNaN(nextCheckTimestamp) || nowInSeconds - nextCheckTimestamp > 0) {
      showMnemonicBackup.value = true;
    }
  }
});

const skipBackup = () => {
  const localStorageKey = `nextBackupCheck-${account.value.accountName}`;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  window.localStorage.setItem(localStorageKey, `${nowInSeconds + CHECK_INTERVAL_SECONDS}`);
  showMnemonicBackup.value = false;
};
</script>
<style lang="scss" scoped>
.wordmark {
  margin-left: auto;
  margin-right: auto;
  display: block;
}

.account-selector {
  .icon {
    display: inline-block;
    transform: rotate(90deg) translateX(2px);
  }
}

// HACK should be incorporated in demeris component
:deep(.assets-table__row) {
  position: relative;
  display: flex;
  width: 100%;

  td:nth-child(2) {
    position: absolute;
    left: 70px;
    top: 18px;
    text-align: left;
    opacity: 0.67;
    width: 1px;
    font-size: 13px;
  }

  td:nth-child(1) {
    width: 175px;
  }

  td:nth-child(1) > div > :nth-child(2) {
    position: relative;
    top: -10px;
  }

  td:nth-child(3) {
    width: 125px;
  }

  td:nth-child(4) {
    display: flex;

    span:nth-child(2) {
      display: none;
    }
  }
}
</style>
