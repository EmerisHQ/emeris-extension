<template>
  <div class="page">
    <Header title="Advanced" :show-back="false" />
    <form class="form" @submit.prevent="updateHdPath">
      <span class="my-4">HD derivation path</span>
      <div class="flex mb-4">
        <span class="mr-2 leading-[48px] secondary-text">m/44’/...’/</span>
        <div class="relative mr-2 w-20" :class="{ error: !hdPathRegex.test(account) }">
          <Input v-model="account" /><span class="absolute right-5 top-3.5 z-10">’</span>
        </div>
        <div class="mr-2 w-20 flex items-center justify-center" :class="{ error: !hdPathRegex.test(change) }">
          <!-- We can not actually change the account change in ledger-cosmos-js -->
          {{ change }}
        </div>
        <div class="mr-2 w-20" :class="{ error: !hdPathRegex.test(addressIndex) }">
          <Input v-model="addressIndex" />
        </div>
      </div>
      <span v-if="hdPathError" class="form-info error mb-4">Invalid derivation path</span>

      <a class="text-xs" @click="infoOpen = true">What is an HD derivation path?</a>

      <div class="mt-auto">
        <Button name="Confirm" class="mb-2" :disabled="hdPathError" @click="updateHdPath" />
        <router-link :to="route.query.previous">
          <Button name="Cancel" variant="link" />
        </router-link>
      </div>
    </form>

    <Slideout :open="infoOpen" @update:open="infoOpen = $event">
      <h1 class="mb-4">What is an HD derivation path?</h1>
      <div class="secondary-text mb-6">
        Derivation paths enable you to have multiple accounts under one secret recovery phrase. This is an advanced
        feature, so be sure you understand how derivation paths work before using them. <br />
        What each number represents: m / purpose' / coin_type' / account' / change / address_index
      </div>
      <Button name="Ok" @click="() => (infoOpen = false)" />
    </Slideout>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Header from '@@/components/Header.vue';
import Slideout from '@@/components/Slideout.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';

const hdPathRegex = /^(0|(\d{1,2}|1([0-1]\d|2[0-7])))$/; // 0-127 harding is automatic on the first 3 positions of the hd path hardcoded in leder-cosmos-js

const store = useStore();
const router = useRouter();
const route = useRoute();

const account = ref('0');
const change = ref('0');
const addressIndex = ref('0');

const infoOpen = ref(false);

const newAccount = computed(() => {
  return store.state.extension.newAccount;
});

const updateHdPath = () => {
  if (!hdPathError.value) {
    store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
      ...newAccount.value,
      hdPath: [account.value, change.value, addressIndex.value],
    });
  }
  router.push(route.query.previous);
};

const hdPathError = computed(() => {
  return !hdPathRegex.test(account.value) || !hdPathRegex.test(change.value) || !hdPathRegex.test(addressIndex.value);
});

onMounted(async () => {
  await store.dispatch(GlobalEmerisActionTypes.GET_NEW_ACCOUNT);
  const accountHdPath = newAccount.value?.hdPath;
  if (accountHdPath) {
    account.value = accountHdPath[0];
    change.value = accountHdPath[1];
    addressIndex.value = accountHdPath[2];
  }
});
</script>

<style lang="scss" scoped>
:deep(input) {
  text-align: center;
}
</style>
