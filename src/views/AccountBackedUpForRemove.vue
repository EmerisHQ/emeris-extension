<template>
  <div class="page">
    <img class="mx-auto mt-20 h-12 w-12" src="/images/check-brand.png" />
    <h1 class="mt-8 mb-2">Account backed up</h1>
    <div class="secondary-text mb-6 text-center">
      You can use your secret recovery phrase to import your account into any compatible crypto wallet.
    </div>
    <div class="mt-auto">
      <Button class="reset-btn mb-4" name="Continue removing account" @click="removeWallet" />
      <Button name="Back to account settings" variant="link" @click="goBackHome" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import Button from '@/components/ui/Button.vue';
import { useStore } from '@/utils/useStore';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';

const store = useStore();
const router = useRouter();

const account = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getAccount];
});

const removeWallet = async () => {
  await store.dispatch(GlobalEmerisActionTypes.REMOVE_ACCOUNT, { accountName: account.value.accountName });
  router.push('/accounts');
};

const goBackHome = () => {
  store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
    currentFlow: '',
  });
  router.push('/');
};
</script>

<style lang="scss" scoped>
:deep(.reset-btn button) {
  background: #ff3d56 !important;
}
</style>
