<template>
  <Loader v-if="!account || balances === null" />

  <div v-else-if="balances.length === 0" class="page">
    <img :src="'/images/EmptyPortfolioBG.png'" class="background" />
    <div class="flex relative mb-9">
      <img class="h-6 w-6 absolute" :src="'/images/Avatar.svg'" @click="$router.push('/account')" />
    </div>
    <div class="mt-auto">
      <h1>{{ $t('ext.portfolio.emptyPage.title') }}</h1>
      <p class="secondary-text mb-8 mt-4 text-center">{{ $t('ext.portfolio.emptyPage.subtitle') }}</p>
      <Button name="Receive assets" @click="() => $router.push('/receive')" />
    </div>
  </div>

  <div v-else class="page">
    <img :src="'/images/PortfolioBG.png'" class="background" />
    <div class="flex relative mb-9">
      <img class="h-6 w-6 absolute" :src="'/images/Avatar.svg'" @click="$router.push('/account')" />
      <img class="wordmark" :src="'/images/EmerisWordmark.svg'" />
    </div>

    <span class="secondary-text account-selector mb-2 cursor-pointer" @click="$router.push('/accounts')"
      >{{ account.accountName }} <Icon name="ChevronRightIcon" :icon-size="1"
    /></span>
    <h1 class="text-4xl text-left mb-6">
      <SumBalances :balances="balances" />
    </h1>
    <div class="flex">
      <Button name="Receive" class="mr-3 flex" @click="$router.push('/receive')" />
      <Button name="Send" class="flex-1" variant="secondary" disabled />
    </div>

    <h1 class="text-xl text-left mt-14 mb-6">
      {{ $t('ext.portfolio.assetsHeader') }}
    </h1>
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
    <h1 class="mb-4">{{ $t('ext.portfolio.backupAccount') }}</h1>
    <div class="checkbox inline-flex items-start p-4 rounded-xl border border-solid border-border cursor-pointer mb-6">
      <img class="mt-1 ml-0.5" :src="'/images/BackupIcon.svg'" />
      <p class="checkbox__label ml-4 -text-1 leading-copy">{{ $t('ext.portfolio.backupDetail') }}</p>
    </div>
    <div class="buttons">
      <Button :name="$t('ext.portfolio.backupButton')" @click="() => $router.push('/backup?previous=/accountCreate')" />
      <Button :name="$t('ext.portfolio.backupButtonLater')" variant="link" @click="skipBackup" />
    </div>
  </Slideout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
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

useI18n({ useScope: 'global' });

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

.list-card-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  height: 90px;
  cursor: pointer;

  background: linear-gradient(0deg, #171717 0%, #040404 100%);

  box-shadow: 3px 9px 32px -4px rgba(0, 0, 0, 0.07);
  border-radius: 10px;

  position: relative;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    right: 0;
  }

  .icon {
    position: absolute;
    top: 50%;
    right: 24px;
  }

  .secondary-text {
    font-size: 13px;
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
