<template>
  <div class="page">
    <Header title="Remove account" />
    <div v-if="!backedUp(account)" class="text-center mt-10">
      <Icon name="WarningTriangleIcon" :icon-size="2" class="text-warning mb-4" />
      <p class="font-medium text-2 mb-4">This account is not backed up</p>
      <p class="secondary-text">
        If you haven’t backed up your secret recovery phrase, you may lose assets associated with this account. Are you
        sure you want to remove it?
      </p>
    </div>
    <div v-else class="text-center mt-32">
      <Icon name="InformationIcon" :icon-size="2" class="mb-4" />
      <p class="font-medium text-2">Are you sure you want to remove {{ account.accountName }} account?</p>
    </div>
    <div class="mt-auto">
      <Button class="reset-btn mb-4" name="Remove account" @click="removeWallet" />
      <Button v-if="!backedUp(account)" class="mb-4" variant="secondary" name="Back up account" @click="backUpWallet" />
      <Button name="Cancel" variant="link" @click="router.push(currentRoute)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Icon from '@/components/ui/Icon.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { AccountCreateStates } from '@@/types';

const store = useStore();
const router = useRouter();
const route = useRoute();

const currentRoute = ref(route.path.split('/').slice(0, -1).join('/') ?? '/');

const wallet = computed(() => {
  return store.state.extension.wallet;
});

const account = computed(() => {
  return wallet.value[+route.params.index];
});

const backedUp = (account) => {
  return account.setupState === AccountCreateStates.COMPLETE;
};

const removeWallet = async () => {
  await store.dispatch(GlobalEmerisActionTypes.REMOVE_ACCOUNT, { accountName: account.value.accountName });
  router.push('/accounts');
};

const backUpWallet = () => {
  store.dispatch(GlobalEmerisActionTypes.SET_CURRENT_FLOW, {
    currentFlow: 'REMOVE_ACCOUNT',
  });
  store.dispatch(GlobalEmerisActionTypes.SET_LAST_ACCOUNT_USED, {
    accountName: account.value.accountName,
  });
  router.push(`${route.path}/backup`);
};
</script>

<style lang="scss" scoped>
:deep(.reset-btn button) {
  background: #ff3d56 !important;
}
</style>
