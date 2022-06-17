<template>
  <div class="buttons">
    <Button name="Create account" @click="createWalletRoute" />
    <Button name="Import Account" variant="secondary" @click="importAccountRoute" />
    <Button name="Import Ledger" variant="link" @click="toLedger" />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

import Button from '@/components/ui/Button.vue';
import { useStore } from '@/utils/useStore';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const store = useStore();
const router = useRouter();

const toLedger = () => {
  window.open('popup.html#/ledger?next=/ledger/connect');
};

const createWalletRoute = () => {
  store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
    currentFlow: 'CREATE_ACCOUNT',
  });
  router.push('/welcome/create');
};

const importAccountRoute = () => {
  router.push('/welcome/account-import-info');
};
</script>

<style lang="scss" scoped>
.buttons > *:not(:last-child) {
  @apply mb-4 block;
}
</style>
