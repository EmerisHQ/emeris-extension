<template>
  <div class="page">
    <Header title="Import account" :back-to="headerGoBackUrl">
      <a
        :style="{
          opacity: !mnemonic || hasInvalidChar || unknownWords.length > 0 ? 0.6 : 1,
        }"
        @click="toHdPath"
        >Advanced</a
      >
    </Header>
    <div class="form" @keyup.enter="submit">
      <span style="margin-top: 16px; margin-bottom: 16px">Enter your recovery phrase</span>
      <div style="margin-bottom: 16px">
        <MnemonicInput v-model="mnemonic" placeholder="Your recovery phrase" />
      </div>
      <span v-if="hasInvalidChar" class="form-info error">Invalid character used</span>
      <span v-if="mnemonic && unknownWords.length > 0" class="form-info error"
        >Unknown words found: {{ unknownWords.join(', ') }}</span
      >
      <a @click="infoOpen = true">What’s a recovery phrase?</a>
      <div
        :style="{
          marginTop: 'auto',
        }"
      >
        <Button type="submit" name="Import" :disabled="!mnemonic || unknownWords.length > 0" @click="submit" />
      </div>
    </div>
    <Modal
      title="Invalid recovery phrase"
      description="Check you have entered your recovery phrase correctly and try again."
      :open="invalidRecoveryPhraseWarning"
      @close="invalidRecoveryPhraseWarning = false"
    ></Modal>
    <Slideout :open="infoOpen" @update:open="infoOpen = $event">
      <h1 style="margin-bottom: 16px">What’s a recovery phrase?</h1>
      <div class="secondary-text" style="margin-bottom: 24px">
        These phrases are usually 12 or 24 words long. Each word in the phrase tends to be unrelated to another. Wallet
        providers will usually provide you a mnemonic phrase when you open a new account, this phrase will help you to
        import your wallet.
      </div>
      <Button name="Ok" @click="() => (infoOpen = false)" />
    </Slideout>
  </div>
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
import MnemonicInput from '@@/components/MnemonicInput.vue';
import Modal from '@@/components/Modal.vue';
import Slideout from '@@/components/Slideout.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { GlobalEmerisGetterTypes } from '@@/store/extension/getter-types';
import { AccountCreateStates } from '@@/types';
import wordlist from '@@/wordlists/english.json';

const store = useStore();
const router = useRouter();

const mnemonicFormat = (mnemonic) => mnemonic.trim().replace(/\s/, ' ');

const mnemonic = ref(undefined);
const invalidRecoveryPhraseWarning = ref(false);
const infoOpen = ref(false);
const hasInvalidChar = ref(false);
const unknownWords = ref([]);

const submit = () => {
  if (!hasInvalidChar.value && unknownWords.value.length === 0) {
    storeNewAccount();
    router.push({ path: '/accountCreate' });
  }
};

const toHdPath = () => {
  if (!hasInvalidChar.value && unknownWords.value.length === 0) {
    storeNewAccount();
    router.push('/accountImportHdPath?previous=/accountImport');
  }
};

const storeNewAccount = () => {
  store.dispatch(GlobalEmerisActionTypes.SET_NEW_ACCOUNT, {
    ...store.state.extension.newAccount,
    accountMnemonic: mnemonicFormat(mnemonic.value),
    setupState: AccountCreateStates.COMPLETE,
    route: '/accountImport',
  });
};

const getNewAccount = async () => {
  const newAccount = await store.dispatch(GlobalEmerisActionTypes.GET_NEW_ACCOUNT);

  mnemonic.value = newAccount.accountMnemonic;

  storeNewAccount();
};

const hasAccount = computed(() => {
  return store.getters[GlobalEmerisGetterTypes.getAccount] ? true : false;
});

const headerGoBackUrl = computed(() => {
  return hasAccount.value ? '/portfolio' : '/welcome';
});

watch(mnemonic, (newValue: string) => {
  if (newValue) {
    hasInvalidChar.value = !/^[a-z\s]*$/.test(newValue);

    const wordList = mnemonicFormat(newValue).split(' ');
    unknownWords.value = wordList.filter((word) => !wordlist.includes(word));

    storeNewAccount();
  }
});

onMounted(async () => {
  const hasPassword = await store.dispatch(GlobalEmerisActionTypes.HAS_WALLET);

  if (!hasPassword) {
    router.push({ path: '/passwordCreate', query: { returnTo: '/accountImport' } });
  }

  getNewAccount();
});
</script>
<style lang="scss" scoped>
.form-info {
  &.error {
    color: #ff6072;
  }
  &.success {
    color: #89ff9b;
  }
}
</style>
