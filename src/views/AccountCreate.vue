<template>
  <Loader v-if="loading" />
  <div v-else class="page">
    <Header title="Account Name" :back-to="backTo" />
    <div class="w-3/4 mx-auto mt-10">
      <div
        class="bg-brand w-16 h-16 rounded-full text-center font-medium text-2 text-inverse pt-3.5 mx-auto shadow-brand"
      >
        {{ nameFirstLetter }}
      </div>
      <div class="my-6">
        <input
          v-model="name"
          type="text"
          class="w-full border-none !bg-transparent text-center font-medium text-2 focus:outline-none focus:border-none"
          :class="{
            'text-negative-text': error || nameHasSpecialCharacters,
            'pointer-events-none': isReturningFromBackup,
          }"
          placeholder="Surfer"
          style="caret-color: rgba(255, 255, 255, 0.5)"
        />
        <p v-if="errorText" class="form-info error text-center mt-6">
          {{ errorText }}
        </p>
      </div>
    </div>
    <div class="mt-auto">
      <Button name="Continue" :disabled="buttonDisabled" @click="submit" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as bip39 from 'bip39';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
import Loader from '@@/components/Loader.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { AccountCreateStates } from '@@/types';
import wordlist from '@@/wordlists/english.json';

const router = useRouter();
const route = useRoute();
const store = useStore();

const name = ref(undefined);
const loading = ref(false);

const wallet = computed(() => {
  return store.state.extension.wallet;
});
const lastAccount = computed(() => {
  return store.state.extension.lastAccount;
});
const newAccount = computed(() => {
  return store.state.extension.newAccount;
});

const isReturningFromBackup = computed(() => {
  return route.query.previous === '/backup';
});

const nameFirstLetter = computed(() => {
  return name.value && name.value.length > 0 ? name.value.slice(0, 1) : 'S';
});

const nameHasSpecialCharacters = computed(() => {
  return /[^a-zA-Z0-9\s]/.test(name.value);
});
const buttonDisabled = computed(() => {
  return !name.value || error.value || nameHasSpecialCharacters.value;
});
const error = computed(() => {
  return (
    wallet.value && wallet.value.find(({ accountName }) => accountName === name.value) && !isReturningFromBackup.value
  );
});
const errorText = computed(() => {
  if (error.value) return 'You already used this name for another account. Choose another name.';
  if (nameHasSpecialCharacters.value) return 'Name cannot contain special characters, only numbers and letters.';
  return '';
});

const currentFlow = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getCurrentFlow];
});
const backTo = computed(() => {
  if (currentFlow.value === 'CREATE_ACCOUNT') return '/welcome';
  if (currentFlow.value === 'NEW_CREATE_ACCOUNT') return '/accounts';
  return '/settings';
});

watch(name.value, (newValue) => {
  store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
    ...newAccount.value,
    accountName: newValue,
  });
});

onMounted(async () => {
  const hasPassword = await store.dispatch(GlobalEmerisActionTypes.HAS_WALLET); // the wallet is encrypted with the password so the existence is equal
  if (!hasPassword) {
    router.push({
      path: '/passwordCreate',
      query: { returnTo: route.fullPath },
    });
  }

  const accounts = (await store.dispatch(GlobalEmerisActionTypes.GET_WALLET)) || [];

  // find an unused account name
  if (isReturningFromBackup.value) {
    name.value = lastAccount.value;
  } else {
    let generatedName;
    let i = 1;
    do {
      generatedName = 'Surfer ' + i++;
    } while (accounts.find(({ accountName }) => accountName === generatedName));

    name.value = generatedName;
    store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
      ...newAccount.value,
      route: '/accountCreate',
    });
  }
});

const submit = async () => {
  loading.value = true;
  try {
    if (!isReturningFromBackup.value) {
      const aMnemonic = bip39.generateMnemonic(256, null, wordlist);

      await store.dispatch(GlobalEmerisActionTypes.CREATE_ACCOUNT, {
        account: {
          accountName: name.value,
          accountMnemonic: aMnemonic, // will be overwritten by existing new account
          isLedger: false, // will be overwritten by existing new account
          setupState: newAccount.value?.setupState || AccountCreateStates.CREATED, // if this is an import we don't need to check if the user backed up the mnemonic
          ...newAccount.value,
        },
      });
    }

    // if the account is imported we don't need to show the backup seed screen
    let nextRoute;
    if (newAccount.value?.setupState === AccountCreateStates.COMPLETE) {
      nextRoute = '/accountImportReady';
    } else {
      nextRoute = '/backup?previous=/accountCreate';
    }

    await store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, undefined); // remove new account from flow
    router.push(nextRoute);
  } catch (err) {
    console.error(err);
  }
  loading.value = false;
};
</script>

<style scoped>
.terms-of-use {
  font-size: 13px;
}
.shadow-brand {
  box-shadow: 0.1rem 0.2rem 0.5rem 0.02rem var(--primary);
}
</style>
