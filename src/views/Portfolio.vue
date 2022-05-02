<template>
  <Loader v-if="!account || balances === null" />

  <div v-else-if="balances.length === 0" class="page">
    <img :src="'/images/EmptyPortfolioBG.png'" class="background" />
    <div style="display: flex; position: relative; margin-bottom: 36px">
      <img
        style="height: 24px; width: 24px; position: absolute"
        :src="'/images/Avatar.svg'"
        @click="$router.push('/account')"
      />
    </div>
    <div style="margin-top: auto">
      <h1>Get started by funding your wallet</h1>
      <p class="secondary-text" style="margin-bottom: 32px; margin-top: 16px; text-align: center">
        Send your assets from an exchange or another wallet.
      </p>
      <Button name="Receive assets" @click="() => $router.push('/receive')" />
    </div>
  </div>

  <div v-else class="page">
    <img :src="'/images/PortfolioBG.png'" class="background" />
    <div style="display: flex; position: relative; margin-bottom: 36px">
      <img
        style="height: 24px; width: 24px; position: absolute"
        :src="'/images/Avatar.svg'"
        @click="$router.push('/account')"
      />
      <img class="wordmark" :src="'/images/EmerisWordmark.svg'" />
    </div>

    <span
      class="secondary-text account-selector"
      style="margin-bottom: 8px; cursor: pointer"
      @click="$router.push('/accounts')"
      >{{ account.accountName }} <Icon name="ChevronRightIcon" :icon-size="1"
    /></span>
    <h1 style="font-size: 38px; text-align: left; margin-bottom: 24px">
      <SumBalances :balances="balances" />
    </h1>
    <div style="display: flex">
      <Button name="Receive" style="margin-right: 12px; flex: 1" @click="$router.push('/receive')" />
      <Button name="Send" variant="secondary" style="flex: 1" disabled />
    </div>

    <h1 style="font-size: 21px; text-align: left; margin-top: 56px; margin-bottom: 24px">Assets</h1>
    <AssetsTable
      v-if="balances && balances.length > 0 && verifiedDenoms"
      style="margin-bottom: 24px"
      :balances="balances"
      :hide-zero-assets="true"
      variant="balance"
      :show-headers="false"
      :limit-rows="4"
    />
  </div>
  <Slideout :open="showMnemonicBackup" @update:open="() => {}">
    <h1 style="margin-bottom: 16px">Back up your account</h1>
    <div
      style="margin-bottom: 24px"
      class="checkbox inline-flex items-start p-4 rounded-xl border border-solid border-border cursor-pointer"
    >
      <img class="mt-1 ml-0.5" :src="'/images/BackupIcon.svg'" />
      <p class="checkbox__label ml-4 -text-1 leading-copy">Your funds are not secured, please backup your wallet.</p>
    </div>
    <div class="buttons">
      <Button name="Continue" @click="() => $router.push('/backup/password')" />
      <Button name="Back up later" variant="link" @click="skipBackup" />
    </div>
  </Slideout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import AssetsTable from '@/components/assets/AssetsTable/AssetsTable.vue';
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import { GlobalGetterTypes as GlobalApiGetterTypes } from '@/store/demeris-api/getter-types';
import Loader from '@@/components/Loader.vue';
import Slideout from '@@/components/Slideout.vue';
import { useExtensionStore } from '@@/store';
import SumBalances from '@@/components/SumBalances.vue';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { AccountCreateStates } from '@@/types/index';
import { webDebugging } from '@@/utils/web-debugging';

const store = useExtensionStore();

const CHECK_INTERVAL_SECONDS = 60 * 60 * 24; //  1 day

const showMnemonicBackup = ref(false);

const account = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getAccount];
});

const verifiedDenoms = computed(() => {
  return store.getters[GlobalApiGetterTypes.getVerifiedDenoms];
});

const balances = computed(() => {
  if (!account.value) {
    return undefined;
  }
  return store.getters[GlobalEmerisGetterTypes.getAllBalances](account.value);
});

watch(account.value, (newValue) => {
  if (newValue.setupState === AccountCreateStates.COMPLETE) {
    showMnemonicBackup.value = false;
  }
});

onMounted(async () => {
  await webDebugging();
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
