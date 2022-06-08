<template>
  <div class="page">
    <Header title="Settings" back-to="/account" />

    <!-- Wallet settings -->
    <div class="mb-8">
      <p class="secondary-text -text-1 mb-3">Wallet settings</p>
      <div class="bg-fg rounded-xl">
        <div class="cursor-pointer p-4" @click="$router.push('/security')">
          Security
          <Icon name="ChevronRightIcon" :icon-size="1" class="inline-flex float-right mt-1" />
        </div>
        <hr class="mx-4 border-bg opacity-80" />
        <div
          class="cursor-pointer p-4"
          :class="{
            'pointer-events-none secondary-text': whitelistedWebsites.length === 0,
          }"
          @click="$router.push('/whitelisted')"
        >
          Authorized websites
          <span class="inline-flex float-right mt-1">
            <p class="secondary-text -text-1">{{ whitelistedWebsites.length }}</p>
            <Icon name="ChevronRightIcon" :icon-size="1" class="ml-2" />
          </span>
        </div>
        <hr class="mx-4 border-bg opacity-80" />
        <div class="cursor-pointer p-4 pointer-events-none secondary-text">
          Connected chains
          <span class="inline-flex float-right mt-1">
            <p class="secondary-text -text-1">0</p>
            <Icon name="ChevronRightIcon" :icon-size="1" class="ml-2" />
          </span>
        </div>
        <hr class="mx-4 border-bg opacity-80" />
        <div class="cursor-pointer p-4" @click="$router.push('/signoutConfirm')">
          Sign out <Icon name="ChevronRightIcon" :icon-size="1" class="inline-flex float-right mt-1" />
        </div>
      </div>
    </div>

    <!-- Account settings -->
    <div class="mb-8">
      <p class="secondary-text -text-1 mb-3">Account settings</p>
      <div class="bg-fg rounded-xl mb-4">
        <div v-for="(account, index) in wallet" :key="account.accountName">
          <div class="cursor-pointer p-4 flex justify-between items-center" @click="goToAccount(account)">
            <div class="flex">
              <div
                class="mr-4 bg-brand w-9 h-9 rounded-full text-center font-medium text-1 text-inverse pt-1.5 shadow-brand"
              >
                {{ nameFirstLetter(account.accountName) }}
              </div>
              <div>
                <h2 class="font-medium">{{ account.accountName }}</h2>
                <span class="secondary-text -text-2 flex">
                  <SumBalances :balances="balances(account)" /><span
                    v-if="!backedUp(account)"
                    class="text-negative-text ml-1"
                  >
                    · Not backed up</span
                  >
                </span>
              </div>
            </div>
            <span class="inline-flex mt-1">
              <span v-if="account.isLedger" class="py-1.5 px-3 bg-surface-2 rounded-2xl -text-2 text-white">
                Ledger
              </span>
              <Icon name="ChevronRightIcon" :icon-size="1" class="ml-2" />
            </span>
          </div>
          <hr v-if="index !== wallet.length - 1" class="mx-4 border-bg opacity-80" />
        </div>
      </div>
      <div class="bg-fg rounded-xl">
        <div class="cursor-pointer p-4 flex justify-between items-center" @click="$router.push('/create')">
          <div class="flex">
            <div class="mr-4 bg-text w-6 h-6 rounded-full text-center text-inverse text-1 pt-1">
              <Icon name="PlusIcon" :icon-size="1" />
            </div>
            Create account
          </div>
          <span class="inline-flex mt-1">
            <Icon name="ChevronRightIcon" :icon-size="1" />
          </span>
        </div>
        <hr class="mx-4 border-bg opacity-80" />
        <div class="cursor-pointer p-4 flex justify-between items-center" @click="$router.push('/accountImportInfo')">
          <div class="flex">
            <div class="mr-4 bg-text w-6 h-6 rounded-full text-center text-inverse text-1 pt-1.5">
              <Icon name="ArrowDownIcon" :icon-size="0.7" />
            </div>
            Import account
          </div>
          <span class="inline-flex mt-1">
            <Icon name="ChevronRightIcon" :icon-size="1" />
          </span>
        </div>
        <hr class="mx-4 border-bg opacity-80" />
        <div class="cursor-pointer p-4 flex justify-between items-center" @click="toLedger">
          <div class="flex">
            <div class="mr-4 bg-text w-6 h-6 rounded-full text-center text-inverse text-1 pt-1.5">
              <Icon name="ArrowDownIcon" :icon-size="0.7" />
            </div>
            Import Ledger account
          </div>
          <span class="inline-flex mt-1">
            <Icon name="ChevronRightIcon" :icon-size="1" />
          </span>
        </div>
      </div>
    </div>

    <!-- Explore emeris -->
    <div class="mb-4">
      <p class="secondary-text -text-1 mb-3">Explore Emeris</p>
      <div class="bg-fg rounded-xl">
        <div
          class="cursor-pointer p-4"
          @click="
            $router.push({
              path: '/support',
              query: { url: 'https://emeris.com', caption: 'Emeris web app' },
            })
          "
        >
          Emeris Web App
          <Icon name="DaggArrowRightIcon" :icon-size="1" class="inline-flex float-right mt-1 -rotate-45" />
        </div>
        <hr class="mx-4 border-bg opacity-80" />
        <div
          class="cursor-pointer p-4"
          @click="
            $router.push({
              path: '/support',
              query: { url: 'https://emeris.com/support', caption: 'Emeris Support' },
            })
          "
        >
          Emeris Support
          <Icon name="DaggArrowRightIcon" :icon-size="1" class="inline-flex float-right mt-1 -rotate-45" />
        </div>
        <hr class="mx-4 border-bg opacity-80" />
        <div
          class="cursor-pointer p-4"
          @click="
            $router.push({
              path: '/support',
              query: { url: 'https://t.me/EmerisHQ', caption: 'Telegram community' },
            })
          "
        >
          Telegram Emeris community
          <Icon name="DaggArrowRightIcon" :icon-size="1" class="inline-flex float-right mt-1 -rotate-45" />
        </div>
        <hr class="mx-4 border-bg opacity-80" />
        <div
          class="cursor-pointer p-4"
          @click="
            $router.push({
              path: '/support',
              query: { url: 'https://twitter.com/emerishq', caption: 'Twitter' },
            })
          "
        >
          Twitter
          <Icon name="DaggArrowRightIcon" :icon-size="1" class="inline-flex float-right mt-1 -rotate-45" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import SumBalances from '@@/components/SumBalances.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { AccountCreateStates } from '@@/types';

const store = useStore();
const router = useRouter();

const wallet = computed(() => {
  return store.state.extension.wallet;
});

const whitelistedWebsites = computed(() => {
  return [0, 1, 2, 3];
  // return store.state.extension.whitelistedWebsites;
});

const backedUp = (account) => {
  return account.setupState === AccountCreateStates.COMPLETE;
};

const balances = (account) => {
  return store.getters[GlobalEmerisGetterTypes.getAllBalances](account) || [];
};

const nameFirstLetter = (name) => {
  return name && name.length > 0 ? name.slice(0, 1) : 'S';
};

const goToAccount = (account) => {
  store.dispatch(GlobalEmerisActionTypes.SET_LAST_ACCOUNT_USED, {
    accountName: account.accountName,
  });
  store.dispatch(GlobalEmerisActionTypes.GET_WALLET);
  store.dispatch(GlobalEmerisActionTypes.LOAD_SESSION_DATA);
  router.push('/portfolio');
};

const toLedger = () => {
  window.open('popup.html#/ledger?next=/ledger/connect');
};
</script>

<style lang="scss" scoped>
.shadow-brand {
  box-shadow: 0.1rem 0.2rem 0.5rem 0.02rem var(--primary);
}
</style>
