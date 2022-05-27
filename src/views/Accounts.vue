<template>
  <div class="page">
    <Header title="Accounts" back-to="/account">
      <a v-if="!edit" @click="edit = true">Edit</a>
      <a v-else @click="edit = false">Done</a>
    </Header>
    <div
      v-for="(account, index) in wallet"
      :key="account.accountName"
      class="wallet"
      @click="!edit && goToAccount(account)"
    >
      <img :src="'/images/Avatar.svg'" class="h-10 w-10" />
      <div class="cursor-pointer">
        <h2 class="font-semibold">{{ account.accountName }}</h2>
        <span v-if="backedUp(account)" class="secondary-text"><SumBalances :balances="balances(account)" /></span>
        <span v-else>
          <SumBalances :balances="balances(account)" small-decimals class="secondary-text inline-block" />
          <span style="color: #ff6072; font-size: 13px"> · Not backed up</span>
        </span>
      </div>
      <div v-if="account.isLedger" class="flex flex-col ml-auto justify-center">
        <span class="py-1 px-3 text-[13px] text-text bg-surface-2 rounded-2xl">Ledger</span>
      </div>
      <Icon
        v-if="edit"
        class="cursor-pointer"
        :class="{ 'ml-auto': !account.isLedger, 'ml-3': account.isLedger }"
        name="ThreeDotsIcon"
        :icon-size="1.5"
        @click="$router.push(`/account-settings/${index}`)"
      />
      <div
        v-else-if="account.accountName === lastAccount"
        class="flex flex-col justify-center"
        :class="{ 'ml-auto': !account.isLedger, 'ml-3': account.isLedger }"
      >
        <img class="h-6" :src="'/images/CheckmarkCircle.svg'" alt="Checkmark" />
      </div>
    </div>
    <div class="mt-auto">
      <Button name="Add account" @click="addAdditionalAccount = true" />
    </div>

    <!-- Add Additional Account -->
    <Slideout :open="addAdditionalAccount" @update:open="() => (addAdditionalAccount = null)">
      <Button class="mb-1 text-text" name="Create account" variant="link" @click="goToCreateAccount()" />
      <hr class="mb-1 opacity-[0.14]" />
      <Button class="mb-1 text-text" name="Import account" variant="link" @click="goToImportAccount()" />
      <hr class="mb-1 opacity-[0.14]" />
      <div class="font-semibold">
        <Button name="Cancel" variant="link" @click="() => (addAdditionalAccount = null)" />
      </div>
    </Slideout>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import { GlobalActionTypes } from '@/store';
import Header from '@@/components/Header.vue';
import Slideout from '@@/components/Slideout.vue';
import SumBalances from '@@/components/SumBalances.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { AccountCreateStates } from '@@/types';

const store = useStore();
const router = useRouter();

const addAdditionalAccount = ref(false);
const edit = ref(false);

const wallet = computed(() => {
  return store.state.extension.wallet;
});
const lastAccount = computed(() => {
  return store.state.extension.lastAccount;
});

watch(wallet.value, (newWallet) => {
  if (newWallet && newWallet.length > 0) loadBalances();
  if (newWallet && newWallet.length === 0) router.push('/welcome');
});

const goToCreateAccount = () => {
  store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
    currentFlow: 'CREATE_ACCOUNT',
  });
  router.push('/create');
};

const goToImportAccount = () => {
  store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
    currentFlow: 'NEW_ACCOUNT_IMPORT',
  });
  router.push('/accountImportInfo');
};

const goToAccount = (account) => {
  store.dispatch(GlobalEmerisActionTypes.SET_LAST_ACCOUNT_USED, {
    accountName: account.accountName,
  });
  store.dispatch(GlobalEmerisActionTypes.GET_WALLET);
  store.dispatch(GlobalEmerisActionTypes.LOAD_SESSION_DATA);
  router.push('/portfolio');
};

const backedUp = (account) => {
  return account.setupState === AccountCreateStates.COMPLETE;
};

const loadBalances = () => {
  wallet.value.forEach((account) => {
    if (!store.getters[GlobalEmerisGetterTypes.getAllBalances](account)) {
      store.dispatch(GlobalActionTypes.API.GET_BALANCES, {
        subscribe: true,
        params: { address: account.keyHash },
      });
    }
  });
};

const balances = (account) => {
  return store.getters[GlobalEmerisGetterTypes.getAllBalances](account) || [];
};
</script>

<style lang="scss" scoped>
.wallet {
  @apply flex mb-6;

  > img {
    @apply h-12 w-12 mr-4 mt-2;
  }
}

:deep(.total-price) {
  * {
    font-size: 13px !important;
  }
}
</style>
