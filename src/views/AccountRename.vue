<template>
  <div class="page">
    <Header title="Account Name" :back-to="`/account-settings/${route.params.index}`" />
    <span class="secondary-text mt-4 mb-6">
      If you have multiple accounts this will help you to find the right one
    </span>
    <div class="mb-4">
      <Input v-model="accountName" />
    </div>
    <div class="mt-auto">
      <Button name="Continue" @click="submit" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Header from '@@/components/Header.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const router = useRouter();
const route = useRoute();
const store = useStore();

const accountName = ref('');

const wallet = computed(() => {
  return store.state.extension.wallet;
});
const account = computed(() => {
  return wallet.value[+route.params.index];
});

onMounted(() => {
  accountName.value = account.value.accountName;
});

const submit = async () => {
  try {
    await store.dispatch(GlobalEmerisActionTypes.UPDATE_ACCOUNT, {
      targetAccountName: account.value.accountName,
      newAccountName: accountName.value,
    });
    store.dispatch(GlobalEmerisActionTypes.GET_WALLET);
    router.push('/accounts');
  } catch (err) {
    console.error(err);
  }
};
</script>
