<template>
  <div class="page">
    <Header title="Import account" :back-to="'/accountImportInfo'">
      <a
        :style="{
          opacity: !mnemonic || hasInvalidChar || unknownWords.length > 0 ? 0.6 : 1,
        }"
        @click="toHdPath"
        >Advanced</a
      >
    </Header>
    <div class="form" @keyup.enter="submit">
      <span class="my-4">Enter your secret recovery phrase</span>
      <div class="mb-4">
        <MnemonicInput v-model="mnemonic" placeholder="Your recovery phrase" />
      </div>
      <span v-if="errorText" class="form-info error">{{ errorText }}</span>
      <a class="text-sm" @click="infoOpen = true">What’s a secret recovery phrase?</a>
      <div class="mt-auto">
        <Button type="submit" name="Import" :disabled="isMnemonicInvalid" @click="submit" />
      </div>
    </div>
    <Slideout :open="infoOpen" @update:open="infoOpen = $event">
      <h1 class="mb-4">What’s a secret recovery phrase?</h1>
      <div class="secondary-text mb-6">
        A secret recovery phrase is series of words (usually 12 or 24) used to generate the encryption keys that give
        you access to your crypto account. If your device is stolen or lost, you can regain access to your account by
        importing the secret recovery phrase into another crypto wallet. So always store it securely (for example,
        written down and hidden somewhere safe), and never share it with anyone, since whoever has it can access your
        account, sign transactions, and steal your assets.
      </div>
      <Button name="Ok" @click="() => (infoOpen = false)" />
    </Slideout>
  </div>
</template>

<script setup lang="ts">
import { Secp256k1HdWallet } from '@cosmjs/amino';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from '@/components/ui/Button.vue';
import Header from '@@/components/Header.vue';
import MnemonicInput from '@@/components/MnemonicInput.vue';
import Slideout from '@@/components/Slideout.vue';
import { GlobalEmerisActionTypes } from '@@/store/extension/action-types';
import { AccountCreateStates } from '@@/types';
import wordlist from '@@/wordlists/english.json';

const store = useStore();
const router = useRouter();

const mnemonicFormat = (mnemonic) => mnemonic?.trim().replace(/\s/, ' ');

const mnemonic = ref(undefined);
const invalidRecoveryPhraseWarning = ref(false);
const infoOpen = ref(false);
const hasInvalidChar = ref(false);
const unknownWords = ref([]);

const isMnemonicInvalid = computed(() => {
  return (
    !mnemonic.value ||
    unknownWords.value.length > 0 ||
    invalidRecoveryPhraseWarning.value ||
    mnemonicFormat(mnemonic.value).split(' ').length < 12
  );
});

const errorText = computed(() => {
  if (hasInvalidChar.value) return 'Invalid character used';
  if (mnemonic.value && unknownWords.value.length > 0) return `Unknown words found: ${unknownWords.value.join(', ')}`;
  if (invalidRecoveryPhraseWarning.value) return 'Invalid secret recovery phrase';
  return '';
});

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

watch(mnemonic, async (newValue: string) => {
  if (newValue) {
    hasInvalidChar.value = !/^[a-z\s]*$/.test(newValue);

    const wordList = mnemonicFormat(newValue).split(' ');
    unknownWords.value = wordList.filter((word) => !wordlist.includes(word));

    // Validate if the mnemonic is valid from 12 words
    if (wordList.length >= 12) {
      try {
        await Secp256k1HdWallet.fromMnemonic(mnemonic.value);
        invalidRecoveryPhraseWarning.value = false;
      } catch (e) {
        console.error(e);
        invalidRecoveryPhraseWarning.value = true;
      }
    }
  }
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
