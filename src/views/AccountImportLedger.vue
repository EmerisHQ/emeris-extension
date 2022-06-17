<template>
  <div class="page">
    <Header title="Import account">
      <a @click="toHdPath">Advanced</a>
    </Header>
    <img :src="'/images/ImportLedgerBG.png'" class="background" />
    <div class="block mx-auto mb-14 mt-[72px]">
      <img class="w-[151px]" :src="'/images/LedgerBox.svg'" />
    </div>
    <ListCard :img="'/images/Step1.svg'" caption="Unlock & connect your Ledger device with your computer" />
    <ListCard :img="'/images/Step2.svg'" caption="Open the ‘Cosmos’ app on your Ledger device" />

    <div v-if="error" class="mt-4 text-center text-negative-text">{{ error }}</div>

    <a class="secondary-text mt-6">Having trouble connecting your Ledger?</a>
    <div class="mt-auto">
      <Button name="Connect Ledger" @click="next()" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
import ListCard from '@@/components/ListCard.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const store = useStore();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const hasPassword = await store.dispatch(GlobalEmerisActionTypes.HAS_WALLET); // the wallet is encrypted with the password so the existence is equal
  if (!hasPassword) {
    router.push({ path: '/password-create', query: { returnTo: route.path } });
  }

  store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
    ...store.state.extension.newAccount,
    route: route.path,
  });
});

const toHdPath = () => {
  router.push(`${route.path}/account-import-HD-path`);
};

const next = () => {
  // we use the same component for account gathering and signing
  router.push(route.query.next);
};
</script>
